# 오늘의스터디

학원 운영에 필요한 출결, 학습 관리, 분석, 학부모 소통 기능을 소개하는 **오늘의스터디 랜딩페이지**입니다.

![오늘의스터디 미리보기](./public/og.png)

## 관련 링크

- [배포 사이트](https://todaystudy.thdus4320.chatgpt.site)
- [Figma 디자인](https://www.figma.com/design/bCb2lBu9b18hVPFvIdw4j8/-DES_Sprint--%EC%98%A4%EB%8A%98%EC%9D%98-%EC%8A%A4%ED%84%B0%EB%94%94?node-id=41-3230&t=4FunpaWCX6S7tEin-1)
- [GitHub 저장소](https://github.com/gru-stump/todaystudy)

> 배포 사이트는 Sites 접근 정책에 따라 허용된 계정의 로그인이 필요할 수 있습니다.

## 주요 구현 내용

- 최대 너비 1280px 기반의 데스크톱, 태블릿, 모바일 반응형 레이아웃
- 히어로, 서비스 특징, 출석 관리, 후기, 요금제, CTA 및 푸터 섹션
- 5단계 `CRAM CLASS FLOW` 자동 재생과 단계별 진행선 애니메이션
- AOS 기반 스크롤 등장 효과와 재진입 시 애니메이션 재실행
- Lenis 기반 부드러운 스크롤
- 스크롤 방향에 따른 헤더 노출 제어
- 하단 진입 시 표시되는 부드러운 최상단 이동 버튼
- Figma에서 제공된 고해상도 이미지와 SVG 에셋 적용

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| UI | React 19, TypeScript |
| 프레임워크 | vinext |
| 빌드 | Vite |
| 애니메이션 | AOS, Lenis, CSS Animation |
| 배포 | OpenAI Sites, Cloudflare Workers 기반 런타임 |
| 테스트 | Node.js Test Runner, Chrome CDP 기반 브라우저 테스트 |
| 코드 품질 | ESLint |

## 로컬 실행

### 요구사항

- Node.js `22.13.0` 이상
- npm

### 설치 및 실행

```bash
git clone https://github.com/gru-stump/todaystudy.git
cd todaystudy
npm install
npm run dev
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 로컬 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run start` | 프로덕션 빌드 실행 |
| `npm run lint` | 전체 소스 ESLint 검사 |
| `npm test` | 프로덕션 빌드 및 전체 테스트 실행 |
| `npm run db:generate` | Drizzle 스키마 변경 시 마이그레이션 생성 |

## 프로젝트 구조

```text
todaystudy/
├─ app/
│  ├─ landing/              # 랜딩페이지 섹션, 콘텐츠, 인터랙션
│  ├─ globals.css           # 공통 스타일과 반응형 레이아웃
│  ├─ layout.tsx            # 메타데이터와 공통 레이아웃
│  └─ page.tsx              # 랜딩페이지 진입점
├─ public/
│  ├─ img/                  # 목업, 플로우, 아이콘, 후기 이미지
│  └─ og.png                # 공유 및 README 미리보기 이미지
├─ tests/                   # 레이아웃, 렌더링, 브라우저 회귀 테스트
├─ worker/                  # 배포 런타임 진입점
├─ .openai/hosting.json     # Sites 프로젝트 연결 설정
├─ package.json
└─ vite.config.ts
```

## 디자인 및 에셋 참고사항

- 화면 구현 기준은 위 Figma의 `03_Design` 페이지입니다.
- 공통 콘텐츠 최대 너비는 1280px입니다.
- 랜딩페이지 이미지는 `public/img/`에서 관리합니다.
- 히어로에는 `hero_mockup.png`의 3000×2000 고해상도 원본을 사용합니다.
- `CRAM CLASS FLOW`는 이미지 한 장이 아닌 단계별 레이어와 상태 컴포넌트로 구성되어 있습니다.
- 파일명 변경 시 `app/landing/` 내부의 이미지 참조도 함께 수정해야 합니다.

## 검증

변경 사항을 전달하거나 배포하기 전에 다음 명령어를 실행합니다.

```bash
npm run lint
npm test
```

브라우저 테스트에는 Chrome이 필요합니다. 테스트는 데스크톱·태블릿·모바일 레이아웃, 수평 오버플로, 스크롤 효과, AOS 재실행, `CRAM CLASS FLOW` 전환 동작을 검증합니다.

## 배포

이 프로젝트는 `.openai/hosting.json`에 연결된 OpenAI Sites 프로젝트로 배포합니다. GitHub에 푸시하는 것만으로 사이트가 자동 배포되지는 않으며, 별도의 Sites 배포 과정이 필요합니다.

현재 배포 주소: [https://todaystudy.thdus4320.chatgpt.site](https://todaystudy.thdus4320.chatgpt.site)
