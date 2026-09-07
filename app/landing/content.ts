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
