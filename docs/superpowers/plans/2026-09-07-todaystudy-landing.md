# 오늘의스터디 랜딩페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 첨부 레퍼런스의 아홉 개 섹션, 콘텐츠 위계, 흑백·라임 시각 언어, 제품 목업과 반응형 동작을 갖춘 오늘의스터디 단일 랜딩페이지를 구현한다.

**Architecture:** `app/page.tsx`는 섹션을 조합하는 서버 컴포넌트로 유지하고, 정적 콘텐츠·공용 UI·제품 목업·상호작용 섹션을 `app/landing` 아래에 책임별로 분리한다. 모바일 내비게이션은 기본 HTML 요소로, 수업 흐름 탭만 작은 클라이언트 컴포넌트로 구현해 자바스크립트 의존도를 제한한다.

**Tech Stack:** React 19.2.6, TypeScript 5.9.3, Vinext 1.0.0-beta.2, Tailwind CSS 4.2.1, CSS Modules 없이 전역 CSS, Node.js 내장 테스트 러너

**Spec:** `docs/superpowers/specs/2026-09-07-todaystudy-landing-design.md`

## Global Constraints

- Node.js는 `>=22.13.0`을 사용하고 저장소의 `.nvmrc` 값을 따른다.
- 루트 경로 `/` 하나만 구현하며 외부 API, 데이터베이스, 회원가입, 결제 기능은 추가하지 않는다.
- 모든 문구, 버튼, 카드, 요금제, 푸터는 레퍼런스의 정보 우선순위와 흑백·라임 색상 체계를 따른다.
- 장식용 모델 작성 SVG를 추가하지 않는다. 제품 화면은 HTML/CSS 목업으로 만든다.
- 실제 연결 주소가 없는 CTA는 `#pricing` 또는 `#contact`에 연결한다.
- 1440px, 768px, 390px 기준에서 가로 스크롤이 없어야 한다.
- 키보드 포커스, 의미 있는 제목 계층, 버튼·링크 이름, 이미지 대체 텍스트를 제공한다.
- 사이트 소스가 완성되기 전까지 `app/_sites-preview`는 유지하고, 최종 작업에서 제거한다.

## Planned File Structure

- `app/page.tsx`: 랜딩페이지 섹션 조합과 페이지 메타데이터
- `app/layout.tsx`: 한글 문서 설정, 전역 폰트, 사이트 공통 메타데이터
- `app/globals.css`: 디자인 토큰, 모든 섹션 레이아웃, 목업, 반응형·접근성 스타일
- `app/landing/content.ts`: 메뉴, 장점, 흐름, 후기, 요금제 정적 콘텐츠와 타입
- `app/landing/ui.tsx`: 워드마크, 섹션 라벨, CTA, 체크 아이콘 등 공용 표현 요소
- `app/landing/mockups.tsx`: 휴대폰, 태블릿, 출석·관리 대시보드 목업
- `app/landing/Header.tsx`: 데스크톱 내비게이션과 모바일 메뉴
- `app/landing/ClassFlowSection.tsx`: 수업 흐름 탭과 활성 단계 상태
- `app/landing/sections.tsx`: 히어로와 나머지 정적 섹션
- `public/testimonial-1.webp`, `public/testimonial-2.webp`, `public/testimonial-3.webp`: 후기 카드용 인물 이미지
- `public/og.png`: 완성된 페이지와 같은 팔레트·문구·목업을 사용하는 소셜 미리보기
- `tests/rendered-html.test.mjs`: 서버 렌더링, 핵심 콘텐츠, 메타데이터, 앵커 검증
- `tests/source-contract.test.mjs`: 반응형 규칙, 탭 접근성, 스타터 제거 검증

---

### Task 1: 브랜드 셸과 첫 화면 구현

