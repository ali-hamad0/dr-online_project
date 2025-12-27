import React from "react";
import service1Img from "../assets/service1.png";

const API = "http://localhost:5000";

const DoctorCard = ({ doctor }) => {
  const imgSrc = doctor.image ? `${API}${doctor.image}` : service1Img;

  return (
    <div className="card">
      <img
        src={imgSrc}
        alt={doctor.name}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          borderRadius: "12px",
          marginBottom: "12px",
        }}
      />

      <h3>{doctor.name}</h3>
      <p>
        <b>Specialty:</b> {doctor.specialty}
      </p>
      <p>{doctor.bio}</p>
    </div>
  );
};

export default DoctorCard;
