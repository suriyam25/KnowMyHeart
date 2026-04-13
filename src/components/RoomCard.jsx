import { buildSyncShareLink, copyToClipboard } from "../utils/helpers";

function RoomCard({ roomCode }) {
  const shareLink = buildSyncShareLink(roomCode);

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareLink);
    } catch {
      window.alert("Unable to copy the Heart Sync link automatically on this device.");
    }
  };

  return (
    <article className="room-card glass-panel">
      <span className="eyebrow">Heart Sync room</span>
      <h2>{roomCode}</h2>
      <p>Share this code or link so your partner can join from their phone.</p>

      <label className="field-group">
        <span>Shareable link</span>
        <div className="inline-field">
          <input className="input-field" readOnly type="text" value={shareLink} />
          <button className="button button--primary" onClick={handleCopyLink} type="button">
            Copy Link
          </button>
        </div>
      </label>
    </article>
  );
}

export default RoomCard;
