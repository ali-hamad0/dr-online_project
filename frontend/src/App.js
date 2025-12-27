import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";

import NavBar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Admin from "./pages/Admin";

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dr_user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("dr_user");
    alert("Logged out!");
  };

  return (
    <div className="App">
      <Router>
        <NavBar user={user} onLogout={handleLogout} />

        <Route path="/" exact>
          <Home user={user} />
        </Route>

        <Route path="/doctors" exact>
          <Doctors />
        </Route>

        <Route path="/dashboard" exact>
          <Dashboard user={user} />
        </Route>

        <Route path="/contact" exact>
          <Contact />
        </Route>

        <Route path="/login" exact>
          <Login setUser={setUser} />
        </Route>

        <Route path="/register" exact>
          <Register setUser={setUser} />
        </Route>
        <Route path="/admin" exact>
          <Admin user={user} />
        </Route>

        <Footer />
      </Router>
    </div>
  );
};

export default App;
