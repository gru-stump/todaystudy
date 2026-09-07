import type { ReactNode } from "react";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-label="오늘의스터디">
      <span className="brand-mark__symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>오늘의스터디</span>
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>;
}

export function CtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark";
}) {
  return (
    <a className={["cta", "cta--" + variant].join(" ")} href={href}>
      {children}
    </a>
  );
}

export function CheckMark() {
  return (
    <span className="check-mark" aria-hidden="true">
      ✓
    </span>
  );
}
