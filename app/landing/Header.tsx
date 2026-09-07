import Link from "next/link";
import { navItems } from "./content";
import { BrandMark, CtaLink } from "./ui";

function NavigationLinks() {
  return (
    <>
      {navItems.map((item) => (
        <a href={item.href} key={item.href}>
          {item.label}
        </a>
      ))}
    </>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand-link" href="/" aria-label="오늘의스터디 홈">
          <BrandMark />
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <NavigationLinks />
        </nav>
        <div className="header-actions">
          <a className="login-link" href="#contact">로그인</a>
          <CtaLink href="#pricing">무료로 시작하기</CtaLink>
        </div>
        <details className="mobile-nav">
          <summary aria-label="메뉴 열기">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="모바일 주요 메뉴">
            <NavigationLinks />
            <a href="#contact">로그인</a>
            <a className="mobile-nav__cta" href="#pricing">무료로 시작하기</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
