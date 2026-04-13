import RoomCard from "./RoomCard";
import PlayerStatus from "./PlayerStatus";

function SyncLobby({ room, currentPlayerId, isStarting = false, onStart }) {
  const bothJoined = room.players.length === 2;
  const isReady = bothJoined && room.status === "waiting";

  return (
    <section className="sync-lobby">
      <div className="sync-lobby__grid">
        <RoomCard roomCode={room.roomCode} />

        <article className="sync-lobby__panel glass-panel">
          <span className="eyebrow">Lobby</span>
          <h1>Heart Sync Mode</h1>
          <p>
            Join together, alternate roles every round, and see how often your
            answers line up in real time.
          </p>

          <PlayerStatus currentPlayerId={currentPlayerId} players={room.players} />

          <div className="sync-lobby__actions">
            {isReady ? (
              <button
                className="button button--primary"
                disabled={isStarting}
                onClick={onStart}
                type="button"
              >
                {isStarting ? "Starting..." : "Start Game"}
              </button>
            ) : (
              <div className="sync-waiting-state">
                <strong>Waiting for partner...</strong>
                <span>The game unlocks as soon as both players join the room.</span>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default SyncLobby;
