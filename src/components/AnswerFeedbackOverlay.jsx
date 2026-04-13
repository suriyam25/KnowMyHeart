function AnswerFeedbackOverlay({ feedback }) {
  if (!feedback) {
    return null;
  }

  const isCorrect = feedback === "correct";

  return (
    <div className={`feedback-overlay feedback-overlay--${feedback}`}>
      <div className={`feedback-burst ${isCorrect ? "feedback-burst--heart" : "feedback-burst--broken"}`}>
        {isCorrect ? (
          <>
            <span className="feedback-burst__spark feedback-burst__spark--one">♥</span>
            <span className="feedback-burst__spark feedback-burst__spark--two">♥</span>
            <span className="feedback-burst__spark feedback-burst__spark--three">♥</span>
            <span className="feedback-burst__spark feedback-burst__spark--four">♥</span>
          </>
        ) : null}
        <span className="feedback-burst__icon">{isCorrect ? "♥" : "💔"}</span>
      </div>
      <p>{isCorrect ? "Heart unlocked" : "Oops, heartbreak moment"}</p>
    </div>
  );
}

export default AnswerFeedbackOverlay;