**Files:**
- Create: `app/landing/content.ts`
- Create: `app/landing/ui.tsx`
- Create: `app/landing/mockups.tsx`
- Create: `app/landing/Header.tsx`
- Create: `app/landing/sections.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `navItems`, `benefits`, `flowSteps`, `testimonials`, `pricingPlans` 정적 배열
- Produces: `BrandMark`, `SectionLabel`, `CtaLink`, `CheckMark`, `HeroDevices`, `Header`, `HeroSection`
- Consumes: 없음

- [ ] **Step 1: 스타터 대신 브랜드와 히어로가 렌더링되어야 한다는 실패 테스트 작성**

`tests/rendered-html.test.mjs`의 두 스타터 테스트를 아래 검증으로 교체한다.

```js
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
```

- [ ] **Step 2: 테스트를 실행해 스타터 문구 때문에 실패하는지 확인**

Run: `npm run test`

Expected: FAIL with a missing `lang="ko"`, 오늘의스터디 title, or hero copy assertion.

- [ ] **Step 3: 정적 콘텐츠 타입과 첫 화면 공용 요소 구현**

`app/landing/content.ts`에 아래 타입과 첫 화면 메뉴를 만들고, 이후 작업에서 같은 파일의 배열을 확장한다.

```ts
export type NavItem = { label: string; href: string };
export type Benefit = { icon: string; title: string; description: string };
export type FlowStep = {
  number: string;
  tab: string;
  title: string;
  description: string;
  checklist: string[];
};
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: string;
};
export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  unit: string;
  features: string[];
  featured?: boolean;
  badge?: string;
};

export const navItems: NavItem[] = [
  { label: "서비스 소개", href: "#about" },
  { label: "기능", href: "#features" },
  { label: "요금제", href: "#pricing" },
  { label: "도입사례", href: "#stories" },
];
```

`app/landing/ui.tsx`는 `BrandMark`, `SectionLabel`, `CtaLink`, `CheckMark`를 named export한다. `CtaLink` 인터페이스는 아래와 같다.

```tsx
export function CtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
}) {
  return (
    <a className={`cta cta--${variant}`} href={href}>
      {children}
    </a>
  );
}
```

- [ ] **Step 4: 내비게이션, 히어로, 기기 목업을 구현**

`Header`는 `<details className="mobile-nav">`와 `<summary aria-label="메뉴 열기">`를 사용하고 `navItems`를 데스크톱·모바일에 각각 렌더링한다. `HeroDevices`는 `.tablet-device`, `.phone-device`, `.device-pen` 안에 학생 목록·학습 리포트 행을 실제 텍스트로 렌더링한다.

`HeroSection`은 아래 구조를 제공한다.

```tsx
export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">학원 운영의 모든 것, 하나의 플랫폼으로</p>
          <h1 id="hero-title">
            학생의 오늘을 기록하고,<br />내일의 <em>성장</em>을 만듭니다.
          </h1>
          <p className="hero__description">
            태블릿 출결부터, 학습 분석, 학부모 소통, 전자 설문까지<br />
            학원 운영에 필요한 모든 기능을 하나의 플랫폼에서 경험하세요.
          </p>
          <div className="button-row">
            <CtaLink href="#pricing">무료로 시작하기</CtaLink>
            <CtaLink href="#features" variant="secondary">서비스 둘러보기 →</CtaLink>
          </div>
        </div>
        <HeroDevices />
      </div>
      <a className="scroll-cue" href="#about" aria-label="서비스 소개로 이동">scroll</a>
    </section>
  );
}
```

`app/page.tsx`는 `Header`와 `HeroSection`을 렌더링하고 페이지 메타데이터를 `오늘의스터디 | 학원 운영 관리 플랫폼`과 `학생의 오늘을 기록하고 내일의 성장을 만드는 학원 운영 관리 플랫폼`으로 교체한다. `app/layout.tsx`의 `<html lang="ko">`와 같은 제목·설명을 설정한다.

- [ ] **Step 5: 첫 화면 스타일과 기본 토큰 구현**

`app/globals.css`에 `--lime: #a8eb00`, `--ink: #0d0e0d`, `--muted: #6f736e`, `--surface: #f4f5f2`, `--line: #e4e7e0`, `--container: 1200px`를 선언한다. `body`, `.container`, `.site-header`, `.hero`, `.hero__grid`, `.hero__copy`, `.hero-devices`, `.tablet-device`, `.phone-device`, `.cta`, `:focus-visible`을 정의하고 390px에서도 첫 화면에 가로 스크롤이 생기지 않도록 `overflow-x: clip`과 유동 크기를 적용한다.

