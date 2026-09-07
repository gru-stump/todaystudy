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
