import { useEffect, useState } from "react";
import "../styles/eterea-create.css";
import "../scripts/eterea-create.js";

export default function HoraCreate({ onNext }) {
  // ====== STATE ======
  const [code, setCode] = useState("");

  // ====== EFFECT ======
  useEffect(() => {
    if (window.initHoraCreate) {
      window.initHoraCreate();
    }
  }, []);

  // ====== HANDLER ======
  function handleGenerateCode() {
    const randomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    setCode(randomCode);
  }

  return (
    <>
      {/* HEADER */}
      <header className="top-bar">
        <div className="page-center top-bar-inner">
          <div className="logo">Tempus Capsule</div>
          <nav className="menu">
            <span>HoraWhisper+</span>
            <span>LoveNote</span>
            <span className="active">EtereaMoment</span>
            <span>VermissSandglass</span>
          </nav>
          <div className="profile">👤</div>
        </div>
      </header>

      {/* MAIN */}
      <main className="layout">
        <div className="page-center">

          {/* TITLE */}
          <section className="title-section">
            <h1>EtereaMoment</h1>
            <p>Collect precious memories with someone who matters.</p>
          </section>

          {/* BOOK */}
          <section className="book-section">
            <div className="book unified">
              <div className="page left"></div>
              <div className="page right"></div>
              <canvas id="canvas" width={720} height={460}></canvas>
            </div>
          </section>

          {/* TOOLBAR */}
          <section className="toolbar-section">
            <div className="toolbar">
              <div className="tools-left">
                <button id="undoBtn">⟲</button>
                <button id="redoBtn">⟳</button>
                <button id="penBtn">🖊️</button>
                <button id="eraserBtn">🧽</button>
                <button id="textBtn">T</button>
                <button id="stickerBtn">⭐</button>
                <button id="imageBtn">🖼️</button>

                <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  style={{ display: "none" }}
                />

                <label className="color-box">
                  <input type="color" id="penColor" defaultValue="#000000" />
                </label>

                <input type="range" min={2} max={12} defaultValue={4} />
              </div>

              <div className="divider"></div>

              <div className="tools-right">
                <span>Background</span>
                <div className="bg-list">
                  <div className="bg-item"></div>
                  <div className="bg-item"></div>
                  <div className="bg-item"></div>
                  <div className="bg-item"></div>
                  <div className="bg-item"></div>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM */}
          <section className="bottom-section">
            <div className="field">
              <label>Create Code</label>

              <div className="code-row">
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <button
                  className="generate-btn"
                  onClick={handleGenerateCode}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="field">
              <label>Capsule open on</label>
              <div
                id="dateDropdown"
                className="date-dropdown placeholder"
              >
                Select open date
              </div>
            </div>
          </section>

          {/* NEXT */}
          <div className="next-row">
            <button
              className="next-btn"
              onClick={() => {
                console.log("NEXT CLICK", code);
                onNext && onNext(code);
              }}
            >
              Next
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
