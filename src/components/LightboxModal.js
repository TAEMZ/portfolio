import React, { useEffect, useCallback } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaImage } from "react-icons/fa";

export default function LightboxModal({ isOpen, images, activeIndex, projectName, onClose, onSelectIndex }) {
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft" && images.length > 1) {
            onSelectIndex((activeIndex === 0 ? images.length - 1 : activeIndex - 1));
        }
        if (e.key === "ArrowRight" && images.length > 1) {
            onSelectIndex((activeIndex === images.length - 1 ? 0 : activeIndex + 1));
        }
    }, [isOpen, images, activeIndex, onClose, onSelectIndex]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen || !images || images.length === 0) return null;

    const currentImg = images[activeIndex] || images[0];

    const prevImage = (e) => {
        e.stopPropagation();
        onSelectIndex(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        onSelectIndex(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
    };

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="lightbox-header">
                    <div className="lightbox-title-wrap">
                        <FaImage style={{ color: '#d4a373', fontSize: '1.1rem' }} />
                        <h4 className="lightbox-title">{projectName || "Screenshot Gallery"}</h4>
                        <span className="lightbox-counter">
                            {activeIndex + 1} / {images.length}
                        </span>
                    </div>

                    <div className="lightbox-actions">
                        <a 
                            href={currentImg} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="lightbox-btn" 
                            title="Open original image in new tab"
                        >
                            <FaExternalLinkAlt />
                        </a>
                        <button className="lightbox-btn close-btn" onClick={onClose} title="Close (Esc)">
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Main Image Stage */}
                <div className="lightbox-stage">
                    {images.length > 1 && (
                        <button className="lightbox-nav-btn prev" onClick={prevImage} title="Previous (Left Arrow)">
                            <FaChevronLeft />
                        </button>
                    )}

                    <div className="lightbox-image-wrapper">
                        <img 
                            src={currentImg} 
                            alt={`${projectName} screenshot ${activeIndex + 1}`}
                            className="lightbox-main-img"
                        />
                    </div>

                    {images.length > 1 && (
                        <button className="lightbox-nav-btn next" onClick={nextImage} title="Next (Right Arrow)">
                            <FaChevronRight />
                        </button>
                    )}
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                    <div className="lightbox-thumbnails">
                        {images.map((imgUrl, idx) => (
                            <button
                                key={idx}
                                className={`lightbox-thumb-btn ${idx === activeIndex ? 'active' : ''}`}
                                onClick={() => onSelectIndex(idx)}
                            >
                                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
