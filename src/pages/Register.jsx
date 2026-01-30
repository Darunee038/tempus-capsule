import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";

export default function Register() {
  // ✅ 1. เรียก useNavigate
  const navigate = useNavigate();

  // ✅ 2. ฟังก์ชัน submit
  const handleSubmit = (e) => {
    e.preventDefault();

    alert(
      " Welcome to Tempus Capsule\n\n" +
      "Your account has been successfully created.\n" 
      
    );

    // ✅ 3. พาไปหน้า login
    navigate("/login");
  };

  return (
    <div className="reg-page">
      <div className="reg-bg">
        <h1 className="reg-brand">Create Account</h1>
        <p className="reg-sub">Begin your journey through time.</p>

        <section className="reg-card">
          {/* 🔥 เปลี่ยน onSubmit ตรงนี้ */}
          <form className="reg-form" onSubmit={handleSubmit}>
            <div className="reg-field">
              <label className="reg-label">First Name</label>
              <input className="reg-input" placeholder="Enter First Name" />
            </div>

            <div className="reg-field">
              <label className="reg-label">Last Name</label>
              <input className="reg-input" placeholder="Enter Last Name" />
            </div>

            <div className="reg-field">
              <label className="reg-label">Nick Name</label>
              <input className="reg-input" placeholder="Enter Nick Name" />
            </div>

            <div className="reg-field">
              <label className="reg-label">Date of Birth</label>
              <input className="reg-input" type="date" />
            </div>

            <div className="reg-field">
              <label className="reg-label">Email Address</label>
              <input
                className="reg-input"
                type="email"
                placeholder="Enter Email Address"
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">User Name</label>
              <input className="reg-input" placeholder="Enter User Name" />
            </div>

            <div className="reg-field">
              <label className="reg-label">Password</label>
              <input
                className="reg-input"
                type="password"
                placeholder="Enter Password"
              />
            </div>

            <div className="reg-checkrow">
              <input type="checkbox" required />
              <span>I agree to the time journey terms</span>
            </div>

            {/* ✅ type="submit" สำคัญมาก */}
            <button className="reg-btn" type="submit">
              Sign Up
            </button>

            <div className="reg-footer">
              Already have account?{" "}
              <Link to="/login" className="reg-link">
                Login
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
