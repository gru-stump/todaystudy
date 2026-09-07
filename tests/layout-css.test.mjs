import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

test("caps the shared page container at 1280px", () => {
  assert.match(css, /--container:\s*1280px;/);
});

test("keeps the desktop hero artwork fully contained", () => {
  assert.match(
    css,
    /\.hero__grid[^}]*grid-template-columns:\s*minmax\(0,\s*620px\)\s*minmax\(0,\s*1fr\);/s,
  );
  assert.match(css, /\.hero-devices__image[^}]*object-fit:\s*contain;/s);
  assert.match(css, /\.hero-devices[^}]*justify-self:\s*end;/s);
});

test("prevents the hero copy and artwork from overflowing narrow screens", () => {
  assert.match(css, /\.hero__copy,\s*\.hero-devices[^}]*min-width:\s*0;/s);
  assert.match(css, /\.hero-devices__image[^}]*max-width:\s*100%;/s);
});

test("crops the desktop attendance artwork and reveals it on mobile", () => {
  assert.match(
    css,
    /\.attendance-artwork[^}]*max-height:\s*360px;[^}]*overflow:\s*hidden;/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*900px\)[\s\S]*\.attendance-artwork[^}]*max-height:\s*none;/,
  );
});

test("limits the class-flow grid texture to the mockup workspace", () => {
  const sectionRule = css.match(/\.class-flow\s*{([^}]*)}/s)?.[1] ?? "";

  assert.doesNotMatch(sectionRule, /background-image/);
  assert.match(
    css,
    /\.flow-panel::before\s*{[^}]*background-image:\s*linear-gradient[^}]*linear-gradient/s,
  );
});

test("connects the class-flow directly to the next section", () => {
  const sectionRule = css.match(/\.class-flow\s*{([^}]*)}/s)?.[1] ?? "";

  assert.match(sectionRule, /padding:\s*58px\s+0\s+0;/);
});

test("marks the active class-flow step with a black progress dot", () => {
  assert.match(
    css,
    /\.flow-tab\[aria-selected="true"\]::after\s*{[^}]*border:\s*3px\s+solid\s+#11130f;[^}]*border-radius:\s*50%;/s,
  );
});

test("matches the desktop Figma class-flow artboard geometry", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.class-flow\s*{[^}]*height:\s*528px;[^}]*padding:\s*44px\s+0\s+0;[^}]*overflow:\s*hidden;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.flow-intro\s*{[^}]*grid-template-columns:\s*290px\s+914px;[^}]*gap:\s*76px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.flow-workspace\s*{[^}]*width:\s*770px;[^}]*height:\s*332px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.flow-check-card\s*{[^}]*width:\s*229px;[^}]*height:\s*207px;[^}]*padding:\s*32px;/,
  );
});
