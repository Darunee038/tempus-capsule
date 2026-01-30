import "../styles/vermissCreate.css";

export default function VermissCreate() {
  return (
    <div className="vc-page">
      <div className="vc-bg">

        <h1 className="vc-title">VermissSandglass</h1>

        <div className="vc-card">

          <div className="vc-header">
            <span className="vc-tag">2025 Goals ✨🌱</span>

            <select className="vc-select">
              <option>Time</option>
              <option>Day</option>
              <option>Month</option>
            </select>
          </div>

          <div className="vc-list">

            <label className="vc-item">
              <input type="checkbox" />
              <span>Be better</span>
            </label>

            <label className="vc-item">
              <input type="checkbox" />
              <span>Find new job</span>
            </label>

            <label className="vc-item">
              <input type="checkbox" />
              <span>Study more</span>
            </label>

            <label className="vc-item">
              <input type="checkbox" />
              <span>Travelling</span>
            </label>

          </div>

          <div className="vc-footer">
            <button className="vc-btn-outline">Add more</button>
            <button className="vc-btn">Done</button>
          </div>

        </div>

        <div className="vc-share">
          <div className="vc-share-title">Share</div>
          <div className="vc-icons">
            <span>📸</span>
            <span>📘</span>
            <span>❌</span>
            <span>💬</span>
          </div>
        </div>

      </div>
    </div>
  );
}
