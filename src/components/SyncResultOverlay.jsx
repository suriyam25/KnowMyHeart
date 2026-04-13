function SyncResultOverlay({ isOpen, isMatch, answerText }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`feedback-overlay feedback-overlay--${isMatch ? "correct" : "wrong"}`}>
      <div className={`feedback-burst ${isMatch ? "feedback-burst--heart" : "feedback-burst--broken"}`}>
        <span className="feedback-burst__icon">{isMatch ? "♥" : "💔"}</span>
      </div>
      <p>
        {isMatch
          ? `Heart sync! You matched on "${answerText}".`
          : `Not this round. The picked answer was "${answerText}".`}
      </p>
    </div>
  );
}

export default SyncResultOverlay;
