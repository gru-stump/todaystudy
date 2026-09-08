"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { navItems } from "./content";
import { BrandMark, CtaLink } from "./ui";

const HEADER_REVEAL_OFFSET = 80;
const SCROLL_DIRECTION_THRESHOLD = 6;
const TOP_BUTTON_OFFSET = 700;

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
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isTopButtonVisible, setIsTopButtonVisible] = useState(false);
  const lenis = useLenis();
  const lastScrollY = useRef(0);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    function updateScrollState() {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY.current;
      const mobileMenuOpen = document.querySelector<HTMLDetailsElement>(".mobile-nav[open]") !== null;

      setIsTopButtonVisible(scrollY > TOP_BUTTON_OFFSET);
      if (scrollY <= HEADER_REVEAL_OFFSET || mobileMenuOpen) {
        setIsHeaderHidden(false);
      } else if (delta > SCROLL_DIRECTION_THRESHOLD) {
        setIsHeaderHidden(true);
      } else if (delta < -SCROLL_DIRECTION_THRESHOLD) {
        setIsHeaderHidden(false);
      }

      lastScrollY.current = scrollY;
      animationFrame.current = null;
    }

    function handleScroll() {
      if (animationFrame.current !== null) return;
      animationFrame.current = window.requestAnimationFrame(updateScrollState);
    }

    lastScrollY.current = window.scrollY;
    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  function scrollToTop() {
    setIsHeaderHidden(false);
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 0.8,
        easing: (progress) => 1 - Math.pow(1 - progress, 3),
      });
      return;
    }

    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <>
      <header className={`site-header${isHeaderHidden ? " site-header--hidden" : ""}`}>
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
      <button
        aria-label="페이지 맨 위로 이동"
        className={`back-to-top${isTopButtonVisible ? " back-to-top--visible" : ""}`}
        onClick={scrollToTop}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
          <path d="m4 11 6-6 6 6M10 5v10" />
        </svg>
      </button>
    </>
  );
}
