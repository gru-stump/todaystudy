const tabletRows = [
  ["14:00", "중등 수학 A", "출석 완료"],
  ["16:00", "고등 영어 B", "수업 예정"],
  ["18:30", "고등 수학 C", "알림 발송"],
];

const phoneRows = [
  ["김하늘", "출석"],
  ["박준서", "출석"],
  ["이서윤", "지각"],
  ["정우진", "출석"],
];

export function HeroDevices() {
  return (
    <div className="hero-devices" aria-label="오늘의스터디 태블릿과 모바일 화면 목업">
      <div className="tablet-device">
        <div className="device-camera" />
        <div className="tablet-screen">
          <div className="screen-topbar">
            <span className="mini-brand">오늘의스터디</span>
            <span>학습 리포트</span>
          </div>
          <div className="report-grid">
            <aside>
              <strong>오늘의 수업</strong>
              <span className="active">대시보드</span>
              <span>출석 관리</span>
              <span>학생 관리</span>
              <span>리포트</span>
            </aside>
            <div className="report-main">
              <div className="report-heading">
                <div>
                  <small>2026년 9월</small>
                  <strong>오늘의 수업 현황</strong>
                </div>
                <span className="lime-chip">운영 중</span>
              </div>
              <div className="report-cards">
                <div><b>42</b><span>전체 학생</span></div>
                <div><b>38</b><span>출석 완료</span></div>
                <div><b>4</b><span>확인 필요</span></div>
              </div>
              <div className="schedule-list">
                {tabletRows.map(([time, lesson, state]) => (
                  <div className="schedule-row" key={time}>
                    <b>{time}</b><span>{lesson}</span><em>{state}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="phone-device">
        <div className="phone-speaker" />
        <div className="phone-screen">
          <p>오늘의 출석</p>
          <strong>학생 체크인</strong>
          <div className="phone-summary"><b>38</b><span>/ 42명 출석</span></div>
          {phoneRows.map(([name, state], index) => (
            <div className="phone-row" key={name}>
              <span className={"avatar avatar--" + (index + 1)}>{name[0]}</span>
              <b>{name}</b>
              <em className={state === "지각" ? "late" : ""}>{state}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="device-pen" aria-hidden="true" />
    </div>
  );
}
