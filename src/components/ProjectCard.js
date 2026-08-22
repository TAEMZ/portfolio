import React, { useState, useRef, useCallback } from "react";
import { FaGithub, FaChevronLeft, FaChevronRight, FaExpand, FaImage } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

/**
 * forceState: null = use own scroll observer | 'expanded' | 'collapsed'
 */
export default function ProjectCard({ project, onOpenLightbox, forceState }) {
    const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Own scroll-driven expansion state
    const [scrollExpanded, setScrollExpanded] = useState(false);
    const observerRef = useRef(null);

    // Resolved state: force override wins, otherwise use scroll state
    const isExpanded = forceState === 'expanded' ? true
                     : forceState === 'collapsed' ? false
                     : scrollExpanded;

    // Callback ref — sets up observer the moment this card mounts
    const cardRef = useCallback((el) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                // Card entered the detection zone → expand
                setScrollExpanded(true);
            } else {
                // Card left the detection zone → collapse
                // rootMargin below ensures this fires BEFORE the card fully exits
                setScrollExpanded(false);
            }
        }, {
            threshold: 0,
            // Shrink the bottom of the viewport by 80px:
            // card collapses when its top is still 80px from the screen bottom (still visible)
            // card expands once 80px of it has entered from the bottom
            rootMargin: '0px 0px -80px 0px'
        });

        observer.observe(el);
        observerRef.current = observer;
    }, []);

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

    return (
        <div
            ref={cardRef}
            className={`project-tile vintage-card custom-project-card ${isExpanded ? 'card-expanded' : 'card-collapsed'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="nail"></div>

            {/* Screenshots Showcase Carousel with Adaptive Blurred Backdrop */}
            {images.length > 0 ? (
                <div
                    className="card-media-wrapper"
                    onClick={() => onOpenLightbox && onOpenLightbox(images, currentIdx, project.name)}
                    title="Click to view full screenshot in Lightbox"
                >
                    <div className="card-image-container">
                        {/* Ambient Blurred Background */}
                        <img
                            src={images[currentIdx]}
                            alt=""
                            className="card-screenshot-blur-bg"
                            aria-hidden="true"
                        />
                        {/* Crisp Foreground Image */}
                        <img
                            src={images[currentIdx]}
                            alt={`${project.name} preview ${currentIdx + 1}`}
                            className="card-screenshot"
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/600x350?text=Screenshot+Preview";
                            }}
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
                        <span>{currentIdx + 1}/{images.length}</span>
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
                                        className={`carousel-dot ${dotIdx === currentIdx ? 'active' : ''}`}
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
