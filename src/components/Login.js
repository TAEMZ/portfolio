import React, { useState } from "react";
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
        try {
            const response = await fetch("/api/auth?action=unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: secretWord })
            });
            const data = await response.json();

            if (data.success) {
                setIsUnlocked(true);
                sessionStorage.setItem("admin_unlocked", "true");
            } else {
                alert(data.error || "Incorrect access word.");
            }
        } catch (err) {
            alert("Security System Error. Please check database.");
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/auth?action=login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem("admin_logged_in", "true");
                navigate("/admin");
            } else {
                alert(data.error || "Invalid credentials");
            }
        } catch (err) {
            alert("Login failed. Please try again.");
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
