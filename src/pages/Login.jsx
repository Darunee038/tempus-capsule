import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";


export default function Login() {
    const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ตอนนี้ทำ UI ก่อน = ให้ผ่านไปหน้า Home ได้เลย
    navigate("/home");
  };
  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-wrap">
          <h1 className="login-brand">Tempus Capsule</h1>

          <section className="login-card">
            <div className="login-title">LOGIN</div>

            <form className="login-form" onSubmit={handleSubmit}>

              <input
                className="login-input"
                type="email"
                placeholder="email address"
                autoComplete="email"
                
              />

              <input
                className="login-input"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
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
