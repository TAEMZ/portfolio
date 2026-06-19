import React, { useState } from "react";
import "./Contact.css";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

export default function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("Sending...");
        // Simulate API call
        setTimeout(() => {
            setStatus("Message Sent! (Demo Mode)");
            setFormData({ name: "", email: "", message: "" });
            setTimeout(() => setStatus(""), 3000);
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <section className="contact-section" id="contact">
            <h2 className="contact-title">Get In Touch</h2>
            <div className="contact-container">
                <div className="contact-info">
                    <h3>Let's Collaborate</h3>
                    <p>
                        I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
                    </p>
                    <div className="info-item">
                        <FaEnvelope className="info-icon" />
                        <a href="mailto:abiykibru6@gmail.com">abiykibru6@gmail.com</a>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <textarea
                            name="message"
                            placeholder="Your Message"
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="submit-btn" disabled={status !== ""}>
                        <FaPaperPlane /> {status || "Send Message"}
                    </button>
                </form>
            </div>
            <div className="contact-glow"></div>
        </section>
    );
}
