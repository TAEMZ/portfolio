import React from "react";
import "./Projects.css";
import { FaGithub } from "react-icons/fa";

export default function Projects() {
  const projects = [
    {
      name: "GradGram – Web App",
      stack: "React + Firebase",
      description:
        "Social platform for graduating students to share memories, photos, and last words. Features Google Auth, Firestore, and department-based rooms.",
      github: "https://github.com/TAEMZ/grad_gram",
    },
    {
      name: "Habeshan Yelp– Flutter App",
      stack: "Flutter + Firebase + Maps",
      description:
        "A business finder app with live location, map integration, and user reviews. Realtime updates using Firebase and Google Maps.",
      github: "https://github.com/TAEMZ/Localbusiness",
    },
    {
      name: "Music Player UI",
      stack: "React",
      description:
        "A custom-designed audio player interface with playlist support and futuristic neon layout.",
      github: "https://github.com/yourusername/music-player",
    },
    {
      name: "Movie Repository",
      stack: "HTML + CSS + JS",
      description:
        "A static movie catalog website with card layout, search filtering, usind .",
      github: "https://github.com/yourusername/movie-repo",
    },
  ];

  return (
    <section className="projects-section" id="projects">
      <h2 className="projects-title">My Projects</h2>
      <div className="projects-canvas">
        {projects.map((proj, idx) => (
          <div className="project-tile" key={idx}>
            <h3>{proj.name}</h3>
            <span className="stack">{proj.stack}</span>
            <p className="desc">{proj.description}</p>
            <a
              href={proj.github}
              className="project-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
            >
              <FaGithub className="github-icon" />
              View on GitHub
            </a>
          </div>
        ))}
      </div>
      <div className="projects-glow"></div>
    </section>
  );
}
