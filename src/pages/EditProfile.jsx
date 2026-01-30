import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/editProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();

  const handleComplete = () => {
    alert("✅ Profile updated successfully");
    navigate("/profile"); // 👈 กลับหน้าโปรไฟล์
  };

  return (
    <div className="ep-page">
      <div className="ep-bg">

        <h1 className="ep-title">Profile</h1>

        <div className="ep-card">

          <label>First Name</label>
          <input placeholder="Enter First Name" />

          <label>Last Name</label>
          <input placeholder="Enter Last Name" />

          <label>Nick Name</label>
          <input placeholder="Enter Nick Name" />

          <label>Date of Birth</label>
          <input type="date" />

          <label>Email Address</label>
          <input placeholder="Enter Email Address" />

          <label>User Name</label>
          <input placeholder="Enter User Name" />

          <label>Change Password</label>
          <div className="ep-password">
            <input type="password" placeholder="Enter Password" />
            <span className="ep-check">✓</span>
          </div>

        </div>

        {/* ✅ ปุ่ม Complete */}
        <button
          className="ep-btn"
          onClick={handleComplete}
        >
          Complete
        </button>

      </div>
    </div>
  );
}
