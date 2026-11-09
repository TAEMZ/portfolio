import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Projects.css";
import { FaPlus } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import ProjectCard from "./ProjectCard";
import LightboxModal from "./LightboxModal";

export default function Projects() {
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    activeIndex: 0,
    projectName: ""
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=projects");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const featured = data.filter(p => p.featured === true);
      return featured.length > 0 ? featured : data.slice(0, 6);
    }
  });

  const handleOpenLightbox = (images, activeIndex, projectName) => {
    setLightboxState({ isOpen: true, images, activeIndex, projectName });
  };

  const handleCloseLightbox = () => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectIndex = (newIndex) => {
    setLightboxState(prev => ({ ...prev, activeIndex: newIndex }));
  };

  if (isLoading) return (
    <div className="projects-section" style={{ textAlign: 'center', color: 'var(--accent)', padding: '100px' }}>
      Loading Featured Projects...
    </div>
  );

  return (
    <section className="projects-section" id="projects">
      <div className="section-header">
        <h2 className="projects-title">Featured Work</h2>
      </div>

      <div className="projects-canvas">
        {projects.map((proj, idx) => (
          <ProjectCard
            key={proj.id || idx}
            project={proj}
            onOpenLightbox={handleOpenLightbox}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Link
          to="/projects"
          className="icon-link view-more-btn"
          style={{
            fontSize: '1.02rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--accent)',
            textDecoration: 'none',
            padding: '12px 28px',
            borderRadius: '7px',
            border: '1px solid var(--accent-border)',
            background: 'var(--surface-subtle)',
            transition: 'all 0.25s ease',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600'
          }}
        >
          <span>View All Projects Gallery</span>
          <FaPlus style={{ fontSize: '0.85rem' }} />
        </Link>
      </div>

      <LightboxModal
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        activeIndex={lightboxState.activeIndex}
        projectName={lightboxState.projectName}
        onClose={handleCloseLightbox}
        onSelectIndex={handleSelectIndex}
      />
    </section>
  );
}
