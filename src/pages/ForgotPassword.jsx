import { useNavigate } from "react-router-dom";
import "../styles/forgot.css";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // mock ว่าส่ง email แล้ว
        alert("📩 OTP sent to your email");

        navigate("/otp");
    };

    return (
        <div className="fp-page">
            <div className="fp-bg">
                <h1 className="fp-title">Forgot Password</h1>

                <p className="fp-desc">
                    We’ve sent a password reset link to your email
                    <br />
                    <b>TempusCap@gmail.com</b>
                </p>

                <div className="fp-otp">
                    <div className="fp-otp">
                        {[...Array(6)].map((_, i) => (
                            <input
                                key={i}
                                className="fp-box"
                                maxLength="1"
                                inputMode="numeric"
                            />
                        ))}
                    </div>



                </div>
                <button
                    className="fp-btn-main"
                    onClick={() => navigate("/reset")}
                >
                    Continue
                </button>

                <button
                    className="fp-btn-sub"
                    onClick={() => navigate("/login")}
                >
                    Back to Sign up
                </button>


            </div>
        </div>

    );
}
