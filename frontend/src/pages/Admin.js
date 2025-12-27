import React, { useEffect, useState } from "react";
import "../styles/Admin.css";

const API = "http://localhost:5000";

const Admin = ({ user }) => {
  const isAdmin = !!user && (user.role === "admin" || user.role === "doctor");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "", specialty: "", bio: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(`${API}/api/doctors`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API returned non-JSON:\n${text.slice(0, 200)}`);
      }

      if (!res.ok) throw new Error(data?.error || "Failed to load doctors");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    loadDoctors();
  }, [isAdmin]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr("");
  };

  const addDoctor = async (e) => {
    e.preventDefault();

    if (!form.name || !form.specialty) {
      setErr("Name and Specialty are required.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("specialty", form.specialty);
      fd.append("bio", form.bio);
      if (imageFile) fd.append("image", imageFile);

      const res = await fetch(`${API}/api/doctors`, {
        method: "POST",
        body: fd,
      });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API returned non-JSON:\n${text.slice(0, 200)}`);
      }

      if (!res.ok)
        throw new Error(data?.error || data?.message || "Failed to add doctor");

      setForm({ name: "", specialty: "", bio: "" });
      setImageFile(null);
      await loadDoctors();
      alert("Doctor added ✅");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;

    try {
      const res = await fetch(`${API}/api/doctors/${id}`, { method: "DELETE" });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API returned non-JSON:\n${text.slice(0, 200)}`);
      }

      if (!res.ok) throw new Error(data?.error || "Failed to delete doctor");
      await loadDoctors();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="page">
      {!isAdmin ? (
        <>
          <h1>Admin Page</h1>
          <p className="error">Access denied. You must be an admin/doctor.</p>
        </>
      ) : (
        <>
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Manage doctors (add / view / delete).</p>
          </div>

          {err ? <p className="error">{err}</p> : null}

          <div className="admin-card">
            <h2>Add Doctor</h2>

            <form className="admin-form" onSubmit={addDoctor}>
              <div className="field">
                <label>Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Doctor name"
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label>Specialty *</label>
                <input
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  placeholder="Cardiology, Dentist..."
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Short bio..."
                />
              </div>

              <div className="field">
                <label>Image</label>
                <input
                  className="file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {imageFile ? (
                  <small className="hint">Selected: {imageFile.name}</small>
                ) : null}
              </div>

              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Doctor"}
              </button>
            </form>
          </div>

          <hr className="divider" />

          <div className="section-title">
            <h2>Doctors List</h2>
            {loading ? <span className="loading">Loading...</span> : null}
          </div>

          <div className="doctor-cards">
            {doctors.map((d) => (
              <div key={d.id} className="card">
                {d.image ? (
                  <img
                    className="card-img"
                    src={`${API}${d.image}`}
                    alt={d.name}
                  />
                ) : (
                  <div className="card-img placeholder">
                    <span>No Image</span>
                  </div>
                )}

                <div className="card-body">
                  <h3>{d.name}</h3>
                  <p>
                    <b>Specialty:</b> {d.specialty}
                  </p>
                  {d.bio ? (
                    <p className="bio">{d.bio}</p>
                  ) : (
                    <p className="bio muted">No bio provided.</p>
                  )}

                  <button
                    className="danger-btn"
                    onClick={() => deleteDoctor(d.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
