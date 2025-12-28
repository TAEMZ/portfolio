import React, { useState } from "react";
import "./Projects.css";
import { FaGithub, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

export default function Projects() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const projects = [
    {
      name: "Agentic Chat",
      stack: "React + Firebase + Vanilla CSS",
      description:
        "A feature-packed chat app acting as a real-time platform. Supports Video/Voice calls, File Sharing, and Secure Auth. Includes 'Theme Syncing' between users, a hidden gesture channel, collaborative sketching, and 'Sentiment UI' that changes colors based on message mood.",
      github: "https://github.com/TAEMZ/Agentic-Chat",
      demo: "https://chatapp-eight-rho.vercel.app/",
    },
    {
      name: "Debug Partner",
      stack: "Python + Supabase + AI",
      description:
        "A chronological problem-solving assistant that suggests solutions at timed intervals (immediate to long-term), providing deeper insights as it 'thinks' for you over time.",
      github: "https://github.com/TAEMZ/Debug_partner",
    },
    {
      name: "Star Wars Explorer",
      stack: "Flutter + Riverpod + GraphQL + Hive",
      description:
        "A feature-rich Star Wars app featuring a Galaxy Map, character connection Hub, and offline persistence. Built with modern state management and Graphql synchronization.",
      github: "https://github.com/TAEMZ/Star-Wars-Explore",
    },
    {
      name: "Telegram Medical Advice Bot",
      stack: "Python + Flask + Addis Assistant AI",
      description:
        "AI-powered healthcare assistant supporting Amharic, Afaan Oromoo, and Tigrinya. Provides medical guidance using the Addis Assistant AI API.",
      github: "https://github.com/TAEMZ",
    },
    {
      name: "GradGram – Web App",
      stack: "React + Firebase",
      description:
        "Social platform for graduating students to share memories, photos, and last words. Features Google Auth, Firestore, and department-based rooms.",
      github: "https://github.com/TAEMZ/grad_gram",
      demo: "https://grad-gram.vercel.app/",
    },
    {
      name: "Habeshan Yelp– Flutter App",
      stack: "Flutter + Firebase + Maps",
      description:
        "A business finder app with live location, map integration, and user reviews. Realtime updates using Firebase and Google Maps.",
      github: "https://github.com/TAEMZ/Localbusiness",
    },
    {
      name: "Music Player ",
      stack: "React",
      description:
        "A custom-designed audio player interface with playlist support and futuristic neon layout.",
      github: "https://github.com/TAEMZ/music_player",
    },
    {
      name: "Quote generator",
      stack: "HTML,CSS ,JS",
      description:
        "Quote generator from famous movie lines and platform where users talk about their favorite movies.",
      github: "https://github.com/TAEMZ/Quote-Generator",
      demo: "https://quote-generator-beta-sepia.vercel.app/",
    },
    {
      name: "Movie Repository",
      stack: "HTML + CSS + JS",
      description:
        "A static movie catalog website with card layout, search filtering, usind .",
      github: "https://github.com/TAEMZ/Movie-Repo",
      demo: "https://movie-repo-theta.vercel.app",
    },
    {
      name: "Skill Snap",
      stack: "Flutter + Superbase",
      description:
        "is a peer-to-peer (P2P) skill-sharing platform that connectes individuals to exchange knowledge and abilities directly. Users can teach or learn various ",
      github: "https://github.com/TAEMZ/SkillSnap/tree/main/skill_snap",
    },
  ];

  return (
    <section className="projects-section" id="projects">
      <div className="section-header">
        <h2 className="projects-title">My Projects</h2>
        <button
          className="collapse-toggle"
          onClick={toggleCollapse}
          aria-label="Toggle Compact View"
          title={isCollapsed ? "Expand Cards" : "Collect Cards"}
        >
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>
      <div className={`projects-canvas ${isCollapsed ? "collapsed" : ""}`}>
        {projects.map((proj, idx) => (
          <div className="project-tile vintage-card" key={idx}>
            <div className="nail"></div>
            <h3>{proj.name}</h3>
            <span className="stack">{proj.stack}</span>
            <p className="desc">{proj.description}</p>
            <div className="project-links">
              <a
                href={proj.github}
                className="project-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <FaGithub className="github-icon" />
                GitHub
              </a>
              {proj.demo && (
                <a
                  href={proj.demo}
                  className="project-link live-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Live Demo"
                >
                  <SiVercel className="vercel-icon" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="projects-glow"></div>
    </section>
  );
}
