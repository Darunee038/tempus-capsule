import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/otp.css";

export default function OTPVerify() {
  const navigate = useNavigate();
  const inputs = useRef([]);

  const handleChange = (e, i) => {
    const value = e.target.value;

    if (value && i < 5) {
      inputs.current[i + 1].focus();
    }
  };

  const handleSubmit = () => {
    alert("✅ OTP verified");
    navigate("/reset");
  };

  return (
    <div className="otp-page">
      <div className="otp-bg">
        <h1>Change Password</h1>

        <p>
          We’ve sent a password reset link to your email
          <br />
          <b>TempusCap@gmail.com</b>
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
          Send OTP
        </button>

        <button className="otp-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}
