import React, { useState } from "react";
import "./Experience.css";
import { useQuery } from '@tanstack/react-query';
import { FaCode, FaChevronRight } from "react-icons/fa";

export default function Experience() {
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['experience'],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=experience");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="experience" id="experience">
        <div className="experience-loading">Loading Career Dossier...</div>
      </section>
    );
  }

  if (experiences.length === 0) {
    return (
      <section className="experience" id="experience">
        <h2 className="experience-title">Experience &amp; Career</h2>
        <p style={{ textAlign: "center", color: "#a09890" }}>No experiences logged.</p>
      </section>
    );
  }

  const activeExp = experiences[activeIndex] || experiences[0];

  // Helper to split tech stack into clean individual badges
  const techList = activeExp?.tech
    ? activeExp.tech
        .split(/[\+\,·\•]/)
        .map(t => t.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="experience" id="experience">
      <div className="experience-header-block">
        <h2 className="experience-title">Experience &amp; Career</h2>
      </div>

      <div className="dossier-terminal">
        {/* Dossier Body: Split Pane */}
        <div className="dossier-body">
          {/* Left Column: Role Selector Tabs */}
          <div className="dossier-sidebar" role="tablist" aria-label="Career Roles">
            {experiences.map((exp, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={exp.id || idx}
                  className={`dossier-tab ${isActive ? "active" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`dossier-panel-${idx}`}
                >
                  <div className="tab-info">
                    <div className="tab-role">{exp.title}</div>
                  </div>
                  <FaChevronRight className="tab-arrow" />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Role Detail Pane */}
          <div
            className="dossier-content"
            id={`dossier-panel-${activeIndex}`}
            role="tabpanel"
          >
            <div className="dossier-detail-header">
              <h3 className="detail-title">{activeExp.title}</h3>

              {techList.length > 0 && (
                <div className="detail-tech-wrap">
                  <div className="tech-label">
                    <FaCode className="tech-label-icon" />
                    <span>TECH STACK:</span>
                  </div>
                  <div className="tech-badges-row">
                    {techList.map((tool, i) => (
                      <span className="tech-pill" key={i}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-divider"></div>

            <div className="detail-body">
              <h4 className="detail-section-subtitle">Highlights &amp; Responsibilities</h4>
              <ul className="detail-bullet-list">
                {Array.isArray(activeExp.details) && activeExp.details.length > 0 ? (
                  activeExp.details.map((point, i) => (
                    <li key={i}>
                      <span className="bullet-glyph">↳</span>
                      <span className="bullet-text">{point}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <span className="bullet-glyph">↳</span>
                    <span className="bullet-text">{activeExp.tech || "Engineering execution & deliverable"}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
