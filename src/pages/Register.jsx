import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";

import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    dob: "",
    email: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = form.email.trim().toLowerCase();

    // 🔥 กันกรอกไม่ครบ
    if (!normalizedEmail || !form.password || !form.username) {
      alert("Please fill all required fields ❗");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        form.password
      );

      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        user_name: form.username,
        user_firstname: form.firstName,
        user_lastname: form.lastName,
        user_nickname: form.nickname,
        user_email: normalizedEmail,
        user_email_lowercase: normalizedEmail,
        user_dob: form.dob,
        user_rank: "user",  
        user_doc: serverTimestamp(),
      });

      alert("Account created successfully 🎉");

      navigate("/login");

    } catch (err) {
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      console.error(err);

      // 🔥 แปลง error ให้อ่านง่าย
      if (err.code === "auth/email-already-in-use") {
        alert("This email is already registered ❌");
      } else if (err.code === "auth/weak-password") {
        alert("Password must be at least 6 characters ❌");
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-bg">
        <h1 className="reg-brand">Create Account</h1>
        <p className="reg-sub">Begin your journey through time.</p>

        <section className="reg-card">
          <form className="reg-form" onSubmit={handleSubmit}>

            <div className="reg-field">
              <label className="reg-label">First Name</label>
              <input
                className="reg-input"
                placeholder="Enter First Name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Last Name</label>
              <input
                className="reg-input"
                placeholder="Enter Last Name"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Nick Name</label>
              <input
                className="reg-input"
                placeholder="Enter Nick Name"
                value={form.nickname}
                onChange={(e) =>
                  setForm({ ...form, nickname: e.target.value })
                }
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Date of Birth</label>
              <input
                type="date"
                className="reg-input"
                value={form.dob}
                onChange={(e) =>
                  setForm({ ...form, dob: e.target.value })
                }
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Email</label>
              <input
                type="email"
                className="reg-input"
                placeholder="Enter E-mail Address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Username</label>
              <input
                className="reg-input"
                placeholder="Enter User Name"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Password</label>
              <input
                type="password"
                className="reg-input"
                placeholder="Enter Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div className="reg-checkrow">
              <input type="checkbox" required />
              <span>I agree to the terms</span>
            </div>

            <button className="reg-btn" type="submit">
              Sign Up
            </button>

            <div className="reg-footer">
              Already have account?{" "}
              <Link to="/login">Login</Link>
            </div>

          </form>
        </section>
      </div>
    </div>
  );
}
