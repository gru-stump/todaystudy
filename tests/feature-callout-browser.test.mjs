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

test("desktop visual details at a 1440px viewport", async (t) => {
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
      "--window-size=1440,900",
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
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
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
        const content = element.querySelector(':scope > div').getBoundingClientRect();
        const iconRect = icon?.getBoundingClientRect();
        const geometry = {
          x: Math.round(rect.left - inner.left),
          y: Math.round(rect.top - section.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          copyHeight: Math.round(copy.getBoundingClientRect().height),
          iconSize: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
          overflowY: Math.max(0, element.scrollHeight - element.clientHeight),
          contentBottomInset: Math.round(rect.bottom - Math.max(content.bottom, iconRect?.bottom ?? 0)),
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
        pricingDrawing: (() => {
          const accent = document.querySelector('.pricing h2 em');
          const style = getComputedStyle(accent, '::after');
          return {
            usesAsset: style.backgroundImage.includes('/img/pricong_drawing.svg'),
            width: Math.round(Number.parseFloat(style.width)),
            height: Math.round(Number.parseFloat(style.height)),
          };
        })(),
      };
    })()`,
    returnByValue: true,
  });

  await t.test("keeps callout copy inside each card and anchors the action card to the mockup", () => {
    const { contentBottomInset: overviewInset, height: overviewHeight, ...overview } = result.result.value.overview;
    const { contentBottomInset: actionInset, height: actionHeight, ...action } = result.result.value.action;
    assert.ok(overviewInset >= 10, `overview bottom inset was ${overviewInset}px`);
    assert.ok(actionInset >= 10, `action bottom inset was ${actionInset}px`);
    assert.ok(overviewHeight >= 79, `overview height was ${overviewHeight}px`);
    assert.ok(actionHeight >= 79, `action height was ${actionHeight}px`);
    assert.deepEqual(overview, {
      x: 367,
      y: 69,
      width: 174,
      copyHeight: 36,
      iconSize: 16,
      overflowY: 0,
    });
    assert.deepEqual(action, {
      x: 1097,
      y: 149,
      width: 174,
      copyHeight: 36,
      iconSize: 16,
      overflowY: 0,
      edgeDelta: 0,
      stageY: 105,
    });
  });

  await t.test("renders the supplied pricing drawing behind the system label", async () => {
    const assetResponse = await fetch(`http://127.0.0.1:${sitePort}/img/pricong_drawing.svg`);
    assert.equal(assetResponse.status, 200);
    assert.deepEqual(result.result.value.pricingDrawing, {
      usesAsset: true,
      width: 175,
      height: 44,
    });
  });

  await t.test("extends the class-flow line and moves its point when the next step opens", async () => {
    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const track = document.querySelector('.flow-progress');
        const line = document.querySelector('.flow-progress__line');
        const dot = document.querySelector('.flow-progress__dot');
        const next = document.querySelector('.flow-panel:not([hidden]) .flow-next');
        if (!track || !line || !dot || !next) return null;

        const read = () => {
          const trackRect = track.getBoundingClientRect();
          const lineRect = line.getBoundingClientRect();
          const dotRect = dot.getBoundingClientRect();
          return {
            lineWidth: Math.round(lineRect.width),
            dotCenter: Math.round(dotRect.left + dotRect.width / 2 - trackRect.left),
          };
        };

        const initial = read();
        next.click();
        await new Promise((resolve) => setTimeout(resolve, 90));
        const middle = read();
        await new Promise((resolve) => setTimeout(resolve, 500));
        const final = read();
        return {
          initial,
          middle,
          final,
          selectedTab: document.querySelector('.flow-tab[aria-selected="true"]')?.id ?? null,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.deepEqual(value.initial, { lineWidth: 0, dotCenter: 0 });
    assert.ok(
      value.middle.lineWidth > 0 && value.middle.lineWidth < 203,
      `flow animation samples were ${JSON.stringify(value)}`,
    );
    assert.ok(
      value.middle.dotCenter > 0 && value.middle.dotCenter < 203,
      `flow animation samples were ${JSON.stringify(value)}`,
    );
    assert.ok(Math.abs(value.final.lineWidth - 203) <= 2, `final line width was ${value.final.lineWidth}px`);
    assert.ok(Math.abs(value.final.dotCenter - 203) <= 2, `final dot position was ${value.final.dotCenter}px`);
    assert.equal(value.selectedTab, "flow-tab-1");
  });

  await t.test("replays AOS when a section re-enters the viewport", async () => {
    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const target = document.querySelector('.pricing__copy[data-aos]');
        if (!target) return null;

        for (let attempt = 0; attempt < 20 && !target.classList.contains('aos-init'); attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const initialized = target.classList.contains('aos-init');
        target.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 250));
        const firstEntry = target.classList.contains('aos-animate');
        window.scrollTo({ top: 0 });
        await new Promise((resolve) => setTimeout(resolve, 250));
        const resetOutsideViewport = !target.classList.contains('aos-animate');
        target.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 250));
        return {
          animation: target.getAttribute('data-aos'),
          initialized,
          firstEntry,
          resetOutsideViewport,
          secondEntry: target.classList.contains('aos-animate'),
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    assert.deepEqual(animation.result.value, {
      animation: "fade-right",
      initialized: true,
      firstEntry: true,
      resetOutsideViewport: true,
      secondEntry: true,
    });
  });
});
