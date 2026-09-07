import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(process.pid) + "-" + Date.now());
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the TodayStudy landing hero", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ko"/i);
  assert.match(html, /<title>오늘의스터디 \| 학원 운영 관리 플랫폼<\/title>/i);
  assert.match(html, /학생의 오늘을 기록하고/);
  assert.match(html, /내일의/);
  assert.match(html, /성장/);
  assert.match(html, /무료로 시작하기/);
  assert.match(html, /서비스 둘러보기/);
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.doesNotMatch(html, /Building your site|Your site is taking shape/);
});

test("renders the benefits and attendance product story", async () => {
  const html = await (await render()).text();
  assert.match(html, /학원을 가장 잘 아는/);
  assert.match(html, /현장 중심 설계/);
  assert.match(html, /데이터로 성장/);
  assert.match(html, /소통의 연결/);
  assert.match(html, /안정적인 보안/);
  assert.match(html, /태블릿으로 끝내는/);
  assert.match(html, /출석 체크와 자동 알림/);
  assert.match(html, /QR\/태블릿 출석 지원/);
});

test("renders all five academy workflow steps and management feature", async () => {
  const html = await (await render()).text();
  for (const label of ["수업준비", "학생 등원", "수업 진행", "성장 분석", "학부모 소통"]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /직관적인 화면 강력한 기능/);
  assert.match(html, /한눈에 확인/);
  assert.match(html, /빠르게 처리/);
});

test("renders proof, pricing, final CTA, and contact information", async () => {
  const html = await (await render()).text();
  assert.match(html, /현장에서 먼저/);
  assert.match(html, /변화를 경험한 분들의 이야기/);
  assert.match(html, /98%/);
  assert.match(html, /4\.8/);
  assert.match(html, /1,200/);
  assert.match(html, /Premium/);
  assert.match(html, /199,000/);
  assert.match(html, /Starter/);
  assert.match(html, /99,000/);
  assert.match(html, /Enterprise/);
  assert.match(html, /지금 시작하면/);
  assert.match(html, /학원의/);
  assert.match(html, /내일/);
  assert.match(html, /이 달라집니다/);
  assert.match(html, /sales@primers\.co\.kr/);
});

test("publishes social metadata without the starter preview runtime", async () => {
  const html = await (await render()).text();
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image" content="http:\/\/localhost\/og\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.equal(packageJson.dependencies?.["react-loading-skeleton"], undefined);
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
  await assert.rejects(
    access(new URL("../app/_sites-preview/preview.css", import.meta.url)),
  );
});

test("renders the supplied TodayStudy artwork in every visual section", async () => {
  const html = await (await render()).text();

  for (const asset of [
    "todaystudy_logo.svg",
    "hero_mockup.png",
    "graduationcap.png",
    "chart.png",
    "comment.png",
    "shield.png",
    "features_moockup.png",
    "cramclassflow_01.png",
    "cramclassflow_02-1.png",
    "cramclassflow_02-2.png",
    "cramclassflow_03_bg.png",
    "cramclassflow_03_people.png",
    "cramclassflow_03_memo.png",
    "cramclassflow_04_dashboard.png",
    "cramclassflow_04_people.png",
    "cramclassflow_05_bg.png",
    "smartsimple_mockup.png",
    "review_01.png",
    "review_02.png",
    "review_03.png",
    "cta_bg.png",
  ]) {
    assert.match(html, new RegExp(`/img/${asset.replace(".", "\\.")}`));
  }
});

test("renders one distinct visual panel for every academy workflow phase", async () => {
  const html = await (await render()).text();

  for (const phase of ["BEFORE CLASS", "CHECK-IN", "IN CLASS", "ANALYZE", "CONNECT"]) {
    assert.match(html, new RegExp(`data-flow-phase="${phase}"`));
  }
});

test("labels every academy workflow tab with its English phase", async () => {
  const html = await (await render()).text();

  for (const phase of ["BEFORE CLASS", "CHECK-IN", "IN CLASS", "ANALYZE", "CONNECT"]) {
    assert.match(html, new RegExp(`<small class="flow-tab__phase">${phase}</small>`));
  }
});

test("renders the Figma workflow workspace and state-specific copy", async () => {
  const html = await (await render()).text();

  assert.match(html, /class="flow-workspace\s/);

  for (const title of [
    "오늘의 준비 체크리스트",
    "오늘의 등원 체크",
    "오늘의 수업 포인트",
    "오늘의 분석 체크",
    "오늘의 공유 항목",
  ]) {
    assert.match(html, new RegExp(title));
  }

  for (const sentence of [
    "반별 수업 정보, 교재, 출결까지 한눈에 확인해보세요.",
    "등원 현황부터 지각ㆍ결석 상태까지 한눈에 확인해보세요.",
    "메모와 피드백까지 기록되어 모든 수업 기록이 한 흐름으로 연결됩니다.",
    "꾸준한 소통으로 학부모의 신뢰를 더욱 단단하게 만듭니다.",
  ]) {
    assert.match(html, new RegExp(sentence));
  }

  assert.match(html, /처음 단계 보기/);
});

test("renders the exact non-flow Figma section copy", async () => {
  const html = await (await render()).text();

  for (const sentence of [
    "데이터로 성장",
    "안정적인 보안",
    "QR/태블릿 출석 지원",
    "한눈에 확인",
    "빠르게 처리",
    "AI 학습 분석·통계 리포트",
    "학부모 카카오톡 자동 발송",
    "평일 09:00 ~ 18:00",
    "규모와 목적에 맞는 플랜을 선택해보세요.",
    "모든 플랜 동일 제공",
    "모든 핵심 기능을 제공하는 프리미엄 플랜입니다.",
  ]) {
    assert.match(html, new RegExp(sentence.replace(/[.*+?^\x24{}()|[\]\\]/g, "\\$&")));
  }
});
