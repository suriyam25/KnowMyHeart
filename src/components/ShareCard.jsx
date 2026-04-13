import { Link } from "react-router-dom";
import { buildShareLink, copyToClipboard } from "../utils/helpers";

function ShareCard({ quiz, onCreateAnother }) {
  const shareLink = buildShareLink(quiz.quizCode);

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareLink);
    } catch {
      window.alert("Unable to copy the link automatically on this device.");
    }
  };

  return (
    <section className="share-card glass-panel">
      <span className="eyebrow">Quiz ready to share</span>
      <h1>{quiz.quizTitle}</h1>
      <p>
        Share the quiz code or send the direct play link so your partner can see
        how well they know your heart.
      </p>

      <div className="share-grid">
        <article className="share-box">
          <span>Quiz code</span>
          <strong>{quiz.quizCode}</strong>
        </article>
        <article className="share-box">
          <span>Created by</span>
          <strong>{quiz.creatorName}</strong>
        </article>
      </div>

      <label className="field-group">
        <span>Shareable link</span>
        <div className="inline-field">
          <input className="input-field" readOnly type="text" value={shareLink} />
          <button className="button button--primary" onClick={handleCopyLink} type="button">
            Copy Link
          </button>
        </div>
      </label>

      <div className="share-actions">
        <Link className="button button--ghost" to={`/play/${quiz.quizCode}`}>
          Preview Quiz
        </Link>
        <button className="button button--text" onClick={onCreateAnother} type="button">
          Create Another Quiz
        </button>
      </div>
    </section>
  );
}

export default ShareCard;
