"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { flowSteps } from "./content";
import { moveFlowIndex } from "./flow-state.mjs";
import { CheckMark, SectionLabel } from "./ui";

function FlowScene({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flow-scene flow-scene--before">
        <Image alt="수업 준비 화면" height={332} src="/img/cramclassflow_01.png" unoptimized width={482} />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flow-scene flow-scene--checkin">
        <Image className="flow-scene__phone" alt="학생 등원 체크인 화면" height={1077} src="/img/cramclassflow_02-1.png" unoptimized width={690} />
        <Image className="flow-scene__photo" alt="학생의 등원을 확인하는 선생님" height={888} src="/img/cramclassflow_02-2.png" unoptimized width={897} />
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="flow-scene flow-scene--class">
        <Image className="flow-scene__class-bg" alt="수업을 진행하는 선생님" height={933} src="/img/cramclassflow_03_bg.png" unoptimized width={2289} />
        <Image className="flow-scene__participation" alt="학생 참여도 기록" height={390} src="/img/cramclassflow_03_people.png" unoptimized width={774} />
        <Image className="flow-scene__memo" alt="수업 메모 기록" height={357} src="/img/cramclassflow_03_memo.png" unoptimized width={774} />
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="flow-scene flow-scene--analyze">
        <Image className="flow-scene__dashboard" alt="학생 성장 분석 대시보드" height={1050} src="/img/cramclassflow_04_dashboard.png" unoptimized width={1656} />
        <Image className="flow-scene__counsel" alt="학습 결과를 상담하는 선생님과 학생" height={600} src="/img/cramclassflow_04_people.png" unoptimized width={801} />
      </div>
    );
  }

  return (
    <div className="flow-scene flow-scene--connect">
      <Image alt="학부모가 수업 소식을 확인하는 모습" height={333} src="/img/cramclassflow_05_bg.png" unoptimized width={763} />
      <span className="flow-message flow-message--top">오늘 수업도 잘 참여했어요!</span>
      <span className="flow-message flow-message--bottom">학습 리포트가 도착했습니다.</span>
    </div>
  );
}

export function ClassFlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectStep(index: number) {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    selectStep(moveFlowIndex(activeIndex, direction, flowSteps.length));
  }

  return (
    <section className="class-flow" aria-labelledby="flow-title">
      <div className="container">
        <div className="flow-intro">
          <div>
            <SectionLabel>CRAM CLASS FLOW</SectionLabel>
            <h2 id="flow-title">학원의 하루,<br />오늘의 스터디와 함께</h2>
          </div>
          <div className="flow-tabs" role="tablist" aria-label="학원 업무 흐름">
            {flowSteps.map((step, index) => (
              <button
                aria-controls={"flow-panel-" + index}
                aria-selected={activeIndex === index}
                className="flow-tab"
                id={"flow-tab-" + index}
                key={step.number}
                onClick={() => selectStep(index)}
                onKeyDown={handleKeyDown}
                ref={(node) => { tabRefs.current[index] = node; }}
                role="tab"
                tabIndex={activeIndex === index ? 0 : -1}
                type="button"
              >
                <span>{step.number}</span>
                <small className="flow-tab__phase">{step.phase}</small>
                <b>{step.tab}</b>
              </button>
            ))}
          </div>
        </div>
        {flowSteps.map((step, index) => (
          <div
            aria-labelledby={"flow-tab-" + index}
            className="flow-panel"
            data-flow-phase={step.phase}
            hidden={activeIndex !== index}
            id={"flow-panel-" + index}
            key={step.number}
            role="tabpanel"
          >
            <article className="flow-check-card">
              <small>오늘의 준비 체크리스트</small>
              <ul>
                {step.checklist.map((item) => (
                  <li key={item}><CheckMark />{item}</li>
                ))}
              </ul>
            </article>
            <FlowScene index={index} />
            <div className="flow-copy">
              <SectionLabel>{step.number}/05</SectionLabel>
              <small>{step.phase}</small>
              <h3>{step.title}</h3>
              <p>{step.description}<br />필요한 업무를 한눈에 확인하세요.</p>
              <button
                className="flow-next"
                onClick={() => selectStep(moveFlowIndex(index, 1, flowSteps.length))}
                type="button"
              >
                다음 단계 보기 →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
