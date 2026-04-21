import React from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

import "../styles/eterea.css";
import Navbar from "../components/Navbar";
import { notify } from "../utils/notify";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function EtereaMoment() {
  const navigate = useNavigate();
  
  // const handleJoin = (e) => {
  //   e.preventDefault();
  //   // เดี๋ยวค่อยทำระบบจริงทีหลัง
  //   notify.info("Code received ✨ (demo)");
  // };

  const handleJoin = async (joinCode) => {
    const roomRef = doc(db, "etereaRooms", joinCode);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
       notify.info("Invalid code");
      return;
    }

    const data = snap.data();

    // 👉 ไปหน้า editor
    navigate(`/feature/eterea/create?capsuleId=${data.capsuleId}`);
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

            <form className="et-join-bar" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const joinCode = formData.get("joinCode");
              handleJoin(joinCode);
            }}>
              <input className="et-join-input" name="joinCode" placeholder="Enter Code" />
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
