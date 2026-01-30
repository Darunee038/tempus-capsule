import { Link } from "react-router-dom";

export default function CapsuleCard({ item }) {
  return (
    <Link className="card" to={`/feature/${item.key}`}>
      <div className="card-title">{item.title}</div>
      <div className="card-desc">{item.desc}</div>
    </Link>
  );
}
