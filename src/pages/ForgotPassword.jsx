import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/forgot.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);

      // ✅ SUCCESS MESSAGE
      setSuccess(
        "A password reset email has been sent. Please check your inbox."
      );

    } catch (err) {
      console.error("ERROR:", err.code);

      // ❌ EMAIL NOT FOUND
      if (err.code === "auth/user-not-found") {
        setError("This email is not registered.");
      }

      // ❌ INVALID FORMAT
      else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      }

      // ❌ SPAM / TOO MANY REQUESTS
      else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      }

      // ❌ OTHER
      else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-bg">
        <h1 className="fp-title">Forgot Password</h1>

        <p className="fp-desc">
          Enter the email address you used to register.
          <br />
          We'll send a reset link to your email.
        </p>

        <form className="fp-form" onSubmit={handleSubmit}>
          <input
            className="fp-input"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
              if (success) setSuccess("");
            }}
            autoComplete="email"
          />

          {/* ❌ ERROR */}
          {error && <p className="fp-error">{error}</p>}

          {/* ✅ SUCCESS */}
          {success && <p className="fp-success">{success}</p>}

          <button
            className="fp-btn-main"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <button
          className="fp-btn-sub"
          type="button"
          onClick={() => navigate("/login")}
        >
          Back to Sign in
        </button>
      </div>
    </div>
  );
}