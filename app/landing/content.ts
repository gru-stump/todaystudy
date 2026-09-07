export type NavItem = { label: string; href: string };
export type Benefit = { icon: string; title: string; description: string };
export type FlowStep = {
  number: string;
  phase: "BEFORE CLASS" | "CHECK-IN" | "IN CLASS" | "ANALYZE" | "CONNECT";
  tab: string;
  title: string;
  description: [string, string];
  checklistTitle: string;
  checklist: string[];
  ctaLabel: string;
};
export type Testimonial = {
  quoteLine1: string;
  quoteHighlight: string;
  quoteTail: string;
  name: string;
  role?: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
};
export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  unit: string;
  details?: [string, string];
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

export const benefits: Benefit[] = [
  {
    icon: "/img/graduationcap.png",
    title: "현장 중심 설계",
    description: "학원 운영 흐름을 누구보다 잘 아는 사람들이 직접 설계했습니다.",
  },
  {
    icon: "/img/chart.png",
    title: "데이터로 성장",
    description: "축적된 데이터를 통해 학생의 성장을 예측하고 관리합니다.",
  },
  {
    icon: "/img/comment.png",
    title: "소통의 연결",
    description: "학원과 학부모, 학생의 소통이 더 가까워집니다.",
  },
  {
    icon: "/img/shield.png",
    title: "안정적인 보안",
    description: "중요한 데이터는 안전하게 암호화하여 보호됩니다.",
  },
];

export const flowSteps: FlowStep[] = [
  {
    number: "01",
    phase: "BEFORE CLASS",
    tab: "수업준비",
    title: "수업준비",
    description: [
      "수업 전 체크리스트로 준비를 완벽하게!",
      "반별 수업 정보, 교재, 출결까지 한눈에 확인해보세요.",
    ],
    checklistTitle: "오늘의 준비 체크리스트",
    checklist: ["출결 반/수업 확인", "교재 및 자료 준비", "출결 기기 연결 확인", "알림 설정 확인"],
    ctaLabel: "다음 단계 보기",
  },
  {
    number: "02",
    phase: "CHECK-IN",
    tab: "학생 등원",
    title: "학생 등원",
    description: [
      "학생이 도착하면 출결이 자동으로 정리됩니다.",
      "등원 현황부터 지각ㆍ결석 상태까지 한눈에 확인해보세요.",
    ],
    checklistTitle: "오늘의 등원 체크",
    checklist: ["출결 반/수업 확인", "교재 및 자료 준비", "출결 기기 연결 확인", "알림 설정 확인"],
    ctaLabel: "다음 단계 보기",
  },
  {
    number: "03",
    phase: "IN CLASS",
    tab: "수업 진행",
    title: "수업 진행",
    description: [
      "수업 중 실시간으로 진도와 과제, 학생 상태를 한눈에 관리하세요.",
      "메모와 피드백까지 기록되어 모든 수업 기록이 한 흐름으로 연결됩니다.",
    ],
    checklistTitle: "오늘의 수업 포인트",
    checklist: ["수업 자료와 진도 확인", "학생별 과제 및 오답 체크", "개별 메모와 피드백 기록", "수업 기록 자동 저장"],
    ctaLabel: "다음 단계 보기",
  },
  {
    number: "04",
    phase: "ANALYZE",
    tab: "성장 분석",
    title: "성장 분석",
    description: [
      "출결과 학습 데이터를 한데 모아 성장 흐름을 분석하세요.",
      "AI 요약과 다음 학습 방향까지 한눈에 확인할 수 있습니다.",
    ],
    checklistTitle: "오늘의 분석 체크",
    checklist: ["출결/학습 데이터 자동 수집", "학생별 성취도 비교", "AI 리포트 요약 확인", "다음 학습 방향 제안"],
    ctaLabel: "다음 단계 보기",
  },
  {
    number: "05",
    phase: "CONNECT",
    tab: "학부모 소통",
    title: "학부모 소통",
    description: [
      "수업 결과와 메시지를 간편하게 공유하고,",
      "꾸준한 소통으로 학부모의 신뢰를 더욱 단단하게 만듭니다.",
    ],
    checklistTitle: "오늘의 공유 항목",
    checklist: ["수업 결과 요약 전달", "출결ㆍ과제 현황 공유", "개별 코멘트 및 상담 연결", "알림 발송 내역 확인"],
    ctaLabel: "처음 단계 보기",
  },
];

export const testimonials: Testimonial[] = [
  {
    quoteLine1: "출결과 리포트 업무가 줄어",
    quoteHighlight: "수업에 더 집중",
    quoteTail: "할 수 있어요",
    name: "김oo 선생님",
    role: "에xx 학원",
    image: "/img/review_01.png",
    imageWidth: 280,
    imageHeight: 346,
  },
  {
    quoteLine1: "운영 현황과 학습 데이터가",
    quoteHighlight: "한눈에 보여",
    quoteTail: "훨씬 효율적입니다.",
    name: "박oo 원장님",
    role: "미xxx 학원",
    image: "/img/review_02.png",
    imageWidth: 317,
    imageHeight: 394,
  },
  {
    quoteLine1: "아이의 학습 변화가",
    quoteHighlight: "눈에 보여",
    quoteTail: "안심되서 좋습니다.",
    name: "이oo 학부모님",
    image: "/img/review_03.png",
    imageWidth: 280,
    imageHeight: 347,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Premium",
    description: "성장하는 학원을 위한 최적의 선택",
    price: "199,000",
    unit: "원/월",
    featured: true,
    badge: "가장 인기 있는 플랜",
    details: [
      "학습 관리, 성과 분석, 자동화 기능까지",
      "모든 핵심 기능을 제공하는 프리미엄 플랜입니다.",
    ],
    features: [
      "Starter의 모든 기능 포함",
      "AI 학습 분석·통계 리포트",
      "학부모 카카오톡 자동 발송",
      "학생 수 무제한",
    ],
  },
  {
    name: "Starter",
    description: "소규모 학원을 위한 필수 플랜",
    price: "99,000",
    unit: "원/월",
    features: ["태블릿 채점 (책·시험지)", "기본 성적 관리", "학생 관리 (30명까지)", "월간 학습 리포트"],
  },
  {
    name: "Enterprise",
    description: "프랜차이즈·대형 학원 맞춤",
    price: "별도 문의",
    unit: "",
    features: [
      "Premium의 모든 기능 포함",
      "다지점 통합 관리",
      "기존 시스템 데이터 연동",
      "전담 매니저 지원",
    ],
  },
];
