import { use, useEffect, useMemo, useState } from "react";

import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

import "../styles/home.css";
import "../styles/eterea-create.css";
import "../scripts/eterea-create.js";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, updateDoc } from "firebase/firestore";
const eterea_DRAFT_STORAGE_KEY = "etereaCapsuleDraft";


export default function EtereaCreate({ onNext }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const [searchParams] = useSearchParams();
  const capsuleId = searchParams.get("capsuleId");

  const roomCode = searchParams.get("roomCode");

  const mode = searchParams.get("mode");
  const isViewMode = mode === "view";
  const [code, setCode] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCapsule, setLoadingCapsule] = useState(Boolean(capsuleId));
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [capsuleRecord, setCapsuleRecord] = useState(null);

  const clientId = useMemo(() => crypto.randomUUID(), []);




  useEffect(() => {
    document.body.classList.add("eterea-create-route");

    if (window.initEtereaCreate) {
      window.initEtereaCreate();
    }

    return () => {
      document.body.classList.remove("eterea-create-route");
    };
  }, []);


  const lockedMessage = useMemo(() => {
    const openDate = capsuleRecord?.openAt?.toDate?.();
    if (!isViewMode || !openDate) return "";
    if (openDate.getTime() <= Date.now()) return "";
    return `This capsule is still locked until ${openDate.toLocaleDateString("en-GB")}.`;
  }, [capsuleRecord, isViewMode]);

  useEffect(() => {
    document.body.dataset.etereaReadOnly = isViewMode ? "true" : "false";

    return () => {
      delete document.body.dataset.etereaReadOnly;
    };
  }, [isViewMode]);

  useEffect(() => {
    if (window.initetereaCreate) {
      window.initetereaCreate();
    }

    return () => {
      window.__etereaCreateInited = false;
      delete window.etereaCreateApi;
    };
  }, []);

  useEffect(() => {
    console.log("Setting up auth state listener for etereaCreate. Current user:", auth);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed. Current user:", user);
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!capsuleId) {
      setLoadingCapsule(false);
      setCapsuleRecord(null);
      return;
    }

    let cancelled = false;

    const loadCapsule = async () => {
      try {
        setLoadingCapsule(true);
        setErrorMessage("");


        const capsuleRef = state.flowType === "lova"
          ? doc(db, "lovaNotes", capsuleId)
          : doc(db, "etereaCapsules", capsuleId);
        const capsuleSnap = await getDoc(capsuleRef);

        if (!capsuleSnap.exists()) {
          if (!cancelled) {
            setErrorMessage("Capsule not found.");
            setCapsuleRecord(null);
          }
          return;
        }

        const data = { id: capsuleSnap.id, ...capsuleSnap.data() };

        if (!cancelled) {
          setCapsuleRecord(data);
        }
      } catch (err) {
        console.error("Failed to load capsule:", err);
        if (!cancelled) {
          setErrorMessage("Could not load this capsule.");
          setCapsuleRecord(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingCapsule(false);
        }
      }
    };

    loadCapsule();

    return () => {
      cancelled = true;
    };
  }, [capsuleId]);

  useEffect(() => {
    if (!window.etereaCreateApi?.loadSnapshot) return;
    if (lockedMessage) return;

    if (isViewMode) {
      if (capsuleRecord?.canvasState) {
        window.etereaCreateApi.loadSnapshot(capsuleRecord.canvasState);
      }
      return;
    }

    try {
      const localDraftRaw = window.sessionStorage.getItem(eterea_DRAFT_STORAGE_KEY);
      const localDraft = localDraftRaw ? JSON.parse(localDraftRaw) : null;
      const localDraftCapsuleId = localDraft?.capsuleId || null;
      const localDraftMatchesRoute = capsuleId
        ? localDraftCapsuleId === capsuleId
        : Boolean(localDraft?.canvasState);

      if (localDraftMatchesRoute && localDraft?.canvasState) {
        window.etereaCreateApi.loadSnapshot(localDraft.canvasState);
        return;
      }
    } catch (error) {
      console.warn("Failed to restore local eterea draft:", error);
    }

    if (capsuleRecord?.canvasState) {
      window.etereaCreateApi.loadSnapshot(capsuleRecord.canvasState);
    }
  }, [capsuleId, capsuleRecord, isViewMode, lockedMessage]);

  const handleNextStep = async () => {
    setStatusMessage("");
    setErrorMessage("");

    if (isViewMode) {
      navigate("/feature/eterea");
      return;
    }

    if (!currentUser) {
      setErrorMessage("Please log in before saving a capsule.");
      return;
    }

    if (!window.etereaCreateApi?.getSnapshot) {
      setErrorMessage("The page editor is not ready yet.");
      return;
    }

    const snapshot = window.etereaCreateApi.getSnapshot();

    if (!snapshot.backupEmail) {
      setErrorMessage("Please enter a backup email.");
      return;
    }

    if (!snapshot.openDate) {
      setErrorMessage("Please choose the capsule open date.");
      return;
    }

    try {
      setSaving(true);

      const localDraft = {
        capsuleId: capsuleId || null,
        userId: currentUser.uid,
        backupEmail: snapshot.backupEmail,
        openDate: snapshot.openDate,
        canvasState: snapshot,
        updatedAt: Date.now(),
      };

      window.sessionStorage.setItem(eterea_DRAFT_STORAGE_KEY, JSON.stringify(localDraft));

      setStatusMessage("Moving to capsule design...");
      navigate(capsuleId ? `/feature/eterea/capsule?capsuleId=${capsuleId}` : "/feature/eterea/capsule", { state: { flowType: state?.flowType } });
    } catch (err) {
      console.error("Failed to prepare capsule draft:", err);
      setErrorMessage("Could not continue to capsule design. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
    if (!roomCode) return;

    const cleanData = (data) => ({
      ...data,
      strokes: data.strokes.map((s) => {
        if (s.type === "image") {
          const { img, ...rest } = s;
          return rest;
        }
        return s;
      }),
    });

    let saveTimer;

    window.etereaCreateApi = {
      ...window.etereaCreateApi,
      onChange: async (data) => {
        clearTimeout(saveTimer);

        saveTimer = setTimeout(async () => {
          try {
            const cleaned = cleanData(data);

            await updateDoc(doc(db, "etereaRooms", roomCode), {
              canvasState: cleaned,
              updatedAt: serverTimestamp(),
              updatedBy: clientId,
            });
          } catch (err) {
            console.error("save realtime error:", err);
          }
        }, 250);
      },
    };

    return () => clearTimeout(saveTimer);
  }, [roomCode, clientId]);

  useEffect(() => {
    if (!roomCode) return;
    if (!window.etereaCreateApi?.loadSnapshot) return;

    let lastData = null;

    const unsub = onSnapshot(doc(db, "etereaRooms", roomCode), (snap) => {
      const data = snap.data();
      if (!data?.canvasState) return;

      if (data.updatedBy === clientId) return;

      const json = JSON.stringify(data.canvasState);
      if (json === lastData) return;

      lastData = json;
      window.etereaCreateApi.loadSnapshot(data.canvasState);
    });

    setCode(roomCode);
    return () => unsub();
  }, [roomCode, clientId]);


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
