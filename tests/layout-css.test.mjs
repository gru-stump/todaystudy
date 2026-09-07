import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const heroPng = await readFile(
  new URL("../public/img/hero_mockup.png", import.meta.url),
);
const featuresPng = await readFile(
  new URL("../public/img/features_moockup.png", import.meta.url),
);
const flowBeforePng = await readFile(
  new URL("../public/img/cramclassflow_01.png", import.meta.url),
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

test("uses the full-resolution Figma hero source", () => {
  assert.equal(heroPng.readUInt32BE(16), 3000);
  assert.equal(heroPng.readUInt32BE(20), 2000);
});

test("uses the supplied high-density attendance mockup", () => {
  assert.equal(featuresPng.readUInt32BE(16), 2625);
  assert.equal(featuresPng.readUInt32BE(20), 1554);
});

test("uses the supplied high-density before-class mockup", () => {
  assert.equal(flowBeforePng.readUInt32BE(16), 1928);
  assert.equal(flowBeforePng.readUInt32BE(20), 1328);
});

test("frames the full hero source without clipping the device artwork", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.hero-devices\s*{[^}]*width:\s*916px;[^}]*height:\s*638px;[^}]*overflow:\s*hidden;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.hero-devices__image\s*{[^}]*left:\s*-488px;[^}]*top:\s*-200px;[^}]*width:\s*1701px;[^}]*height:\s*1134px;/,
  );
});

test("prevents the hero copy and artwork from overflowing narrow screens", () => {
  assert.match(css, /\.hero__copy,\s*\.hero-devices[^}]*min-width:\s*0;/s);
  assert.match(
    css,
    /\.hero-devices\s*{[^}]*aspect-ratio:\s*916\s*\/\s*638;[^}]*overflow:\s*hidden;/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*560px\)[\s\S]*\.hero h1\s*{[^}]*font-size:\s*34px;/,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*560px\)[\s\S]*\.hero-devices\s*{[^}]*width:\s*92%;/,
  );
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

test("marks the class-flow progress with a black moving dot", () => {
  assert.match(
    css,
    /\.flow-progress__dot\s*{[^}]*border:\s*3px\s+solid\s+#11130f;[^}]*border-radius:\s*50%;[^}]*transition:\s*left\s+450ms/s,
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

test("matches the full desktop Figma section rhythm", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.hero\s*{[^}]*height:\s*655px;[^}]*min-height:\s*655px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.benefits\s*{[^}]*height:\s*412px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.attendance\s*{[^}]*height:\s*551px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.feature-showcase\s*{[^}]*height:\s*280px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.testimonials\s*{[^}]*height:\s*530px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.pricing\s*{[^}]*height:\s*702px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.final-cta\s*{[^}]*height:\s*417px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.site-footer\s*{[^}]*height:\s*322px;/,
  );
});

test("positions the desktop hero and attendance artwork from the Figma frame", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.hero__copy\s*{[^}]*top:\s*132px;[^}]*width:\s*578px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.hero-devices\s*{[^}]*top:\s*-3px;[^}]*left:\s*533px;[^}]*width:\s*916px;[^}]*height:\s*638px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.hero-devices__image\s*{[^}]*width:\s*1701px;[^}]*height:\s*1134px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.attendance-artwork\s*{[^}]*top:\s*146px;[^}]*left:\s*385px;[^}]*width:\s*855px;[^}]*height:\s*498px;/,
  );
});

test("matches the desktop testimonial and pricing card geometry", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.testimonial-card:nth-child\(2\)\s*{[^}]*left:\s*703px;[^}]*top:\s*79px;[^}]*width:\s*305px;[^}]*height:\s*382px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.pricing-cards\s*{[^}]*top:\s*47px;[^}]*left:\s*532px;[^}]*width:\s*735px;[^}]*height:\s*596px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.price-card--featured\s*{[^}]*width:\s*361px;[^}]*height:\s*596px;/,
  );
});

test("preserves the exact desktop Figma title line breaks", () => {
  for (const selector of [
    String.raw`\.hero h1`,
    String.raw`\.attendance h2`,
    String.raw`\.feature-showcase h2`,
    String.raw`\.testimonials h2`,
  ]) {
    assert.match(
      css,
      new RegExp(
        String.raw`@media\s*\(min-width:\s*1328px\)[\s\S]*${selector}\s*\{[^}]*white-space:\s*nowrap;`,
      ),
    );
  }
});

test("positions the overview desktop callout from the Figma frame", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.feature-callout--overview\s*{[^}]*top:\s*69px;[^}]*left:\s*367px;/,
  );
});

test("matches the Figma testimonial typography", () => {
  assert.match(css, /\.testimonial-card__quote-icon\s*{[^}]*font-size:\s*20px;/s);
  assert.match(
    css,
    /\.testimonial-card__quote-text\s*{[^}]*font-weight:\s*500;[^}]*line-height:\s*1\.5;/s,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.testimonial-card:nth-child\(1\)\s+\.testimonial-card__quote-text,[\s\S]*\.testimonial-card:nth-child\(3\)\s+\.testimonial-card__quote-text\s*{[^}]*font-size:\s*12px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.testimonial-card:nth-child\(2\)\s+\.testimonial-card__quote-text\s*{[^}]*font-size:\s*14px;/,
  );
});

test("uses the exact Figma pricing title weights", () => {
  assert.match(
    css,
    /\.price-card h3\s*{[^}]*font-family:\s*"Pretendard Variable"[^;]*;[^}]*font-weight:\s*700;/s,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.price-card--featured h3\s*{[^}]*font-size:\s*28px;[^}]*letter-spacing:\s*-0\.84px;/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1328px\)[\s\S]*\.pricing-cards__side \.price-card h3\s*{[^}]*font-size:\s*20px;[^}]*letter-spacing:\s*-0\.6px;/,
  );
});

test("matches the Figma footer typography and contact grouping", () => {
  assert.match(css, /\.footer-content\s*{[^}]*width:\s*293px;[^}]*gap:\s*24px;/s);
  assert.match(
    css,
    /\.footer-intro\s*{[^}]*font-size:\s*16px;[^}]*font-weight:\s*600;[^}]*line-height:\s*1\.5;/s,
  );
  assert.match(
    css,
    /\.footer-contact\s*{[^}]*min-height:\s*150px;[^}]*padding-left:\s*32px;[^}]*border-left:\s*1px solid/s,
  );
  assert.match(css, /\.footer-contact__row img\s*{[^}]*width:\s*24px;[^}]*height:\s*24px;/s);
  assert.match(css, /\.footer-contact__hours\s*{[^}]*font-size:\s*12px;/s);
});