- [ ] **Step 6: 빌드와 서버 렌더링 테스트가 통과하는지 확인**

Run: `npm run test`

Expected: PASS for the hero render test and exit code 0.

- [ ] **Step 7: 첫 의미 있는 미리보기 확인 후 커밋**

Run: `npm run dev`

Expected: Local URL이 출력되고 `/` 요청이 HTTP 200으로 응답한다. 이 시점에만 첫 로컬 미리보기를 연다.

```bash
git status --short
git add .
git commit -m "feat: build todaystudy landing hero"
```

---

### Task 2: 강점과 출석 관리 섹션 구현

**Files:**
- Modify: `app/landing/content.ts`
- Modify: `app/landing/mockups.tsx`
- Modify: `app/landing/sections.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `Benefit`, `SectionLabel`, `CheckMark`
- Produces: `BenefitsSection`, `AttendanceSection`, `AttendanceDashboard`

- [ ] **Step 1: 강점과 출석 섹션 콘텐츠 실패 테스트 작성**

첫 테스트 아래에 다음 테스트를 추가한다.

```js
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
```

- [ ] **Step 2: 테스트가 새 섹션 문구 부재로 실패하는지 확인**

Run: `npm run test`

Expected: FAIL on `학원을 가장 잘 아는` or `태블릿으로 끝내는`.

- [ ] **Step 3: 네 가지 강점 콘텐츠와 섹션 구현**

`benefits` 배열에 아래 데이터를 저장한다.

```ts
export const benefits: Benefit[] = [
  { icon: "⌂", title: "현장 중심 설계", description: "학원 운영 경험을 누구보다 잘 아는 사람들이 직접 설계했습니다." },
  { icon: "▥", title: "데이터 성장", description: "축적된 데이터를 통해 학생의 성장을 예측하고 관리합니다." },
  { icon: "▣", title: "소통의 연결", description: "학생과 학부모, 학원이 소통하도록 가까이 돕습니다." },
  { icon: "◆", title: "안전한 보안", description: "중요한 데이터는 안전하게 암호화되어 보호됩니다." },
];
```

`BenefitsSection`은 `id="about"`인 검정 배경 `<section>`과 네 개의 `<article>`로 구성하고, 각 카드 제목을 `<h3>`로 제공한다.

- [ ] **Step 4: 출석 대시보드와 설명 구현**

`AttendanceDashboard`는 사이드바 메뉴 `전체 학생`, `출석 관리`, `수업 관리`, 본문 제목 `오늘의 출석`, 다섯 학생 행, 초록 상태 배지를 렌더링한다. `AttendanceSection`은 `id="features"`를 사용하고 다음 체크 항목을 제공한다.

```tsx
const attendanceChecks = [
  "QR체크인 출석 지원",
  "지각 · 조퇴 · 결석 자동 구분",
  "학부모 실시간 알림 발송",
  "출석 통계 및 리포트 제공",
];
```

- [ ] **Step 5: 검정 강점 영역과 흰 출석 영역의 반응형 스타일 구현**

`app/globals.css`에 `.dark-section`, `.benefit-grid`, `.benefit-card`, `.attendance`, `.attendance__grid`, `.dashboard`, `.dashboard__sidebar`, `.dashboard__body`, `.student-row`, `.status-pill`을 추가한다. 900px 이하에서 강점은 2열, 출석은 1열로 전환하고 560px 이하에서 강점도 1열로 전환한다.

- [ ] **Step 6: 테스트와 빌드 검증 후 커밋**

Run: `npm run test`

Expected: all tests PASS and build exit code 0.

```bash
git add app/page.tsx app/globals.css app/landing tests/rendered-html.test.mjs
git commit -m "feat: add benefits and attendance sections"
```

---

### Task 3: 수업 흐름과 관리자 기능 구현

**Files:**
- Create: `app/landing/ClassFlowSection.tsx`
- Modify: `app/landing/content.ts`
- Modify: `app/landing/mockups.tsx`
- Modify: `app/landing/sections.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/source-contract.test.mjs`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `FlowStep`, `SectionLabel`, `CheckMark`, `ManagementDashboard`
- Produces: `ClassFlowSection`, `FeatureShowcaseSection`, `ManagementDashboard`

- [ ] **Step 1: 흐름 콘텐츠와 접근 가능한 탭 계약 테스트 작성**

`tests/rendered-html.test.mjs`에 다음 서버 렌더링 테스트를 추가한다.

```js
test("renders all five academy workflow steps and management feature", async () => {
  const html = await (await render()).text();
  for (const label of ["수업준비", "학생 등원", "수업 진행", "성장 분석", "학부모 소통"]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /직관적인 화면 강력한 기능/);
  assert.match(html, /통합 학생 관리/);
  assert.match(html, /빠른 알림/);
});
```

`tests/source-contract.test.mjs`를 아래 내용으로 만든다.

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("class flow implements an accessible tab interface", async () => {
  const source = await readFile(
    new URL("../app/landing/ClassFlowSection.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tab"/);
  assert.match(source, /aria-selected=/);
  assert.match(source, /aria-controls=/);
  assert.match(source, /role="tabpanel"/);
  assert.match(source, /onKeyDown=/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /ArrowLeft/);
});
```

