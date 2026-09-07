"use client";

import { useRef, useState } from "react";
import { flowSteps } from "./content";
import { moveFlowIndex } from "./flow-state.mjs";
import { CheckMark, SectionLabel } from "./ui";

export function ClassFlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStep = flowSteps[activeIndex];

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
                <b>{step.tab}</b>
              </button>
            ))}
          </div>
        </div>
        <div
          aria-labelledby={"flow-tab-" + activeIndex}
          className="flow-panel"
          id={"flow-panel-" + activeIndex}
          role="tabpanel"
        >
          <article className="flow-check-card">
            <small>오늘의 준비 체크리스트</small>
            <ul>
              {activeStep.checklist.map((item) => (
                <li key={item}><CheckMark />{item}</li>
              ))}
            </ul>
          </article>
          <div className="flow-device" aria-hidden="true">
            <div className="flow-device__bar"><span>수업 관리</span><i /></div>
            {activeStep.checklist.map((item, index) => (
              <div className="flow-device__row" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{item}</b>
                <em>{index < 2 ? "완료" : "확인"}</em>
              </div>
            ))}
            <div className="flow-pencil" />
          </div>
          <div className="flow-copy">
            <SectionLabel>{activeStep.number}/05</SectionLabel>
            <small>BEFORE CLASS</small>
            <h3>{activeStep.title}</h3>
            <p>{activeStep.description}<br />필요한 준비를 한눈에 확인하세요.</p>
            <button
              className="flow-next"
              onClick={() => selectStep(moveFlowIndex(activeIndex, 1, flowSteps.length))}
              type="button"
            >
              다음 단계 보기 →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
