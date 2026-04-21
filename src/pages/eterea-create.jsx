import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import "../styles/eterea-create.css";
import "../scripts/eterea-create.js";
import Navbar from "../components/Navbar";

export default function EtereaCreate({ onNext }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleGenerateCode = () => {
    const generatedCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    setCode(generatedCode);
  };

  useEffect(() => {
    document.body.classList.add("eterea-create-route");

    if (window.initEtereaCreate) {
      window.initEtereaCreate();
    }

    return () => {
      document.body.classList.remove("eterea-create-route");
    };
  }, []);

  return (
    <>
      <Navbar variant="hp" activeFeature="eterea" />

      <div className="eterea-create-page">
        <div className="dreamscape-layer" aria-hidden="true">
          <div className="falling-star falling-star-fourpoint falling-star-one" />
          <div className="falling-star falling-star-fourpoint falling-star-two" />
          <div className="falling-star falling-star-fourpoint falling-star-three" />
          <div className="falling-star falling-star-fourpoint falling-star-four" />
          <div className="falling-star falling-star-fourpoint falling-star-five" />
          <div className="falling-star falling-star-fourpoint falling-star-six" />
          <div className="falling-star falling-star-fourpoint falling-star-seven" />
          <div className="falling-star falling-star-fourpoint falling-star-eight" />
          <div className="falling-star falling-star-fourpoint falling-star-nine" />
          <div className="falling-star falling-star-fourpoint falling-star-ten" />
          <div className="falling-star falling-star-fourpoint falling-star-eleven" />
          <div className="falling-star falling-star-fourpoint falling-star-twelve" />
        </div>

        <main className="layout">
          <div className="page-center">
            <section className="title-section">
              <h1>EtereaMoment</h1>
              <p>Collect precious memories with someone who matters.</p>
            </section>

            <section className="book-section">
              <div className="book unified">
                <div className="page left"></div>
                <div className="page right"></div>
                <canvas id="canvas" width={720} height={460}></canvas>
              </div>
            </section>

            <section className="toolbar-section">
              <div className="toolbar">
                <div className="tools-left">
                  <button id="undoBtn" data-tooltip="Undo the last change">↶</button>
                  <button id="redoBtn" data-tooltip="Redo the last undone change">↷</button>
                  <button id="penBtn" data-tooltip="Draw with the pen tool">✎</button>
                  <button id="eraserBtn" data-tooltip="Erase strokes from the page">⌫</button>
                  <button id="textBtn" data-tooltip="Add a text note">T</button>
                  <button id="stickerBtn" data-tooltip="Open the sticker library">✦</button>
                  <button id="imageBtn" data-tooltip="Upload a photo">🖼</button>
                  <label className="paper-color-trigger" data-tooltip="Change paper color">
                    <span className="paper-color-icon">🎨</span>
                    <input type="color" id="paperColorInput" defaultValue="#ffffff" />
                  </label>
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    style={{ display: "none" }}
                  />

                  <label className="color-box" data-tooltip="Choose pen color">
                    <input type="color" id="penColor" defaultValue="#000000" />
                  </label>

                  <input
                    type="range"
                    min={2}
                    max={12}
                    defaultValue={4}
                    data-tooltip="Adjust pen size"
                  />
                </div>

                <div className="divider"></div>

                <div className="tools-right">
                  <span>Background</span>
                  <div className="bg-list">
                    <button type="button" className="bg-item bg-stars active" data-bg="stars" data-tooltip="Pastel stars paper"></button>
                    <button type="button" className="bg-item bg-blue-floral" data-bg="blueFloral" data-tooltip="Blue floral paper"></button>
                    <button type="button" className="bg-item bg-clover" data-bg="sprinkles" data-tooltip="Clover paper"></button>
                    <button type="button" className="bg-item bg-pastel-grid" data-bg="pastelGrid" data-tooltip="Pastel grid paper"></button>
                    <button type="button" className="bg-item bg-confetti-dots" data-bg="confettiDots" data-tooltip="Soft confetti dots"></button>
                  </div>
                </div>
              </div>
            </section>

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
                    type="button"
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

            <div className="next-row">
              <button
                type="button"
                className="next-btn"
                onClick={() => {
                  navigate("/feature/eterea/capsule");
                }}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
