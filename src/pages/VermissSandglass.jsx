import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/vermiss.css";
import logo from "../assets/logo/tempus-logo.png";

export default function VermissSandglass() {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format time as HH:MM:SS
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
      
      // Format date as DD/MM/YYYY
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      setDate(`${day}/${month}/${year}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
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
            <Link to="/home" className="ver-logo">
              <img src={logo} alt="Tempus Capsule" className="ver-logo-img" />
            </Link>

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
              <div className="ver-time">{time}</div>
              <div className="ver-line" />
              <div className="ver-date">{date}</div>
              <div className="ver-line" />
              <div className="ver-question">
                What lesson did <br />
                time teach you?
              </div>
            </div>

            <div className="ver-center">
              <div className="hourglass-wrapper">
                {/* SVG Hourglass */}
                <svg className="hourglass-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* Gradient สำหรับกระจก */}
                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(180,200,255,0.15)" />
                      <stop offset="30%" stopColor="rgba(200,220,255,0.25)" />
                      <stop offset="70%" stopColor="rgba(200,220,255,0.25)" />
                      <stop offset="100%" stopColor="rgba(180,200,255,0.15)" />
                    </linearGradient>

                    {/* Gradient สำหรับทราย */}
                    <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(200,180,210,0.95)" />
                      <stop offset="50%" stopColor="rgba(180,160,200,0.9)" />
                      <stop offset="100%" stopColor="rgba(150,130,180,0.85)" />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Inner glow */}
                    <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Clip path สำหรับทรายด้านบน */}
                    <clipPath id="topBulbClip">
                      <path d="M 40 20 
                               Q 20 20, 20 60 
                               Q 20 140, 100 175 
                               Q 180 140, 180 60 
                               Q 180 20, 160 20 
                               Z" />
                    </clipPath>

                    {/* Clip path สำหรับทรายด้านล่าง */}
                    <clipPath id="bottomBulbClip">
                      <path d="M 100 225 
                               Q 20 260, 20 340 
                               Q 20 380, 40 380 
                               L 160 380 
                               Q 180 380, 180 340 
                               Q 180 260, 100 225 
                               Z" />
                    </clipPath>
                  </defs>

                  {/* Outer glow */}
                  <ellipse cx="100" cy="200" rx="90" ry="190" fill="rgba(140,170,220,0.08)" filter="url(#glow)" />

                  {/* กรอบบน */}
                  <ellipse cx="100" cy="18" rx="65" ry="8" fill="url(#glassGradient)" stroke="rgba(180,210,255,0.4)" strokeWidth="1.5" filter="url(#innerGlow)" />

                  {/* กระจกด้านบน - รูปทรงโค้งมน */}
                  <path className="glass-bulb top-bulb"
                    d="M 40 20 
                           Q 20 20, 20 60 
                           Q 20 140, 100 180 
                           Q 180 140, 180 60 
                           Q 180 20, 160 20"
                    fill="url(#glassGradient)"
                    stroke="rgba(180,210,255,0.35)"
                    strokeWidth="2" />

                  {/* ทรายด้านบน */}
                  <g clipPath="url(#topBulbClip)">
                    <ellipse className="sand-top-svg" cx="100" cy="130" rx="60" ry="45" fill="url(#sandGradient)" filter="url(#innerGlow)" />
                  </g>

                  {/* คอกลาง */}
                  <path className="glass-neck"
                    d="M 100 180 Q 85 195, 85 200 Q 85 205, 100 220"
                    fill="none"
                    stroke="rgba(180,210,255,0.3)"
                    strokeWidth="2" />
                  <path className="glass-neck"
                    d="M 100 180 Q 115 195, 115 200 Q 115 205, 100 220"
                    fill="none"
                    stroke="rgba(180,210,255,0.3)"
                    strokeWidth="2" />

                  {/* สายทรายไหล */}
                  <line className="sand-stream-svg" x1="100" y1="175" x2="100" y2="225" stroke="rgba(200,180,220,0.9)" strokeWidth="4" strokeLinecap="round" filter="url(#innerGlow)" />

                  {/* กระจกด้านล่าง - รูปทรงโค้งมน */}
                  <path className="glass-bulb bottom-bulb"
                    d="M 100 220 
                           Q 20 260, 20 340 
                           Q 20 380, 40 380 
                           L 160 380 
                           Q 180 380, 180 340 
                           Q 180 260, 100 220"
                    fill="url(#glassGradient)"
                    stroke="rgba(180,210,255,0.35)"
                    strokeWidth="2" />

                  {/* ทรายด้านล่าง */}
                  <g clipPath="url(#bottomBulbClip)">
                    <ellipse className="sand-bottom-svg" cx="100" cy="340" rx="55" ry="35" fill="url(#sandGradient)" filter="url(#innerGlow)" />
                    {/* กองทรายรูปกรวย */}
                    <path className="sand-pile-svg" d="M 100 280 L 75 340 L 125 340 Z" fill="rgba(200,180,220,0.7)" filter="url(#innerGlow)" />
                  </g>

                  {/* กรอบล่าง */}
                  <ellipse cx="100" cy="382" rx="65" ry="8" fill="url(#glassGradient)" stroke="rgba(180,210,255,0.4)" strokeWidth="1.5" filter="url(#innerGlow)" />

                  {/* เงาสะท้อนบนกระจก */}
                  <path className="glass-reflection"
                    d="M 45 40 Q 40 80, 50 120"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="4"
                    strokeLinecap="round" />
                  <path className="glass-reflection"
                    d="M 45 250 Q 40 300, 50 340"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="3"
                    strokeLinecap="round" />
                </svg>

                {/* อนุภาคทราย */}
                <div className="sand-particles-container">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div className="sand-particle-new" key={i} style={{
                      animationDelay: `${i * 0.12}s`,
                      left: `${48 + Math.random() * 4}%`
                    }}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ver-lockcard">
              <svg className="ver-lock-lines" viewBox="0 0 100 320" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="lineGlow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Connecting lines between locks */}
                <line x1="50" y1="0" x2="50" y2="320" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" filter="url(#lineGlow)" />
              </svg>
              <svg className="ver-lock-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="lockGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Lock body */}
                <rect x="16" y="28" width="32" height="24" rx="4" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" filter="url(#lockGlow)" />
                {/* Lock shackle */}
                <path d="M 22 28 Q 22 14, 32 14 Q 42 14, 42 28" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#lockGlow)" />
                {/* Lock keyhole */}
                <circle cx="32" cy="36" r="3" fill="rgba(255,255,255,0.7)" filter="url(#lockGlow)" />
              </svg>
              <svg className="ver-lock-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="lockGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Lock body */}
                <rect x="16" y="28" width="32" height="24" rx="4" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" filter="url(#lockGlow)" />
                {/* Lock shackle */}
                <path d="M 22 28 Q 22 14, 32 14 Q 42 14, 42 28" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#lockGlow)" />
                {/* Lock keyhole */}
                <circle cx="32" cy="36" r="3" fill="rgba(255,255,255,0.7)" filter="url(#lockGlow)" />
              </svg>
              <svg className="ver-lock-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="lockGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Lock body */}
                <rect x="16" y="28" width="32" height="24" rx="4" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" filter="url(#lockGlow)" />
                {/* Lock shackle */}
                <path d="M 22 28 Q 22 14, 32 14 Q 42 14, 42 28" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#lockGlow)" />
                {/* Lock keyhole */}
                <circle cx="32" cy="36" r="3" fill="rgba(255,255,255,0.7)" filter="url(#lockGlow)" />
              </svg>
              <svg className="ver-lock-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="lockGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Lock body */}
                <rect x="16" y="28" width="32" height="24" rx="4" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" filter="url(#lockGlow)" />
                {/* Lock shackle */}
                <path d="M 22 28 Q 22 14, 32 14 Q 42 14, 42 28" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#lockGlow)" />
                {/* Lock keyhole */}
                <circle cx="32" cy="36" r="3" fill="rgba(255,255,255,0.7)" filter="url(#lockGlow)" />
              </svg>
            </div>
          </section>

          {/* CHAPTERS */}
          <section className="ver-chapters">
            <div
              className="ver-chapter"
              onClick={() => navigate("/feature/vermiss/create")}
            >
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
              navigate("/feature/vermiss/create");
            }}
          >
            Add New Chapter
          </button>


        </main>
      </div>
    </div>
  );
}
