import Image from "next/image";

export function HeroDevices() {
  return (
    <div className="hero-devices">
      <Image
        alt="오늘의스터디 태블릿과 모바일 학습 관리 화면"
        className="hero-devices__image"
        height={2000}
        src="/img/hero_mockup.png"
        unoptimized
        width={3000}
      />
    </div>
  );
}

export function AttendanceDashboard() {
  return (
    <div className="attendance-artwork" data-aos="fade-left">
      <Image
        alt="오늘의스터디 출석 관리 대시보드"
        height={518}
        src="/img/features_moockup.png"
        unoptimized
        width={875}
      />
    </div>
  );
}

export function ManagementDashboard() {
  return (
    <div className="management-dashboard management-dashboard--artwork">
      <Image
        alt="오늘의스터디 학원 통합 관리 대시보드"
        height={711}
        src="/img/smartsimple_mockup.png"
        unoptimized
        width={2049}
      />
    </div>
  );
}
