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
        const animationOffsetY = new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
        const geometry = {
          x: Math.round(rect.left - inner.left),
          y: Math.round(rect.top - animationOffsetY - section.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          copyHeight: Math.round(copy.getBoundingClientRect().height),
          iconSize: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
          overflowY: Math.max(0, element.scrollHeight - element.clientHeight),
          contentBottomInset: Math.round(rect.bottom - Math.max(content.bottom, iconRect?.bottom ?? 0)),
        };
        if (relateToStage) {
          geometry.edgeDelta = Math.round((rect.left + rect.width / 2) - stage.right);
          geometry.stageY = Math.round(rect.top - animationOffsetY - stage.top);
        }
        return geometry;
      };
      return {
        overview: read('.feature-callout--overview'),
        action: read('.feature-callout--action', true),
        checkinPhoneTop: getComputedStyle(
          document.querySelector('.flow-scene--checkin .flow-scene__phone'),
        ).top,
        pricingDrawing: (() => {
          const accent = document.querySelector('.pricing h2 em');
          const style = getComputedStyle(accent, '::after');
          return {
            usesAsset: style.backgroundImage.includes('/img/pricong_drawing.svg'),
            width: Math.round(Number.parseFloat(style.width)),
            height: Math.round(Number.parseFloat(style.height)),
          };
        })(),
        pricingIcons: Array.from(document.querySelectorAll('.pricing-point')).map((point) => {
          const outer = point.querySelector(':scope > span')?.getBoundingClientRect();
          const icon = point.querySelector('svg')?.getBoundingClientRect();
          return {
            iconHeight: icon ? Math.round(icon.height) : 0,
            iconWidth: icon ? Math.round(icon.width) : 0,
            outerHeight: outer ? Math.round(outer.height) : 0,
            outerWidth: outer ? Math.round(outer.width) : 0,
          };
        }),
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

  await t.test("renders three crisp pricing icons in their designed boxes", () => {
    assert.deepEqual(result.result.value.pricingIcons, [
      { iconHeight: 24, iconWidth: 24, outerHeight: 32, outerWidth: 32 },
      { iconHeight: 24, iconWidth: 24, outerHeight: 32, outerWidth: 32 },
      { iconHeight: 24, iconWidth: 24, outerHeight: 32, outerWidth: 32 },
    ]);
  });

  await t.test("uses Pretendard even when the Geist variable is unavailable", async () => {
    const font = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        document.body.style.setProperty('--font-geist-sans', 'initial');
        return {
          family: getComputedStyle(document.body).fontFamily,
          geistVariable: getComputedStyle(document.body).getPropertyValue('--font-geist-sans'),
        };
      })()`,
      returnByValue: true,
    });

    assert.equal(font.result.value.geistVariable, "");
    assert.match(font.result.value.family, /Pretendard Variable/);
  });

  await t.test("keeps the hero scroll cue moving while the pointer rests on it", async () => {
    const initial = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const cue = document.querySelector('.scroll-cue');
        const mouse = cue?.querySelector('span');
        if (!cue || !mouse) return null;
        const cueStyle = getComputedStyle(cue);
        const wheelStyle = getComputedStyle(mouse, '::after');
        const bounds = cue.getBoundingClientRect();
        return {
          cueAnimation: cueStyle.animationName,
          cueDuration: Number.parseFloat(cueStyle.animationDuration),
          cueTransform: new DOMMatrixReadOnly(cueStyle.transform).m42,
          wheelAnimation: wheelStyle.animationName,
          wheelDuration: Number.parseFloat(wheelStyle.animationDuration),
          wheelTransform: new DOMMatrixReadOnly(wheelStyle.transform).m42,
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        };
      })()`,
      returnByValue: true,
    });
    assert.notEqual(initial.result.value, null);

    await new Promise((resolve) => setTimeout(resolve, 350));
    const moved = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const cue = document.querySelector('.scroll-cue');
        const mouse = cue.querySelector('span');
        return {
          cueTransform: new DOMMatrixReadOnly(getComputedStyle(cue).transform).m42,
          wheelTransform: new DOMMatrixReadOnly(getComputedStyle(mouse, '::after').transform).m42,
        };
      })()`,
      returnByValue: true,
    });

    const start = initial.result.value;
    assert.notEqual(start.cueAnimation, "none");
    assert.ok(start.cueDuration >= 1.6 && start.cueDuration <= 2, JSON.stringify(start));
    assert.notEqual(start.wheelAnimation, "none");
    assert.ok(start.wheelDuration >= 1.1 && start.wheelDuration <= 1.5, JSON.stringify(start));
    assert.ok(Math.abs(moved.result.value.cueTransform - start.cueTransform) >= 1, JSON.stringify({ start, moved: moved.result.value }));
    assert.ok(Math.abs(moved.result.value.wheelTransform - start.wheelTransform) >= 1, JSON.stringify({ start, moved: moved.result.value }));

    await cdp.call("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: start.x,
      y: start.y,
    });
    const hovered = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const cue = document.querySelector('.scroll-cue');
        const mouse = cue.querySelector('span');
        return {
          cueState: getComputedStyle(cue).animationPlayState,
          wheelState: getComputedStyle(mouse, '::after').animationPlayState,
        };
      })()`,
      returnByValue: true,
    });
    assert.deepEqual(hovered.result.value, { cueState: "running", wheelState: "running" });
    await cdp.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 });
  });

  await t.test("does not vertically offset the check-in phone artwork", () => {
    assert.equal(result.result.value.checkinPhoneTop, "auto");
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

  await t.test("stages the class-flow scene, checklist, and copy after a step change", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-content-motion=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        await new Promise((resolve) => setTimeout(resolve, 750));
        document.querySelector('.flow-panel:not([hidden]) .flow-next')?.click();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const panel = document.querySelector('.flow-panel:not([hidden])');
        if (!panel) return null;
        const readOpacity = (selector) =>
          Number.parseFloat(getComputedStyle(panel.querySelector(selector)).opacity);
        const firstBeat = {
          button: readOpacity('.flow-next'),
          checklist: readOpacity('.flow-check-card'),
          scene: readOpacity('.flow-scene'),
          title: readOpacity('.flow-copy h3'),
        };

        await new Promise((resolve) => setTimeout(resolve, 180));
        const secondBeat = {
          button: readOpacity('.flow-next'),
          checklist: readOpacity('.flow-check-card'),
          count: readOpacity('.flow-step-count'),
          description: readOpacity('.flow-copy__description'),
          scene: readOpacity('.flow-scene'),
          title: readOpacity('.flow-copy h3'),
        };

        await new Promise((resolve) => setTimeout(resolve, 650));
        return {
          final: {
            button: readOpacity('.flow-next'),
            checklist: readOpacity('.flow-check-card'),
            count: readOpacity('.flow-step-count'),
            description: readOpacity('.flow-copy__description'),
            scene: readOpacity('.flow-scene'),
            title: readOpacity('.flow-copy h3'),
          },
          firstBeat,
          secondBeat,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.ok(value.firstBeat.scene > value.firstBeat.checklist, JSON.stringify(value.firstBeat));
    assert.ok(value.firstBeat.checklist > value.firstBeat.title, JSON.stringify(value.firstBeat));
    assert.equal(value.firstBeat.button, 0);
    assert.ok(value.secondBeat.count > value.secondBeat.title, JSON.stringify(value.secondBeat));
    assert.ok(value.secondBeat.title > value.secondBeat.description, JSON.stringify(value.secondBeat));
    assert.equal(value.secondBeat.button, 0);
    assert.deepEqual(value.final, {
      button: 1,
      checklist: 1,
      count: 1,
      description: 1,
      scene: 1,
      title: 1,
    });
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

  await t.test("reveals the feature callouts upward in sequence", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?feature-callouts=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const section = document.querySelector('.feature-showcase');
        const overview = document.querySelector('.feature-callout--overview');
        const action = document.querySelector('.feature-callout--action');
        if (!section || !overview || !action) return null;

        for (let attempt = 0; attempt < 20 && !overview.classList.contains('aos-init'); attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const initial = {
          actionOpacity: Number.parseFloat(getComputedStyle(action).opacity),
          overviewOpacity: Number.parseFloat(getComputedStyle(overview).opacity),
        };
        section.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 100));
        const firstBeat = {
          actionOpacity: Number.parseFloat(getComputedStyle(action).opacity),
          overviewOpacity: Number.parseFloat(getComputedStyle(overview).opacity),
        };
        await new Promise((resolve) => setTimeout(resolve, 220));
        const secondBeat = {
          actionOpacity: Number.parseFloat(getComputedStyle(action).opacity),
          overviewOpacity: Number.parseFloat(getComputedStyle(overview).opacity),
        };
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {
          animations: [overview.getAttribute('data-aos'), action.getAttribute('data-aos')],
          delays: [overview.getAttribute('data-aos-delay'), action.getAttribute('data-aos-delay')],
          final: {
            actionOpacity: Number.parseFloat(getComputedStyle(action).opacity),
            overviewOpacity: Number.parseFloat(getComputedStyle(overview).opacity),
          },
          firstBeat,
          initial,
          secondBeat,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.deepEqual(value.animations, ["fade-up", "fade-up"]);
    assert.deepEqual(value.delays, ["0", "150"]);
    assert.deepEqual(value.initial, { actionOpacity: 0, overviewOpacity: 0 });
    assert.ok(
      value.firstBeat.overviewOpacity > value.firstBeat.actionOpacity,
      `first callout did not lead: ${JSON.stringify(value.firstBeat)}`,
    );
    assert.ok(
      value.secondBeat.actionOpacity > value.firstBeat.actionOpacity,
      `second callout did not follow: ${JSON.stringify(value)}`,
    );
    assert.deepEqual(value.final, { actionOpacity: 1, overviewOpacity: 1 });
  });

  await t.test("reveals the FEATURES tablet from right to left", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?attendance-tablet=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const section = document.querySelector('.attendance');
        const tablet = document.querySelector('.attendance-artwork');
        if (!section || !tablet) return null;

        for (let attempt = 0; attempt < 20 && !tablet.classList.contains('aos-init'); attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const read = () => ({
          opacity: Number.parseFloat(getComputedStyle(tablet).opacity),
          translateX: Math.round(new DOMMatrixReadOnly(getComputedStyle(tablet).transform).m41),
        });

        const initial = read();
        section.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 120));
        const middle = read();
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {
          animation: tablet.getAttribute('data-aos'),
          final: read(),
          initial,
          middle,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.equal(value.animation, "fade-left");
    assert.ok(value.initial.translateX >= 90, `initial offset was ${value.initial.translateX}px`);
    assert.ok(
      value.middle.translateX > 0 && value.middle.translateX < value.initial.translateX,
      `tablet did not move left: ${JSON.stringify(value)}`,
    );
    assert.ok(value.middle.opacity > value.initial.opacity, `tablet did not fade in: ${JSON.stringify(value)}`);
    assert.deepEqual(value.final, { opacity: 1, translateX: 0 });
  });

  await t.test("keeps AOS visible under the platform reduced-motion setting", async () => {
    await cdp.call("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?motion=reduce`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        window.scrollTo({ top: 0 });
        const target = document.querySelector('.pricing__copy[data-aos]');
        if (!target) return null;

        for (let attempt = 0; attempt < 20 && !target.classList.contains('aos-init'); attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
        const initialStyle = getComputedStyle(target);
        const initialOpacity = Number.parseFloat(initialStyle.opacity);
        const duration = Math.max(
          ...initialStyle.transitionDuration
            .split(',')
            .map((value) => Number.parseFloat(value) * (value.includes('ms') ? 0.001 : 1)),
        );

        target.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 180));
        const middleOpacity = Number.parseFloat(getComputedStyle(target).opacity);
        await new Promise((resolve) => setTimeout(resolve, 700));
        return {
          duration,
          finalOpacity: Number.parseFloat(getComputedStyle(target).opacity),
          initialOpacity,
          middleOpacity,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.ok(value.initialOpacity < 0.05, `initial opacity was ${value.initialOpacity}`);
    assert.ok(value.duration >= 0.6, `transition duration was ${value.duration}s`);
    assert.ok(value.middleOpacity > 0 && value.middleOpacity < 1, `middle opacity was ${value.middleOpacity}`);
    assert.ok(value.finalOpacity > 0.99, `final opacity was ${value.finalOpacity}`);
  });

  await t.test("keeps the requested hero scroll cue moving under the Windows reduced-motion setting", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?scroll-cue-motion=reduce`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const cue = document.querySelector('.scroll-cue');
        const mouse = cue?.querySelector('span');
        if (!cue || !mouse) return null;
        const read = () => ({
          cueName: getComputedStyle(cue).animationName,
          cueY: new DOMMatrixReadOnly(getComputedStyle(cue).transform).m42,
          wheelName: getComputedStyle(mouse, '::after').animationName,
          wheelY: new DOMMatrixReadOnly(getComputedStyle(mouse, '::after').transform).m42,
        });
        const initial = read();
        await new Promise((resolve) => setTimeout(resolve, 350));
        return {
          initial,
          matchesReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          moved: read(),
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.equal(value.matchesReducedMotion, true);
    assert.notEqual(value.initial.cueName, "none", JSON.stringify(value));
    assert.notEqual(value.initial.wheelName, "none", JSON.stringify(value));
    assert.ok(Math.abs(value.moved.cueY - value.initial.cueY) >= 1, JSON.stringify(value));
    assert.ok(Math.abs(value.moved.wheelY - value.initial.wheelY) >= 1, JSON.stringify(value));
  });

  await t.test("smoothly reveals the next class-flow panel under the platform reduced-motion setting", async () => {
    const animation = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const next = document.querySelector('.flow-panel:not([hidden]) .flow-next');
        if (!next) return null;

        next.click();
        await new Promise((resolve) => setTimeout(resolve, 150));

        const activePanel = document.querySelector('.flow-panel:not([hidden])');
        if (!activePanel) return null;
        const middleStyle = getComputedStyle(activePanel);
        const duration = Math.max(
          ...middleStyle.animationDuration
            .split(',')
            .map((value) => Number.parseFloat(value) * (value.includes('ms') ? 0.001 : 1)),
        );
        const middleOpacity = Number.parseFloat(middleStyle.opacity);

        await new Promise((resolve) => setTimeout(resolve, 450));
        return {
          duration,
          finalOpacity: Number.parseFloat(getComputedStyle(activePanel).opacity),
          middleOpacity,
          selectedTab: document.querySelector('.flow-tab[aria-selected="true"]')?.id ?? null,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.ok(value.duration >= 0.4, `animation duration was ${value.duration}s`);
    assert.ok(value.middleOpacity > 0 && value.middleOpacity < 1, `middle opacity was ${value.middleOpacity}`);
    assert.ok(value.finalOpacity > 0.99, `final opacity was ${value.finalOpacity}`);
    assert.equal(value.selectedTab, "flow-tab-1");
  });

  await t.test("smoothly extends class-flow progress under the platform reduced-motion setting", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-progress=reduce`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

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
            dotCenter: dotRect.left + dotRect.width / 2 - trackRect.left,
            lineWidth: lineRect.width,
          };
        };

        const initial = read();
        next.click();
        await new Promise((resolve) => setTimeout(resolve, 150));
        const middle = read();
        const duration = Math.max(
          ...getComputedStyle(line).transitionDuration
            .split(',')
            .map((value) => Number.parseFloat(value) * (value.includes('ms') ? 0.001 : 1)),
        );
        await new Promise((resolve) => setTimeout(resolve, 450));
        return { duration, final: read(), initial, middle };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = animation.result.value;
    assert.notEqual(value, null);
    assert.ok(value.duration >= 0.4, `transition duration was ${value.duration}s`);
    assert.ok(
      value.middle.lineWidth > value.initial.lineWidth && value.middle.lineWidth < value.final.lineWidth,
      `line animation samples were ${JSON.stringify(value)}`,
    );
    assert.ok(
      value.middle.dotCenter > value.initial.dotCenter && value.middle.dotCenter < value.final.dotCenter,
      `point animation samples were ${JSON.stringify(value)}`,
    );
  });

  await t.test("keeps class-flow autoplay running while the pointer rests over the section", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-pointer-autoplay=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const center = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const section = document.querySelector('.class-flow');
        if (!section) return null;
        section.scrollIntoView({ block: 'center' });
        const rect = section.getBoundingClientRect();
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(Math.max(1, Math.min(window.innerHeight - 1, rect.top + rect.height / 2))),
        };
      })()`,
      returnByValue: true,
    });
    assert.notEqual(center.result.value, null);
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
    await cdp.call("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: center.result.value.x,
      y: center.result.value.y,
    });
    await new Promise((resolveWait) => setTimeout(resolveWait, 6200));

    const selected = await cdp.call("Runtime.evaluate", {
      expression: `document.querySelector('.flow-tab[aria-selected="true"]')?.id ?? null`,
      returnByValue: true,
    });
    assert.equal(selected.result.value, "flow-tab-1");
  });

  await t.test("cycles the visible class flow after a reading pause and pauses during interaction", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-autoplay=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const autoplay = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const section = document.querySelector('.class-flow');
        const firstTab = document.querySelector('#flow-tab-0');
        if (!section || !firstTab) return null;

        section.scrollIntoView({ block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 200));
        firstTab.focus();
        await new Promise((resolve) => setTimeout(resolve, 6200));
        const whileFocused = document.querySelector('.flow-tab[aria-selected="true"]')?.id ?? null;

        firstTab.blur();
        await new Promise((resolve) => setTimeout(resolve, 6200));
        return {
          afterResume: document.querySelector('.flow-tab[aria-selected="true"]')?.id ?? null,
          whileFocused,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    assert.deepEqual(autoplay.result.value, {
      afterResume: "flow-tab-1",
      whileFocused: "flow-tab-0",
    });
  });

  await t.test("reveals scroll controls by direction and smoothly returns to the top", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?scroll-controls=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const controls = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const header = document.querySelector('.site-header');
        const topButton = document.querySelector('.back-to-top');
        if (!header || !topButton) return null;

        const initial = {
          headerHidden: header.classList.contains('site-header--hidden'),
          topButtonRightInset: Math.round(Number.parseFloat(getComputedStyle(topButton).right)),
          topButtonVisible: topButton.classList.contains('back-to-top--visible'),
        };

        window.scrollTo({ top: 1400 });
        await new Promise((resolve) => setTimeout(resolve, 180));
        const afterDown = {
          headerHidden: header.classList.contains('site-header--hidden'),
          topButtonVisible: topButton.classList.contains('back-to-top--visible'),
        };

        window.scrollTo({ top: 1050 });
        await new Promise((resolve) => setTimeout(resolve, 180));
        const afterUp = {
          headerHidden: header.classList.contains('site-header--hidden'),
          topButtonVisible: topButton.classList.contains('back-to-top--visible'),
        };

        topButton.click();
        await new Promise((resolve) => setTimeout(resolve, 120));
        const middleScrollY = window.scrollY;
        await new Promise((resolve) => setTimeout(resolve, 900));
        return {
          afterDown,
          afterTop: {
            headerHidden: header.classList.contains('site-header--hidden'),
            scrollY: Math.round(window.scrollY),
            topButtonVisible: topButton.classList.contains('back-to-top--visible'),
          },
          afterUp,
          initial,
          middleScrollY,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const value = controls.result.value;
    assert.notEqual(value, null);
    assert.deepEqual(value.initial, {
      headerHidden: false,
      topButtonRightInset: 24,
      topButtonVisible: false,
    });
    assert.deepEqual(value.afterDown, { headerHidden: true, topButtonVisible: true });
    assert.deepEqual(value.afterUp, { headerHidden: false, topButtonVisible: true });
    assert.ok(value.middleScrollY > 0 && value.middleScrollY < 1050, `middle scroll position was ${value.middleScrollY}`);
    assert.deepEqual(value.afterTop, { headerHidden: false, scrollY: 0, topButtonVisible: false });
  });

  await t.test("continues wheel scrolling through a gentle eased motion", async () => {
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?smooth-wheel=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    await cdp.call("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 800,
    });

    const samples = [];
    for (const delay of [30, 140, 650]) {
      await new Promise((resolveWait) => setTimeout(resolveWait, delay));
      const sample = await cdp.call("Runtime.evaluate", {
        expression: "Math.round(window.scrollY)",
        returnByValue: true,
      });
      samples.push(sample.result.value);
    }

    assert.ok(samples[0] > 0 && samples[0] < 800, `first wheel sample was ${samples[0]}`);
    assert.ok(samples[1] > samples[0], `wheel samples did not continue: ${samples.join(", ")}`);
    assert.ok(samples[2] >= samples[1], `wheel motion reversed: ${samples.join(", ")}`);
    assert.ok(samples[2] <= 820, `wheel motion overshot: ${samples.join(", ")}`);
  });

  await t.test("prevents tablet layouts from exposing horizontal whitespace", async () => {
    for (const width of [768, 834, 1024]) {
      await cdp.call("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.call("Page.navigate", {
        url: `http://127.0.0.1:${sitePort}/?tablet-overflow=${width}`,
      });
      await waitFor(async () => {
        const ready = await cdp.call("Runtime.evaluate", {
          expression: "document.readyState",
          returnByValue: true,
        });
        return ready.result.value === "complete";
      });

      const overflow = await cdp.call("Runtime.evaluate", {
        expression: `(async () => {
          window.scrollTo({ behavior: 'instant', left: 999, top: 0 });
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return {
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            scrollX: Math.round(window.scrollX),
          };
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });

      assert.equal(
        overflow.result.value.scrollX,
        0,
        `${width}px layout exposed horizontal whitespace: ${JSON.stringify(overflow.result.value)}`,
      );
    }
  });

  await t.test("composes every class-flow scene on one full-width tablet artboard", async () => {
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: 768,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-tablet-artboard=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const result = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const tabs = [...document.querySelectorAll('.flow-tab')];
        const snapshots = [];
        const rect = (element) => {
          const value = element.getBoundingClientRect();
          return {
            left: Math.round(value.left),
            top: Math.round(value.top),
            right: Math.round(value.right),
            bottom: Math.round(value.bottom),
            width: Math.round(value.width),
            height: Math.round(value.height),
          };
        };

        for (const tab of tabs) {
          tab.click();
          await new Promise((resolve) => setTimeout(resolve, 700));
          const panel = document.querySelector('.flow-panel:not([hidden])');
          snapshots.push({
            workspace: rect(panel.querySelector('.flow-workspace')),
            card: rect(panel.querySelector('.flow-check-card')),
            scene: rect(panel.querySelector('.flow-scene')),
            images: [...panel.querySelectorAll('.flow-scene img')].map(rect),
          });
        }
        return snapshots;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const snapshots = result.result.value;
    for (const [index, snapshot] of snapshots.entries()) {
      assert.ok(snapshot.workspace.width >= 700, `step ${index + 1} workspace is not full width: ${JSON.stringify(snapshot)}`);
      assert.ok(snapshot.workspace.height >= 360, `step ${index + 1} workspace is too shallow: ${JSON.stringify(snapshot)}`);
      assert.ok(Math.abs(snapshot.scene.left - snapshot.workspace.left) <= 1, `step ${index + 1} scene does not span the artboard`);
      assert.ok(Math.abs(snapshot.scene.right - snapshot.workspace.right) <= 1, `step ${index + 1} scene does not span the artboard`);
      assert.ok(snapshot.card.left >= snapshot.workspace.left, `step ${index + 1} checklist leaves the artboard`);
      assert.ok(snapshot.card.right <= snapshot.workspace.right, `step ${index + 1} checklist leaves the artboard`);
      for (const image of snapshot.images) {
        assert.ok(image.left >= snapshot.workspace.left - 8, `step ${index + 1} image overflows left: ${JSON.stringify(image)}`);
        assert.ok(image.right <= snapshot.workspace.right + 8, `step ${index + 1} image overflows right: ${JSON.stringify(image)}`);
      }
    }

    const [, checkin, inClass, analyze, connect] = snapshots;
    assert.ok(checkin.images[0].right - checkin.images[1].left >= 20, "check-in phone should overlap the photo");
    assert.ok(inClass.images[0].height >= 230, "in-class photo should fill the lower artboard");
    assert.ok(analyze.images[1].right - analyze.images[0].left >= 28, "analysis people should overlap the dashboard");
    assert.ok(connect.images[0].height >= 245, "connect photo should not collapse into a short strip");
  });

  await t.test("stages layered class-flow artwork with a short tablet-only delay", async () => {
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: 768,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-tablet-stagger=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const result = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        document.querySelectorAll('.flow-tab')[2].click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return [...document.querySelectorAll('.flow-panel:not([hidden]) .flow-scene img')].map((image) => {
          const style = getComputedStyle(image);
          return { name: style.animationName, delay: style.animationDelay };
        });
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const animations = result.result.value;
    assert.equal(animations.length, 3);
    assert.ok(animations.every(({ name }) => name.includes("flow-tablet-art-enter")), JSON.stringify(animations));
    assert.equal(new Set(animations.map(({ delay }) => delay)).size, 3, JSON.stringify(animations));
  });

  await t.test("keeps the class-flow tabs free of tablet scrollbars", async () => {
    for (const width of [600, 720, 768, 834]) {
      await cdp.call("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.call("Page.navigate", {
        url: `http://127.0.0.1:${sitePort}/?flow-tabs=${width}`,
      });
      await waitFor(async () => {
        const ready = await cdp.call("Runtime.evaluate", {
          expression: "document.readyState",
          returnByValue: true,
        });
        return ready.result.value === "complete";
      });

      const result = await cdp.call("Runtime.evaluate", {
        expression: `(() => {
          const tabs = document.querySelector('.flow-tabs');
          const bounds = tabs.getBoundingClientRect();
          const tabItems = [...tabs.querySelectorAll('.flow-tab')];
          const firstTab = tabItems[0].getBoundingClientRect();
          const lastTab = tabItems.at(-1).getBoundingClientRect();
          const firstTabStyle = getComputedStyle(tabItems[0]);
          const lastTabStyle = getComputedStyle(tabItems.at(-1));
          const progress = tabs.querySelector('.flow-progress').getBoundingClientRect();
          const dot = document.querySelector('.flow-progress__dot').getBoundingClientRect();
          const style = getComputedStyle(tabs);
          return {
            clientHeight: tabs.clientHeight,
            clientWidth: tabs.clientWidth,
            dotBottom: Math.round(dot.bottom),
            firstLabelStart: Math.round(firstTab.left + Number.parseFloat(firstTabStyle.paddingLeft)),
            lastLabelStart: Math.round(lastTab.left + Number.parseFloat(lastTabStyle.paddingLeft)),
            overflowX: style.overflowX,
            overflowY: style.overflowY,
            progressLeft: Math.round(progress.left),
            progressRight: Math.round(progress.right),
            scrollHeight: tabs.scrollHeight,
            scrollWidth: tabs.scrollWidth,
            tabsBottom: Math.round(bounds.bottom),
          };
        })()`,
        returnByValue: true,
      });

      const metrics = result.result.value;
      assert.equal(metrics.scrollWidth, metrics.clientWidth, `${width}px horizontal overflow: ${JSON.stringify(metrics)}`);
      assert.equal(metrics.overflowX, "visible", `${width}px horizontal scrollbar: ${JSON.stringify(metrics)}`);
      assert.equal(metrics.overflowY, "visible", `${width}px vertical scrollbar: ${JSON.stringify(metrics)}`);
      assert.ok(Math.abs(metrics.progressLeft - metrics.firstLabelStart) <= 1, `${width}px progress start is misaligned: ${JSON.stringify(metrics)}`);
      assert.ok(Math.abs(metrics.progressRight - metrics.lastLabelStart) <= 1, `${width}px progress end is misaligned: ${JSON.stringify(metrics)}`);
      assert.ok(metrics.dotBottom <= metrics.tabsBottom + 5, `${width}px progress dot escaped: ${JSON.stringify(metrics)}`);
    }
  });

  await t.test("keeps mobile flow tabs swipeable without visible scrollbars and follows the active step", async () => {
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-mobile-tabs=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const result = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const tabs = document.querySelector('.flow-tabs');
        const track = tabs.querySelector('.flow-tabs__track');
        const pageY = window.scrollY;
        const initial = {
          clientHeight: tabs.clientHeight,
          clientWidth: tabs.clientWidth,
          overflowX: getComputedStyle(tabs).overflowX,
          overflowY: getComputedStyle(tabs).overflowY,
          scrollHeight: tabs.scrollHeight,
          scrollWidth: tabs.scrollWidth,
          trackExists: Boolean(track),
        };

        document.querySelectorAll('.flow-tab')[3].click();
        await new Promise((resolve) => setTimeout(resolve, 650));
        const active = document.querySelector('.flow-tab[aria-selected="true"]');
        const activeBounds = active.getBoundingClientRect();
        const tabsBounds = tabs.getBoundingClientRect();

        return {
          ...initial,
          activeCenter: (activeBounds.left + activeBounds.right) / 2,
          pageMoved: Math.abs(window.scrollY - pageY),
          scrollLeft: tabs.scrollLeft,
          tabsCenter: (tabsBounds.left + tabsBounds.right) / 2,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const metrics = result.result.value;
    assert.equal(metrics.trackExists, true, JSON.stringify(metrics));
    assert.ok(metrics.scrollWidth > metrics.clientWidth, JSON.stringify(metrics));
    assert.equal(metrics.overflowX, "auto", JSON.stringify(metrics));
    assert.equal(metrics.overflowY, "hidden", JSON.stringify(metrics));
    assert.equal(metrics.scrollHeight, metrics.clientHeight, JSON.stringify(metrics));
    assert.ok(metrics.scrollLeft > 0, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.activeCenter - metrics.tabsCenter) <= 2, JSON.stringify(metrics));
    assert.ok(metrics.pageMoved <= 1, JSON.stringify(metrics));
  });

  await t.test("keeps the tablet next-step button on one line with breathing room below", async () => {
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: 711,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-tablet-button=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const result = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        document.querySelectorAll('.flow-tab')[2].click();
        const section = document.querySelector('.class-flow').getBoundingClientRect();
        const button = document.querySelector('.flow-panel:not([hidden]) .flow-next');
        const buttonBounds = button.getBoundingClientRect();
        const arrowBounds = button.querySelector('img').getBoundingClientRect();
        const style = getComputedStyle(button);
        return {
          bottomSpace: section.bottom - buttonBounds.bottom,
          buttonCenter: (buttonBounds.top + buttonBounds.bottom) / 2,
          buttonHeight: buttonBounds.height,
          arrowCenter: (arrowBounds.top + arrowBounds.bottom) / 2,
          display: style.display,
          whiteSpace: style.whiteSpace,
        };
      })()`,
      returnByValue: true,
    });

    const metrics = result.result.value;
    assert.equal(metrics.display, "inline-flex", JSON.stringify(metrics));
    assert.equal(metrics.whiteSpace, "nowrap", JSON.stringify(metrics));
    assert.ok(metrics.buttonHeight <= 56, JSON.stringify(metrics));
    assert.ok(Math.abs(metrics.buttonCenter - metrics.arrowCenter) <= 1, JSON.stringify(metrics));
    assert.ok(metrics.bottomSpace >= 56, JSON.stringify(metrics));
  });

  await t.test("keeps the in-class and analysis layers visually connected on compact tablets", async () => {
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: 600,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/?flow-compact-composition=1`,
    });
    await waitFor(async () => {
      const ready = await cdp.call("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      return ready.result.value === "complete";
    });

    const result = await cdp.call("Runtime.evaluate", {
      expression: `(async () => {
        const rect = (element) => {
          const value = element.getBoundingClientRect();
          return {
            bottom: Math.round(value.bottom),
            height: Math.round(value.height),
            left: Math.round(value.left),
            right: Math.round(value.right),
            top: Math.round(value.top),
            width: Math.round(value.width),
          };
        };
        const readStep = async (index) => {
          document.querySelectorAll('.flow-tab')[index].click();
          await new Promise((resolve) => setTimeout(resolve, 700));
          const panel = document.querySelector('.flow-panel:not([hidden])');
          return {
            card: rect(panel.querySelector('.flow-check-card')),
            images: [...panel.querySelectorAll('.flow-scene img')].map(rect),
          };
        };
        return {
          analyze: await readStep(3),
          inClass: await readStep(2),
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    const { analyze, inClass } = result.result.value;
    const [classPhoto, participation, memo] = inClass.images;
    const [dashboard, people] = analyze.images;
    assert.ok(classPhoto.height >= 250, `class photo is too shallow: ${JSON.stringify(inClass)}`);
    assert.ok(classPhoto.top < inClass.card.bottom - 70, `class photo is detached from the checklist: ${JSON.stringify(inClass)}`);
    assert.ok(memo.bottom >= classPhoto.top - 16, `memo is detached from the class photo: ${JSON.stringify(inClass)}`);
    assert.ok(participation.top >= classPhoto.top, `participation card left the class photo: ${JSON.stringify(inClass)}`);
    assert.equal(analyze.card.width, 210, `analysis checklist is oversized: ${JSON.stringify(analyze)}`);
    assert.ok(dashboard.width >= 330, `analysis dashboard is too small: ${JSON.stringify(analyze)}`);
    assert.ok(people.width >= 198, `analysis people image is too small: ${JSON.stringify(analyze)}`);
    assert.ok(dashboard.left >= analyze.card.right, `checklist covers the dashboard heading: ${JSON.stringify(analyze)}`);
    assert.ok(dashboard.bottom >= people.top + 16, `analysis layers do not overlap enough: ${JSON.stringify(analyze)}`);
  });
});
