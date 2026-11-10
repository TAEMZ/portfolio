import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Experience.css";
import { useQuery } from "@tanstack/react-query";
import {
  FaCode,
  FaReact,
  FaNodeJs,
  FaPython,
  FaDocker,
  FaJava,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiFlutter,
  SiFirebase,
  SiPostgresql,
  SiSupabase,
  SiVercel,
} from "react-icons/si";

function getTechIcon(toolName) {
  const key = toolName.toLowerCase();
  if (key.includes("react")) return <FaReact className="exp-tech-icon react" aria-hidden="true" />;
  if (key.includes("next")) return <SiNextdotjs className="exp-tech-icon" aria-hidden="true" />;
  if (key.includes("typescript") || key === "ts") return <SiTypescript className="exp-tech-icon ts" aria-hidden="true" />;
  if (key.includes("javascript") || key === "js") return <SiJavascript className="exp-tech-icon js" aria-hidden="true" />;
  if (key.includes("node")) return <FaNodeJs className="exp-tech-icon node" aria-hidden="true" />;
  if (key.includes("tailwind")) return <SiTailwindcss className="exp-tech-icon tailwind" aria-hidden="true" />;
  if (key.includes("flutter")) return <SiFlutter className="exp-tech-icon flutter" aria-hidden="true" />;
  if (key.includes("firebase")) return <SiFirebase className="exp-tech-icon firebase" aria-hidden="true" />;
  if (key.includes("python")) return <FaPython className="exp-tech-icon python" aria-hidden="true" />;
  if (key.includes("docker")) return <FaDocker className="exp-tech-icon docker" aria-hidden="true" />;
  if (key.includes("java")) return <FaJava className="exp-tech-icon" aria-hidden="true" />;
  if (key.includes("postgres")) return <SiPostgresql className="exp-tech-icon pg" aria-hidden="true" />;
  if (key.includes("supabase")) return <SiSupabase className="exp-tech-icon node" aria-hidden="true" />;
  if (key.includes("vercel")) return <SiVercel className="exp-tech-icon" aria-hidden="true" />;
  return <FaCode className="exp-tech-icon" aria-hidden="true" />;
}

export default function Experience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sidebarRef = useRef(null);
  const scrollTimerRef = useRef(null);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["experience"],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=experience");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
  });

  const scrollToIndex = useCallback((idx) => {
    const el = sidebarRef.current;
    if (!el || el.clientWidth <= 0) return;
    el.scrollTo?.({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  const stepRole = (delta) => {
    if (experiences.length === 0) return;
    const nextIndex = Math.max(0, Math.min(experiences.length - 1, activeIndex + delta));
    setActiveIndex(nextIndex);
    scrollToIndex(nextIndex);
  };

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollWidth <= el.clientWidth + 8 || el.clientWidth <= 0) return;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const snappedIndex = Math.round(el.scrollLeft / el.clientWidth);
        const clamped = Math.max(0, Math.min(experiences.length - 1, snappedIndex));
        setActiveIndex((prev) => (prev !== clamped ? clamped : prev));
      }, 90);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [experiences.length]);

  if (isLoading) {
    return (
      <section className="experience" id="experience">
        <div className="experience-inner">
          <div className="experience-loading">Loading Career Timeline...</div>
        </div>
      </section>
    );
  }

  if (experiences.length === 0) {
    return (
      <section className="experience" id="experience">
        <div className="experience-inner">
          <div className="experience-header-block">
            <span className="experience-accent-bar" aria-hidden="true"></span>
            <h2 className="experience-title">Experience &amp; Career</h2>
          </div>
          <p className="experience-empty">No experiences logged.</p>
        </div>
      </section>
    );
  }

  const activeExp = experiences[activeIndex] || experiences[0];

  const techList = activeExp?.tech
    ? activeExp.tech
        .split(/[+,·•]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="experience" id="experience">
      <div className="experience-inner">
        <div className="experience-header-block">
          <span className="experience-accent-bar" aria-hidden="true"></span>
          <h2 className="experience-title">Experience &amp; Career</h2>
        </div>

        <div className="timeline-layout">
          {/* Left Column: Career Timeline Selector (One-at-a-Time with Sideways Arrows on Mobile) */}
          <div
            className={`timeline-sidebar-wrap ${
              experiences.length > 1 ? "has-multiple" : ""
            }`}
          >
            <button
              type="button"
              className="timeline-scroll-arrow timeline-scroll-arrow-left"
              onClick={() => stepRole(-1)}
              disabled={activeIndex <= 0}
              aria-label="Previous career role"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>

            <div
              ref={sidebarRef}
              className="timeline-sidebar"
              role="tablist"
              aria-label="Career Roles"
            >
              {experiences.map((exp, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={exp.id || idx}
                    type="button"
                    className={`timeline-tab ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setActiveIndex(idx);
                      scrollToIndex(idx);
                    }}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`timeline-panel-${idx}`}
                  >
                    <span className="timeline-node" aria-hidden="true"></span>
                    <div className="timeline-tab-info">
                      <div className="timeline-tab-role">{exp.title}</div>
                      {exp.period && <div className="timeline-tab-period">{exp.period}</div>}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="timeline-scroll-arrow timeline-scroll-arrow-right"
              onClick={() => stepRole(1)}
              disabled={activeIndex >= experiences.length - 1}
              aria-label="Next career role"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </div>

          {/* Right Column: Selected Role Details */}
          <div
            className="timeline-content"
            id={`timeline-panel-${activeIndex}`}
            role="tabpanel"
          >
            <div className="timeline-detail-header">
              <div className="detail-heading-row">
                <svg
                  className="detail-layers-icon"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="detail-heading-text">
                  <h3 className="detail-title">{activeExp.title}</h3>
                  {activeExp.period && (
                    <div className="detail-period">{activeExp.period}</div>
                  )}
                </div>
              </div>

              {techList.length > 0 && (
                <div className="detail-tech-row">
                  {techList.map((tool, i) => (
                    <span className="exp-tech-item" key={i}>
                      {getTechIcon(tool)}
                      <span>{tool}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-divider"></div>

            <ul className="detail-bullet-list">
              {Array.isArray(activeExp.details) && activeExp.details.length > 0 ? (
                activeExp.details.map((point, i) => (
                  <li key={i}>
                    <span className="bullet-dot" aria-hidden="true"></span>
                    <span className="bullet-text">{point}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span className="bullet-dot" aria-hidden="true"></span>
                  <span className="bullet-text">
                    {activeExp.tech || "Engineering execution & deliverable"}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
