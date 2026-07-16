import React from "react";
import { Link } from "react-router-dom";
import "./Projects.css";
import { FaGithub, FaPlus } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

import { useQuery } from '@tanstack/react-query';

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=projects");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Only display published projects (or ones with no status field)
      const published = data.filter(p => p.status === 'published' || !p.status);
      const featured = published.filter(p => p.featured === true);
      return featured.length > 0 ? featured : published;
    }
  });

  if (isLoading) return <div className="projects-section">Loading...</div>;

  return (
    <section className="projects-section" id="projects">
      <div className="section-header">
        <h2 className="projects-title">Featured Work</h2>
      </div>
      <div className="projects-canvas">
        {projects.map((proj, idx) => (
          <div className="project-tile vintage-card" key={idx}>
            <div className="nail"></div>
            <h3>{proj.name}</h3>
            <span className="stack">{proj.stack}</span>
            <p className="desc">{proj.description}</p>
            <div className="project-links">
              {proj.github && (
                <a
                  href={proj.github}
                  className="project-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="github-icon" />
                  GitHub
                </a>
              )}
              {proj.demo && (
                <a
                  href={proj.demo}
                  className="project-link live-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiVercel className="vercel-icon" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        ))}

      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/projects" className="icon-link" style={{ fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#d4a373', transition: 'all 0.3s ease' }}>
          <span>View More Projects</span>
          <FaPlus style={{ fontSize: '1rem' }} />
        </Link>
      </div>

      <div className="projects-glow"></div>
    </section>
  );
}
