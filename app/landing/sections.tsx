import Image from "next/image";
import type { CSSProperties } from "react";
import { assetPath } from "./asset-path.mjs";
import { benefits, pricingPlans, testimonials } from "./content";
import {
  AttendanceDashboard,
  HeroDevices,
  ManagementDashboard,
} from "./mockups";
import { BrandMark, CheckMark, CtaLink, SectionLabel } from "./ui";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy" data-aos="fade-right" data-aos-duration="700">
          <p className="eyebrow">학원 운영의 모든 것, 하나의 플랫폼으로</p>
          <h1 id="hero-title">
            학생의 오늘을 기록하고,<br />
            내일의 <em>성장</em>을 만듭니다.
          </h1>
          <p className="hero__description">
            태블릿 출결부터, 학습 분석, 학부모 소통, 전자 설문까지
            <br />
            학원 운영에 필요한 모든 기능을 하나의 플랫폼에서 경험하세요.
          </p>
          <div className="button-row">
            <CtaLink href="#pricing">무료로 시작하기</CtaLink>
            <CtaLink href="#features" variant="secondary">
              서비스 둘러보기 →
            </CtaLink>
          </div>
        </div>
        <HeroDevices />
      </div>
      <a className="scroll-cue" href="#about" aria-label="서비스 소개로 이동">
        <span aria-hidden="true" />
        scroll
      </a>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section className="dark-section benefits" id="about" aria-labelledby="benefits-title">
      <div className="container">
        <div className="benefits__heading" data-aos="fade-up">
          <SectionLabel>WHY TODAYSTUDY?</SectionLabel>
          <h2 id="benefits-title">학원을 가장 잘 아는<br />사람들이 만들었습니다</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit, index) => (
            <article
              className="benefit-card"
              data-aos="fade-up"
              data-aos-delay={index * 80}
              key={benefit.title}
            >
              <Image
                alt=""
                className="benefit-card__icon"
                height={48}
                src={assetPath(benefit.icon)}
                unoptimized
                width={48}
              />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const attendanceChecks = [
  "QR/태블릿 출석 지원",
  "지각ㆍ조퇴ㆍ결석ㆍ자동 구분",
  "학부모 실시간 알림톡 발송",
  "출석 통계 및 리포트 제공",
];

export function AttendanceSection() {
  return (
    <section className="attendance" id="features" aria-labelledby="attendance-title">
      <div className="container attendance__grid">
        <div className="section-copy" data-aos="fade-right">
          <SectionLabel>FEATURES</SectionLabel>
          <h2 id="attendance-title">태블릿으로 끝내는<br />출석 체크와 자동 알림</h2>
          <p>태블릿으로 간편하게 출결을 관리하고,<br />실시간으로 학부모에게 알림을 전송하세요.</p>
          <ul className="check-list">
            {attendanceChecks.map((item) => (
              <li key={item}><CheckMark />{item}</li>
            ))}
          </ul>
        </div>
        <AttendanceDashboard />
      </div>
    </section>
  );
}

export function FeatureShowcaseSection() {
  return (
    <section className="feature-showcase" aria-labelledby="showcase-title">
      <div className="container feature-showcase__inner">
        <div className="feature-showcase__copy" data-aos="fade-right">
          <SectionLabel>SMART &amp; SIMPLE</SectionLabel>
          <h2 id="showcase-title">직관적인 화면 강력한 기능</h2>
          <p>누구나 쉽게, 그러나 강력하게 사용할 수 있도록<br />오늘의 스터디는 사용성을 최우선으로 설계했습니다.</p>
        </div>
        <div
          className="feature-callout feature-callout--overview"
          data-aos="fade-up"
          data-aos-delay="0"
        >
          <Image aria-hidden="true" alt="" height={16} src={assetPath("/img/feature-overview.svg")} unoptimized width={16} />
          <div><b>한눈에 확인</b><p>필요한 정보와<br />오늘의 업무를 한 화면에서</p></div>
        </div>
        <div className="management-stage">
          <ManagementDashboard />
          <div
            className="feature-callout feature-callout--action"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <Image aria-hidden="true" alt="" height={16} src={assetPath("/img/feature-action.svg")} unoptimized width={16} />
            <div><b>빠르게 처리</b><p>반복되는 업무는 줄이고,<br />클릭은 최소한으로</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="testimonials" id="stories" aria-labelledby="stories-title">
      <div className="container testimonials__grid">
        <div className="testimonials__copy" data-aos="fade-right">
          <SectionLabel>TRUST &amp; REVIEWS</SectionLabel>
          <h2 id="stories-title">현장에서 먼저<br />변화를 경험한 분들의 이야기</h2>
          <p>오늘의 스터디는 더 나은 교육을 위해,<br />지금도 많은 학원과 함께하고 있습니다.</p>
          <div className="metrics" aria-label="서비스 주요 지표">
            <div className="metric"><b>98%</b><span>서비스 만족도</span></div>
            <div className="metric"><b>4.8<span>/5</span></b><span>평균 평점</span></div>
            <div className="metric"><b>1,200<span>+</span></b><span>누적 고객수</span></div>
          </div>
        </div>
        <div className="testimonial-grid" data-aos="fade-left">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <Image
                alt={testimonial.name + " 인터뷰"}
                className="testimonial-card__portrait"
                height={testimonial.imageHeight}
                src={assetPath(testimonial.image)}
                unoptimized
                width={testimonial.imageWidth}
              />
              <div className="testimonial-card__quote">
                <span className="testimonial-card__quote-icon" aria-hidden="true">“</span>
                <p className="testimonial-card__quote-text">
                  <span>{testimonial.quoteLine1}</span>
                  <span><em>{testimonial.quoteHighlight}</em> {testimonial.quoteTail}</span>
                </p>
                <p className="testimonial-card__author">
                  {testimonial.name}
                  {testimonial.role ? <span> | {testimonial.role}</span> : null}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceCard({ index }: { index: number }) {
  const plan = pricingPlans[index];
  return (
    <article className={"price-card" + (plan.featured ? " price-card--featured" : "")}>
      {plan.badge ? <span className="price-card__badge">{plan.badge}</span> : null}
      <h3>{plan.name}</h3>
      <p>{plan.description}</p>
      <div className="price-card__price">
        <b>{plan.price}</b><span>{plan.unit}</span>
      </div>
      {plan.details ? (
        <p className="price-card__details">{plan.details[0]}<br />{plan.details[1]}</p>
      ) : null}
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}><CheckMark />{feature}</li>
        ))}
      </ul>
      <CtaLink href="#contact" variant={plan.featured ? "dark" : "secondary"}>
        {plan.price === "별도 문의" ? "도입 문의하기 →" : "14일 무료 체험 시작 →"}
      </CtaLink>
    </article>
  );
}

