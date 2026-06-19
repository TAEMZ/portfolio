import React, { useState } from "react";
import "./Experience.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { useQuery } from '@tanstack/react-query';
import { answeredge } from '../answeredgeClient';

export default function Experience() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['experience'],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=experience");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) return <div className="experience">Loading...</div>;

  return (
    <section className="experience" id="experience">
      <div className="section-header">
        <h2 className="experience-title">Experience & Projects</h2>
        <button
          className="collapse-toggle"
          onClick={toggleCollapse}
          aria-label="Toggle Compact View"
          title={isCollapsed ? "Expand Cards" : "Collect Cards"}
        >
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>
      <div className={`experience-grid ${isCollapsed ? "collapsed" : ""}`}>
        {experiences.length === 0 ? (
          <p>No experiences found.</p>
        ) : (
          experiences.map((exp, idx) => (
            <div className="experience-card vintage-card" key={idx}>
              <div className="nail"></div>
              <h3>{exp.title}</h3>
              <p className="tech">
                {exp.tech}
              </p>
              <ul>
                {Array.isArray(exp.details) && exp.details.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
      <div className="experience-glow"></div>
    </section>
  );
}
