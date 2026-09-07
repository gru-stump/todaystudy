import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const { port } = server.address();
  await new Promise((resolveClose) => server.close(resolveClose));
  return port;
}

async function waitFor(check, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch {
      // The local server and browser can reject requests while starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error("Timed out waiting for browser geometry test setup");
}

async function connectCdp(url) {
  const socket = new WebSocket(url);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(message.error.message));
    else handler.resolve(message.result);
  });

  return {
    close: () => socket.close(),
    call(method, params = {}) {
      const id = ++nextId;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolveCall, rejectCall) => {
        pending.set(id, { resolve: resolveCall, reject: rejectCall });
      });
    },
  };
}

test("anchors the action callout to the mockup's right edge at a 1280px viewport", async (t) => {
  const projectRoot = resolve(import.meta.dirname, "..");
  const sitePort = await reservePort();
  const debugPort = await reservePort();
  const profileDir = await mkdtemp(join(tmpdir(), "todaystudy-callout-"));
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  assert.equal(existsSync(chromePath), true, "Chrome is required for the geometry test");

  const site = spawn(
    process.execPath,
    ["node_modules/vinext/dist/cli.js", "start", "--port", String(sitePort)],
    { cwd: projectRoot, stdio: "ignore" },
  );
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--remote-allow-origins=*",
      `--remote-debugging-port=${debugPort}`,
      "--window-size=1280,900",
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  t.after(async () => {
    site.kill();
    chrome.kill();
    await rm(profileDir, {
      force: true,
      maxRetries: 10,
      recursive: true,
      retryDelay: 100,
    });
  });

  await waitFor(async () => (await fetch(`http://127.0.0.1:${sitePort}/`)).ok);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok);

  const target = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`http://127.0.0.1:${sitePort}/`)}`,
    { method: "PUT" },
  ).then((response) => response.json());
  const cdp = await connectCdp(target.webSocketDebuggerUrl);
  t.after(() => cdp.close());

  await cdp.call("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.call("Page.navigate", { url: `http://127.0.0.1:${sitePort}/` });
  await waitFor(async () => {
    const result = await cdp.call("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    return result.result.value === "complete";
  });

  const result = await cdp.call("Runtime.evaluate", {
    expression: `(() => {
      const section = document.querySelector('.feature-showcase').getBoundingClientRect();
      const inner = document.querySelector('.feature-showcase__inner').getBoundingClientRect();
      const stage = document.querySelector('.management-stage').getBoundingClientRect();
      const read = (selector, relateToStage = false) => {
        const element = document.querySelector(selector);
        const rect = element.getBoundingClientRect();
        const copy = element.querySelector('p');
        const icon = element.querySelector('img');
        const geometry = {
          x: Math.round(rect.left - inner.left),
          y: Math.round(rect.top - section.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          copyHeight: Math.round(copy.getBoundingClientRect().height),
          iconSize: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
        };
        if (relateToStage) {
          geometry.edgeDelta = Math.round((rect.left + rect.width / 2) - stage.right);
          geometry.stageY = Math.round(rect.top - stage.top);
        }
        return geometry;
      };
      return {
        overview: read('.feature-callout--overview'),
        action: read('.feature-callout--action', true),
      };
    })()`,
    returnByValue: true,
  });

  assert.deepEqual(result.result.value, {
    overview: { x: 367, y: 69, width: 169, height: 79, copyHeight: 36, iconSize: 16 },
    action: {
      x: 1097,
      y: 149,
      width: 174,
      height: 79,
      copyHeight: 36,
      iconSize: 16,
      edgeDelta: 0,
      stageY: 105,
    },
  });
});
