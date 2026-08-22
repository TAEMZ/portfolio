import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { FaBars, FaTimes, FaFileAlt } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
      <a
        href="https://drive.google.com/file/d/1dgqHmqHNXRVbsfTXJ_NIyXHeoYUR67wH/view?usp=drive_link"
        className="cv-button navbar-cv-brand"
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMenu}
        title="Open Abiy's Resume / CV"
      >
        <FaFileAlt style={{ fontSize: '0.85rem' }} />
        <span>Get CV</span>
      </a>

      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        <ul>
          <li>
            <a href="#hero" onClick={closeMenu}>
              Home
            </a>
          </li>
          <li>
            <a href="#about" onClick={closeMenu}>
              About
            </a>
          </li>
          <li>
            <a href="#skills" onClick={closeMenu}>
              Skills
            </a>
          </li>
          <li>
            <a href="#experience" onClick={closeMenu}>
              Experience
            </a>
          </li>
          <li>
            <a href="#projects" onClick={closeMenu}>
              Projects
            </a>
          </li>
          <li>
            <a href="#footer" onClick={closeMenu}>
              Contact
            </a>
          </li>
        </ul>
      </div>

      <div className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation menu">
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
    </nav>
  );
}
