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
  imageWidth: number;
  imageHeight: number;
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

export const benefits: Benefit[] = [
  {
    icon: "/img/graduationcap.png",
    title: "현장 중심 설계",
    description: "학원 운영 경험을 누구보다 잘 아는 사람들이 직접 설계했습니다.",
  },
  {
    icon: "/img/chart.png",
    title: "데이터 성장",
    description: "축적된 데이터를 통해 학생의 성장을 예측하고 관리합니다.",
  },
  {
    icon: "/img/comment.png",
    title: "소통의 연결",
    description: "학생과 학부모, 학원이 소통하도록 가까이 돕습니다.",
  },
  {
    icon: "/img/shield.png",
    title: "안전한 보안",
    description: "중요한 데이터는 안전하게 암호화되어 보호됩니다.",
  },
];

export const flowSteps: FlowStep[] = [
  {
    number: "01",
    tab: "수업준비",
    title: "수업준비",
    description: "수업 전 체크리스트로 준비를 완벽하게 끝냅니다.",
    checklist: ["출결 반영 여부 확인", "교재 및 자료 준비", "출결 기기 연결 확인", "알림 설정 확인"],
  },
  {
    number: "02",
    tab: "학생 등원",
    title: "빠른 체크인",
    description: "QR과 태블릿으로 등원 상태를 자동 기록합니다.",
    checklist: ["학생 QR 확인", "등원 시간 기록", "지각 자동 분류", "학부모 알림 발송"],
  },
  {
    number: "03",
    tab: "수업 진행",
    title: "수업 집중",
    description: "수업 중 필요한 학생 정보와 기록을 한 화면에 모읍니다.",
    checklist: ["오늘의 수업 확인", "학생별 메모", "과제 등록", "특이사항 공유"],
  },
  {
    number: "04",
    tab: "성장 분석",
    title: "데이터 분석",
    description: "출결과 학습 데이터를 학생별 성장 리포트로 연결합니다.",
    checklist: ["출결 추이 분석", "과제 수행 확인", "성취도 비교", "상담 자료 생성"],
  },
  {
    number: "05",
    tab: "학부모 소통",
    title: "학부모 연결",
    description: "수업 결과와 공지를 필요한 순간에 정확하게 전달합니다.",
    checklist: ["수업 결과 공유", "상담 일정 안내", "공지 발송", "확인 여부 추적"],
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "수업이 더 체계적으로 바뀌고 운영 시간을 줄일 수 있었어요.",
    name: "김수연 원장",
    role: "서울 봄빛학원 · 예시 후기",
    image: "/img/review_01.png",
    imageWidth: 280,
    imageHeight: 346,
  },
  {
    quote: "운영 현황과 학습 데이터를 한눈에 보며 훨씬 효율적입니다.",
    name: "박도윤 원장",
    role: "대전 이음학원 · 예시 후기",
    image: "/img/review_02.png",
    imageWidth: 317,
    imageHeight: 394,
  },
  {
    quote: "학부모와의 소통이 빨라지고 놓치는 일이 줄었습니다.",
    name: "이하린 원장",
    role: "부산 나래학원 · 예시 후기",
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
    features: [
      "Starter의 모든 기능 포함",
      "AI 학습 분석 통계 리포트",
      "학부모 커뮤니케이션 자동 발송",
      "학원 수 무제한",
    ],
  },
  {
    name: "Starter",
    description: "소규모 학원을 위한 필수 플랜",
    price: "99,000",
    unit: "원/월",
    features: ["태블릿 출결 체크", "기본 학생 관리", "학부모 공지", "월간 리포트"],
  },
  {
    name: "Enterprise",
    description: "프랜차이즈·대형 학원 맞춤",
    price: "별도 문의",
    unit: "",
    features: [
      "Premium의 모든 기능 포함",
      "다지점 통합 관리",
      "전용 시스템 연동",
      "운영·마케팅 지원",
    ],
  },
];
