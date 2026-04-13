import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import SyncGame from "../components/SyncGame";
import SyncLobby from "../components/SyncLobby";
import {
  SYNC_POLL_INTERVAL,
} from "../utils/constants";
import {
  generateHeartCode,
  generateId,
  normalizeRoomCode,
} from "../utils/helpers";
import {
  createSyncQuestionSet,
  DEFAULT_SYNC_QUESTION_SET,
  SYNC_QUESTION_BANK,
} from "../utils/syncQuestions";
import {
  getSyncPlayerSession,
  getSyncRoomByCode,
  saveSyncPlayerSession,
  saveSyncRoom,
  syncRoomCodeExists,
  updateSyncRoom,
} from "../utils/storage";

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
  const [room, setRoom] = useState(() =>
    normalizedRouteCode ? getSyncRoomByCode(normalizedRouteCode) : null
  );
  const [playerSession, setPlayerSession] = useState(() =>
    normalizedRouteCode ? getSyncPlayerSession(normalizedRouteCode) : null
  );

  useEffect(() => {
    setJoinCode(normalizedRouteCode);

    if (!normalizedRouteCode) {
      setRoom(null);
      setPlayerSession(null);
      setErrorMessage("");
      return;
    }

    const nextRoom = getSyncRoomByCode(normalizedRouteCode);
    const nextSession = getSyncPlayerSession(normalizedRouteCode);

    setRoom(nextRoom);
    setPlayerSession(nextSession);
    if (nextSession?.name) {
      setPlayerName(nextSession.name);
    }

    setErrorMessage(
      nextRoom ? "" : "That Heart Sync room could not be found. Check the code or create a new one."
    );
  }, [normalizedRouteCode]);

  useEffect(() => {
    if (!room || (Array.isArray(room.questions) && room.questions.length > 0)) {
      return;
    }

    const updatedRoom = updateSyncRoom(room.roomCode, (currentRoom) => ({
      ...currentRoom,
      questions: DEFAULT_SYNC_QUESTION_SET,
    }));

    if (updatedRoom) {
      setRoom(updatedRoom);
    }
  }, [room]);

  useEffect(() => {
    if (!normalizedRouteCode) {
      return undefined;
    }

    const syncRoomState = () => {
      const latestRoom = getSyncRoomByCode(normalizedRouteCode);
      const latestSession = getSyncPlayerSession(normalizedRouteCode);

      setRoom(latestRoom);
      setPlayerSession(latestSession);

      if (latestSession?.name) {
        setPlayerName((currentValue) => currentValue || latestSession.name);
      }

      if (!latestRoom) {
        setErrorMessage(
          "That Heart Sync room could not be found. Check the code or create a new one."
        );
      }
    };

    syncRoomState();
    const intervalId = window.setInterval(syncRoomState, SYNC_POLL_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [normalizedRouteCode]);

  const currentPlayer = useMemo(() => {
    if (!room || !playerSession) {
      return null;
    }

    return room.players.find((player) => player.id === playerSession.playerId) ?? null;
  }, [room, playerSession]);

  const handleCreateRoom = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setErrorMessage("Enter your name before creating a Heart Sync room.");
      return;
    }

    let roomCode = generateHeartCode();
    while (syncRoomCodeExists(roomCode)) {
      roomCode = generateHeartCode();
    }

    const firstPlayer = {
      id: generateId("sync-player"),
      name: trimmedName,
      joinedAt: new Date().toISOString(),
    };

    const nextRoom = {
      id: generateId("sync-room"),
      roomCode,
      players: [firstPlayer],
      questions: createSyncQuestionSet(10),
      currentRound: 1,
      currentQuestionIndex: 0,
      answererIndex: 0,
      answers: {},
      matchCount: 0,
      status: "waiting",
      roundStatus: "collecting",
      revealStartedAt: null,
      lastRoundMatch: null,
      createdAt: new Date().toISOString(),
    };

    saveSyncRoom(nextRoom);
    saveSyncPlayerSession(roomCode, {
      playerId: firstPlayer.id,
      name: firstPlayer.name,
    });
    navigate(`/sync/${roomCode}`);
  };

  const handleJoinRoom = () => {
    const normalizedCode = normalizeRoomCode(joinCode);
    if (!normalizedCode) {
      setErrorMessage("Enter a Heart Code to join a room.");
      return;
    }

    const existingRoom = getSyncRoomByCode(normalizedCode);
    if (!existingRoom) {
      setErrorMessage("That Heart Sync room could not be found. Check the code and try again.");
      return;
    }

    const savedSession = getSyncPlayerSession(normalizedCode);
    if (
      savedSession &&
      existingRoom.players.some((player) => player.id === savedSession.playerId)
    ) {
      setErrorMessage("");
      navigate(`/sync/${normalizedCode}`);
      return;
    }

    if (existingRoom.players.length >= 2) {
      setErrorMessage("This Heart Sync room is already full.");
      return;
    }

    if (existingRoom.status !== "waiting") {
      setErrorMessage("This Heart Sync game has already started.");
      return;
    }

    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setErrorMessage("Enter your name before joining the room.");
      return;
    }

    const secondPlayer = {
      id: generateId("sync-player"),
      name: trimmedName,
      joinedAt: new Date().toISOString(),
    };

    const updatedRoom = {
      ...existingRoom,
      players: [...existingRoom.players, secondPlayer],
    };

    saveSyncRoom(updatedRoom);
    saveSyncPlayerSession(normalizedCode, {
      playerId: secondPlayer.id,
      name: secondPlayer.name,
    });
    setErrorMessage("");
    navigate(`/sync/${normalizedCode}`);
  };

  const handleStartGame = () => {
    if (!room) {
      return;
    }

    const updatedRoom = updateSyncRoom(room.roomCode, (currentRoom) => {
      if (currentRoom.status !== "waiting" || currentRoom.players.length !== 2) {
        return currentRoom;
      }

      return {
        ...currentRoom,
        status: "playing",
        currentRound: 1,
        currentQuestionIndex: 0,
        answererIndex: 0,
        answers: {},
        matchCount: 0,
        roundStatus: "collecting",
        revealStartedAt: null,
        lastRoundMatch: null,
      };
    });

    if (updatedRoom) {
      setRoom(updatedRoom);
    }
  };

  const handleRoomUpdate = (updatedRoom) => {
    setRoom(updatedRoom);
  };

  const shouldShowLobby = Boolean(room && currentPlayer && room.status === "waiting");
  const shouldShowGame = Boolean(room && currentPlayer && room.status !== "waiting");

  return (
    <PageShell className="sync-page">
      <div className="container">
        {shouldShowLobby ? (
          <SyncLobby currentPlayerId={currentPlayer.id} onStart={handleStartGame} room={room} />
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
                <button className="button button--primary" onClick={handleCreateRoom} type="button">
                  Create Room
                </button>
                <button className="button button--ghost" onClick={handleJoinRoom} type="button">
                  Join Room
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
                <button className="button button--ghost" onClick={handleJoinRoom} type="button">
                  Join Existing Room
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
