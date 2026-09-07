import assert from "node:assert/strict";
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
  assert.match(html, /데이터 성장/);
  assert.match(html, /소통의 연결/);
  assert.match(html, /안전한 보안/);
  assert.match(html, /태블릿으로 끝내는/);
  assert.match(html, /출석 체크와 자동 알림/);
  assert.match(html, /QR체크인 출석 지원/);
});

test("renders all five academy workflow steps and management feature", async () => {
  const html = await (await render()).text();
  for (const label of ["수업준비", "학생 등원", "수업 진행", "성장 분석", "학부모 소통"]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /직관적인 화면 강력한 기능/);
  assert.match(html, /통합 학생 관리/);
  assert.match(html, /빠른 알림/);
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
