import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/vermiss.css";
import logo from "../assets/logo/tempus-logo.png";




export default function VermissSandglass() {
  const navigate = useNavigate();
  return (
    <div className="ver-page">
      <div className="ver-bg">

        {/* ⭐ STAR BACKGROUND (ใส่ตรงนี้) */}
        <div className="ver-sky" aria-hidden="true">
          <div className="night">
            {Array.from({ length: 15 }).map((_, i) => (
              <div className="shooting_star" key={i} />
            ))}
          </div>
        </div>

        {/* NAV */}
        <header className="ver-nav">
          <div className="ver-nav-inner">
            <div className="ver-logo">
              <img src={logo} alt="Tempus Capsule" className="ver-logo-img" />


            </div>

            <nav className="ver-menu">
              <Link className="ver-menu-item" to="/feature/hora">HoraWhisper+</Link>
              <Link className="ver-menu-item" to="/feature/lova">LovaNote</Link>
              <Link className="ver-menu-item active" to="/feature/eterea">EtereaMoment</Link>
              <Link className="ver-menu-item" to="/feature/vermiss">VermissSandglass</Link>
            </nav>

            <Link className="ver-user" to="/profile">👤</Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="ver-main">
          <h1 className="ver-title">VermissSandglass</h1>
          <p className="ver-subtitle">Record how time changed you.</p>

          {/* HERO */}
          <section className="ver-hero">
            <div className="ver-sidecard">
              <div className="ver-time">18:00:02</div>
              <div className="ver-line" />
              <div className="ver-date">02/11/2026</div>
              <div className="ver-line" />
              <div className="ver-question">
                What lesson did <br />
                time teach you?
              </div>
            </div>

            <div className="ver-center">
              <div className="ver-hourglass" />
            </div>

            <div className="ver-lockcard">
              <div className="ver-lock">🔒</div>
              <div className="ver-lock">🔒</div>
              <div className="ver-lock">🔒</div>
              <div className="ver-lock">🔒</div>
            </div>
          </section>

          {/* CHAPTERS */}
          <section className="ver-chapters">
            <div className="ver-chapter">
              <div className="ver-chapter-title">2025 Goals</div>
              <div className="ver-chapter-emo">🌲✨🌼</div>
            </div>

            <div className="ver-chapter" />
            <div className="ver-chapter" />
          </section>


          <button
            className="ver-btn"
            onClick={() => {
              console.log("CLICKED");
              navigate("/feature/vermiss/new");
            }}
          >
            Add New Chapter
          </button>


        </main>
      </div>
    </div>
  );
}
