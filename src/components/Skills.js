import React, { useState, useEffect } from "react";
import "./Skills.css";

import { useQuery } from '@tanstack/react-query';

export default function Skills() {
  const { data: skills = {}, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=skills");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.reduce((acc, curr) => {
        acc[curr.category] = curr.items;
        return acc;
      }, {});
    }
  });

  if (isLoading) return <div className="skills-section">Loading...</div>;

  return (
    <section className="skills-section" id="skills">
      <h2 className="skills-title glitch" data-text="SKILLS">
        SKILLS
      </h2>
      <div className="skill-groups">
        {Object.entries(skills).length === 0 ? (
          <p>No skills found.</p>
        ) : (
          Object.entries(skills).map(([category, items], index) => (
            <div className="skill-group" key={index}>
              <h3 className="category-title">{category}</h3>
              <div className="skill-chips">
                {Array.isArray(items) && items.map((item, idx) => (
                  <span className="skill-chip" key={idx} data-text={item}>
                    <span className="skill-chip-inner">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="skills-glow"></div>
      <div className="cyber-grid"></div>
    </section>
  );
}
