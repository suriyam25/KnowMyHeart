import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import SyncGame from "../components/SyncGame";
import SyncLobby from "../components/SyncLobby";
import {
  firebaseConfigErrorMessage,
  firebaseEnvDebugSnapshot,
  isFirebaseConfigured,
} from "../lib/firebase";
import { normalizeRoomCode } from "../utils/helpers";
import { createSyncQuestionSet, SYNC_QUESTION_BANK } from "../utils/syncQuestions";
import {
  clearSyncPlayerSession,
  getSyncPlayerSession,
  saveSyncPlayerSession,
} from "../utils/storage";
import {
  createRoom,
  joinRoom,
  startRoom,
  subscribeToRoom,
} from "../services/heartSyncService";

function SyncModePage() {
  const navigate = useNavigate();
  const { roomCode: routeRoomCode } = useParams();
  const normalizedRouteCode = useMemo(
    () => normalizeRoomCode(routeRoomCode ?? ""),
    [routeRoomCode]
  );

  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState(normalizedRouteCode);
  const [errorMessage, setErrorMessage] = useState("");
  const [room, setRoom] = useState(null);
  const [playerSession, setPlayerSession] = useState(() =>
    normalizedRouteCode ? getSyncPlayerSession(normalizedRouteCode) : null
  );
  const [isCheckingRoom, setIsCheckingRoom] = useState(Boolean(normalizedRouteCode));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState("");

  useEffect(() => {
    setJoinCode(normalizedRouteCode);
    setErrorMessage("");

    if (!normalizedRouteCode) {
      setRoom(null);
      setPlayerSession(null);
      setIsCheckingRoom(false);
      return;
    }

    const savedSession = getSyncPlayerSession(normalizedRouteCode);
    setPlayerSession(savedSession);
    if (savedSession?.name) {
      setPlayerName((currentValue) => currentValue || savedSession.name);
    }

    setIsCheckingRoom(true);

    try {
      const unsubscribe = subscribeToRoom(
        normalizedRouteCode,
        (nextRoom) => {
          setRoom(nextRoom);
          setIsCheckingRoom(false);

          if (!nextRoom) {
            setErrorMessage("That Heart Sync room could not be found. Check the code or create a new one.");
            clearSyncPlayerSession(normalizedRouteCode);
            return;
          }

          setErrorMessage("");
        },
        (error) => {
          setRoom(null);
          setIsCheckingRoom(false);
          setErrorMessage(error.message || "Unable to load the Heart Sync room right now.");
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      setRoom(null);
      setIsCheckingRoom(false);
      setErrorMessage(error.message || "Unable to connect to Firebase right now.");
      return undefined;
    }
  }, [normalizedRouteCode]);

  const currentPlayer = useMemo(() => {
    if (!room || !playerSession) {
      return null;
    }

    return room.players.find((player) => player.id === playerSession.playerId) ?? null;
  }, [room, playerSession]);

  const canJoinExistingRoom = Boolean(room && room.status === "waiting" && room.players.length < 2);

  const handleCreateRoom = async () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setErrorMessage("Enter your name before creating a Heart Sync room.");
      return;
    }

    try {
      setIsSubmitting(true);
      setPendingAction("create");
      setErrorMessage("");
      const { room: createdRoom, session } = await createRoom({
        playerName: trimmedName,
        questions: createSyncQuestionSet(10),
      });

      saveSyncPlayerSession(createdRoom.roomCode, session);
      setPlayerSession(session);
      setRoom(createdRoom);
      navigate(`/sync/${createdRoom.roomCode}`);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create the Heart Sync room.");
    } finally {
      setIsSubmitting(false);
      setPendingAction("");
    }
  };

  const handleJoinRoom = async () => {
    const normalizedCode = normalizeRoomCode(joinCode);
    const trimmedName = playerName.trim();

    if (!normalizedCode) {
      setErrorMessage("Enter a Heart Code to join a room.");
      return;
    }

    if (!trimmedName) {
      setErrorMessage("Enter your name before joining the room.");
      return;
    }

    try {
      setIsSubmitting(true);
      setPendingAction("join");
      setErrorMessage("");

      const existingSession = getSyncPlayerSession(normalizedCode);
      const { room: joinedRoom, session } = await joinRoom({
        roomCode: normalizedCode,
        playerName: trimmedName,
        existingSession,
      });

      saveSyncPlayerSession(normalizedCode, session);
      setPlayerSession(session);
      setRoom(joinedRoom);
      navigate(`/sync/${normalizedCode}`);
    } catch (error) {
      setErrorMessage(error.message || "Unable to join the Heart Sync room.");
    } finally {
      setIsSubmitting(false);
      setPendingAction("");
    }
  };

  const handleStartGame = async () => {
    if (!room) {
      return;
    }

    try {
      setIsSubmitting(true);
      setPendingAction("start");
      setErrorMessage("");
      const updatedRoom = await startRoom(room.roomCode);
      setRoom(updatedRoom);
    } catch (error) {
      setErrorMessage(error.message || "Unable to start the Heart Sync game.");
    } finally {
      setIsSubmitting(false);
      setPendingAction("");
    }
  };

  const handleRoomUpdate = (updatedRoom) => {
    setRoom(updatedRoom);
  };

  const shouldShowLobby = Boolean(room && currentPlayer && room.status === "waiting");
  const shouldShowGame = Boolean(room && currentPlayer && room.status !== "waiting");

  if (!isFirebaseConfigured) {
    return (
      <PageShell className="sync-page">
        <div className="container">
          <section className="empty-state glass-panel">
            <span className="eyebrow">Firebase setup required</span>
            <h1>Heart Sync needs Firebase configuration</h1>
            <p>{firebaseConfigErrorMessage}</p>
            <p>
              Local setup: create a root <code>.env</code> file from <code>.env.example</code>,
              add all <code>VITE_FIREBASE_*</code> values, keep it beside <code>package.json</code>,
              and restart <code>npm run dev</code>.
            </p>
            <p>
              Vercel setup: add the same variables in Project Settings -&gt; Environment Variables,
              redeploy, and reload this page.
            </p>
            <p>
              Do not place the file inside <code>src/</code> and do not name it <code>.env.txt</code>.
            </p>
            <p className="sync-entry__note">
              Env debug: {Object.entries(firebaseEnvDebugSnapshot.firebaseEnvLoaded)
                .map(([envKey, loaded]) => `${envKey}=${loaded ? "loaded" : "missing"}`)
                .join(" | ")}
            </p>
          </section>
        </div>
      </PageShell>
    );
  }

  if (normalizedRouteCode && isCheckingRoom) {
    return (
      <PageShell className="sync-page">
        <div className="container">
          <section className="empty-state glass-panel">
            <span className="eyebrow">Connecting</span>
            <h1>Checking your Heart Sync room...</h1>
            <p>Loading live room details from Firebase Realtime Database.</p>
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="sync-page">
      <div className="container">
        {shouldShowLobby ? (
          <SyncLobby
            currentPlayerId={currentPlayer.id}
            isStarting={isSubmitting && pendingAction === "start"}
            onStart={handleStartGame}
            room={room}
          />
        ) : null}

        {shouldShowGame ? (
          <SyncGame
            currentPlayerId={currentPlayer.id}
            onRoomUpdate={handleRoomUpdate}
            room={room}
          />
        ) : null}

        {!shouldShowLobby && !shouldShowGame ? (
          <section className="sync-entry">
            <div className="sync-entry__hero glass-panel">
              <span className="eyebrow">New mode</span>
              <h1>Heart Sync Mode</h1>
              <p>
                Create a shared room, invite your partner, and answer the same
                romantic prompts live from two phones.
              </p>
              <p className="sync-entry__note">
                Every room gets a fresh 10-question deck from a {SYNC_QUESTION_BANK.length}+ prompt bank.
              </p>

              <div className="hero-actions">
                <button
                  className="button button--primary"
                  disabled={isSubmitting}
                  onClick={handleCreateRoom}
                  type="button"
                >
                  {isSubmitting && pendingAction === "create" ? "Creating..." : "Create Room"}
                </button>
                <button
                  className="button button--ghost"
                  disabled={isSubmitting}
                  onClick={handleJoinRoom}
                  type="button"
                >
                  {isSubmitting && pendingAction === "join" ? "Joining..." : "Join Room"}
                </button>
              </div>
            </div>

            <div className="sync-entry__grid">
              <article className="sync-entry__panel glass-panel">
                <span className="eyebrow">Your details</span>
                <h2>Set your player name</h2>
                <label className="field-group">
                  <span>Name</span>
                  <input
                    className="input-field"
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Your name"
                    type="text"
                    value={playerName}
                  />
                </label>
              </article>

              <article className="sync-entry__panel glass-panel">
                <span className="eyebrow">Join by code</span>
                <h2>Use a Heart Code</h2>
                <label className="field-group">
                  <span>Heart Code</span>
                  <input
                    className="input-field"
                    onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
                    placeholder="KMH5821"
                    type="text"
                    value={joinCode}
                  />
                </label>
                {normalizedRouteCode && room ? (
                  <p className="sync-entry__note">
                    Room {room.roomCode} is live. Enter your name to join from this device.
                  </p>
                ) : null}
                {normalizedRouteCode && room && !canJoinExistingRoom && !currentPlayer ? (
                  <p className="sync-entry__note">
                    This room already has two players or the game has started.
                  </p>
                ) : null}
                <button
                  className="button button--ghost"
                  disabled={isSubmitting || (normalizedRouteCode ? !room || !canJoinExistingRoom : false)}
                  onClick={handleJoinRoom}
                  type="button"
                >
                  {isSubmitting && pendingAction === "join" ? "Joining..." : "Join Existing Room"}
                </button>
              </article>
            </div>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}

export default SyncModePage;
