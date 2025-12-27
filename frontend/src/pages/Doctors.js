import React, { useEffect, useState } from "react";
import "../styles/Doctors.css";
import DoctorCard from "../components/DoctorCard";

const API = "http://localhost:5000";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/doctors`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load doctors");
        setDoctors(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page doctors-page">
      <h1>Our Doctors</h1>
      <p>Meet our medical professionals.</p>

      {loading ? <p>Loading doctors...</p> : null}
      {err ? <p style={{ color: "red" }}>{err}</p> : null}

      <div className="doctor-cards">
        {doctors.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;
