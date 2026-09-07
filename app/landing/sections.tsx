import { HeroDevices } from "./mockups";
import { CtaLink } from "./ui";

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