`package.json`의 test 명령을 `npm run build && node --test tests/*.test.mjs`로 변경한다.

- [ ] **Step 2: 테스트가 파일과 문구 부재로 실패하는지 확인**

Run: `npm run test`

Expected: FAIL because `ClassFlowSection.tsx` does not exist and workflow copy is absent.

- [ ] **Step 3: 다섯 단계 데이터를 구현**

`flowSteps`는 다음 레코드를 사용한다.

```ts
export const flowSteps: FlowStep[] = [
  { number: "01", tab: "수업준비", title: "수업준비", description: "수업 전 체크리스트로 준비를 완벽하게 끝냅니다.", checklist: ["출결 반영 여부 확인", "교재 및 자료 준비", "출결 기기 연결 확인", "알림 설정 확인"] },
  { number: "02", tab: "학생 등원", title: "빠른 체크인", description: "QR과 태블릿으로 등원 상태를 자동 기록합니다.", checklist: ["학생 QR 확인", "등원 시간 기록", "지각 자동 분류", "학부모 알림 발송"] },
  { number: "03", tab: "수업 진행", title: "수업 집중", description: "수업 중 필요한 학생 정보와 기록을 한 화면에 모읍니다.", checklist: ["오늘의 수업 확인", "학생별 메모", "과제 등록", "특이사항 공유"] },
  { number: "04", tab: "성장 분석", title: "데이터 분석", description: "출결과 학습 데이터를 학생별 성장 리포트로 연결합니다.", checklist: ["출결 추이 분석", "과제 수행 확인", "성취도 비교", "상담 자료 생성"] },
  { number: "05", tab: "학부모 소통", title: "학부모 연결", description: "수업 결과와 공지를 필요한 순간에 정확하게 전달합니다.", checklist: ["수업 결과 공유", "상담 일정 안내", "공지 발송", "확인 여부 추적"] },
];
```

- [ ] **Step 4: 키보드 조작 가능한 수업 흐름 탭 구현**

`ClassFlowSection.tsx`는 `"use client"`, `useState(0)`, `useRef<Array<HTMLButtonElement | null>>([])`를 사용한다. `ArrowRight`와 `ArrowLeft`는 활성 인덱스를 순환하고 새 탭에 포커스를 이동한다. `다음 단계 보기 →` 버튼은 `(activeIndex + 1) % flowSteps.length`를 선택한다. 모든 탭에 `id="flow-tab-${index}"`, `aria-controls="flow-panel-${index}"`, 패널에 대응하는 `aria-labelledby`를 설정한다.

