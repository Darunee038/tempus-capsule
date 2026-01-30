import { Link } from "react-router-dom";
import "../styles/lova.css";
import logo from "../assets/logo/tempus-logo.png";

export default function LovaNote() {
  return (
    <div className="lova-page">
      <div className="lova-bg">

        {/* NAV */}
        <header className="lova-nav">
          <div className="lova-nav-inner">
            <div className="lova-logo">
              <img src={logo} alt="Tempus Capsule" className="lova-logo-img" />



            </div>

            <nav className="lova-menu">
              <Link className="lova-menu-item" to="/feature/hora">HoraWhisper+</Link>
              <Link className="lova-menu-item active" to="/feature/lova">LovaNote</Link>
              <Link className="lova-menu-item" to="/feature/eterea">EtereaMoment</Link>
              <Link className="lova-menu-item" to="/feature/vermis">VermissSandglass</Link>
            </nav>

            <Link className="lova-user" to="/profile">👤</Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="lova-content">
          <h1 className="lova-title">LovaNote</h1>

          <section className="lova-section">
            <h3 className="lova-section-title">Opened Capsules</h3>
            <div className="lova-grid">
              <div className="lova-card" />
              <div className="lova-card" />
              <div className="lova-card" />
            </div>
          </section>

          <section className="lova-section">
            <h3 className="lova-section-title">Locked Capsules</h3>
            <div className="lova-grid">
              <div className="lova-card" />
              <div className="lova-card" />
              <div className="lova-card" />
            </div>
          </section>

          <Link className="lova-create" to="/feature/lova/create">
            Create Capsule
          </Link>

        </main>
      </div>
    </div>
  );
}
