import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Projects.css";


export default function Admin() {
    const [activeTab, setActiveTab] = useState("projects");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ projects: [], experience: [], skills: [] });
    const navigate = useNavigate();

    // Form States
    const [projectForm, setProjectForm] = useState({ name: "", stack: "", description: "", github: "", demo: "", featured: false });
    const [expForm, setExpForm] = useState({ title: "", tech: "", period: "", details: "" });
    const [skillForm, setSkillForm] = useState({ category: "", items: "" });

    // Editing State
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        checkUser();
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function checkUser() {
        const isLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";
        if (!isLoggedIn) navigate("/login");
    }

    async function fetchAllData() {
        setLoading(true);
        try {
            const pResp = await fetch("/api/get-data?table=projects");
            const projects = await pResp.json();

            const eResp = await fetch("/api/get-data?table=experience");
            const experience = await eResp.json();

            const sResp = await fetch("/api/get-data?table=skills");
            const skills = await sResp.json();

            setData({ 
                projects: Array.isArray(projects) ? projects : [], 
                experience: Array.isArray(experience) ? experience : [], 
                skills: Array.isArray(skills) ? skills : [] 
            });
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const handleLogout = async () => {
        sessionStorage.clear();
        navigate("/login");
    };


    // CRUD Actions
    async function saveItem(table, item) {
        try {
            const url = editingId ? `/api/admin?table=${table}&id=${editingId}` : `/api/admin?table=${table}`;
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to save");
            }

            setEditingId(null);
            fetchAllData();
        } catch (error) {
            alert(error.message);
        }
    }

    async function deleteItem(table, id) {
        if (window.confirm("Are you sure you want to delete this?")) {
            try {
                const response = await fetch(`/api/admin?table=${table}&id=${id}`, {
                    method: "DELETE"
                });

                if (!response.ok) throw new Error("Failed to delete");
                fetchAllData();
            } catch (error) {
                alert(error.message);
            }
        }
    }

    const startEdit = (tab, item) => {
        setEditingId(item.id);
        if (tab === "projects") {
            setProjectForm({
                name: item.name,
                stack: item.stack,
                description: item.description,
                github: item.github,
                demo: item.demo,
                featured: item.featured || false
            });
        } else if (tab === "experience") {
            setExpForm({ title: item.title, tech: item.tech, period: item.period, details: item.details.join("\n") });
        } else if (tab === "skills") {
            setSkillForm({ category: item.category, items: item.items.join(", ") });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setProjectForm({ name: "", stack: "", description: "", github: "", demo: "", featured: false });
        setExpForm({ title: "", tech: "", period: "", details: "" });
        setSkillForm({ category: "", items: "" });
    };

    if (loading) return <div className="loading" style={{ color: "white", padding: "100px", textAlign: "center" }}>Loading...</div>;

    return (
        <section className="projects-section admin-panel">
            <div className="section-header">
                <h2 className="projects-title">Portfolio CMS</h2>
                    <button onClick={handleLogout} className="admin-btn logout-btn">Logout</button>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <button onClick={() => { setActiveTab("projects"); cancelEdit(); }} className={`admin-btn ${activeTab === "projects" ? "active" : ""}`}>Projects</button>
                <button onClick={() => { setActiveTab("experience"); cancelEdit(); }} className={`admin-btn ${activeTab === "experience" ? "active" : ""}`}>Experience</button>
                <button onClick={() => { setActiveTab("skills"); cancelEdit(); }} className={`admin-btn ${activeTab === "skills" ? "active" : ""}`}>Skills</button>
            </div>

            {activeTab === "projects" && (
                <div className="tab-content">
                    <div className="admin-card" style={{ marginBottom: '40px' }}>
                        <h3>{editingId ? "Edit Project" : "Add Project"}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); saveItem("projects", projectForm); setProjectForm({ name: "", stack: "", description: "", github: "", demo: "", featured: false }); }} className="contact-form">
                            <div className="premium-input-group">
                                <input type="text" placeholder="Project Name" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} required />
                            </div>
                            <div className="premium-input-group">
                                <input type="text" placeholder="Stack (e.g. React + Supabase)" value={projectForm.stack} onChange={e => setProjectForm({ ...projectForm, stack: e.target.value })} />
                            </div>
                            <div className="premium-input-group">
                                <textarea placeholder="Description" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} required rows="4" />
                            </div>
                            <div className="premium-input-group">
                                <input type="url" placeholder="Github URL" value={projectForm.github} onChange={e => setProjectForm({ ...projectForm, github: e.target.value })} />
                            </div>
                            <div className="premium-input-group">
                                <input type="url" placeholder="Demo URL" value={projectForm.demo} onChange={e => setProjectForm({ ...projectForm, demo: e.target.value })} />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d4a373', marginBottom: '20px', cursor: 'pointer', fontFamily: 'Courier Prime, monospace', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={projectForm.featured}
                                    onChange={e => setProjectForm({ ...projectForm, featured: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#d4a373' }}
                                />
                                Show on Homepage (Featured)
                            </label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="admin-btn active">{editingId ? "Update Project" : "Add Project"}</button>
                                {editingId && <button type="button" onClick={cancelEdit} className="admin-btn">Cancel</button>}
                            </div>
                        </form>
                    </div>
                    <div className="projects-canvas">
                        {data.projects.map(p => (
                            <div className="admin-card" key={p.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3>{p.name}</h3>
                                    {p.featured && <span style={{ background: '#d4a373', color: '#0a0e13', padding: '2px 8px', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold' }}>FEATURED</span>}
                                </div>
                                <span className="stack">{p.stack}</span>
                                <div className="admin-actions">
                                    <button onClick={() => startEdit("projects", p)} className="admin-icon-btn" title="Edit"><FaEdit /></button>
                                    <button onClick={() => deleteItem("projects", p.id)} className="admin-icon-btn delete" title="Delete"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "experience" && (
                <div className="tab-content">
                    <div className="admin-card" style={{ marginBottom: '40px' }}>
                        <h3>{editingId ? "Edit Experience" : "Add Experience"}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); saveItem("experience", { ...expForm, details: expForm.details.split("\n") }); setExpForm({ title: "", tech: "", period: "", details: "" }); }} className="contact-form">
                            <div className="premium-input-group">
                                <input type="text" placeholder="Job Title" value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} required />
                            </div>
                            <div className="premium-input-group">
                                <input type="text" placeholder="Technologies used" value={expForm.tech} onChange={e => setExpForm({ ...expForm, tech: e.target.value })} />
                            </div>
                            <div className="premium-input-group">
                                <input type="text" placeholder="Period (e.g. 2023 - Present)" value={expForm.period} onChange={e => setExpForm({ ...expForm, period: e.target.value })} />
                            </div>
                            <div className="premium-input-group">
                                <textarea placeholder="Details (One task per line)" value={expForm.details} onChange={e => setExpForm({ ...expForm, details: e.target.value })} rows="4" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="admin-btn active">{editingId ? "Update Experience" : "Add Experience"}</button>
                                {editingId && <button type="button" onClick={cancelEdit} className="admin-btn">Cancel</button>}
                            </div>
                        </form>
                    </div>
                    <div className="projects-canvas">
                        {data.experience.map(e => (
                            <div className="admin-card" key={e.id}>
                                <h3>{e.title}</h3>
                                <span>{e.period} | {e.tech}</span>
                                <div className="admin-actions">
                                    <button onClick={() => startEdit("experience", e)} className="admin-icon-btn" title="Edit"><FaEdit /></button>
                                    <button onClick={() => deleteItem("experience", e.id)} className="admin-icon-btn delete" title="Delete"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "skills" && (
                <div className="tab-content">
                    <div className="admin-card" style={{ marginBottom: '40px' }}>
                        <h3>{editingId ? "Edit Skill Category" : "Add Skill Category"}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); saveItem("skills", { ...skillForm, items: skillForm.items.split(",").map(i => i.trim()) }); setSkillForm({ category: "", items: "" }); }} className="contact-form">
                            <div className="premium-input-group">
                                <input type="text" placeholder="Skill Category (e.g. Languages)" value={skillForm.category} onChange={e => setSkillForm({ ...skillForm, category: e.target.value })} required />
                            </div>
                            <div className="premium-input-group">
                                <input type="text" placeholder="Items (Comma separated: React, JS, HTML)" value={skillForm.items} onChange={e => setSkillForm({ ...skillForm, items: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="admin-btn active">{editingId ? "Update Category" : "Add Category"}</button>
                                {editingId && <button type="button" onClick={cancelEdit} className="admin-btn">Cancel</button>}
                            </div>
                        </form>
                    </div>
                    <div className="projects-canvas">
                        {data.skills.map(s => (
                            <div className="admin-card" key={s.id}>
                                <h3>{s.category}</h3>
                                <p>{s.items?.join(", ")}</p>
                                <div className="admin-actions">
                                    <button onClick={() => startEdit("skills", s)} className="admin-icon-btn" title="Edit"><FaEdit /></button>
                                    <button onClick={() => deleteItem("skills", s.id)} className="admin-icon-btn delete" title="Delete"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
