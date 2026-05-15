import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Projects.css";
import { FaGithub, FaArrowLeft } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

import { useQuery } from '@tanstack/react-query';

export default function AllProjects() {
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

    if (isLoading) return <div className="projects-section" style={{ color: 'white', textAlign: 'center', padding: '100px' }}>Loading Gallery...</div>;

    return (
        <section className="projects-section" id="all-projects">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <Link to="/" className="project-link" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <FaArrowLeft /> Back to Home
                </Link>
                <h2 className="projects-title" style={{ margin: 0 }}>Project Archive</h2>
                <div style={{ width: '120px' }}></div> {/* Spacer for symmetry */}
            </div>

            <div className="projects-canvas">
                {projects.map((proj, index) => (
                    <div className="project-tile vintage-card" key={index}>
                        <div className="nail"></div>
                        <div className="project-info">
                            <h3>{proj.name}</h3>
                            <span className="stack">{proj.stack}</span>
                            <p className="desc">{proj.description}</p>
                            <div className="project-links">
                                {proj.github && (
                                    <a href={proj.github} target="_blank" rel="noopener noreferrer" className="project-link">
                                        <FaGithub className="github-icon" /> Github
                                    </a>
                                )}
                                {proj.demo && (
                                    <a href={proj.demo} target="_blank" rel="noopener noreferrer" className="project-link live-link">
                                        <SiVercel className="vercel-icon" /> Live Demo
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="projects-glow"></div>
        </section>
    );
}
