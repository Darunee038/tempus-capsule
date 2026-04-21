import { useNavigate, Link } from "react-router-dom";
import "../styles/lova.css";
import logo from "../assets/logo/tempus-logo.png";

export default function LovaNote() {
  return (
    <div className="lova-page">
      {/* FLOATING HEARTS */}
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>
      <div className="rose-petal">❤️</div>

      <div className="lova-bg">

        {/* NAV */}
        <header className="lova-nav">
          <div className="lova-nav-inner">
            <Link to="/home" className="lova-logo">
              <img src={logo} alt="Tempus Capsule" className="lova-logo-img" />
            </Link>

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

          {/* <Link className="lova-create" to="/feature/lova/create"> */}
          <Link 
            className="hora-create" 
            to="/feature/hora/create"
            state={{flowType: "lova"}}
          >
            Create Capsule
          </Link>

        </main>
      </div>
    </div>
  );
}
