import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/otp.css";

export default function OTPVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputs = useRef([]);
  const email = location.state?.email || "your registered email";

  const handleChange = (e, i) => {
    const value = e.target.value;

    if (value && i < 5) {
      inputs.current[i + 1].focus();
    }
  };

  const handleSubmit = () => {
    alert("OTP verified");
    navigate("/reset");
  };

  return (
    <div className="otp-page">
      <div className="otp-bg">
        <h1>Change Password</h1>

        <p>
          We&apos;ve sent a password reset OTP to
          <br />
          <b>{email}</b>
        </p>

        <div className="otp-box">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              maxLength="1"
              className="otp-input"
              ref={(el) => (inputs.current[i] = el)}
              onChange={(e) => handleChange(e, i)}
            />
          ))}
        </div>

        <button className="otp-btn" onClick={handleSubmit}>
          Verify OTP
        </button>

        <button className="otp-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}
