import "../styles/landing.css";
import TopBar from "../components/TopBar";
import CapsuleGrid from "../components/CapsuleGrid";

import logoText from "../assets/logo/logo-text.png";
import logoOrbit from "../assets/logo/logo-orbit.png";

export default function Home() {
  return (
    <div className="home">
      <TopBar />

      <main className="hero">

        {/* ✅ LOGO AREA */}
        <div className="brand-logo">
          <img
            src={logoOrbit}
            alt="orbit"
            className="logo-orbit"
          />

          <img
            src={logoText}
            alt="Tempus Capsule"
            className="logo-text"
          />
        </div>

        <p className="tagline">
          A message for the version <br />
          of you that exists in another time.
        </p>

        

        {/* ✅ FORM PREVIEW */}
        <div className="form-preview">
          <div className="form-showcase">
            <div className="form-title-group">
              <label className="form-title-label">Title</label>
              <div className="form-title-box">
                <p>to me, the future me :)</p>
              </div>
            </div>

            <div className="form-detail">
              <label>Detail</label>
            </div>

            <div className="form-content">
              <p>To pray in the future,<br />
              This is just a test mail to you in the next few<br />
              days, wish this work!<br />
              from capsule keeper</p>
            </div>

            <div className="form-footer">
              <div className="form-field">
                <span className="field-icon"></span>
                <div>
                  <label>Email</label>
                  <p>TempusCapsule@gmail.com</p>
                </div>
              </div>

              <div className="form-field">
                <span className="field-icon"></span>
                <div>
                  <label>Code</label>
                  <p>45A5213</p>
                </div>
              </div>

              <div className="form-field">
                <span className="field-icon"></span>
                <div>
                  <label>Date</label>
                  <p>01/10/2025</p>
                </div>
              </div>

              <button className="form-send-btn">Send ✈</button>
            </div>
          </div>
        </div>

        {/* <CapsuleGrid /> */}
      </main>
    </div>
  );
}

