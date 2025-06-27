import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <h1 className="glow-text">Hi, I'm Abiy 👋</h1>
        <p className="subtitle">
          Creative Full-Stack Developer specializing in modern web & mobile
          solutions
        </p>

        <div className="tech-stack">
          <span className="highlight">React</span>
          <span className="highlight">Flutter</span>
          <span className="highlight">Firebase</span>
          <span className="highlight">Node.js</span>
          <span className="highlight">UI/UX</span>
        </div>

        <p className="hero-description">
          I build performant, accessible digital experiences with clean code and
          pixel-perfect designs. Currently crafting innovative solutions at the
          intersection of technology and creativity.
        </p>

        <div className="hero-cta">
          <a href="#projects" className="cta-button">
            View My Work
          </a>
          <a href="#footer" className="cta-button secondary">
            Contact Me
          </a>
        </div>
      </div>

      <div className="floating-elements">
        <div className="glow-ring"></div>
        <div className="glow-ring ring-2"></div>
        <div className="code-snippet">{"// Passionate about clean code"}</div>
        <div className="code-snippet">{"const innovation = true;"}</div>
      </div>

      <div className="blur-background"></div>
      <div className="particles"></div>
    </section>
  );
}
