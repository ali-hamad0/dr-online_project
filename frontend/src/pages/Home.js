import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import doctorImg from "../assets/doctor.png";

const Home = ({ user }) => {
  const isLoggedIn = !!user;

  return (
    <div className="home">
       <section className="home-hero">
        <div className="home-hero-text">
          <h1>
            Welcome to <span className="brand">Dr. Online</span>
          </h1>

          <p className="hero-subtitle">
            A trusted space where doctors share verified medical knowledge and
            patients discuss their health safely, clearly, and together.
          </p>

          {user ? (
            <p className="home-welcome">
              👋 Welcome back, <b>{user.name}</b>
              {user.role ? ` (${user.role})` : ""}
            </p>
          ) : null}

          <div className="hero-buttons">
            <Link
              to={isLoggedIn ? "/dashboard" : "/register"}
              className="home-btn primary"
            >
              {isLoggedIn ? "Go to Discussion Board" : "Join the Community"}
            </Link>

            {!isLoggedIn && (
              <Link to="/login" className="secondary-link">
                Already have an account? <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        <div className="home-hero-image">
          <img src={doctorImg} alt="Doctor illustration" />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="home-stats">
        <div className="stat-card">
          <h3>120+</h3>
          <p>Verified doctors sharing knowledge</p>
        </div>
        <div className="stat-card">
          <h3>800+</h3>
          <p>Patients learning & asking questions</p>
        </div>
        <div className="stat-card">
          <h3>150+</h3>
          <p>Active discussions about diseases</p>
        </div>
      </section>

       <section className="home-how">
        <h2>How Dr. Online Works</h2>
        <div className="steps">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>Create Your Account</h3>
            <p>
              Register as a doctor or patient in seconds and join our secure
              platform.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">2</span>
            <h3>Join Discussions</h3>
            <p>
              Ask questions, share experiences, and discuss diseases with real
              doctors.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">3</span>
            <h3>Stay Updated</h3>
            <p>
              Doctors post recent studies and trusted information about
              different conditions.
            </p>
          </div>
        </div>
      </section>

       <section className="features">
        <h2>Our Main Features</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Doctor & Patient Registration</h3>
            <p>Secure roles to keep trusted medical interactions.</p>
          </div>

          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            className="card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h3>Discussion Board</h3>
            <p>
              Open topics, ask questions, and discuss diseases in a respectful
              environment.
            </p>
          </Link>

          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            className="card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h3>Latest Medical Studies</h3>
            <p>
              Doctors share simplified explanations of recent research for
              patients.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
