import React from "react";
import "./Footer.css";
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronUp } from "react-icons/fa";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer" id="footer">
      <div id="contact" style={{ position: "absolute", top: "-50px" }}></div>
      <div className="footer-inner">
        {/* Email Direct Contact */}
        <div className="footer-contact">
          <FaEnvelope className="footer-icon" />
          <a href="mailto:abiykibru6@gmail.com" className="footer-email">
            abiykibru6@gmail.com
          </a>
        </div>

        {/* Social Icons */}
        <div className="footer-socials">
          <a
            href="https://github.com/TAEMZ"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="footer-social-link"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/abiy-kibru-a94611318/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="footer-social-link"
          >
            <FaLinkedin />
          </a>
        </div>

        {/* Copyright & Scroll to top */}
        <div className="footer-meta">
          <p className="footer-copy">© 2026 Abiy Kibru</p>
          <button
            onClick={scrollToTop}
            className="scroll-top-btn"
            aria-label="Back to Top"
            title="Back to Top"
          >
            <FaChevronUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
