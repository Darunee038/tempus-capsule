import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import "../styles/editProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    dob: "",
    email: "",
    username: "",
    currentPassword: "", // 👈 รหัสเดิม
    newPassword: "",     // 👈 รหัสใหม่
  });

  // โหลดข้อมูล
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setForm((prev) => ({
            ...prev,
            firstName: data.user_firstname || "",
            lastName: data.user_lastname || "",
            nickname: data.user_nickname || "",
            dob: data.user_dob || "",
            email: data.user_email || "",
            username: data.user_name || "",
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleComplete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");

      const docRef = doc(db, "users", user.uid);
      const normalizedEmail = form.email.trim().toLowerCase();

      // 🔥 update Firestore
      await updateDoc(docRef, {
        user_firstname: form.firstName,
        user_lastname: form.lastName,
        user_nickname: form.nickname,
        user_dob: form.dob,
        user_email: normalizedEmail,
        user_email_lowercase: normalizedEmail,
        user_name: form.username,
      });

      // 🔐 เปลี่ยนรหัส (ถ้ามีกรอก)
      if (form.newPassword) {
        if (!form.currentPassword) {
          return alert("❗ กรุณากรอกรหัสเดิม");
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          form.currentPassword
        );

        // ✅ re-login ก่อน
        await reauthenticateWithCredential(user, credential);

        // ✅ แล้วค่อยเปลี่ยนรหัส
        await updatePassword(user, form.newPassword);
      }

      alert("✅ Profile updated successfully");
      navigate("/profile");

    } catch (error) {
      console.error("🔥 ERROR:", error);
      alert(error.message);
    }
  };

  return (
    <div className="ep-page">
      <div className="ep-bg">

        <h1 className="ep-title">Profile</h1>

        <div className="ep-card">

          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} />

          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />

          <label>Nick Name</label>
          <input name="nickname" value={form.nickname} onChange={handleChange} />

          <label>Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} />

          <label>Email Address</label>
          <input name="email" value={form.email} onChange={handleChange} />

          <label>User Name</label>
          <input name="username" value={form.username} onChange={handleChange} />

          {/* 🔐 รหัสเดิม */}
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
          />

          {/* 🔐 รหัสใหม่ */}
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
          />

        </div>

        <button className="ep-btn" onClick={handleComplete}>
          Complete
        </button>

      </div>
    </div>
  );
}