- [ ] **Step 5: 관리자 대시보드와 기능 콜아웃 구현**

`ManagementDashboard`는 상단 검색 영역, 학생 현황 숫자 네 개, 최근 출결 목록, 예정 수업 목록을 포함한다. `FeatureShowcaseSection`은 검정 배경에서 왼쪽 제목, 중앙 대시보드, 양쪽의 `통합 학생 관리`와 `빠른 알림` 콜아웃을 렌더링한다.

- [ ] **Step 6: 흐름 탭과 검정 기능 영역 스타일 구현**

`.class-flow`, `.flow-tabs`, `.flow-tab`, `.flow-tab[aria-selected="true"]`, `.flow-panel`, `.flow-checklist`, `.feature-showcase`, `.management-stage`, `.feature-callout`을 추가한다. 900px 이하에서는 탭을 가로 스크롤 가능한 단일 행으로 유지하고 패널을 한 열로 바꾸며, 관리자 콜아웃은 대시보드 아래 두 열로 이동한다.

- [ ] **Step 7: 테스트와 빌드 검증 후 커밋**

Run: `npm run test`

Expected: rendered HTML and source contract tests PASS.

```bash
git add package.json app/page.tsx app/globals.css app/landing tests
git commit -m "feat: add academy workflow and management showcase"
```

---

### Task 4: 후기, 요금제, 최종 전환과 푸터 구현

**Files:**
- Create: `public/testimonial-1.webp`
- Create: `public/testimonial-2.webp`
- Create: `public/testimonial-3.webp`
- Modify: `app/landing/content.ts`
- Modify: `app/landing/sections.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `Testimonial`, `PricingPlan`, `SectionLabel`, `CtaLink`, `CheckMark`
- Produces: `TestimonialsSection`, `PricingSection`, `FinalCtaSection`, `Footer`

- [ ] **Step 1: 후기, 가격, 푸터의 실패 테스트 작성**

```js
test("renders proof, pricing, final CTA, and contact information", async () => {
  const html = await (await render()).text();
  assert.match(html, /현장에서 먼저 변화를 경험한/);
  assert.match(html, /98%/);
  assert.match(html, /4\.8/);
  assert.match(html, /1,200/);
  assert.match(html, /Premium/);
  assert.match(html, /199,000/);
  assert.match(html, /Starter/);
  assert.match(html, /99,000/);
  assert.match(html, /Enterprise/);
  assert.match(html, /지금 시작하면/);
  assert.match(html, /학원의 내일이 달라집니다/);
  assert.match(html, /sales@primers\.co\.kr/);
});
```

- [ ] **Step 2: 테스트가 후기나 요금제 문구 부재로 실패하는지 확인**

Run: `npm run test`

Expected: FAIL on `현장에서 먼저 변화를 경험한` or `Premium`.

- [ ] **Step 3: 후기 이미지 세 장 준비**

밝은 학원 또는 사무실을 배경으로 한 서로 다른 한국인 성인 인물 사진 세 장을 동일한 세로 비율로 준비한다. 정면 증명사진보다 자연스러운 인터뷰 장면을 선택하고 각 파일을 900×1125px WebP, 품질 82로 저장한다. 이미지의 출처와 사용 가능 조건을 확인하고 파일명은 계획된 경로를 그대로 사용한다.

- [ ] **Step 4: 후기와 요금제 데이터 구현**

```ts
export const testimonials: Testimonial[] = [
  { quote: "수업이 더 체계적으로 바뀌고 운영 시간을 줄일 수 있었어요.", name: "김수연 원장", role: "서울 봄빛학원 · 예시 후기", image: "/testimonial-1.webp" },
  { quote: "운영 현황과 학습 데이터를 한눈에 보며 훨씬 효율적입니다.", name: "박도윤 원장", role: "대전 이음학원 · 예시 후기", image: "/testimonial-2.webp" },
  { quote: "학부모와의 소통이 빨라지고 놓치는 일이 줄었습니다.", name: "이하린 원장", role: "부산 나래학원 · 예시 후기", image: "/testimonial-3.webp" },
];

