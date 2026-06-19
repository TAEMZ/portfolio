import React, { useState, useEffect } from "react";
import "./Hero.css";
import { answeredge } from '../answeredgeClient';

export default function Hero() {
  const [text, setText] = useState("");
  const [isWaving, setIsWaving] = useState(true);
  const fullText = "I am a creative software developer experienced in mobile and web apps across different stacks.";
  const speed = 50;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsWaving(false);
      } else {
        setIsWaving(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <h1 className="glow-text">Hi, I'm Abiy <span className={isWaving ? "waving-hand" : ""}>👋</span></h1>
        <p className="subtitle">
          {text}
          <span className="cursor">|</span>
        </p>

        <div className="tech-stack">
          <span className="highlight">React</span>
          <span className="highlight">Flutter</span>
          <span className="highlight">Firebase</span>
          <span className="highlight">Node.js</span>
          <span className="highlight">UI/UX</span>
        </div>

        <p className="hero-description">
          I'm a full-stack developer who loves turning complex problems into simple, functional, and well-designed software. Whether it's a mobile app or a web platform, I focus on clean code and great user experiences.
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
