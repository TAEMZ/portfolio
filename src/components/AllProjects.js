import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Projects.css";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import ProjectCard from "./ProjectCard";
import LightboxModal from "./LightboxModal";

export default function AllProjects() {
    const [selectedStack, setSelectedStack] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [lightboxState, setLightboxState] = useState({
        isOpen: false,
        images: [],
        activeIndex: 0,
        projectName: ""
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects', 'all'],
        queryFn: async () => {
            const response = await fetch("/api/get-data?table=projects");
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data;
        }
    });

    const handleOpenLightbox = (images, activeIndex, projectName) => {
        setLightboxState({
            isOpen: true,
            images,
            activeIndex,
            projectName
        });
    };

    const handleCloseLightbox = () => {
        setLightboxState(prev => ({ ...prev, isOpen: false }));
    };

    const handleSelectIndex = (newIndex) => {
        setLightboxState(prev => ({ ...prev, activeIndex: newIndex }));
    };

    // Filter projects
    const filteredProjects = projects.filter(p => {
        const matchesSearch = 
            (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.stack && p.stack.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;
        if (selectedStack === "all") return true;
        if (selectedStack === "with_images") return Array.isArray(p.images) && p.images.length > 0;
        return p.stack && p.stack.toLowerCase().includes(selectedStack.toLowerCase());
    });

    if (isLoading) return (
        <div className="projects-section" style={{ color: 'var(--accent)', textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>
            Loading Project Gallery...
        </div>
    );

    return (
        <section className="projects-section" id="all-projects">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <Link to="/" className="project-link" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', textDecoration: 'none' }}>
                    <FaArrowLeft /> Back to Home
                </Link>
                <h2 className="projects-title" style={{ margin: 0 }}>Project Archive ({filteredProjects.length})</h2>
                <div style={{ width: '120px' }}></div>
            </div>

            {/* Filter & Search Controls */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 40px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginRight: '5px' }}>
                        <FaFilter /> Filter:
                    </span>
                    {["all", "with_images", "flutter", "react", "typescript", "python"].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedStack(tag)}
                            className={`admin-btn ${selectedStack === tag ? 'active' : ''}`}
                            style={{ 
                                padding: '6px 14px', 
                                fontSize: '0.8rem', 
                                textTransform: 'capitalize',
                                borderRadius: '20px'
                            }}
                        >
                            {tag === "all" ? "All Projects" : tag === "with_images" ? "With Screenshots" : tag}
                        </button>
                    ))}
                </div>

                <div style={{ minWidth: '240px', flex: '1', maxWidth: '350px' }}>
                    <input
                        type="text"
                        placeholder="Search projects by name, stack, keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 14px',
                            background: 'var(--surface-input)',
                            border: '1px solid var(--accent-border)',
                            borderRadius: '20px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-sans)'
                        }}
                    />
                </div>
            </div>

            {/* Projects Grid */}
            <div className="projects-canvas">
                {filteredProjects.map((proj, index) => (
                    <ProjectCard
                        key={proj.id || index}
                        project={proj}
                        onOpenLightbox={handleOpenLightbox}
                    />
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    No projects found matching your search criteria.
                </div>
            )}

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
