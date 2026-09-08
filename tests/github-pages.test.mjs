import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const assetPathUrl = new URL("../app/landing/asset-path.mjs", import.meta.url);
const assetPathExists = await access(assetPathUrl)
  .then(() => true)
  .catch(() => false);

async function readOptional(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8").catch(() => "");
}

test("prefixes public assets for repository-scoped GitHub Pages URLs", async (t) => {
  assert.equal(assetPathExists, true, "asset-path.mjs should exist");

  if (!assetPathExists) {
    t.skip("asset path helper is not implemented yet");
    return;
  }

  const { assetPath } = await import(assetPathUrl.href);
  assert.equal(assetPath("/img/hero_mockup.png", ""), "/img/hero_mockup.png");
  assert.equal(
    assetPath("/img/hero_mockup.png", "/todaystudy"),
    "/todaystudy/img/hero_mockup.png",
  );
});

test("enables a separate static export mode without changing the default Sites build", async () => {
  const config = await readOptional("../next.config.ts");
  const layout = await readOptional("../app/layout.tsx");

  assert.match(config, /NEXT_PUBLIC_GITHUB_PAGES/);
  assert.match(layout, /NEXT_PUBLIC_GITHUB_PAGES/);
  assert.match(config, /output:\s*["']export["']/);
  assert.match(config, /assetPrefix/);
  assert.doesNotMatch(
    config,
    /^\s*basePath:/m,
    "vinext must prerender / directly; repository assets use assetPrefix instead",
  );
  assert.match(config, /images:\s*{[^}]*unoptimized:\s*true/s);
});

test("publishes the exported client directory through the official Pages actions", async () => {
  const workflow = await readOptional("../.github/workflows/deploy-pages.yml");

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /NEXT_PUBLIC_GITHUB_PAGES:\s*["']true["']/);
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH:\s*\/todaystudy/);
});

test("routes every app-owned public asset through the Pages base path", async () => {
  const files = [
    "../app/layout.tsx",
    "../app/globals.css",
    "../app/landing/ClassFlowSection.tsx",
    "../app/landing/mockups.tsx",
    "../app/landing/sections.tsx",
    "../app/landing/ui.tsx",
  ];
  const source = (await Promise.all(files.map(readOptional))).join("\n");

  assert.doesNotMatch(source, /src=["']\/img\//);
  assert.doesNotMatch(source, /url\(["']\/img\//);
  assert.doesNotMatch(source, /href=["']\/favicon\.svg/);
});
