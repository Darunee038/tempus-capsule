import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../styles/hora.css";
import Navbar from "../components/Navbar";

function formatOpenDate(value) {
  if (!value) return "No open date";

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  if (Number.isNaN(date.getTime())) return "No open date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStrokeCount(canvasState) {
  return Array.isArray(canvasState?.strokes) ? canvasState.strokes.length : 0;
}

function getCapsulePreview(capsule) {
  return capsule.capsulePreviewUrl || "";
}

async function hashPassword(value) {
  const encoded = new TextEncoder().encode(value);
  const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function HoraWhisper() {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlockingCapsule, setUnlockingCapsule] = useState(null);
  const [capsulePasswordInput, setCapsulePasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [deletingCapsuleId, setDeletingCapsuleId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCapsules([]);
        setLoading(false);
        setError("Please log in to see your capsules.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const snapshot = await getDocs(
          query(collection(db, "horaCapsules"), where("userId", "==", user.uid))
        );

        const nextCapsules = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter(
            (capsule) =>
              capsule.draftStage === "complete" ||
              capsule.capsuleState ||
              capsule.capsuleName ||
              capsule.capsulePreviewUrl
          )
          .sort((a, b) => {
            const aTime = a.openAt?.toMillis?.() ?? 0;
            const bTime = b.openAt?.toMillis?.() ?? 0;
            return aTime - bTime;
          });

        setCapsules(nextCapsules);
      } catch (err) {
        console.error("Failed to load Hora capsules:", err);
        setError("Could not load your capsules right now.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const { openedCapsules, lockedCapsules } = useMemo(() => {
    const now = Date.now();

    return capsules.reduce(
      (acc, capsule) => {
        const openAt = capsule.openAt?.toMillis?.() ?? 0;
        if (openAt && openAt <= now) acc.openedCapsules.push(capsule);
        else acc.lockedCapsules.push(capsule);
        return acc;
      },
      { openedCapsules: [], lockedCapsules: [] }
    );
  }, [capsules]);

  const closePasswordModal = () => {
    setUnlockingCapsule(null);
    setCapsulePasswordInput("");
    setPasswordError("");
    setVerifyingPassword(false);
  };

  const handleOpenCapsule = async () => {
    if (!unlockingCapsule) return;

    if (!unlockingCapsule.capsulePasswordHash) {
      closePasswordModal();
      navigate(`/feature/hora/create?capsuleId=${unlockingCapsule.id}&mode=view`, {
        state: {
          flowType : "hora"
        }
      });
      return;
    }

    if (!capsulePasswordInput.trim()) {
      setPasswordError("Please enter the capsule password.");
      return;
    }

    try {
      setVerifyingPassword(true);
      setPasswordError("");

      const hashedInput = await hashPassword(capsulePasswordInput.trim());
      if (hashedInput !== unlockingCapsule.capsulePasswordHash) {
        setPasswordError("Incorrect password. Please try again.");
        return;
      }

      closePasswordModal();
      navigate(`/feature/hora/create?capsuleId=${unlockingCapsule.id}&mode=view`,
        {
          state: {
            flowType : "hora"
          }
        }
      );
    } catch (err) {
      console.error("Failed to verify capsule password:", err);
      setPasswordError("Could not verify the password right now.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleDeleteCapsule = async (event, capsule) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${capsule.capsuleName || "this capsule"}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingCapsuleId(capsule.id);
      setError("");
      await deleteDoc(doc(db, "horaCapsules", capsule.id));
      setCapsules((prev) => prev.filter((item) => item.id !== capsule.id));

      if (unlockingCapsule?.id === capsule.id) {
        closePasswordModal();
      }
    } catch (err) {
      console.error("Failed to delete capsule:", err);
      setError("Could not delete this capsule right now.");
    } finally {
      setDeletingCapsuleId("");
    }
  };

  const renderCapsuleCard = (capsule, isLocked) => {
    const strokeCount = getStrokeCount(capsule.canvasState);
    const previewUrl = getCapsulePreview(capsule);

    return (
      <button
        key={capsule.id}
        type="button"
        className={`hora-card hora-card-button ${isLocked ? "is-locked" : "is-opened"}`}
        onClick={() => {
          if (isLocked) return;
          setUnlockingCapsule(capsule);
          setCapsulePasswordInput("");
          setPasswordError("");
        }}
      >
        <div className="hora-card-top">
          <span className={`hora-card-chip ${isLocked ? "locked" : "opened"}`}>
            {isLocked ? "Locked" : "Opened"}
          </span>
          <div className="hora-card-meta">
            <span className="hora-card-date">{formatOpenDate(capsule.openAt)}</span>
            <button
              type="button"
              className="hora-card-delete"
              aria-label={`Delete ${capsule.capsuleName || "capsule"}`}
              disabled={deletingCapsuleId === capsule.id}
              onClick={(event) => handleDeleteCapsule(event, capsule)}
            >
              {deletingCapsuleId === capsule.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <div className="hora-card-body">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={capsule.capsuleName || "Capsule preview"}
              className="hora-card-preview"
            />
          ) : (
            <div className="hora-card-preview hora-card-preview-placeholder" aria-hidden="true" />
          )}
          <h4>{capsule.capsuleName || capsule.backupEmail || "Hora Capsule"}</h4>
          <p>{strokeCount} item{strokeCount === 1 ? "" : "s"} saved on the page</p>
        </div>
        <div className="hora-card-footer">
          <span>{isLocked ? "Available on open date" : "Open capsule"}</span>
        </div>
      </button>
    );
  };
  

  const goToCreatePage = () =>{
    navigate("/feature/hora/create", {
      state: {
        flowType : "hora"
      }
    });
  }

  return (
    <div className="hora-page">
      <div className="hora-bg">
        <Navbar variant="hora" activeFeature="hora" />

        <main className="hora-content">
          <h1 className="hora-title">HoraWhisper+</h1>

          {error && <p className="hora-feedback">{error}</p>}
          {loading && <p className="hora-feedback">Loading your capsules...</p>}

          <section className="hora-section">
            <h3 className="hora-section-title">Opened Capsules</h3>
            <div className="hora-grid">
              {!loading && openedCapsules.length === 0 && (
                <div className="hora-empty-card">No capsules are ready to open yet.</div>
              )}
              {openedCapsules.map((capsule) => renderCapsuleCard(capsule, false))}
            </div>
          </section>

          <section className="hora-section">
            <h3 className="hora-section-title">Locked Capsules</h3>
            <div className="hora-grid">
              {!loading && lockedCapsules.length === 0 && (
                <div className="hora-empty-card">You do not have any locked capsules right now.</div>
              )}
              {lockedCapsules.map((capsule) => renderCapsuleCard(capsule, true))}
            </div>
          </section>

          <Link 
            className="hora-create" 
            to="/feature/hora/create"
            state={{flowType: "hora"}}
          >

            Create Capsule
          </Link>
        </main>

        {unlockingCapsule && (
          <>
            <button
              type="button"
              className="hora-modal-backdrop"
              aria-label="Close password modal"
              onClick={closePasswordModal}
            />
            <div className="hora-password-modal" role="dialog" aria-modal="true" aria-labelledby="hora-password-title">
              <h3 id="hora-password-title">Enter Capsule Password</h3>
              <p>
                Enter the password for <strong>{unlockingCapsule.capsuleName || "this capsule"}</strong> to open it.
              </p>
              <input
                type="password"
                value={capsulePasswordInput}
                placeholder="Capsule password"
                onChange={(event) => setCapsulePasswordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleOpenCapsule();
                  }
                }}
                autoFocus
              />
              {passwordError && <p className="hora-password-error">{passwordError}</p>}
              <div className="hora-password-actions">
                <button type="button" onClick={closePasswordModal}>
                  Cancel
                </button>
                <button type="button" onClick={handleOpenCapsule} disabled={verifyingPassword}>
                  {verifyingPassword ? "Checking..." : "Open Capsule"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
