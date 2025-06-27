import React from "react";
import "./Footer.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <p>© 2025 </p>
      <p>
        Contact: <a href="mailto:abiykibru6@gmail.com">abiykibru6@gmail.com</a>
      </p>
      <div className="social-icons">
        <a
          href="https://github.com/TAEMZ"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/abiy-kibru-a94611318/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
      </div>
    </footer>
  );
}
