import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "./Projects.css";
import { FaGithub, FaPlus } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      // Fallback: if 'featured' column error (missing), show all
      const { data: allData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      setProjects(allData || []);
    } else {
      setProjects(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="projects-section">Loading...</div>;

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
