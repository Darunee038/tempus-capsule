import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import Navbar from "../components/Navbar";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {

  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.user_name || data.username || "User");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="hp-page">
      <div className="hp-bg">
        <div className="hp-main">
          {/* NAV */}
          <Navbar variant="hp" />


          {/* CONTENT */}
          <main className="hp-content">
            <h1 className="hp-title">Welcome {username || "User"}</h1>

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
