import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Projects.css";

const initialProjects = [
    { name: "Agentic Chat", stack: "React + Firebase + Vanilla CSS", description: "A feature-packed chat app acting as a real-time platform. Supports Video/Voice calls, File Sharing, and Secure Auth. Includes 'Theme Syncing' between users, a hidden gesture channel, collaborative sketching, and 'Sentiment UI' that changes colors based on message mood.", github: "https://github.com/TAEMZ/Agentic-Chat", demo: "https://chatapp-eight-rho.vercel.app/" },
    { name: "Debug Partner", stack: "Python + Supabase + AI", description: "A chronological problem-solving assistant that suggests solutions at timed intervals (immediate to long-term), providing deeper insights as it 'thinks' for you over time.", github: "https://github.com/TAEMZ/Debug_partner" },
    { name: "Star Wars Explorer", stack: "Flutter + Riverpod + GraphQL + Hive", description: "A feature-rich Star Wars app featuring a Galaxy Map, character connection Hub, and offline persistence. Built with modern state management and Graphql synchronization.", github: "https://github.com/TAEMZ/Star-Wars-Explore" },
    { name: "Telegram Medical Advice Bot", stack: "Python + Flask + Addis Assistant AI", description: "AI-powered healthcare assistant supporting Amharic, Afaan Oromoo, and Tigrinya. Provides medical guidance using the Addis Assistant AI API.", github: "https://github.com/TAEMZ" },
    { name: "GradGram – Web App", stack: "React + Firebase", description: "Social platform for graduating students to share memories, photos, and last words. Features Google Auth, Firestore, and department-based rooms.", github: "https://github.com/TAEMZ/grad_gram", demo: "https://grad-gram.vercel.app/" },
    { name: "Habeshan Yelp– Flutter App", stack: "Flutter + Firebase + Maps", description: "A business finder app with live location, map integration, and user reviews. Realtime updates using Firebase and Google Maps.", github: "https://github.com/TAEMZ/Localbusiness" },
    { name: "Music Player ", stack: "React", description: "A custom-designed audio player interface with playlist support and futuristic neon layout.", github: "https://github.com/TAEMZ/music_player" },
    { name: "Quote generator", stack: "HTML,CSS ,JS", description: "Quote generator from famous movie lines and platform where users talk about their favorite movies.", github: "https://github.com/TAEMZ/Quote-Generator", demo: "https://quote-generator-beta-sepia.vercel.app/" },
    { name: "Movie Repository", stack: "HTML + CSS + JS", description: "A static movie catalog website with card layout, search filtering, usind .", github: "https://github.com/TAEMZ/Movie-Repo", demo: "https://movie-repo-theta.vercel.app" },
    { name: "Skill Snap", stack: "Flutter + Superbase", description: "is a peer-to-peer (P2P) skill-sharing platform that connectes individuals to exchange knowledge and abilities directly. Users can teach or learn various ", github: "https://github.com/TAEMZ/SkillSnap/tree/main/skill_snap" }
];

const initialExperience = [
    { title: "Automated Telegram Services", tech: "n8n + Python (Backend)", period: "2024", details: ["Developed service-oriented Telegram bots orchestrated via n8n workflows.", "Integrated robust Python backends for complex data processing and logic.", "Streamlined user interactions for automated service delivery."] },
    { title: "Corporate Web Solutions", tech: "Next.js + React + Modern UI", period: "2024", details: ["Designed and deployed high-performance portfolio websites for client companies.", "Built responsive, professional sites that align with corporate brand identities."] },
    { title: "Automation & AI Workflows", tech: "n8n + Make.com + GraphQL", period: "2024 - Present", details: ["Built automated Facebook Ad account syncing for campaigns, adsets, and ads using GraphQL.", "Developed automated blog post generators and publishing flows via Make.com.", "Implemented various complex n8n workflows for data synchronization and AI assistant integration."] },
    { title: "Hospital Management System", tech: "Java (Spring Boot)", period: "2023", details: ["Managed patients, pharmacy, and billing using java and MySQL.", "Included PDF exports, secure login, backups, and role-based access."] },
    { title: "Store Inventory System", tech: "Java (Swing + MySQL)", period: "2023", details: ["Built a desktop inventory system with stock alerts and reports.", "product lookup and supplier tracking included."] },
    { title: "Hotel Booking System", tech: "Java (Spring Boot)", period: "2024", details: ["Created booking portal with staff scheduling and payment simulation.", "Used layered MVC and database-driven design."] },
    { title: "Academic Plagiarism Checker", tech: "n8n + Python (Flask) + Gemini AI", period: "2024", details: ["Automated plagiarism detection pipeline using n8n workflows and Python Flask microservices.", "Integrated Google Gemini AI for advanced semantic analysis and comparison.", "Utilized Supabase for real-time results tracking and data storage."] },
    { title: "Freelance Mobile Engineer", tech: "Flutter + Firebase + Google Maps", period: "2024", details: ["Delivered scalable mobile solutions for local businesses, focusing on geolocation features.", "Implemented real-time backends and media storage using Firebase."] }
];

const initialSkills = [
    { category: "Languages", items: ["Java", "JavaScript", "PHP", "Dart (Flutter)", "Python", "React", "Html", "Css"] },
    { category: "Frameworks & Libraries", items: ["Spring Boot", "React", "Express.js"] },
    { category: "Databases", items: ["Firebase", "PostgreSQL", "MySQL", "Superbase"] },
    { category: "DevOps & Tools", items: ["Docker", "Git", "Postman"] },
    { category: "Automation", items: ["n8n", "Make.com"] }
];

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
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) navigate("/login");
    }

    async function fetchAllData() {
        setLoading(true);
        try {
            const { data: projects } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
            const { data: experience } = await supabase.from("experience").select("*").order("created_at", { ascending: false });
            const { data: skills } = await supabase.from("skills").select("*").order("created_at", { ascending: true });
            setData({ projects: projects || [], experience: experience || [], skills: skills || [] });
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const migrateData = async () => {
        setLoading(true);
        try {
            const pResp = await supabase.from("projects").insert(initialProjects);
            if (pResp.error) throw pResp.error;

            const eResp = await supabase.from("experience").insert(initialExperience);
            if (eResp.error) throw eResp.error;

            const sResp = await supabase.from("skills").insert(initialSkills);
            if (sResp.error) throw sResp.error;

            alert("Migration Successful!");
            fetchAllData();
        } catch (err) {
            alert("Migration Failed: " + (err.message || JSON.stringify(err)));
            console.error(err);
        }
        setLoading(false);
    };

    // CRUD Actions
    async function saveItem(table, item) {
        let error;
        if (editingId) {
            const { error: err } = await supabase.from(table).update(item).eq("id", editingId);
            error = err;
        } else {
            const { error: err } = await supabase.from(table).insert([item]);
            error = err;
        }

        if (error) alert(error.message);
        else {
            setEditingId(null);
            fetchAllData();
        }
    }

    async function deleteItem(table, id) {
        if (window.confirm("Are you sure you want to delete this?")) {
            const { error } = await supabase.from(table).delete().eq("id", id);
            if (error) alert(error.message);
            else fetchAllData();
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    {(data.projects.length === 0) && (
                        <button onClick={migrateData} className="admin-btn" style={{ background: 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50', color: '#4CAF50' }}>Migrate All Data</button>
                    )}
                    <button onClick={handleLogout} className="admin-btn logout-btn">Logout</button>
                </div>
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
