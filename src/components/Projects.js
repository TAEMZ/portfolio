import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Projects.css";
import { FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import ProjectCard from "./ProjectCard";
import LightboxModal from "./LightboxModal";

export default function Projects() {
  // null = each card decides via its own scroll observer
  // 'expanded' | 'collapsed' = manual override for all cards
  const [forceState, setForceState] = useState(null);

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

  // Toggle button: cycle between forced-collapsed → forced-expanded → back to scroll-driven
  const toggleAll = () => {
    setForceState(prev => {
      if (prev === null) return 'collapsed';
      if (prev === 'collapsed') return 'expanded';
      return null; // 'expanded' → back to scroll-driven
    });
  };

  const handleOpenLightbox = (images, activeIndex, projectName) => {
    setLightboxState({ isOpen: true, images, activeIndex, projectName });
  };

  const handleCloseLightbox = () => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectIndex = (newIndex) => {
    setLightboxState(prev => ({ ...prev, activeIndex: newIndex }));
  };

  // Icon: show chevron-down if currently in "all expanded" or "auto" mode
  const isCurrentlyCollapsed = forceState === 'collapsed';

  if (isLoading) return (
    <div className="projects-section" style={{ textAlign: 'center', color: '#d4a373', padding: '100px' }}>
      Loading Featured Projects...
    </div>
  );

  return (
    <section className="projects-section" id="projects">
      <div className="section-header">
        <h2 className="projects-title">Featured Work</h2>
        <button
          className="collapse-toggle"
          onClick={toggleAll}
          aria-label="Toggle Compact View"
          title={isCurrentlyCollapsed ? "Expand All Cards" : "Contract All Cards"}
        >
          {isCurrentlyCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>

      <div className="projects-canvas">
        {projects.map((proj, idx) => (
          <ProjectCard
            key={proj.id || idx}
            project={proj}
            onOpenLightbox={handleOpenLightbox}
            forceState={forceState}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Link
          to="/projects"
          className="icon-link view-more-btn"
          style={{
            fontSize: '1.1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: '#d4a373',
            textDecoration: 'none',
            padding: '12px 28px',
            borderRadius: '6px',
            border: '1px solid rgba(212, 163, 115, 0.4)',
            background: 'rgba(212, 163, 115, 0.08)',
            transition: 'all 0.3s ease',
            fontFamily: 'Courier Prime, monospace',
            fontWeight: 'bold'
          }}
        >
          <span>View All Projects Gallery</span>
          <FaPlus style={{ fontSize: '0.9rem' }} />
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
