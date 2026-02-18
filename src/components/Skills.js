import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Skills.css";

export default function Skills() {
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching skills:", error);
    } else {
      // Group by category
      const grouped = data.reduce((acc, curr) => {
        acc[curr.category] = curr.items;
        return acc;
      }, {});
      setSkills(grouped);
    }
    setLoading(false);
  }

  if (loading) return <div className="skills-section">Loading...</div>;

  return (
    <section className="skills-section" id="skills">
      <h2 className="skills-title glitch" data-text="SKILLS">
        SKILLS
      </h2>
      <div className="skill-groups">
        {Object.entries(skills).length === 0 ? (
          <p>No skills found.</p>
        ) : (
          Object.entries(skills).map(([category, items], index) => (
            <div className="skill-group" key={index}>
              <h3 className="category-title">{category}</h3>
              <div className="skill-chips">
                {Array.isArray(items) && items.map((item, idx) => (
                  <span className="skill-chip" key={idx} data-text={item}>
                    <span className="skill-chip-inner">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="skills-glow"></div>
      <div className="cyber-grid"></div>
    </section>
  );
}