function PricingPointIcon({ kind }: { kind: "trial" | "consult" | "security" }) {
  return (
    <Image
      className="pricing-point__icon"
      src={assetPath({
        trial: "/img/icon_calendar.svg",
        consult: "/img/icon_comment.svg",
        security: "/img/icon_shield.svg",
      }[kind])}
      alt=""
      width={30}
      height={30}
      aria-hidden="true"
    />
  );
}

export function PricingSection() {
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="container pricing__grid">
        <div className="pricing__copy" data-aos="fade-right">
          <SectionLabel>PRICING</SectionLabel>
          <h2 id="pricing-title">공부 관리,<br />이제는<br /><em style={{ "--pricing-drawing": `url(${assetPath("/img/pricong_drawing.svg")})` } as CSSProperties}>시스템</em>의 차이</h2>
          <p>오늘의스터디는 학습 관리부터 성과 분석까지<br />학원 운영에 필요한 모든 기능을 제공합니다.<br />규모와 목적에 맞는 플랜을 선택해보세요.</p>
          <div className="pricing-points">
            <div className="pricing-point"><span><PricingPointIcon kind="trial" /></span><div><b>14일 무료 체험</b><small>모든 플랜 동일 제공</small></div></div>
            <div className="pricing-point"><span><PricingPointIcon kind="consult" /></span><div><b>도입 상담 가능</b><small>전담 컨설턴트 1:1상담</small></div></div>
            <div className="pricing-point"><span><PricingPointIcon kind="security" /></span><div><b>안심하고 사용</b><small>데이터 보안ㆍ안정성 보장</small></div></div>
          </div>
        </div>
        <div className="pricing-cards" data-aos="fade-left">
          <PriceCard index={0} />
          <div className="pricing-cards__side">
            <PriceCard index={1} />
            <PriceCard index={2} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section
      className="final-cta"
      aria-labelledby="final-cta-title"
      style={{ backgroundImage: `url(${assetPath("/img/cta_bg.png")})` }}
    >
      <div className="container final-cta__inner" data-aos="fade-up">
        <SectionLabel>PRICING</SectionLabel>
        <h2 id="final-cta-title">지금 시작하면,<br />학원의 <em>내일</em>이 달라집니다.</h2>
        <p>14일 무료 체험으로 오늘의 스터디를 직접 경험해보세요.</p>
        <div className="button-row">
          <CtaLink href="#pricing">무료로 시작하기 →</CtaLink>
          <CtaLink href="#contact" variant="dark">도입 문의하기</CtaLink>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container site-footer__grid" data-aos="fade-up">
        <div className="footer-content">
          <BrandMark />
          <p className="footer-intro">학원 운영의 모든 것, 하나의 플랫폼으로<br />학생의 오늘을 기록하고, 학원의 내일을 만듭니다.</p>
          <p className="footer-meta">주식회사 프라이머스&nbsp;&nbsp;ㅣ&nbsp;&nbsp;대표 김호균<br />사업자등록번호 485-86-03027</p>
          <small>© 2026 Primers. All rights reserved.</small>
        </div>
        <address className="footer-contact">
          <b>문의하기</b>
          <div className="footer-contact__row">
            <Image alt="" height={24} src={assetPath("/img/footer-phone.svg")} unoptimized width={24} />
            <div>
              <a href="tel:0519398154">051.939.8154</a>
              <small className="footer-contact__hours">평일 09:00 ~ 18:00&nbsp; · &nbsp;주말/공휴일 휴무</small>
            </div>
          </div>
          <div className="footer-contact__row">
            <Image alt="" height={24} src={assetPath("/img/footer-email.svg")} unoptimized width={24} />
            <a href="mailto:sales@primers.co.kr">sales@primers.co.kr</a>
          </div>
        </address>
      </div>
    </footer>
  );
}
