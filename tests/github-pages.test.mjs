import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const assetPathUrl = new URL("../app/landing/asset-path.mjs", import.meta.url);
const assetPathExists = await access(assetPathUrl)
  .then(() => true)
  .catch(() => false);
const preparePagesUrl = new URL(
  "../scripts/prepare-github-pages.mjs",
  import.meta.url,
);
const preparePagesExists = await access(preparePagesUrl)
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
  const packageJson = JSON.parse(await readOptional("../package.json"));

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /NEXT_PUBLIC_GITHUB_PAGES:\s*["']true["']/);
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH:\s*\/todaystudy/);
  assert.match(workflow, /run:\s*npm run build:pages/);
  assert.equal(
    packageJson.scripts?.["build:pages"],
    "vinext build && node scripts/prepare-github-pages.mjs",
  );
});

test("places framework assets at the artifact root used by GitHub Pages", async (t) => {
  assert.equal(
    preparePagesExists,
    true,
    "prepare-github-pages.mjs should exist",
  );

  if (!preparePagesExists) {
    t.skip("Pages output normalizer is not implemented yet");
    return;
  }

  const scriptSource = await readFile(preparePagesUrl, "utf8");
  assert.match(scriptSource, /\bcp\(/, "copying works in OneDrive-backed Windows worktrees");
  assert.doesNotMatch(scriptSource, /\brename\(/);

  const root = await mkdtemp(join(tmpdir(), "todaystudy-pages-test-"));
  const nestedNext = join(root, "todaystudy", "_next");
  await mkdir(nestedNext, { recursive: true });
  await writeFile(join(nestedNext, "app.js"), "export {};\n");

  try {
    const { prepareGitHubPagesOutput } = await import(preparePagesUrl.href);
    await prepareGitHubPagesOutput(root, "/todaystudy");

    assert.equal(await readFile(join(root, "_next", "app.js"), "utf8"), "export {};\n");
    await access(join(root, ".nojekyll"));
    await assert.rejects(access(join(root, "todaystudy")));
  } finally {
    await rm(root, { force: true, recursive: true });
  }
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
