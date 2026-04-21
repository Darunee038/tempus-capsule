import { Link } from "react-router-dom";

export default function CapsuleCard({ item }) {
  return (
    <Link className="card" >
      <div className="card-title">{item.title}</div>
      <div className="card-desc">{item.desc}</div>
    </Link>
  );
}
