import React from "react";
import { Link } from "react-router-dom";
import "../styles/eterea.css";
import logo from "../assets/logo/tempus-logo.png";

export default function EtereaMoment() {
  const handleJoin = (e) => {
    e.preventDefault();
    // เดี๋ยวค่อยทำระบบจริงทีหลังได้
    alert("Code received ✨ (demo)");
  };

  return (
    <div className="et-page">
      <div className="et-bg">
        {/* NAV */}
        <header className="et-nav">
          <div className="et-nav-inner">
            <div className="et-logo">
              <img src={logo} alt="Tempus Capsule" className="et-logo-img" />
            </div>

            <nav className="et-menu">
              <Link className="et-menu-item" to="/feature/hora">HoraWhisper+</Link>
              <Link className="et-menu-item" to="/feature/lova">LovaNote</Link>
              <Link className="et-menu-item active" to="/feature/eterea">EtereaMoment</Link>
              <Link className="et-menu-item" to="/feature/vermis">VermissSandglass</Link>
            </nav>

            <Link className="et-user" to="/profile" aria-label="Profile">
              <span className="et-user-icon">👤</span>
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="et-main">
          <h1 className="et-title">EtereaMoment</h1>

          <section className="et-section">
            <h3 className="et-section-title">Opened Capsules</h3>
            <div className="et-grid">
              <div className="et-card et-card-hasimg">
              </div>
              <div className="et-card" />
              <div className="et-card" />
            </div>
          </section>

          <section className="et-section">
            <h3 className="et-section-title">Locked Capsules</h3>
            <div className="et-grid">
              <div className="et-card" />
              <div className="et-card" />
              <div className="et-card" />
            </div>
          </section>

          <div className="et-join">
            <div className="et-join-title">Join Group</div>

            <form className="et-join-bar" onSubmit={handleJoin}>
              <input className="et-join-input" placeholder="Enter Code" />
              <button className="et-join-btn" type="submit">Join</button>
            </form>
          </div>

          <Link to="/feature/eterea/create" className="et-create-btn">
            Create Capsule
          </Link>
        </main>
      </div>
    </div>
  );
}
