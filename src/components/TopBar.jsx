import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="pill-group">
        <Link className="pill" to="/login">Login</Link>
        <Link className="pill" to="/register">Register</Link>
      </div>
    </header>
  );
}
