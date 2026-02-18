import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Experience.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Experience() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching experiences:", error);
    else setExperiences(data);
    setLoading(false);
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (loading) return <div className="experience">Loading...</div>;

  return (
    <section className="experience" id="experience">
      <div className="section-header">
        <h2 className="experience-title">Experience & Projects</h2>
        <button
          className="collapse-toggle"
          onClick={toggleCollapse}
          aria-label="Toggle Compact View"
          title={isCollapsed ? "Expand Cards" : "Collect Cards"}
        >
          {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>
      <div className={`experience-grid ${isCollapsed ? "collapsed" : ""}`}>
        {experiences.length === 0 ? (
          <p>No experiences found.</p>
        ) : (
          experiences.map((exp, idx) => (
            <div className="experience-card vintage-card" key={idx}>
              <div className="nail"></div>
              <h3>{exp.title}</h3>
              <p className="tech">
                {exp.tech}
              </p>
              <ul>
                {Array.isArray(exp.details) && exp.details.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
      <div className="experience-glow"></div>
    </section>
  );
}