export const pricingPlans: PricingPlan[] = [
  { name: "Premium", description: "성장하는 학원을 위한 최적의 선택", price: "199,000", unit: "원/월", featured: true, badge: "가장 인기 있는 플랜", features: ["Starter의 모든 기능 포함", "AI 학습 분석 통계 리포트", "학부모 커뮤니케이션 자동 발송", "학원 수 무제한"] },
  { name: "Starter", description: "소규모 학원을 위한 필수 플랜", price: "99,000", unit: "원/월", features: ["태블릿 출결 체크", "기본 학생 관리", "학부모 공지", "월간 리포트"] },
  { name: "Enterprise", description: "프랜차이즈·대형 학원 맞춤", price: "별도 문의", unit: "", features: ["Premium의 모든 기능 포함", "다지점 통합 관리", "전용 시스템 연동", "운영·마케팅 지원"] },
];
```

- [ ] **Step 5: 후기, 요금제, CTA, 푸터 마크업 구현**

`TestimonialsSection`은 `id="stories"`, 세 지표와 세 후기 `<article>`을 렌더링한다. `PricingSection`은 `id="pricing"`, Premium 대표 카드와 Starter·Enterprise 보조 카드를 제공한다. `FinalCtaSection`의 버튼은 `#pricing`과 `#contact`를 사용한다. `Footer`는 `id="contact"`, 전화 `051.939.8154`, 이메일 `sales@primers.co.kr`, 사업자 정보, `© 2026 Primers. All rights reserved.`를 표시한다.

- [ ] **Step 6: 후기·가격·CTA·푸터 스타일 구현**

`.testimonials`, `.metrics`, `.metric`, `.testimonial-grid`, `.testimonial-card`, `.testimonial-card__quote`, `.pricing`, `.pricing__grid`, `.price-card`, `.price-card--featured`, `.final-cta`, `.final-cta::before`, `.site-footer`를 추가한다. 후기 이미지는 `aspect-ratio: 4 / 5`, `object-fit: cover`를 사용한다. 모바일에서 모든 카드는 한 열이며 Premium 카드가 먼저 노출된다.

- [ ] **Step 7: 테스트와 빌드 검증 후 커밋**

Run: `npm run test`

Expected: all landing content assertions PASS and build exit code 0.

```bash
git add public/testimonial-*.webp app/page.tsx app/globals.css app/landing tests/rendered-html.test.mjs
git commit -m "feat: add testimonials pricing and conversion sections"
```

---

### Task 5: 스타터 제거, 소셜 카드, 최종 반응형 검증

