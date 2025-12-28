import React, { useState } from "react";
import "./Experience.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Experience() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const experiences = [
    {
      title: "Automated Telegram Services",
      tech: "n8n + Python (Backend)",
      period: "2024",
      details: [
        "Developed service-oriented Telegram bots orchestrated via n8n workflows.",
        "Integrated robust Python backends for complex data processing and logic.",
        "Streamlined user interactions for automated service delivery.",
      ],
    },
    {
      title: "Corporate Web Solutions",
      tech: "Next.js + React + Modern UI",
      period: "2024",
      details: [
        "Designed and deployed high-performance portfolio websites for client companies.",
        "Built responsive, professional sites that align with corporate brand identities.",
      ],
    },
    {
      title: "Automation & AI Workflows",
      tech: "n8n + Make.com + GraphQL",
      period: "2024 - Present",
      details: [
        "Built automated Facebook Ad account syncing for campaigns, adsets, and ads using GraphQL.",
        "Developed automated blog post generators and publishing flows via Make.com.",
        "Implemented various complex n8n workflows for data synchronization and AI assistant integration.",
      ],
    },
    {
      title: "Hospital Management System",
      tech: "Java (Spring Boot)",
      period: "2023",
      details: [
        "Managed patients, pharmacy, and billing using java and MySQL.",
        "Included PDF exports, secure login, backups, and role-based access.",
      ],
    },
    {
      title: "Store Inventory System",
      tech: "Java (Swing + MySQL)",
      period: "2023",
      details: [
        "Built a desktop inventory system with stock alerts and reports.",
        "product lookup and supplier tracking included.",
      ],
    },
    {
      title: "Hotel Booking System",
      tech: "Java (Spring Boot)",
      period: "2024",
      details: [
        "Created booking portal with staff scheduling and payment simulation.",
        "Used layered MVC and database-driven design.",
      ],
    },
    {
      title: "Academic Plagiarism Checker",
      tech: "n8n + Python (Flask) + Gemini AI",
      period: "2024",
      details: [
        "Automated plagiarism detection pipeline using n8n workflows and Python Flask microservices.",
        "Integrated Google Gemini AI for advanced semantic analysis and comparison.",
        "Utilized Supabase for real-time results tracking and data storage.",
      ],
    },
    {
      title: "Freelance Mobile Engineer",
      tech: "Flutter + Firebase + Google Maps",
      period: "2024",
      details: [
        "Delivered scalable mobile solutions for local businesses, focusing on geolocation features.",
        "Implemented real-time backends and media storage using Firebase.",
      ],
    },
  ];

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
        {experiences.map((exp, idx) => (
          <div className="experience-card vintage-card" key={idx}>
            <div className="nail"></div>
            <h3>{exp.title}</h3>
            <p className="tech">
              {exp.tech}
            </p>
            <ul>
              {exp.details.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="experience-glow"></div>
    </section>
  );
}
