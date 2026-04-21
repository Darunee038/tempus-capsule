import { Link } from "react-router-dom";
import logo from "../assets/logo/tempus-logo.png";

const FEATURES = [
  { key: "hora", label: "HoraWhisper+", to: "/feature/hora" },
  { key: "lova", label: "LovaNote", to: "/feature/lova" },
  { key: "eterea", label: "EtereaMoment", to: "/feature/eterea" },
  { key: "vermis", label: "VermissSandglass", to: "/feature/vermis" },
];

export default function Navbar({ variant = "hp", activeFeature = "" }) {
  const navClass = `${variant}-nav`;
  const navInnerClass = `${variant}-nav-inner`;
  const logoClass = `${variant}-logo`;
  const logoImgClass = `${variant}-logo-img`;
  const menuClass = `${variant}-menu`;
  const menuItemClass = `${variant}-menu-item`;
  const userClass = `${variant}-user`;
  const userIconClass = `${variant}-user-icon`;

  return (
    <header className={navClass}>
      <div className={navInnerClass}>
        <Link to="/home" className={logoClass}>
          <img src={logo} alt="Tempus Capsule" className={logoImgClass} />
        </Link>

        <nav className={menuClass}>
          {FEATURES.map((feature) => (
            <Link
              key={feature.key}
              className={`${menuItemClass}${activeFeature === feature.key ? " active" : ""}`}
              to={feature.to}
            >
              {feature.label}
            </Link>
          ))}
        </nav>

        <Link className={userClass} to="/profile" aria-label="Profile">
          <span className={userIconClass}>👤</span>
        </Link>
      </div>
    </header>
  );
}
