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

export const benefits: Benefit[] = [
  {
    icon: "⌂",
    title: "현장 중심 설계",
    description: "학원 운영 경험을 누구보다 잘 아는 사람들이 직접 설계했습니다.",
  },
  {
    icon: "▥",
    title: "데이터 성장",
    description: "축적된 데이터를 통해 학생의 성장을 예측하고 관리합니다.",
  },
  {
    icon: "▣",
    title: "소통의 연결",
    description: "학생과 학부모, 학원이 소통하도록 가까이 돕습니다.",
  },
  {
    icon: "◆",
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
