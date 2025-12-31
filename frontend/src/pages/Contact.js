import React, { useState } from "react";
import "../styles/Contact.css";
import service1Img from "../assets/service1.png";

const API = "https://dr-online-project.onrender.com";
// const API = "http://localhost:5000";

const Contact = () => {
  const [state, setState] = useState({
    fname: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setState({ ...state, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.fname || !state.email || !state.message) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSubmitted(false);

    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: state.fname,
          email: state.email,
          subject: state.subject,
          message: state.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "Failed to send message.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setState({
        fname: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err) {
      setError("Server error. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact">
      <section className="contact-section">
        <div className="contact-left">
          <img
            src={service1Img}
            alt="Dr. Online contact illustration"
            className="contact-img"
          />

          <h1>
            Contact <span className="brand">Dr. Online</span>
          </h1>
          <p>
            Have questions, ideas, or feedback? Our team is happy to hear from
            you.
          </p>

          <ul className="contact-info">
            <li>
              <b>Email:</b> support@dronline.com
            </li>
            <li>
              <b>Phone:</b> +961 70 000 000
            </li>
            <li>
              <b>Response Time:</b> within 24 hours
            </li>
          </ul>
        </div>

        <div className="contact-right">
          <h2>Send us a message</h2>

          <form onSubmit={handleSubmit}>
            <label>Full Name *</label>
            <input
              name="fname"
              placeholder="Enter full name..."
              type="text"
              value={state.fname}
              onChange={handleChange}
            />

            <label>Email *</label>
            <input
              name="email"
              placeholder="Enter email..."
              type="email"
              value={state.email}
              onChange={handleChange}
            />

            <label>Subject</label>
            <select
              name="subject"
              value={state.subject}
              onChange={handleChange}
            >
              <option>General Inquiry</option>
              <option>Technical Issue</option>
              <option>Medical Question</option>
              <option>Partnership Request</option>
              <option>Other</option>
            </select>

            <label>Message *</label>
            <textarea
              rows="6"
              placeholder="Enter message..."
              name="message"
              value={state.message}
              onChange={handleChange}
            />

            <button type="submit" className="send-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>

            {error ? <p className="error-text">{error}</p> : null}

            {submitted ? (
              <p className="success-msg">✅ Message sent successfully!</p>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
