import React from "react";
import "./Experience.css";

export default function Experience() {
  const experiences = [
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
      title: "GradGram – Memory App",
      tech: "React + Firebase",
      period: "2024",
      details: [
        "Users upload memories & last words with Google Auth + Firestore.",
        "Includes real-time updates and department-based rooms.",
      ],
    },
    {
      title: "Business discovery and promotion app ",
      tech: "Flutter + Firebase + Maps",
      period: "2024",
      details: [
        "Local business finder with ratings, map view, and reviews.",
        "Stored real-time data and media using Firebase backend.",
      ],
    },
  ];

  return (
    <section className="experience" id="experience">
      <h2 className="experience-title">Experience & Projects</h2>
      <div className="experience-grid">
        {experiences.map((exp, idx) => (
          <div className="experience-card" key={idx}>
            <h3>{exp.title}</h3>
            <p className="tech">
              {exp.tech} · {exp.period}
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
