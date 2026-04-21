import { useEffect } from "react";
import "../styles/home.css";
import "../styles/vermiss-create.css";
import Navbar from "../components/Navbar";

export default function HoraCreate({ onNext }) {
    useEffect(() => {
    if (window.initHoraCreate) {
      window.initHoraCreate();
    }
  }, []);

  return (
    <>
      {/* HEADER */}
      <Navbar variant="hp" activeFeature="vermis" />

      {/* MAIN */}
      <main className="layout">
        <div className="page-center">

          {/* TITLE */}
          <section className="title-section">
            <h1>VermissSandglass</h1>
            
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

          <section className="bottom-section">
            <div className="field">
              <label>Username of friend</label>
              <input type="email" placeholder="Enter Username" />
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

          <div className="next-row">
            <button
              className="next-btn"
              onClick={() => {
                console.log("NEXT CLICK");
                onNext();
              }}
            >
              Complete
            </button>
          </div>
        </div>
      </main>
    </>
  );
}