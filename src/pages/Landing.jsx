import "../styles/landing.css";
import TopBar from "../components/TopBar";
import BrandTitle from "../components/BrandTitle";
import CapsuleGrid from "../components/CapsuleGrid";

export default function Home() {
  return (
    <div className="home">
      <TopBar />
      <main className="hero">
        <BrandTitle />
        <p className="tagline">
          A message for the you who exists<br />in another time.
        </p>

        <a className="cta" href="/create">Create Capsule</a>

        <CapsuleGrid />
      </main>
    </div>
  );
}
