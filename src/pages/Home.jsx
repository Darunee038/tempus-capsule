import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import logo from "../assets/logo/tempus-logo.png";

export default function Home() {
  return (
    <div className="hp-page">
      <div className="hp-bg">
        <div className="hp-main">
          {/* NAV */}
          <header className="hp-nav">
            <div className="hp-nav-inner">
              <div className="et-logo">
              <img src={logo} alt="Tempus Capsule" className="et-logo-img" />

                
              </div>

              <nav className="hp-menu">
                <Link className="hp-menu-item" to="/feature/hora">HoraWhisper+</Link>
                <Link className="hp-menu-item" to="/feature/lova">LovaNote</Link>
                <Link className="hp-menu-item" to="/feature/eterea">EtereaMoment</Link>
                <Link className="hp-menu-item" to="/feature/vermis">VermissSandglass</Link>
              </nav>

              <Link className="hp-user" to="/profile" aria-label="Profile">
                <span className="hp-user-icon">👤</span>
              </Link>
            </div>
          </header>


          {/* CONTENT */}
          <main className="hp-content">
            <h1 className="hp-title">Welcome Ngam</h1>

            <div className="hp-actions">
              <Link className="hp-action" to="/create">Create Capsule</Link>
              <Link className="hp-action" to="/support">Support</Link>
            </div>

            <section className="hp-section">
              <h3 className="hp-section-title">Opened Capsules</h3>
              <div className="hp-grid">
                <div className="hp-card" />
                <div className="hp-card" />
                <div className="hp-card" />
              </div>
            </section>

            <section className="hp-section">
              <h3 className="hp-section-title">Locked Capsules</h3>
              <div className="hp-grid">
                <div className="hp-card" />
                <div className="hp-card" />
                <div className="hp-card" />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
