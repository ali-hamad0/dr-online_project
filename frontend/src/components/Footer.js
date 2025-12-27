import React from "react";
import "../styles/Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h2 className="footer-logo">
            🩺 Dr.<span className="brand">Online</span>
          </h2>
          <p>
            Connecting doctors and patients in one simple digital space.
            Learn and share health awareness together.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/doctors">Doctors</Link></li>
            <li><Link to="/dashboard">Discussion</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Stay Connected</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
            <a href="mailto:support@dronline.com"><FaEnvelope /></a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dr. Online | All rights reserved.</p>
        <p className="disclaimer">
          Disclaimer: Dr. Online provides general health information and does not replace
          professional medical diagnosis or treatment.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
