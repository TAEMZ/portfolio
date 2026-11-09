import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { FaBars, FaTimes, FaFileAlt, FaSun, FaMoon } from "react-icons/fa";

const NAV_ITEMS = [
  { id: "hero", href: "#hero", label: "Home" },
  { id: "about", href: "#about", label: "About" },
  { id: "skills", href: "#skills", label: "Skills" },
  { id: "experience", href: "#experience", label: "Experience" },
  { id: "projects", href: "#projects", label: "Projects" },
  { id: "footer", href: "#footer", label: "Contact" },
];

export default function Navbar({ theme = "dark", onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      if (scrollY <= 40) {
        setActiveSection("hero");
        return;
      }

      let current = "hero";
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.offsetHeight > 0) {
          const top = el.offsetTop - 160;
          if (scrollY >= top) {
            current = item.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
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
      <div className="navbar-inner">
        <a
          href="https://drive.google.com/file/d/1dgqHmqHNXRVbsfTXJ_NIyXHeoYUR67wH/view?usp=drive_link"
          className="cv-button navbar-cv-brand"
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
          title="Open Abiy's Resume / CV"
        >
          <FaFileAlt style={{ fontSize: "0.85rem" }} />
          <span>Get CV</span>
        </a>

        <div className={`nav-links ${isOpen ? "active" : ""}`}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={activeSection === item.id ? "active" : ""}
                  onClick={() => {
                    setActiveSection(item.id);
                    closeMenu();
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-actions">
          <div className="theme-toggle" role="group" aria-label="Color theme switcher">
            <button
              type="button"
              className={`theme-toggle-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => onSelectTheme && onSelectTheme("light")}
              aria-label="Switch to light theme"
              aria-pressed={theme === "light"}
              title="Light theme"
            >
              <FaSun />
            </button>
            <button
              type="button"
              className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => onSelectTheme && onSelectTheme("dark")}
              aria-label="Switch to dark theme"
              aria-pressed={theme === "dark"}
              title="Dark theme"
            >
              <FaMoon />
            </button>
          </div>

          <button
            type="button"
            className="hamburger"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
}
