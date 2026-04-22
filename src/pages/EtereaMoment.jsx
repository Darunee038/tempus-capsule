import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

import "../styles/eterea.css";
import Navbar from "../components/Navbar";
import { notify } from "../utils/notify";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, collection, query, where, onSnapshot } from "firebase/firestore";

export default function EtereaMoment() {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]);


  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "etereaCapsules"),
      where("members", "array-contains", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("capsules", data);
      setCapsules(data);
    });

    return () => unsub();
  }, []);

  const opened = capsules.filter(c => {
    if (!c.openAt) return false;
    return new Date(c.openAt.seconds * 1000) <= new Date();
  });

  const locked = capsules.filter(c => {
    if (!c.openAt) return true;
    return new Date(c.openAt.seconds * 1000) > new Date();
  });

  const handleJoin = async (joinCode) => {
    const roomRef = doc(db, "etereaRooms", joinCode);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      notify.info("Invalid code");
      return;
    }

    if (!auth.currentUser) {
      notify.info("Please login first");
      return;
    }

    const uid = auth.currentUser.uid;
    await updateDoc(roomRef, {
      members: arrayUnion(uid),
      [`memberInfo.${uid}`]: {
        role: "member",
        joinedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });


    navigate(`/feature/eterea/create?roomCode=${joinCode}`);
  };


  const handleCreateRoom = async () => {
    if (!auth.currentUser) {
      notify.info("Please login first");
      return;
    }

    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const uid = auth.currentUser.uid;

    await setDoc(doc(db, "etereaRooms", code), {
      code: code,
      ownerId: uid,
      members: [uid],
      memberInfo: {
        [uid]: {
          role: "owner",
          joinedAt: serverTimestamp(),
        },
      },
      createdAt: serverTimestamp(),
    });

    return code;
  };

  return (
    <div className="et-page">
      <div className="et-bg">
        {/* NAV */}
        <Navbar variant="et" activeFeature="eterea" />

        {/* CONTENT */}
        <main className="et-main">
          <h1 className="et-title">EtereaMoment</h1>

          <section className="et-section">
            <h3 className="et-section-title">Opened Capsules</h3>
            <div className="et-grid">
              {opened.length === 0 ? (
                <div className="et-empty">No opened capsules yet</div>
              ) : opened.map(c => (
                <div  key={c.id} >
                  <div className="et-card et-card-hasimg">
                    <h4>{c.capsuleName}</h4>
                    <img src={c.image} alt={c.title} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="et-section">
            <h3 className="et-section-title">Locked Capsules</h3>
            <div className="et-grid">
              {locked.length === 0 ? (
                <div className="et-empty">No locked capsules yet</div>
              ) : locked.map(c => (
                <div
                  key={c.id}
                >
                  <div className="et-card et-card-hasimg">
                    <h4>{c.capsuleName}</h4>
                    <img src={c.image} alt={c.title} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="et-join">
            <div className="et-join-title">Join Group</div>

            <form className="et-join-bar" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const joinCode = formData.get("joinCode");
              handleJoin(joinCode);
            }}>
              <input className="et-join-input" name="joinCode" placeholder="Enter Code" />
              <button className="et-join-btn" type="submit">Join</button>
            </form>
          </div>

          {/* <Link to="/feature/eterea/create" className="et-create-btn">
            Create Capsule
          </Link> */}

          <button
            className="et-create-btn"
            onClick={async () => {
              const code = await handleCreateRoom();

              if (!code) return;

              navigate(`/feature/eterea/create?roomCode=${code}`);
            }}
          >
            Create Capsule
          </button>

        </main>
      </div>
    </div>
  );
}
