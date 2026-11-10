import React, { useState, useEffect } from "react";
import "./Hero.css";
import heroFace from "../assets/hero_face.png";
import heroFaceLight from "../assets/hero_face_light.png";
import { FaReact, FaNodeJs, FaArrowRight } from "react-icons/fa";
import { SiFlutter, SiFirebase, SiNextdotjs } from "react-icons/si";

export default function Hero() {
  const [text, setText] = useState("");
  const fullText =
    "I am a creative software developer experienced in mobile and web apps across different stacks.";
  const speed = 42;

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
      {/* Subtle Lower Silk-Wave Backdrop (kept clear behind portrait) */}
      <svg
        className="hero-wave-bg"
        viewBox="0 0 1440 820"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroWaveStrokePrimary" x1="120" y1="780" x2="1440" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="32%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="72%" stopColor="var(--accent-bright)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="heroWaveStrokeSecondary" x1="220" y1="810" x2="1440" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="85%" stopColor="var(--accent)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroWaveRibbon" x1="200" y1="810" x2="1440" y2="510" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.065" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle flowing silk ribbons sweeping below content & portrait */}
        <path
          d="M0 785C280 735 490 770 740 675C975 585 1190 615 1440 480L1440 645C1195 745 965 720 720 790C480 860 220 825 0 785Z"
          fill="url(#heroWaveRibbon)"
        />
        <path
          d="M0 790C280 740 490 772 745 672C980 580 1195 610 1440 470"
          stroke="url(#heroWaveStrokePrimary)"
          strokeWidth="1.35"
        />
        <path
          d="M140 812C410 755 615 765 860 682C1085 606 1255 640 1440 535"
          stroke="url(#heroWaveStrokePrimary)"
          strokeWidth="1.1"
          opacity="0.75"
        />
        <path
          d="M320 820C570 770 765 765 995 700C1180 648 1315 660 1440 595"
          stroke="url(#heroWaveStrokeSecondary)"
          strokeWidth="1"
        />
      </svg>

      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Hi, I&apos;m Abiy</h1>

          <p className="hero-subtitle">
            {text}
            <span className="cursor" aria-hidden="true">|</span>
          </p>

          <div className="hero-tech-stack" aria-label="Core technologies">
            <span className="hero-tech-item">
              <FaReact className="hero-tech-icon" aria-hidden="true" />
              <span>React</span>
            </span>
            <span className="hero-tech-item">
              <SiNextdotjs className="hero-tech-icon" aria-hidden="true" />
              <span>Next.js</span>
            </span>
            <span className="hero-tech-item">
              <SiFlutter className="hero-tech-icon" aria-hidden="true" />
              <span>Flutter</span>
            </span>
            <span className="hero-tech-item">
              <SiFirebase className="hero-tech-icon" aria-hidden="true" />
              <span>Firebase</span>
            </span>
            <span className="hero-tech-item">
              <FaNodeJs className="hero-tech-icon" aria-hidden="true" />
              <span>Node.js</span>
            </span>
            <span className="hero-tech-item">
              <svg
                className="hero-tech-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="9" x2="9" y2="20" />
              </svg>
              <span>UI/UX</span>
            </span>
          </div>

          <p className="hero-description">
            I&apos;m a full-stack developer who loves turning complex problems into simple, functional, and well-designed software. Whether it&apos;s a mobile app or a web platform, I focus on clean architecture and great user experiences.
          </p>

          <div className="hero-cta">
            <a href="#projects" className="cta-button">
              <span>View My Work</span>
              <FaArrowRight className="cta-arrow" aria-hidden="true" />
            </a>
            <a href="#footer" className="cta-button secondary">
              Contact Me
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-face-wrapper">
            <img src={heroFace} alt="Abiy Matrix Portrait" className="hero-face-img hero-face-dark" />
            <img src={heroFaceLight} alt="" aria-hidden="true" className="hero-face-img hero-face-light" />
            <div className="hero-face-glow"></div>
          </div>
        </div>
      </div>

      <div className="hero-bottom-divider" aria-hidden="true"></div>
    </section>
  );
}
