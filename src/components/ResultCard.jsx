import { Link } from "react-router-dom";
import { PASS_PERCENTAGE } from "../utils/constants";
import { copyToClipboard, getResultBadge } from "../utils/helpers";

function ResultCard({ result, onRetry }) {
  const { attempt, quiz } = result;
  const badge = getResultBadge(attempt.percentage);
  const passed = attempt.percentage >= PASS_PERCENTAGE;

  const handleShareResult = async () => {
    const resultText = `${attempt.playerName} scored ${attempt.score}/${attempt.totalQuestions} on "${quiz.quizTitle}" created by ${quiz.creatorName} in KnowMyHeart.`;

    try {
      await copyToClipboard(resultText);
    } catch {
      window.alert("Unable to copy the result text automatically on this device.");
    }
  };

  return (
    <section className={`result-card glass-panel ${passed ? "result-card--win" : "result-card--loss"}`}>
      <div className="result-card__top">
        <span className={`result-badge ${passed ? "result-badge--win" : "result-badge--loss"}`}>
          {badge.label}
        </span>
        <h1>{passed ? "Love quiz passed" : "More heart homework needed"}</h1>
        <p>
          {passed
            ? "You crossed the magic mark and unlocked the celebration."
            : "Aww... more heart homework needed 💔"}
        </p>
      </div>

      <div className="result-creator-banner">
        <span>A quiz created by</span>
        <strong>{quiz.creatorName}</strong>
      </div>

      <div className="result-stats">
        <article>
          <span>Player</span>
          <strong>{attempt.playerName}</strong>
        </article>
        <article>
          <span>Creator</span>
          <strong>{quiz.creatorName}</strong>
        </article>
        <article>
          <span>Score</span>
          <strong>
            {attempt.score}/{attempt.totalQuestions}
          </strong>
        </article>
        <article>
          <span>Percentage</span>
          <strong>{attempt.percentage}%</strong>
        </article>
      </div>

      <div className="result-summary">
        <h2>{quiz.quizTitle}</h2>
        <p>
          {passed
            ? "Your partner knows your heart pretty well."
            : `You needed ${PASS_PERCENTAGE}% to unlock the full celebration. Hit retry and try again.`}
        </p>
        {passed && quiz.finalMessage ? (
          <blockquote className="love-note">{quiz.finalMessage}</blockquote>
        ) : null}
      </div>

      <div className="result-actions">
        <button className="button button--primary" onClick={onRetry} type="button">
          Retry Quiz
        </button>
        <button className="button button--ghost" onClick={handleShareResult} type="button">
          Copy Result
        </button>
        <Link className="button button--text" to="/">
          Back Home
        </Link>
      </div>
    </section>
  );
}

export default ResultCard;
