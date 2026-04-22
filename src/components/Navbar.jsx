import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/tempus-logo.png";

const FEATURES = [
  { key: "hora", label: "HoraWhisper+", to: "/feature/hora" },
  { key: "lova", label: "LovaNote", to: "/feature/lova" },
  { key: "eterea", label: "EtereaMoment", to: "/feature/eterea" },
  { key: "vermis", label: "VermissSandglass", to: "/feature/vermis" },
];

export default function Navbar({ variant = "hp", activeFeature = "" }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navClass = `${variant}-nav`;
  const navInnerClass = `${variant}-nav-inner`;
  const logoClass = `${variant}-logo`;
  const logoImgClass = `${variant}-logo-img`;
  const menuClass = `${variant}-menu`;
  const menuItemClass = `${variant}-menu-item`;
  const menuPanelClass = `${variant}-menu-panel`;
  const navToggleClass = `${variant}-nav-toggle`;
  const userClass = `${variant}-user`;
  const userIconClass = `${variant}-user-icon`;

  return (
    <header className={navClass}>
      <div className={navInnerClass}>
        <Link to="/home" className={logoClass}>
          <img src={logo} alt="Tempus Capsule" className={logoImgClass} />
        </Link>

        <button
          type="button"
          className={navToggleClass}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`${menuPanelClass}${isMenuOpen ? " is-open" : ""}`}>
          <nav className={menuClass}>
            {FEATURES.map((feature) => (
              <Link
                key={feature.key}
                className={`${menuItemClass}${activeFeature === feature.key ? " active" : ""}`}
                to={feature.to}
                onClick={() => setIsMenuOpen(false)}
              >
                {feature.label}
              </Link>
            ))}
          </nav>

          <Link
            className={userClass}
            to="/profile"
            aria-label="Profile"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={userIconClass}>👤</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
