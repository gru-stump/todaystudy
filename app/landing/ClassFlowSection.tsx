"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { assetPath } from "./asset-path.mjs";
import { flowSteps } from "./content";
import { moveFlowIndex } from "./flow-state.mjs";
import { SectionLabel } from "./ui";

const sceneNames = ["before", "checkin", "class", "analyze", "connect"] as const;
const FLOW_AUTOPLAY_DELAY_MS = 6000;

function FlowScene({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flow-scene flow-scene--before">
        <Image alt="수업 준비 화면" height={332} src={assetPath("/img/cramclassflow_01.png")} unoptimized width={482} />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flow-scene flow-scene--checkin">
        <Image className="flow-scene__phone" alt="학생 등원 체크인 화면" height={1077} src={assetPath("/img/cramclassflow_02-1.png")} unoptimized width={690} />
        <Image className="flow-scene__photo" alt="학생의 등원을 확인하는 선생님" height={888} src={assetPath("/img/cramclassflow_02-2.png")} unoptimized width={897} />
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="flow-scene flow-scene--class">
        <Image className="flow-scene__class-bg" alt="수업을 진행하는 선생님" height={933} src={assetPath("/img/cramclassflow_03_bg.png")} unoptimized width={2289} />
        <Image className="flow-scene__participation" alt="학생 참여 현황" height={390} src={assetPath("/img/cramclassflow_03_people.png")} unoptimized width={774} />
        <Image className="flow-scene__memo" alt="수업 메모 기록" height={357} src={assetPath("/img/cramclassflow_03_memo.png")} unoptimized width={774} />
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="flow-scene flow-scene--analyze">
        <Image className="flow-scene__dashboard" alt="학생 성장 분석 대시보드" height={1050} src={assetPath("/img/cramclassflow_04_dashboard.png")} unoptimized width={1656} />
        <Image className="flow-scene__counsel" alt="학습 결과를 상담하는 선생님과 학생" height={600} src={assetPath("/img/cramclassflow_04_people.png")} unoptimized width={801} />
      </div>
    );
  }

  return (
    <div className="flow-scene flow-scene--connect">
      <Image alt="학부모가 수업 소식을 확인하는 모습" height={333} src={assetPath("/img/cramclassflow_05_bg.png")} unoptimized width={763} />
    </div>
  );
}
export function ClassFlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progress = `${(activeIndex / (flowSteps.length - 1)) * 100}%`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isFocusPaused) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((index) => moveFlowIndex(index, 1, flowSteps.length));
    }, FLOW_AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, isFocusPaused, isVisible, restartKey]);

  useEffect(() => {
    const tabs = tabsRef.current;
    const activeTab = tabRefs.current[activeIndex];
    if (!tabs || !activeTab || !window.matchMedia("(max-width: 560px)").matches) return;

    const frame = window.requestAnimationFrame(() => {
      const targetLeft = activeTab.offsetLeft - (tabs.clientWidth - activeTab.offsetWidth) / 2;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      tabs.scrollTo({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        left: Math.max(0, Math.min(targetLeft, tabs.scrollWidth - tabs.clientWidth)),
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex]);

  function selectStep(index: number, moveFocus = false) {
    setActiveIndex(index);
    setRestartKey((key) => key + 1);
    if (moveFocus) tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    selectStep(moveFlowIndex(activeIndex, direction, flowSteps.length), true);
  }

  return (
    <section
      aria-labelledby="flow-title"
      className="class-flow"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocusPaused(false);
      }}
      onFocusCapture={() => setIsFocusPaused(true)}
      ref={sectionRef}
    >
      <div className="container">
        <div className="flow-intro">
          <div className="flow-intro__copy" data-aos="fade-right">
            <SectionLabel>CRAM CLASS FLOW</SectionLabel>
            <h2 id="flow-title">학원의 하루,<br />오늘의 스터디와 함께</h2>
          </div>
          <div className="flow-tabs" data-aos="fade-left" role="tablist" aria-label="학원 업무 흐름" ref={tabsRef}>
            <div className="flow-tabs__track">
              {flowSteps.map((step, index) => (
                <Fragment key={step.number}>
                  <button
                    aria-controls={"flow-panel-" + index}
                    aria-selected={activeIndex === index}
                    className="flow-tab"
                    id={"flow-tab-" + index}
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
                  {index < flowSteps.length - 1 ? <i className="flow-tab-divider" aria-hidden="true" /> : null}
                </Fragment>
              ))}
              <div
                aria-hidden="true"
                className="flow-progress"
              >
                <span className="flow-progress__line" style={{ width: progress }} />
                <span className="flow-progress__dot" style={{ left: progress }} />
              </div>
            </div>
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
            <div className={"flow-workspace flow-workspace--" + sceneNames[index]}>
              <article className="flow-check-card">
                <strong>{step.checklistTitle}</strong>
                <ul>
                  {step.checklist.map((item) => (
                    <li key={item}>
                      <Image aria-hidden="true" alt="" height={20} src={assetPath("/img/flow_check.svg")} unoptimized width={20} />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
              <FlowScene index={index} />
            </div>
            <div className="flow-copy">
              <span className="flow-step-count">
                <b>{step.number}</b>
                <small> / 05</small>
              </span>
              <small className="flow-copy__phase">{step.phase}</small>
              <h3>{step.title}</h3>
              <div className="flow-copy__description">
                {step.description.map((line) => <p key={line}>{line}</p>)}
              </div>
              <button
                className={"flow-next" + (index === flowSteps.length - 1 ? " flow-next--primary" : "")}
                onClick={() => selectStep(moveFlowIndex(index, 1, flowSteps.length))}
                type="button"
              >
                {step.ctaLabel}
                <Image aria-hidden="true" alt="" height={16} src={assetPath("/img/flow_arrow.svg")} unoptimized width={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
