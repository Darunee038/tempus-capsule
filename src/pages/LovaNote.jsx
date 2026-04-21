import { Link } from "react-router-dom";
import "../styles/lova.css";
import Navbar from "../components/Navbar";

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
        <Navbar variant="lova" activeFeature="lova" />

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
