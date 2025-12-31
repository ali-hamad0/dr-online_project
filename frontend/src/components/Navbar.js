import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { FaBars } from "react-icons/fa";

const NavBar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    onLogout();
    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" onClick={closeMenu} className="navbar-logo">
          🩺 Dr.<span className="brand">Online</span>
        </Link>
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? "✖" : <FaBars style={{ fontSize: "26px" }} />}
      </button>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/doctors" onClick={closeMenu}>
          Doctors
        </Link>
        <Link to="/dashboard" onClick={closeMenu}>
          Discussion
        </Link>
        <Link to="/contact" onClick={closeMenu}>
          Contact
        </Link>
        {(user?.role === "admin" ) && (
          <Link to="/admin" onClick={closeMenu}>
            Admin
          </Link>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-actions">
            <span className="navbar-user">
              {user.name} <small>({user.role})</small>
            </span>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-actions">
            <Link to="/login" onClick={closeMenu} className="login-btn">
              Login
            </Link>

            <Link to="/register" onClick={closeMenu} className="register-btn">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
