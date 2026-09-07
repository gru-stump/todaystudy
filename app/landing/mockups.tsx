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

const attendanceStudents = [
  ["김하늘", "중등 수학 A", "출석"],
  ["박준서", "고등 영어 B", "출석"],
  ["이서윤", "고등 수학 C", "지각"],
  ["정우진", "중등 영어 A", "출석"],
  ["최유나", "고등 수학 A", "결석"],
];

export function AttendanceDashboard() {
  return (
    <div className="dashboard attendance-dashboard" aria-label="출석 관리 대시보드 목업">
      <div className="dashboard__top">
        <span className="mini-brand">오늘의스터디</span>
        <span>2026. 09. 07 월요일</span>
        <span className="dashboard__user">프라이머스 학원</span>
      </div>
      <div className="dashboard__layout">
        <aside className="dashboard__sidebar">
          <b>운영 관리</b>
          <span>전체 학생</span>
          <span className="active">출석 관리</span>
          <span>수업 관리</span>
          <span>학습 리포트</span>
          <span>설정</span>
        </aside>
        <div className="dashboard__body">
          <div className="dashboard__heading">
            <div>
              <small>ATTENDANCE</small>
              <h3>오늘의 출석</h3>
            </div>
            <button type="button">학생 등록 +</button>
          </div>
          <div className="dashboard__filters">
            <b>전체 42명</b>
            <span>출석 38</span>
            <span>지각 2</span>
            <span>결석 2</span>
          </div>
          <div className="student-table">
            <div className="student-table__head">
              <span>학생</span><span>수업</span><span>체크인</span><span>상태</span>
            </div>
            {attendanceStudents.map(([name, lesson, state], index) => (
              <div className="student-row" key={name}>
                <span><i className={"student-dot student-dot--" + (index + 1)} />{name}</span>
                <span>{lesson}</span>
                <span>{index === 4 ? "미체크" : "13:" + (10 + index * 7)}</span>
                <em className={"status-pill status-pill--" + state}>{state}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagementDashboard() {
  return (
    <div className="management-dashboard" aria-label="학원 통합 관리 대시보드 목업">
      <div className="management-dashboard__top">
        <span className="mini-brand">오늘의스터디</span>
        <span>통합 관리</span>
        <span>프라이머스 학원</span>
      </div>
      <div className="management-dashboard__body">
        <aside>
          <b>대시보드</b>
          <span>학생 관리</span>
          <span>출결 관리</span>
          <span>수업 관리</span>
          <span>성과 분석</span>
        </aside>
        <div className="management-content">
          <div className="management-content__heading">
            <div><small>DASHBOARD</small><strong>학원 운영 현황</strong></div>
            <button type="button">리포트 보기</button>
          </div>
          <div className="management-stats">
            <div><small>전체 학생</small><b>1,248</b><em>+12%</em></div>
            <div><small>오늘 출석률</small><b>96.8%</b><em>+2.4%</em></div>
            <div><small>진행 수업</small><b>24</b><em>정상</em></div>
            <div><small>확인 알림</small><b>8</b><em>확인</em></div>
          </div>
          <div className="management-panels">
            <div>
              <strong>최근 출결</strong>
              <p><i />김하늘 <span>13:10 출석</span></p>
              <p><i />박준서 <span>13:17 출석</span></p>
              <p><i />이서윤 <span>13:24 지각</span></p>
            </div>
            <div>
              <strong>예정 수업</strong>
              <p><b>16:00</b> 고등 영어 B</p>
              <p><b>17:30</b> 중등 수학 A</p>
              <p><b>19:00</b> 고등 수학 C</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
