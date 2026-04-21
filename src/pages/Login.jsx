import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

// 🔥 เพิ่ม 2 อันนี้
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  // ✅ เพิ่ม state เก็บค่า
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 แก้ handleSubmit ให้ใช้ Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login successful 🎉");

      navigate("/home");

    }
    catch (error) {
      if (error.code === "auth/wrong-password") {
        alert("Wrong password ❌");
      } else if (error.code === "auth/user-not-found") {
        alert("User not found ❌");
      } else if (error.code === "auth/invalid-credential") {
        alert("Email or password is incorrect ❌");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-wrap">
          <h1 className="login-brand">Tempus Capsule</h1>

          <section className="login-card">
            <div className="login-title">LOGIN</div>

            <form className="login-form" onSubmit={handleSubmit}>

              {/* 🔥 เพิ่ม value + onChange */}
              <input
                className="login-input"
                type="email"
                placeholder="E-mail address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* 🔥 เพิ่ม value + onChange */}
              <input
                className="login-input"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label className="remember-row">
                <input type="checkbox" className="remember-check" />
                <span>Remember me</span>
              </label>

              <button className="signin-btn" type="submit">
                Sign in
              </button>

              <div className="login-links">
                <Link className="login-link" to="/forgot">
                  Forgot password?
                </Link>
                <Link className="login-link" to="/register">
                  Create account
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}