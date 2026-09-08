import Image from "next/image";
import type { ReactNode } from "react";
import { assetPath } from "./asset-path.mjs";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-label="오늘의스터디">
      <Image
        alt=""
        height={26}
        src={assetPath("/img/todaystudy_logo.svg")}
        unoptimized
        width={168}
      />
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
