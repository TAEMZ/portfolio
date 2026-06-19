import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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
import PetCompanion from "./components/PetCompanion";
import { answeredge } from './answeredgeClient';

import "./App.css";

const Portfolio = () => (
  <>
    <Navbar />
    <Hero />
    <About />
    <Skills />
    <Experience />
    <Projects />
    <Footer />
  </>
);

export default function App() {
  useEffect(() => {
    // Initialize AnswerEdge tracking on app load
    if (answeredge) {
      console.log('AnswerEdge SDK initialized');
    }
  }, []);

  return (
    <>
      <CursorTrail />
      <PetCompanion />
      <div className="tv-static"></div>
      <div className="scanlines"></div>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<AllProjects />} />
      </Routes>
    </>
  );
}
