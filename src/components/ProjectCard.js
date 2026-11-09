import React, { useState } from "react";
import { FaGithub, FaChevronLeft, FaChevronRight, FaExpand, FaImage } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

export default function ProjectCard({ project, onOpenLightbox }) {
    const rawImages = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
    const [failedUrls, setFailedUrls] = useState([]);
    const images = rawImages.filter(url => !failedUrls.includes(url));
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const safeIdx = images.length > 0 ? currentIdx % images.length : 0;

    // Auto-advance preview on hover
    React.useEffect(() => {
        if (!isHovered || images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % images.length);
        }, 3200);
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleDotClick = (e, idx) => {
        e.stopPropagation();
        setCurrentIdx(idx);
    };

    const handleImageError = (failedUrl) => {
        setFailedUrls(prev => (prev.includes(failedUrl) ? prev : [...prev, failedUrl]));
    };

    return (
        <div
            className="project-tile vintage-card custom-project-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="nail"></div>

            {/* Screenshots Showcase Carousel with Adaptive Blurred Backdrop */}
            {images.length > 0 ? (
                <div
                    className="card-media-wrapper"
                    onClick={() => onOpenLightbox && onOpenLightbox(images, safeIdx, project.name)}
                    title="Click to view full screenshot in Lightbox"
                >
                    <div className="card-image-container">
                        {/* Ambient Blurred Background */}
                        <img
                            src={images[safeIdx]}
                            alt=""
                            className="card-screenshot-blur-bg"
                            aria-hidden="true"
                        />
                        {/* Crisp Foreground Image */}
                        <img
                            src={images[safeIdx]}
                            alt={`${project.name} preview ${safeIdx + 1}`}
                            className="card-screenshot"
                            loading="lazy"
                            onError={() => handleImageError(images[safeIdx])}
                        />
                        <div className="image-overlay-gradient"></div>
                    </div>

                    {/* Expand icon on hover */}
                    <div className="expand-badge" title="Expand Lightbox">
                        <FaExpand />
                    </div>

                    {/* Image Counter Badge */}
                    <div className="image-count-badge">
                        <FaImage style={{ fontSize: '0.75rem' }} />
                        <span>{safeIdx + 1}/{images.length}</span>
                    </div>

                    {/* Slider Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="carousel-nav-btn prev-btn"
                                onClick={handlePrev}
                                aria-label="Previous image"
                            >
                                <FaChevronLeft />
                            </button>
                            <button
                                className="carousel-nav-btn next-btn"
                                onClick={handleNext}
                                aria-label="Next image"
                            >
                                <FaChevronRight />
                            </button>

                            {/* Dot Indicators */}
                            <div className="carousel-dots">
                                {images.map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        className={`carousel-dot ${dotIdx === safeIdx ? 'active' : ''}`}
                                        onClick={(e) => handleDotClick(e, dotIdx)}
                                        aria-label={`Go to image ${dotIdx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="card-no-image-placeholder">
                    <span className="code-tag">&lt;/&gt;</span>
                    <span className="placeholder-text">{project.stack || "Project Showcase"}</span>
                </div>
            )}

            {/* Project Content */}
            <div className="project-card-body">
                <div className="project-header-row">
                    <h3>{project.name}</h3>
                    {project.featured && <span className="featured-tag">FEATURED</span>}
                </div>

                <span className="stack">{project.stack}</span>
                <p className="desc">{project.description}</p>

                <div className="project-links">
                    {project.github && (
                        <a
                            href={project.github}
                            className="project-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaGithub className="github-icon" />
                            GitHub
                        </a>
                    )}
                    {project.demo && (
                        <a
                            href={project.demo}
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
        </div>
    );
}
