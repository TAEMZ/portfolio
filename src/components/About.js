import React from "react";
import "./About.css";
import { FaJava, FaReact, FaNodeJs } from "react-icons/fa";
import { SiFlutter, SiFirebase, SiPython, SiDart } from "react-icons/si";

export default function About() {
  const technologies = [
    { icon: <FaJava size={24} />, name: "Java" },
    { icon: <FaReact size={24} />, name: "React" },
    { icon: <SiFlutter size={24} />, name: "Flutter" },
    { icon: <SiFirebase size={24} />, name: "Firebase" },
    { icon: <FaNodeJs size={24} />, name: "Node.js" },
    { icon: <SiPython size={24} />, name: "Python" },
    { icon: <SiDart size={24} />, name: "Dart" },
  ];

  return (
    <section className="about-section" id="about">
      <h2 className="about-title">ABOUT ME</h2>
      <div className="about-card">
        <p className="about-text">
          I build what I relate to—solving real problems I encounter daily. I
          strive to master the entire ecosystem, orchestrating the invisible
          data structures and network pathways to ensuring I truly command every
          layer of what I create.
        </p>

        <div className="tech-stack">
          {technologies.map((tech, index) => (
            <div className="tech-item" key={index}>
              <span className="tech-icon">{tech.icon}</span>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>

        <p className="about-text">
          I thrive on learning by doing, contributing to impactful projects, and
          constantly improving my skills. My approach is hands-on, user-focused,
          and always evolving with the latest industry trends.
        </p>
      </div>
      <div className="about-glow"></div>
      <div className="cyber-grid"></div>
    </section>
  );
}
