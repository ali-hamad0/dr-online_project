import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";

const API = "https://dr-online-backend.onrender.com";
// const API = "http://localhost:5000";

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Login failed.");
        setLoading(false);
        return;
      }

      setUser(data.user);
      localStorage.setItem("dr_user", JSON.stringify(data.user));
      setLogged(true);
      alert("Login successful!");
    } catch (err) {
      setError("Server error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <p>Login to join Dr. Online.</p>

      <form onSubmit={handleSubmit} className="login-form">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </form>

      {logged ? (
        <p className="success-msg">
          ✅ You are logged in. Go to{" "}
          <Link to="/" className="home-link">
            Home
          </Link>
        </p>
      ) : (
        <p className="register-link">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      )}
    </div>
  );
};

export default Login;
