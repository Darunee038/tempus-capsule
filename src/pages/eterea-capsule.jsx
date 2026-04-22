import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import "../styles/eterea-capsule.css";
import { CapsuleModel } from "../scripts/capsule.jsx";
import Navbar from "../components/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
const ETEREA_DRAFT_STORAGE_KEY = "etereaCapsuleDraft";

export default function EtereaCapsule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const [selectedPart, setSelectedPart] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [topColor, setTopColor] = useState("#ffffff");
  const [bottomColor, setBottomColor] = useState("#ffffff");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [placingSticker, setPlacingSticker] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [activeSticker, setActiveSticker] = useState(null);

  const capsuleId = searchParams.get("capsuleId");
  const roomCode = searchParams.get("roomCode");

  const [capsuleName, setCapsuleName] = useState("");
  const [capsulePassword, setCapsulePassword] = useState("");
  const [saving, setSaving] = useState(false);



  const applyColorChange = (newColor) => {
    if (!selectedPart) return;

    const snapshot = {
      top: topColor,
      bottom: bottomColor
    };

    const trimmedHistory = history.slice(0, historyIndex + 1);
    const newHistory = [...trimmedHistory, snapshot];

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (selectedPart === "A") setTopColor(newColor);
    if (selectedPart === "B") setBottomColor(newColor);
  };

  const handleSaveCapsule = async () => {
  try {
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    if (!roomCode) {
      alert("Room code missing");
      return;
    }

    const roomRef = doc(db, "etereaRooms", roomCode);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      alert("Room not found");
      return;
    }

    const roomData = snap.data();

    if (!roomData.canvasState) {
      alert("No canvas data");
      return;
    }

    const finalCapsuleId = crypto.randomUUID();

    const payload = {
      userId: auth.currentUser.uid,
      roomCode,

      canvasState: roomData.canvasState, // ✅ เอาจาก firestore
      openAt: roomData.canvasState.openDate || null,

      capsuleName,
      capsulePassword,

      capsuleStyle: {
        topColor,
        bottomColor,
        stickers,
      },

      members: roomData.members || [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "etereaCapsules", finalCapsuleId), payload);

    // 👉 link กลับไปที่ room
    await updateDoc(roomRef, {
      capsuleId: finalCapsuleId,
      updatedAt: serverTimestamp(),
    });

    navigate("/feature/eterea");

  } catch (err) {
    console.error("Save capsule error:", err);
  }
};

  return (
    <div
      className="capsule-page"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* HEADER */}
      <Navbar variant="hp" activeFeature="eterea" />

      {/* ===== MODEL AREA ===== */}
      <div className="model-area">
        <Canvas
          shadows
          camera={{ position: [0, 0.4, 6.5], fov: 38 }}
          gl={{
            physicallyCorrectLights: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.6
          }}
        >

          <CapsuleModel
            selectedPart={selectedPart}
            topColor={topColor}
            bottomColor={bottomColor}
            setSelectedPart={setSelectedPart}
            stickers={stickers}
            setStickers={setStickers}
            placingSticker={placingSticker}
            setPlacingSticker={setPlacingSticker}
            activeSticker={activeSticker}
            setActiveSticker={setActiveSticker}
          />
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 8, 5]} intensity={0.2} castShadow />
          <directionalLight position={[-5, 4, 5]} intensity={1} />
          <Environment preset="studio" intensity={0.6} />
          <directionalLight position={[0, 5, 5]} intensity={0.8} />


          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
            far={4}
          />

          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar-section">
        <div className="toolbar">
          <div className="tools-left">
            <button
              disabled={historyIndex < 0}
              onClick={() => {
                if (historyIndex < 0) return;

                const prev = history[historyIndex];
                setTopColor(prev.top);
                setBottomColor(prev.bottom);

                setHistoryIndex(historyIndex - 1);
              }}
            >
              ↶
            </button>
            <button
              disabled={historyIndex >= history.length - 1}
              onClick={() => {
                const next = history[historyIndex + 1];
                if (!next) return;

                setTopColor(next.top);
                setBottomColor(next.bottom);

                setHistoryIndex(historyIndex + 1);
              }}
            >
              ↷
            </button>
            <div className="divider" />
            <button>✏️</button>
            <button>🧽</button>
            <button>T</button>
            <button
              onClick={() => {
                setShowStickerPanel(true);
              }}
            >
              ⭐
            </button>
            <button>🖼</button>
            <input
              type="color"
              value={
                selectedPart === "A"
                  ? topColor
                  : selectedPart === "B"
                    ? bottomColor
                    : "#ffffff"
              }
              disabled={!selectedPart}
              onChange={(e) => applyColorChange(e.target.value)}
            />
            <input type="range" min="1" max="40" defaultValue="4" />
          </div>

          <div className="divider" />

          <div className="tools-right">
            <button
              className={selectedPart === "A" ? "active" : ""}
              onClick={() => setSelectedPart("A")}
            >
              Select A
            </button>

            <button
              className={selectedPart === "B" ? "active" : ""}
              onClick={() => setSelectedPart("B")}
            >
              Select B
            </button>


          </div>
        </div>
      </div>

      {/* FORM */}
      <section className="capsule-form-section">
        <div className="form-split">
          <div className="form-box">
            <label>Capsule Name</label>
            {/* <input type="text" placeholder="Enter capsule name" /> */}
            <input
              type="text"
              placeholder="Enter capsule name"
              value={capsuleName}
              onChange={(e) => setCapsuleName(e.target.value)}
            />
          </div>

          <div className="form-box">
            <label>Capsule Password</label>
            {/* <input type="password" placeholder="Enter capsule password" /> */}
            <input
              type="password"
              placeholder="Enter capsule password"
              value={capsulePassword}
              onChange={(e) => setCapsulePassword(e.target.value)}
            />
          </div>
        </div>

        <button
          className="save-btn"
          onClick={handleSaveCapsule}
          disabled={saving}>
          Save Capsule
        </button>
      </section>

      {/* ✅ PUT POPUP HERE */}
      {showStickerPanel && (
        <>
          <div
            className="popup-overlay"
            onClick={() => setShowStickerPanel(false)}
          />

          <div className="sticker-popup">
            <h3>Stickers</h3>

            <div className="sticker-grid">
              {[
                "IMG_1283.png",
                "IMG_1284.png",
                "IMG_1285.png",
                "IMG_1286.png",
                "IMG_1287.png",
                "IMG_1288.png",
                "IMG_1289.png",
                "IMG_1290.png",
                "IMG_1291.png",
                "IMG_1292.png",
                "IMG_1293.png",
                "IMG_1294.png",
                "IMG_1295.png",
                "IMG_1296.png",
                "IMG_1297.png",
                "IMG_1298.png",
              ].map((file, i) => (
                <img
                  key={i}
                  src={`/assets/stickers/${file}`}
                  className="sticker-item"
                  onClick={() => {
                    setPlacingSticker(`/assets/stickers/${file}`);
                    setShowStickerPanel(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );

}