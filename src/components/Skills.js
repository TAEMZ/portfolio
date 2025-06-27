import React from "react";
import "./Skills.css";

export default function Skills() {
  const skills = {
    Languages: [
      "Java",
      "JavaScript",
      "PHP",
      "Dart (Flutter)",
      "Python",
      "React",
      "Html",
      "Css",
    ],
    "Frameworks & Libraries": ["Spring Boot", "React", "Express.js"],
    Databases: ["Firebase", "PostgreSQL", "MySQL", ,],
    "DevOps & Tools": ["Docker"],
  };

  return (
    <section className="skills-section" id="skills">
      <h2 className="skills-title glitch" data-text="SKILLS">
        SKILLS
      </h2>
      <div className="skill-groups">
        {Object.entries(skills).map(([category, items], index) => (
          <div className="skill-group" key={index}>
            <h3 className="category-title">{category}</h3>
            <div className="skill-chips">
              {items.map((item, idx) => (
                <span className="skill-chip" key={idx} data-text={item}>
                  <span className="skill-chip-inner">{item}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="skills-glow"></div>
      <div className="cyber-grid"></div>
    </section>
  );
}
