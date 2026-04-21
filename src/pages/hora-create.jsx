import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import "../styles/home.css";
import "../styles/hora-create.css";
import "../scripts/hora-create.js";
import { auth, db } from "../firebase";
import Navbar from "../components/Navbar";

const HORA_DRAFT_STORAGE_KEY = "horaCapsuleDraft";

export default function HoraCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const [searchParams] = useSearchParams();
  const capsuleId = searchParams.get("capsuleId");
  const mode = searchParams.get("mode");
  const isViewMode = mode === "view";

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCapsule, setLoadingCapsule] = useState(Boolean(capsuleId));
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [capsuleRecord, setCapsuleRecord] = useState(null);

  useEffect(() => {
    console.log( "State passed to HoraCreate:", state);
  }, [state]);

  const lockedMessage = useMemo(() => {
    const openDate = capsuleRecord?.openAt?.toDate?.();
    if (!isViewMode || !openDate) return "";
    if (openDate.getTime() <= Date.now()) return "";
    return `This capsule is still locked until ${openDate.toLocaleDateString("en-GB")}.`;
  }, [capsuleRecord, isViewMode]);

  useEffect(() => {
    document.body.dataset.horaReadOnly = isViewMode ? "true" : "false";

    return () => {
      delete document.body.dataset.horaReadOnly;
    };
  }, [isViewMode]);

  useEffect(() => {
    if (window.initHoraCreate) {
      window.initHoraCreate();
    }

    return () => {
      window.__horaCreateInited = false;
      delete window.horaCreateApi;
    };
  }, []);

  useEffect(() => {
    console.log("Setting up auth state listener for HoraCreate. Current user:", auth);
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

        const capsuleRef = doc(db, "horaCapsules", capsuleId);
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
    if (!window.horaCreateApi?.loadSnapshot) return;
    if (lockedMessage) return;

    if (isViewMode) {
      if (capsuleRecord?.canvasState) {
        window.horaCreateApi.loadSnapshot(capsuleRecord.canvasState);
      }
      return;
    }

    try {
      const localDraftRaw = window.sessionStorage.getItem(HORA_DRAFT_STORAGE_KEY);
      const localDraft = localDraftRaw ? JSON.parse(localDraftRaw) : null;
      const localDraftCapsuleId = localDraft?.capsuleId || null;
      const localDraftMatchesRoute = capsuleId
        ? localDraftCapsuleId === capsuleId
        : Boolean(localDraft?.canvasState);

      if (localDraftMatchesRoute && localDraft?.canvasState) {
        window.horaCreateApi.loadSnapshot(localDraft.canvasState);
        return;
      }
    } catch (error) {
      console.warn("Failed to restore local Hora draft:", error);
    }

    if (capsuleRecord?.canvasState) {
      window.horaCreateApi.loadSnapshot(capsuleRecord.canvasState);
    }
  }, [capsuleId, capsuleRecord, isViewMode, lockedMessage]);

  const handleNextStep = async () => {
    setStatusMessage("");
    setErrorMessage("");

    if (isViewMode) {
      navigate("/feature/hora");
      return;
    }

    console.log("Next step clicked. Current user:", currentUser);
    if (!currentUser) {
      setErrorMessage("Please log in before saving a capsule.");
      return;
    }

    if (!window.horaCreateApi?.getSnapshot) {
      setErrorMessage("The page editor is not ready yet.");
      return;
    }

    const snapshot = window.horaCreateApi.getSnapshot();

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

      window.sessionStorage.setItem(HORA_DRAFT_STORAGE_KEY, JSON.stringify(localDraft));

      setStatusMessage("Moving to capsule design...");
      navigate(capsuleId ? `/feature/hora/capsule?capsuleId=${capsuleId}` : "/feature/hora/capsule");
    } catch (err) {
      console.error("Failed to prepare capsule draft:", err);
      setErrorMessage("Could not continue to capsule design. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar variant="hp" activeFeature="hora" />

      <div className={`hora-create-page ${isViewMode ? "hora-create-readonly" : ""}`}>
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
              <h1>{state?.flowType === "hora" ? "HoraWhisper+" : "LovaNote"}</h1>
              <p>
                {isViewMode
                  ? "Your saved capsule page is shown exactly as it was created."
                  : "Tell your future self what your heart whispers today."}
              </p>
            </section>

            {(loadingCapsule || errorMessage || statusMessage || lockedMessage) && (
              <div className="hora-create-feedback-wrap">
                {loadingCapsule && <p className="hora-create-feedback">Loading capsule...</p>}
                {errorMessage && <p className="hora-create-feedback error">{errorMessage}</p>}
                {statusMessage && <p className="hora-create-feedback success">{statusMessage}</p>}
                {lockedMessage && <p className="hora-create-feedback">{lockedMessage}</p>}
              </div>
            )}

            <section className="book-section">
              <div className="book unified">
                <div className="page left"></div>
                <div className="page right"></div>
                <canvas id="canvas" width={720} height={460}></canvas>
                {isViewMode && <div className="hora-readonly-overlay" aria-hidden="true" />}
              </div>
            </section>

            <section
              className="toolbar-section"
              style={isViewMode ? { display: "none" } : undefined}
              aria-hidden={isViewMode}
            >
              <div className="toolbar">
                <div className="tools-left">
                  <button id="undoBtn" data-tooltip="Undo the last change">⟲</button>
                  <button id="redoBtn" data-tooltip="Redo the last undone change">⟳</button>
                  <button id="penBtn" data-tooltip="Draw with the pen tool">🖊️</button>
                  <button id="eraserBtn" data-tooltip="Erase strokes from the page">🧽</button>
                  <button id="textBtn" data-tooltip="Add a text note">T</button>
                  <button id="stickerBtn" data-tooltip="Open the sticker library">⭐</button>
                  <button id="imageBtn" data-tooltip="Upload a photo">🖼️</button>
                  <label className="paper-color-trigger" data-tooltip="Change paper color">
                    <span className="paper-color-icon">🪣</span>
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
                <label>Backup Email</label>
                <input
                  id="backupEmailInput"
                  type="email"
                  placeholder="Enter your email"
                  readOnly={isViewMode}
                />
              </div>

              <div className="field">
                <label>Capsule open on</label>
                <div
                  id="dateDropdown"
                  className={`date-dropdown placeholder ${isViewMode ? "is-readonly" : ""}`}
                >
                  Select open date
                </div>
              </div>
            </section>

            <button
              className="next-btn"
              disabled={saving || loadingCapsule}
              onClick={handleNextStep}
            >
              {isViewMode ? "Back To Capsules" : saving ? "Saving..." : "Next"}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
