import logoText from "../assets/logo/logo-text.png";
import logoOrbit from "../assets/logo/logo-orbit.png";

export default function BrandTitle() {
  return (
    <div className="brand-title">

      {/* ⭐ STAR LAYER */}
      <div className="brand-stars">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="star" />
        ))}
      </div>

      {/* LOGO */}
      <img src={logoText} className="logo-text" alt="Tempus Capsule" />
      <img src={logoOrbit} className="logo-orbit" alt="" />

    </div>
  );
}
