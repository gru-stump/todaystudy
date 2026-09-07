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
