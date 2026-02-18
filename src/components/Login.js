import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Projects.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secretWord, setSecretWord] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(sessionStorage.getItem("admin_unlocked") === "true");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase
            .from("secrets")
            .select("value")
            .eq("name", "admin_access_code")
            .single();

        if (error) {
            alert("Security System Error. Please check database.");
        } else if (data.value === secretWord) {
            setIsUnlocked(true);
            sessionStorage.setItem("admin_unlocked", "true");
        } else {
            alert("Incorrect access word.");
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            navigate("/admin");
        }
        setLoading(false);
    };

    return (
        <div className="login-wrapper">
            <div className="login-card admin-card">
                {!isUnlocked ? (
                    <>
                        <h2>Security Check</h2>
                        <form onSubmit={handleUnlock} className="contact-form">
                            <div className="premium-input-group">
                                <input
                                    type="password"
                                    placeholder="Enter Access Word..."
                                    value={secretWord}
                                    onChange={(e) => setSecretWord(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="admin-btn active" style={{ width: '100%' }}>
                                {loading ? "Verifying..." : "Unlock Access"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2>Admin Access</h2>
                        <form onSubmit={handleLogin} className="contact-form">
                            <div className="premium-input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="premium-input-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={loading} className="admin-btn active" style={{ width: '100%' }}>
                                {loading ? "Authenticating..." : "Login"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
