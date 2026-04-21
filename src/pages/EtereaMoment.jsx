import React from "react";
import { Link } from "react-router-dom";
import "../styles/eterea.css";
import Navbar from "../components/Navbar";
import { notify } from "../utils/notify";

export default function EtereaMoment() {
  const handleJoin = (e) => {
    e.preventDefault();
    // เดี๋ยวค่อยทำระบบจริงทีหลัง
    notify.info("Code received ✨ (demo)");
  };

  return (
    <div className="et-page">
      <div className="et-bg">
        {/* NAV */}
        <Navbar variant="et" activeFeature="eterea" />

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
