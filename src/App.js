import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import Login from "./components/Login";
import AllProjects from "./components/AllProjects";
import CursorTrail from "./components/CursorTrail";

import "./App.css";

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return "dark";
}

const Portfolio = ({ theme, onSelectTheme }) => (
  <>
    <Navbar theme={theme} onSelectTheme={onSelectTheme} />
    <Hero />
    <About />
    <Skills />
    <Experience />
    <Projects />
    <Footer />
  </>
);

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch {
      // Ignore storage persistence errors
    }
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "light" ? "#e4dccf" : "#0c0c0e");
    }
  }, [theme]);

  return (
    <>
      <CursorTrail />
      <Routes>
        <Route path="/" element={<Portfolio theme={theme} onSelectTheme={setTheme} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<AllProjects />} />
      </Routes>
      <Analytics />
    </>
  );
}
