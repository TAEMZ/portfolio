import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
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

    // AI Chat Modifier States
    const [chatInputs, setChatInputs] = useState({});
    const [chatLoading, setChatLoading] = useState({});

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

    async function updateProjectStatus(id, status) {
        try {
            const response = await fetch(`/api/admin?table=projects&id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to update status");
            }

            fetchAllData();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleChatModify(id, message) {
        if (!message.trim()) return;
        setChatLoading(prev => ({ ...prev, [id]: true }));
        try {
            const response = await fetch('/api/modify-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, message })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to modify project.');
            }

            fetchAllData();
            setChatInputs(prev => ({ ...prev, [id]: '' }));
        } catch (error) {
            alert(error.message);
        } finally {
            setChatLoading(prev => ({ ...prev, [id]: false }));
        }
    }

    const startEdit = (tab, item) => {
        setEditingId(item.id);
        if (tab === "projects") {
            setActiveTab("projects");
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

    // Simulate Column-Balancing for Resume Live Preview
    const simulateResumeColumns = () => {
        // Left Column baseline items (exact match to word/document.xml)
        const leftColumn = [
            { isHeader: true, name: "MORE PROJECTS" },
            { name: "Agentic Chat", stack: "React · Firebase · Vanilla CSS", description: "Real-time chat with video/voice calls, theme syncing, collaborative sketching, hidden gesture channel, and mood-adaptive UI." },
            { name: "Debug Partner", stack: "TypeScript · Python · Supabase · AI", description: "AI coding assistant that iterates on problems over time. Dashboard, analytics, team workspace, evolving suggestions." },
            { name: "Grad Gram", stack: "React · Firebase", description: "Platform for graduates – photo uploads, final messages, department memory rooms, media gallery." },
            { name: "Agent Monitor", stack: "Next.js · TypeScript · Supabase", description: "Monitoring dashboard and SDK for tracking AI agent tool calls and behavior in production." },
            { isHeader: true, name: "DEVELOPER TOOLS & PACKAGES" },
            { name: "AgentGuard npm package", stack: "TypeScript", description: "Lightweight security middleware for AI agents. Intercepts tool calls with filesystem/network/shell guardrails, rate limiting, human-in-the-loop approval, and audit logging." },
            { name: "mcp-test-kit npm package", stack: "TypeScript", description: "Testing framework for Model Context Protocol servers – mock TestServer, a StdioClient, and custom Vitest matchers for validating MCP tool output." },
            { name: "diff-test npm package", stack: "TypeScript", description: "CLI that runs only the tests affected by your current git diff, using import-graph analysis. Auto-detects Vitest, Jest, Mocha, and Playwright." }
        ];

        // Right Column baseline items (exact match to word/document.xml)
        const rightColumn = [
            { isHeader: true, name: "MORE PROJECTS" },
            { name: "Star Wars Explorer", stack: "Flutter · Riverpod · GraphQL", description: "Galaxy map visualization, character connection hub, offline persistence via Hive." },
            { name: "Movie Quote Generator", stack: "JavaScript", description: "Submit, rate, and discuss movie quotes – threaded comments, analytics, favorites, search." },
            { name: "Web Music Player", stack: "React · Firebase", description: "Community audio player – shared track library, curated playlists, custom-built navigation." },
            { name: "Movie Repository", stack: "React", description: "Movie browsing and watchlist app – external API integration, dynamic search/filter." },
            { name: "CineVault", stack: "React", description: "Community movie discovery hub – user-submitted summaries, cast info, quote generation." }
        ];

        const cleanBaseName = (name) => {
            const parts = (name || '').split(/[–\-:|]/);
            let base = parts[0];
            base = base.replace(/\bnpm package\b/gi, '');
            base = base.replace(/\bweb app\b/gi, '');
            base = base.replace(/\bflutter app\b/gi, '');
            return base.trim();
        };

        const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const baselineNames = [
            "agenticchat", "debugpartner", "gradgram", "agentmonitor",
            "agentguard", "mcptestkit", "difftest", "starwarsexplorer",
            "moviequotegenerator", "webmusicplayer", "movierepository", "cinevault",
            "chessarena", "skillsnap", "habeshanyelp", "telegramsavedmessagesbot", "telegrammedicaladvicebot"
        ];

        // Fetch published database projects (excluding drafts/rejected ones)
        const dbPublished = (data.projects || []).filter(p => p.status === 'published' || !p.status);

        // Balance the new database projects dynamically
        dbPublished.forEach(proj => {
            const baseName = cleanBaseName(proj.name);
            const normName = normalize(baseName);
            if (baselineNames.includes(normName)) return; // Skip duplicates already in the template

            // Count paragraphs in columns (Project: 3 paras, Header: 1 para)
            const leftCount = leftColumn.reduce((acc, item) => acc + (item.isHeader ? 1 : 3), 0);
            const rightCount = rightColumn.reduce((acc, item) => acc + (item.isHeader ? 1 : 3), 0);

            const newItem = { name: proj.name, stack: proj.stack, description: proj.description };
            if (leftCount <= rightCount) {
                leftColumn.push(newItem);
            } else {
                rightColumn.push(newItem);
            }
        });

        return { leftColumn, rightColumn };
    };

    const hasPendingDrafts = (data.projects || []).some(p => p.status === 'draft');

    if (loading) return <div className="loading" style={{ color: "white", padding: "100px", textAlign: "center" }}>Loading...</div>;

    const { leftColumn, rightColumn } = simulateResumeColumns();

    return (
        <section className="projects-section admin-panel">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="projects-title">Portfolio CMS</h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {!hasPendingDrafts ? (
                        <a 
                            href="/api/download-resume" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn active"
                            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', background: '#d4a373', color: '#0a0e13', fontWeight: 'bold' }}
                        >
                            Download Resume (DOCX)
                        </a>
                    ) : (
                        <div 
                            style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(212, 163, 115, 0.05)', border: '1px dashed rgba(212, 163, 115, 0.4)', color: '#d4a373', fontSize: '0.8rem', padding: '8px 15px', borderRadius: '4px', fontStyle: 'italic', fontFamily: 'Courier Prime, monospace' }}
                        >
                            [Drafts pending - Publish or Reject below to enable download]
                        </div>
                    )}
                    <button onClick={handleLogout} className="admin-btn logout-btn">Logout</button>
                </div>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <button onClick={() => { setActiveTab("projects"); cancelEdit(); }} className={`admin-btn ${activeTab === "projects" ? "active" : ""}`}>Projects</button>
                <button onClick={() => { setActiveTab("pending"); cancelEdit(); }} className={`admin-btn ${activeTab === "pending" ? "active" : ""}`}>Pending ({(data.projects || []).filter(p => p.status === 'draft').length})</button>
                <button onClick={() => { setActiveTab("preview"); cancelEdit(); }} className={`admin-btn ${activeTab === "preview" ? "active" : ""}`}>Preview Resume</button>
                <button onClick={() => { setActiveTab("experience"); cancelEdit(); }} className={`admin-btn ${activeTab === "experience" ? "active" : ""}`}>Experience</button>
                <button onClick={() => { setActiveTab("skills"); cancelEdit(); }} className={`admin-btn ${activeTab === "skills" ? "active" : ""}`}>Skills</button>
            </div>

            {activeTab === "projects" && (
                <div className="tab-content">
                    <div className="admin-card" style={{ marginBottom: '40px' }}>
                        <h3>{editingId ? "Edit Project" : "Add Project"}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); saveItem("projects", { ...projectForm, status: 'published' }); setProjectForm({ name: "", stack: "", description: "", github: "", demo: "", featured: false }); }} className="contact-form">
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
                        {(data.projects || []).filter(p => p.status === 'published' || !p.status).map(p => (
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

            {activeTab === "pending" && (
                <div className="tab-content">
                    <div className="projects-canvas" style={{ gridTemplateColumns: '1fr' }}>
                        {(data.projects || []).filter(p => p.status === 'draft').map(p => {
                            const chatHistory = typeof p.chat_history === 'string' 
                                ? JSON.parse(p.chat_history) 
                                : (p.chat_history || []);

                            return (
                                <div className="admin-card" key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '800px', margin: '0 auto 20px auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3>{p.name}</h3>
                                        <span style={{ background: '#d4a373', color: '#0a0e13', padding: '2px 8px', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold' }}>DRAFT</span>
                                    </div>
                                    <span className="stack">{p.stack}</span>
                                    <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>{p.description}</p>
                                    
                                    {p.ai_reason && (
                                        <div style={{ background: 'rgba(212, 163, 115, 0.08)', borderLeft: '3px solid #d4a373', padding: '10px', fontSize: '0.8rem', color: '#d4a373', marginTop: '5px', fontStyle: 'italic' }}>
                                            <strong>AI Reason:</strong> {p.ai_reason}
                                        </div>
                                    )}

                                    {/* Conversational Chat Thread UI */}
                                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                        <h4 style={{ color: '#d4a373', marginBottom: '10px', fontSize: '0.85rem', fontFamily: 'Courier Prime, monospace' }}>Refinement Assistant Chat:</h4>
                                        
                                        {chatHistory.length > 0 && (
                                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '15px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                                {chatHistory.map((msg, index) => {
                                                    const isUser = msg.role === 'user';
                                                    return (
                                                        <div 
                                                            key={index}
                                                            style={{
                                                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                                                background: isUser ? 'rgba(212, 163, 115, 0.15)' : 'rgba(255,255,255,0.06)',
                                                                color: isUser ? '#d4a373' : '#e0e0e0',
                                                                padding: '8px 14px',
                                                                borderRadius: isUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                                fontSize: '0.8rem',
                                                                maxWidth: '80%',
                                                                lineHeight: '1.4',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                        >
                                                            <strong style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '3px', opacity: 0.7 }}>
                                                                {isUser ? 'You' : 'Groq Assistant'}
                                                            </strong>
                                                            {msg.content}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Ask AI to modify (e.g. 'shorten the description', 'add Node.js to stack')"
                                                value={chatInputs[p.id] || ""}
                                                onChange={e => setChatInputs({ ...chatInputs, [p.id]: e.target.value })}
                                                onKeyDown={e => { if (e.key === 'Enter') handleChatModify(p.id, chatInputs[p.id]); }}
                                                style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'white' }}
                                            />
                                            <button 
                                                onClick={() => handleChatModify(p.id, chatInputs[p.id])} 
                                                disabled={chatLoading[p.id] || !chatInputs[p.id]?.trim()}
                                                className="admin-btn active" 
                                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.85rem' }}
                                            >
                                                {chatLoading[p.id] ? "Updating..." : <><FaPaperPlane /> Send</>}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                        <button onClick={() => updateProjectStatus(p.id, 'published')} className="admin-btn active" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>Publish</button>
                                        <button onClick={() => startEdit("projects", p)} className="admin-btn" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>Edit Manually</button>
                                        <button onClick={() => updateProjectStatus(p.id, 'rejected')} className="admin-btn logout-btn" style={{ padding: '8px 20px', fontSize: '0.8rem', background: '#e07a5f' }}>Reject</button>
                                    </div>
                                </div>
                            );
                        })}
                        {(data.projects || []).filter(p => p.status === 'draft').length === 0 && (
                            <div style={{ color: 'white', textAlign: 'center', width: '100%', padding: '40px', fontFamily: 'Courier Prime, monospace' }}>No pending draft projects found.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "preview" && (
                <div className="tab-content">
                    <div style={{ color: '#d4a373', textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem', fontFamily: 'Courier Prime, monospace', fontStyle: 'italic' }}>
                        * Live visual layout simulation of your generated columns. Columns balance automatically *
                    </div>
                    
                    <div className="resume-preview-sheet" style={{
                        background: '#ffffff',
                        color: '#333333',
                        padding: '40px',
                        maxWidth: '850px',
                        margin: '0 auto 40px auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                    }}>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #2d3748', paddingBottom: '12px', marginBottom: '20px' }}>
                            <h1 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', color: '#1a202c', fontWeight: 'bold', letterSpacing: '0.05em' }}>ABIY KIBRU</h1>
                            <p style={{ margin: '0', fontSize: '0.8rem', color: '#4a5568', letterSpacing: '0.02em' }}>
                                abiykibru@gmail.com | +251 930 762 144 | Addis Ababa, Ethiopia
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '30px' }}>
                            {/* Left Column */}
                            <div>
                                {leftColumn.map((item, idx) => {
                                    if (item.isHeader) {
                                        return (
                                            <h3 key={idx} style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                color: '#2d3748',
                                                borderBottom: '1px solid #cbd5e1',
                                                paddingBottom: '3px',
                                                marginTop: idx === 0 ? '0px' : '15px',
                                                marginBottom: '10px',
                                                letterSpacing: '0.04em'
                                            }}>{item.name}</h3>
                                        );
                                    }
                                    return (
                                        <div key={idx} style={{ marginBottom: '12px' }}>
                                            <h4 style={{ margin: '0 0 1px 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a202c' }}>{item.name}</h4>
                                            <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#4a5568', display: 'block', marginBottom: '3px' }}>{item.stack}</span>
                                            <p style={{ margin: '0', fontSize: '0.75rem', color: '#4a5568', lineHeight: '1.35' }}>{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column */}
                            <div>
                                {rightColumn.map((item, idx) => {
                                    if (item.isHeader) {
                                        return (
                                            <h3 key={idx} style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                color: '#2d3748',
                                                borderBottom: '1px solid #cbd5e1',
                                                paddingBottom: '3px',
                                                marginTop: idx === 0 ? '0px' : '15px',
                                                marginBottom: '10px',
                                                letterSpacing: '0.04em'
                                            }}>{item.name}</h3>
                                        );
                                    }
                                    return (
                                        <div key={idx} style={{ marginBottom: '12px' }}>
                                            <h4 style={{ margin: '0 0 1px 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a202c' }}>{item.name}</h4>
                                            <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#4a5568', display: 'block', marginBottom: '3px' }}>{item.stack}</span>
                                            <p style={{ margin: '0', fontSize: '0.75rem', color: '#4a5568', lineHeight: '1.35' }}>{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
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
                                <button type="submit" className="admin-btn active">{editingId ? "Add Experience" : "Add Experience"}</button>
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
