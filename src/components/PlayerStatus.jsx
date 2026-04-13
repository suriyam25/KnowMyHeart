function PlayerStatus({ players, currentPlayerId }) {
  return (
    <div className="player-status-list">
      {["Player 1", "Player 2"].map((label, index) => {
        const player = players[index];
        const isCurrentPlayer = player?.id === currentPlayerId;

        return (
          <article className="player-status-card" key={label}>
            <span>{label}</span>
            <strong>{player?.name ?? "Waiting for partner..."}</strong>
            <small>{isCurrentPlayer ? "This is you" : player ? "Connected" : "Open spot"}</small>
          </article>
        );
      })}
    </div>
  );
}

export default PlayerStatus;
