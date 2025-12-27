import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Register.css";

const API = "https://dr-online-backend.onrender.com";

const Register = ({ setUser }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ simple UX: show password
  const [showPass, setShowPass] = useState(false);

  // ✅ simple strength hint (not strict)
  const passHint = useMemo(() => {
    const p = form.password || "";
    if (!p) return "";
    if (p.length < 6) return "Weak (min 6 chars)";
    if (p.length < 10) return "Good";
    return "Strong";
  }, [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill all fields.");
      return;
    }

    // ✅ basic email check (simple)
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || "Register failed.");
        return;
      }

      const newUser = {
        id: data.id,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      setUser(newUser);
      localStorage.setItem("dr_user", JSON.stringify(newUser));

      alert("Account created successfully!");
    } catch (err) {
      setError("Server error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register-card">
        <div className="register-head">
          <h1>Create Account</h1>
          <p>Join Dr. Online as a doctor or patient.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error ? <div className="error-box">{error}</div> : null}

          <div className="field">
            <label>Full Name</label>
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-row">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>

            {passHint ? (
              <small className="hint">Password: {passHint}</small>
            ) : null}
          </div>

          <div className="field">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
            <small className="hint">
              Tip: Choose “Doctor” if you will publish studies.
            </small>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
