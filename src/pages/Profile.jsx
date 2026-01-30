import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();

  // 👉 กด Edit Profile
  const handleEdit = () => {
    navigate("/profile/edit");
  };

  // 👉 ส่ง feedback
  const handleSend = (e) => {
    e.preventDefault();
    alert("✅ Thanks! Your feedback has been sent.");
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
          <div className="pf-name">User Name</div>

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
            />

            <button
              className="pf-btn pf-btn-small"
              type="submit"
            >
              Send feedback
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
