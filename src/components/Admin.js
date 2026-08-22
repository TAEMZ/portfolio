import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    FaEdit, 
    FaTrash, 
    FaCloudUploadAlt, 
    FaSyncAlt, 
    FaArrowLeft, 
    FaArrowRight, 
    FaTimes, 
    FaPlus, 
    FaImage, 
    FaStar, 
    FaCheck, 
    FaExternalLinkAlt 
} from "react-icons/fa";
import "./Projects.css";

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "da7hlicdz";
const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || "cloudinary";

export default function Admin() {
    const [activeTab, setActiveTab] = useState("projects");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [data, setData] = useState({ projects: [], experience: [], skills: [] });
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Form States
    const [projectForm, setProjectForm] = useState({ 
        name: "", 
        stack: "", 
        description: "", 
        github: "", 
        demo: "", 
        featured: false,
        images: [] 
    });
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

    // GitHub Sync
    const handleSyncGithub = async () => {
        if (syncing) return;
        setSyncing(true);
        setSyncMessage("Syncing repositories & extracting screenshots from GitHub...");
        try {
            const res = await fetch("/api/github-sync", { method: "POST" });
            const result = await res.json();
            if (res.ok) {
                setSyncMessage("✅ " + (result.message || "Repositories and screenshots synced successfully!"));
                fetchAllData();
            } else {
                setSyncMessage("❌ Error: " + (result.error || "Failed to sync"));
            }
        } catch (err) {
            setSyncMessage("❌ Sync failed: " + err.message);
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncMessage(""), 6000);
        }
    };

    // Cloudinary Upload
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImages(true);
        const uploadedUrls = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_PRESET);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Upload failed for ${file.name}`);
                }

                const data = await response.json();
                if (data.secure_url) {
                    uploadedUrls.push(data.secure_url);
                }
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        if (uploadedUrls.length > 0) {
            setProjectForm(prev => ({
                ...prev,
                images: [...(prev.images || []), ...uploadedUrls]
            }));
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadingImages(false);
    };

    const addImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        setProjectForm(prev => ({
            ...prev,
            images: [...(prev.images || []), imageUrlInput.trim()]
        }));
        setImageUrlInput("");
    };

    const removeImage = (indexToRemove) => {
        setProjectForm(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const moveImage = (fromIdx, toIdx) => {
        const current = [...(projectForm.images || [])];
        if (toIdx < 0 || toIdx >= current.length) return;
        const [moved] = current.splice(fromIdx, 1);
        current.splice(toIdx, 0, moved);
        setProjectForm(prev => ({ ...prev, images: current }));
    };

    const setAsCover = (idx) => {
        moveImage(idx, 0);
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
        if (window.confirm("Are you sure you want to delete this item?")) {
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
                name: item.name || "",
                stack: item.stack || "",
                description: item.description || "",
                github: item.github || "",
                demo: item.demo || "",
                featured: item.featured || false,
                images: Array.isArray(item.images) ? item.images : []
            });
            window.scrollTo({ top: 120, behavior: 'smooth' });
        } else if (tab === "experience") {
            setExpForm({ 
                title: item.title || "", 
                tech: item.tech || "", 
                period: item.period || "", 
                details: Array.isArray(item.details) ? item.details.join("\n") : (item.details || "")
            });
        } else if (tab === "skills") {
            setSkillForm({ 
                category: item.category || "", 
                items: Array.isArray(item.items) ? item.items.join(", ") : (item.items || "")
            });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setProjectForm({ name: "", stack: "", description: "", github: "", demo: "", featured: false, images: [] });
        setExpForm({ title: "", tech: "", period: "", details: "" });
        setSkillForm({ category: "", items: "" });
    };

    if (loading) return <div className="loading" style={{ color: "white", padding: "100px", textAlign: "center" }}>Loading CMS...</div>;

    return (
        <section className="projects-section admin-panel">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/" className="admin-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <FaArrowLeft /> View Portfolio
                    </Link>
                    <h2 className="projects-title" style={{ margin: 0, fontSize: '1.8rem' }}>Portfolio CMS</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleSyncGithub} disabled={syncing} className="admin-btn" style={{ background: '#238636', borderColor: '#2ea043', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaSyncAlt className={syncing ? "spin-icon" : ""} /> {syncing ? "Syncing Repos..." : "Sync from GitHub"}
                    </button>
                    <button onClick={handleLogout} className="admin-btn logout-btn">Logout</button>
                </div>
            </div>

            {syncMessage && (
                <div style={{ 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    marginBottom: '20px', 
                    backgroundColor: syncMessage.includes('❌') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: `1px solid ${syncMessage.includes('❌') ? '#ef4444' : '#22c55e'}`,
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '0.95rem'
                }}>
                    {syncMessage}
                </div>
            )}

            <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <button onClick={() => { setActiveTab("projects"); cancelEdit(); }} className={`admin-btn ${activeTab === "projects" ? "active" : ""}`}>
                    Projects ({data.projects.length})
                </button>
                <button onClick={() => { setActiveTab("experience"); cancelEdit(); }} className={`admin-btn ${activeTab === "experience" ? "active" : ""}`}>
                    Experience ({data.experience.length})
                </button>
                <button onClick={() => { setActiveTab("skills"); cancelEdit(); }} className={`admin-btn ${activeTab === "skills" ? "active" : ""}`}>
                    Skills ({data.skills.length})
                </button>
            </div>

            {activeTab === "projects" && (
                <div className="tab-content">
                    {/* Project Add / Edit Form */}
                    <div className="admin-card" style={{ marginBottom: '40px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212, 163, 115, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#d4a373' }}>
                                {editingId ? `Edit Project: ${projectForm.name || "Untitled"}` : "Add New Project"}
                            </h3>
                            {editingId && (
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ID: {editingId}</span>
                            )}
                        </div>

                        <form onSubmit={(e) => { 
                            e.preventDefault(); 
                            saveItem("projects", projectForm); 
                            setProjectForm({ name: "", stack: "", description: "", github: "", demo: "", featured: false, images: [] }); 
                        }} className="contact-form">
                            <div className="premium-input-group">
                                <label style={{ display: 'block', color: '#d4a373', fontSize: '0.85rem', marginBottom: '4px' }}>Project Name *</label>
                                <input type="text" placeholder="e.g. SkillSnap – Flutter App" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} required />
                            </div>
                            
                            <div className="premium-input-group">
                                <label style={{ display: 'block', color: '#d4a373', fontSize: '0.85rem', marginBottom: '4px' }}>Tech Stack</label>
                                <input type="text" placeholder="e.g. Flutter · Dart · Firebase" value={projectForm.stack} onChange={e => setProjectForm({ ...projectForm, stack: e.target.value })} />
                            </div>
                            
                            <div className="premium-input-group">
                                <label style={{ display: 'block', color: '#d4a373', fontSize: '0.85rem', marginBottom: '4px' }}>Description *</label>
                                <textarea placeholder="Describe the key features, architecture, and problem solved..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} required rows="4" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                                <div className="premium-input-group">
                                    <label style={{ display: 'block', color: '#d4a373', fontSize: '0.85rem', marginBottom: '4px' }}>GitHub Repository URL</label>
                                    <input type="url" placeholder="https://github.com/TAEMZ/repo" value={projectForm.github} onChange={e => setProjectForm({ ...projectForm, github: e.target.value })} />
                                </div>
                                <div className="premium-input-group">
                                    <label style={{ display: 'block', color: '#d4a373', fontSize: '0.85rem', marginBottom: '4px' }}>Live Demo URL</label>
                                    <input type="url" placeholder="https://my-app.vercel.app" value={projectForm.demo} onChange={e => setProjectForm({ ...projectForm, demo: e.target.value })} />
                                </div>
                            </div>

                            {/* Multiple Images Management Section */}
                            <div style={{ 
                                margin: '20px 0', 
                                padding: '20px', 
                                background: 'rgba(0, 0, 0, 0.4)', 
                                border: '1px dashed rgba(212, 163, 115, 0.4)', 
                                borderRadius: '10px' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ color: '#d4a373', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                        <FaImage /> Project Screenshots & Images ({projectForm.images?.length || 0})
                                    </label>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        Cloudinary ({CLOUDINARY_CLOUD_NAME})
                                    </span>
                                </div>

                                {/* Upload & URL inputs */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '15px' }}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleImageUpload} 
                                        style={{ display: 'none' }} 
                                        id="cloudinary-upload-input"
                                    />
                                    <label 
                                        htmlFor="cloudinary-upload-input" 
                                        className="admin-btn"
                                        style={{ 
                                            cursor: uploadingImages ? 'not-allowed' : 'pointer', 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            background: '#3b82f6', 
                                            borderColor: '#2563eb',
                                            margin: 0
                                        }}
                                    >
                                        <FaCloudUploadAlt style={{ fontSize: '1.2rem' }} /> 
                                        {uploadingImages ? "Uploading to Cloudinary..." : "Upload Images"}
                                    </label>

                                    <div style={{ display: 'flex', flex: 1, minWidth: '260px', gap: '8px' }}>
                                        <input 
                                            type="url" 
                                            placeholder="Paste direct Image / Screenshot URL..." 
                                            value={imageUrlInput} 
                                            onChange={e => setImageUrlInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                                            style={{ 
                                                flex: 1, 
                                                padding: '10px 14px', 
                                                background: 'rgba(255,255,255,0.05)', 
                                                border: '1px solid rgba(255,255,255,0.15)', 
                                                borderRadius: '6px', 
                                                color: '#fff',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={addImageUrl} 
                                            className="admin-btn"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}
                                        >
                                            <FaPlus /> Add URL
                                        </button>
                                    </div>
                                </div>

                                {/* Images Preview Grid */}
                                {projectForm.images && projectForm.images.length > 0 ? (
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                                        gap: '12px',
                                        maxHeight: '340px',
                                        overflowY: 'auto',
                                        padding: '8px',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '8px'
                                    }}>
                                        {projectForm.images.map((imgUrl, idx) => (
                                            <div 
                                                key={idx} 
                                                style={{ 
                                                    position: 'relative', 
                                                    borderRadius: '6px', 
                                                    overflow: 'hidden', 
                                                    border: idx === 0 ? '2px solid #d4a373' : '1px solid rgba(255,255,255,0.15)',
                                                    background: '#0a0e13',
                                                    aspectRatio: '16/10',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <img 
                                                    src={imgUrl} 
                                                    alt={`Preview ${idx + 1}`} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=Invalid+Image'; }}
                                                />

                                                {/* Cover Badge */}
                                                {idx === 0 && (
                                                    <span style={{ 
                                                        position: 'absolute', 
                                                        top: '4px', 
                                                        left: '4px', 
                                                        background: '#d4a373', 
                                                        color: '#000', 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 'bold', 
                                                        padding: '1px 5px', 
                                                        borderRadius: '3px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '3px'
                                                    }}>
                                                        <FaStar style={{ fontSize: '0.6rem' }} /> COVER
                                                    </span>
                                                )}

                                                {/* Index Badge */}
                                                <span style={{ 
                                                    position: 'absolute', 
                                                    bottom: '4px', 
                                                    left: '4px', 
                                                    background: 'rgba(0,0,0,0.7)', 
                                                    color: '#fff', 
                                                    fontSize: '0.65rem', 
                                                    padding: '1px 4px', 
                                                    borderRadius: '3px' 
                                                }}>
                                                    #{idx + 1}
                                                </span>

                                                {/* Actions Overlay */}
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '4px', 
                                                    right: '4px', 
                                                    display: 'flex', 
                                                    gap: '4px',
                                                    background: 'rgba(0,0,0,0.7)',
                                                    padding: '2px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {idx > 0 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setAsCover(idx)} 
                                                            title="Set as Cover"
                                                            style={{ background: 'transparent', border: 'none', color: '#d4a373', cursor: 'pointer', padding: '2px' }}
                                                        >
                                                            <FaStar style={{ fontSize: '0.75rem' }} />
                                                        </button>
                                                    )}
                                                    {idx > 0 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => moveImage(idx, idx - 1)} 
                                                            title="Move Left"
                                                            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                                                        >
                                                            <FaArrowLeft style={{ fontSize: '0.75rem' }} />
                                                        </button>
                                                    )}
                                                    {idx < projectForm.images.length - 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => moveImage(idx, idx + 1)} 
                                                            title="Move Right"
                                                            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                                                        >
                                                            <FaArrowRight style={{ fontSize: '0.75rem' }} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage(idx)} 
                                                        title="Delete Image"
                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                                    >
                                                        <FaTimes style={{ fontSize: '0.8rem' }} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                                        No images added yet. Upload files or paste image URLs to showcase screenshots.
                                    </div>
                                )}
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d4a373', marginBottom: '20px', cursor: 'pointer', fontFamily: 'Courier Prime, monospace', fontSize: '0.95rem' }}>
                                <input
                                    type="checkbox"
                                    checked={projectForm.featured}
                                    onChange={e => setProjectForm({ ...projectForm, featured: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#d4a373' }}
                                />
                                Show on Homepage (Featured Projects Section)
                            </label>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="admin-btn active" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                                    {editingId ? "Update Project" : "Add Project"}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={cancelEdit} className="admin-btn" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Projects Listing */}
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ color: '#fff', margin: 0 }}>All Projects ({data.projects.length})</h3>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Click Edit to modify details or images</span>
                    </div>

                    <div className="projects-canvas">
                        {data.projects.map(p => {
                            const images = Array.isArray(p.images) ? p.images : [];
                            return (
                                <div className="admin-card" key={p.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        {/* Card Header & Thumbnail */}
                                        {images.length > 0 ? (
                                            <div style={{ position: 'relative', height: '140px', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', background: '#0a0e13' }}>
                                                <img 
                                                    src={images[0]} 
                                                    alt={p.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                                <span style={{ 
                                                    position: 'absolute', 
                                                    bottom: '6px', 
                                                    right: '6px', 
                                                    background: 'rgba(0,0,0,0.75)', 
                                                    color: '#fff', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <FaImage /> {images.length} {images.length === 1 ? 'image' : 'images'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div style={{ 
                                                height: '80px', 
                                                borderRadius: '6px', 
                                                background: 'rgba(255,255,255,0.03)', 
                                                border: '1px dashed rgba(255,255,255,0.1)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: '#64748b', 
                                                fontSize: '0.8rem',
                                                marginBottom: '12px'
                                            }}>
                                                No images
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{p.name}</h3>
                                            {p.featured && <span style={{ background: '#d4a373', color: '#0a0e13', padding: '2px 8px', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold' }}>FEATURED</span>}
                                        </div>
                                        
                                        <span className="stack" style={{ display: 'block', margin: '8px 0', color: '#a8a29e', fontSize: '0.85rem' }}>
                                            {p.stack}
                                        </span>
                                        
                                        <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {p.description}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {p.github && (
                                                <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }} title="GitHub">
                                                    GitHub <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                                                </a>
                                            )}
                                            {p.demo && (
                                                <a href={p.demo} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.85rem', textDecoration: 'none' }} title="Demo">
                                                    Demo <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                                                </a>
                                            )}
                                        </div>
                                        <div className="admin-actions" style={{ marginTop: 0 }}>
                                            <button onClick={() => startEdit("projects", p)} className="admin-icon-btn" title="Edit"><FaEdit /></button>
                                            <button onClick={() => deleteItem("projects", p.id)} className="admin-icon-btn delete" title="Delete"><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === "experience" && (
                <div className="tab-content">
                    <div className="admin-card" style={{ marginBottom: '40px' }}>
                        <h3>{editingId ? "Edit Experience" : "Add Experience"}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); saveItem("experience", { ...expForm, details: expForm.details.split("\n").filter(d => d.trim()) }); setExpForm({ title: "", tech: "", period: "", details: "" }); }} className="contact-form">
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
                        <form onSubmit={(e) => { e.preventDefault(); saveItem("skills", { ...skillForm, items: skillForm.items.split(",").map(i => i.trim()).filter(Boolean) }); setSkillForm({ category: "", items: "" }); }} className="contact-form">
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
                                <p>{Array.isArray(s.items) ? s.items.join(", ") : s.items}</p>
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
