import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState("");
  const [username, setUsername] = useState("User");

  // ✅ โหลด username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.user_name || "User");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 👉 Edit Profile
  const handleEdit = () => {
    navigate("/profile/edit");
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    }
  };

  // 🔥 ส่ง feedback เข้า Firebase
  const handleSend = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      if (!feedback.trim()) {
        alert("Please enter message");
        return;
      }

      await addDoc(collection(db, "feedbacks"), {
        user_id: user.uid,
        user_email: user.email,
        message: feedback,
        createdAt: serverTimestamp(),
      });

      alert("✅ Feedback sent!");
      setFeedback("");

    } catch (error) {
      console.error("🔥 ERROR:", error);
      alert("❌ Failed to send feedback");
    }
  };

  return (
    <div className="pf-page">
      <div className="pf-bg">
        <div className="pf-wrap">

          {/* avatar */}
          <div className="pf-avatar">
            <div className="pf-avatar-circle">
              <span className="pf-avatar-icon">👤</span>
            </div>
          </div>

          {/* username */}
          <div className="pf-name">{username}</div>

          {/* edit profile */}
          <button
            className="pf-btn"
            type="button"
            onClick={handleEdit}
          >
            Edit Profile
          </button>

          {/* feedback */}
          <div className="pf-feedback-label">
            Send feedback or report bug
          </div>

          <form className="pf-form" onSubmit={handleSend}>
            <textarea
              className="pf-textarea"
              placeholder="Type your message here..."
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              className="pf-btn pf-btn-small"
              type="submit"
            >
              Send feedback
            </button>
          </form>

          <div className="pf-footer">
            <button
              className="pf-btn pf-btn-back"
              type="button"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              className="pf-btn pf-btn-logout"
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}