**Files:**
- Create: `public/og.png`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tests/source-contract.test.mjs`
- Delete: `app/_sites-preview/SkeletonPreview.tsx`
- Delete: `app/_sites-preview/preview.css`

**Interfaces:**
- Consumes: 완성된 루트 페이지의 브랜드 문구, 라임 팔레트, 기기 목업
- Produces: 루트 Open Graph·X 메타데이터와 배포 가능한 최종 사이트

- [ ] **Step 1: 스타터 제거와 반응형 규칙의 실패 테스트 작성**

`tests/source-contract.test.mjs`에 아래 테스트를 추가한다.

```js
test("finished site removes starter code and keeps responsive safeguards", async () => {
  const [css, layout, page, packageJson] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
```

`tests/source-contract.test.mjs`의 import를 `import { access, readFile } from "node:fs/promises";`로 변경한다.

- [ ] **Step 2: 테스트가 스타터 디렉터리와 메타데이터 때문에 실패하는지 확인**

Run: `npm run test`

Expected: FAIL on missing `/og.png`, presence of `react-loading-skeleton`, or existing `_sites-preview`.

- [ ] **Step 3: 소셜 미리보기 카드 생성과 검수**

이미지 생성은 정확히 한 번의 완성 카드 요청으로 진행한다. 프롬프트는 `오늘의스터디의 흰색·검정·밝은 라임 브랜드, 왼쪽에 '학생의 오늘을 기록하고, 내일의 성장을 만듭니다.'라는 정확한 한글 제목, 오른쪽에 기울어진 태블릿과 휴대폰 학원 관리 대시보드, 1200×630 가로형 소셜 공유 카드, 높은 대비와 넉넉한 안전 여백`으로 고정한다. 결과에서 제목의 한글이 틀렸거나 잘린 경우 한 번만 재시도하고, 검수에 통과한 이미지를 `public/og.png`로 저장한다. 두 번 모두 사용할 수 없으면 `og:image` 필드를 제외하고 나머지 메타데이터만 제공한다.

- [ ] **Step 4: 메타데이터와 모션 저감 규칙 완성**

`app/layout.tsx`의 `metadata`에 아래 필드를 추가한다.

```ts
openGraph: {
  title: "오늘의스터디 | 학원 운영 관리 플랫폼",
  description: "학생의 오늘을 기록하고 내일의 성장을 만드는 학원 운영 관리 플랫폼",
  type: "website",
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "오늘의스터디 서비스 소개" }],
},
twitter: {
  card: "summary_large_image",
  title: "오늘의스터디 | 학원 운영 관리 플랫폼",
  description: "학생의 오늘을 기록하고 내일의 성장을 만드는 학원 운영 관리 플랫폼",
  images: ["/og.png"],
},
```

`app/globals.css`에 `@media (prefers-reduced-motion: reduce)`를 추가해 `scroll-behavior: auto`, transition과 animation 지속 시간을 `0.01ms`로 제한한다.

- [ ] **Step 5: 스타터 코드와 불필요한 패키지 제거**

`app/_sites-preview` 디렉터리의 두 파일을 삭제하고 `react-loading-skeleton`을 제거한다.

Run: `npm uninstall react-loading-skeleton`

Expected: dependency is absent from `package.json` and `package-lock.json` is refreshed.

- [ ] **Step 6: 전체 검증 수행**

Run: `npm run lint`

Expected: exit code 0 with no ESLint errors.

Run: `npm run test`

Expected: build completes and all tests PASS with 0 failures.

Run: `git status --short`

Expected: only the intended Task 5 files are modified or untracked.

- [ ] **Step 7: 최종 커밋**

```bash
git add app/layout.tsx app/globals.css app/_sites-preview package.json package-lock.json public/og.png tests/source-contract.test.mjs
git commit -m "feat: finalize responsive todaystudy landing page"
```

---

### Task 6: 배포와 공개 주소 확인

**Files:**
- Verify: `.openai/hosting.json`

**Interfaces:**
- Consumes: 빌드와 테스트를 통과한 랜딩페이지
- Produces: 사용자가 열 수 있는 Sites 배포 URL

- [ ] **Step 1: 호스팅 선언 확인**

`.openai/hosting.json`이 아래와 같이 외부 저장소를 선언하지 않는지 확인한다.

```json
{
  "d1": null,
  "r2": null
}
```

- [ ] **Step 2: Sites 호스팅 절차로 배포**

`sites:sites-hosting` 스킬을 사용해 현재 프로젝트를 배포한다. 배포 중 새 D1, R2, 인증, 외부 환경 변수는 만들지 않는다.

- [ ] **Step 3: 배포된 루트 확인**

배포 URL의 `/`가 HTTP 200으로 응답하고 제목이 `오늘의스터디 | 학원 운영 관리 플랫폼`인지 확인한다.

- [ ] **Step 4: 로컬 개발 서버 종료와 결과 전달**

유지 중인 로컬 개발 서버를 종료하고 사용자에게 배포 URL을 기본 결과로 전달한다.
