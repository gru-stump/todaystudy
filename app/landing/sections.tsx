import { benefits } from "./content";
import { AttendanceDashboard, HeroDevices } from "./mockups";
import { CheckMark, CtaLink, SectionLabel } from "./ui";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
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
        <SectionLabel>WHY TODAYSTUDY</SectionLabel>
        <h2 id="benefits-title">학원을 가장 잘 아는<br />사람들이 만들었습니다</h2>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.title}>
              <span className="benefit-card__icon" aria-hidden="true">{benefit.icon}</span>
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
  "QR체크인 출석 지원",
  "지각 · 조퇴 · 결석 자동 구분",
  "학부모 실시간 알림 발송",
  "출석 통계 및 리포트 제공",
];

export function AttendanceSection() {
  return (
    <section className="attendance" id="features" aria-labelledby="attendance-title">
      <div className="container attendance__grid">
        <div className="section-copy">
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
