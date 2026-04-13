function SyncQuestionCard({
  question,
  roundNumber,
  totalRounds,
  roleLabel,
  prompt,
  selectedOption,
  disabled,
  waitingForPartner,
  onAnswer,
  matchCount,
}) {
  const progress = `${((roundNumber / totalRounds) * 100).toFixed(0)}%`;

  return (
    <article className="question-card sync-question-card glass-panel">
      <div className="sync-question-card__header">
        <div className="sync-question-card__copy">
          <span className="eyebrow">Round {roundNumber} of {totalRounds}</span>
          <h2>{question.questionText}</h2>
          <p className="sync-question-card__prompt">{prompt}</p>
        </div>

        <div className="sync-role-chip">
          <span>{roleLabel}</span>
          <strong>{matchCount} matches</strong>
        </div>
      </div>

      <div className="progress-track" aria-hidden="true">
        <span style={{ width: progress }} />
      </div>

      <div className="answer-stack">
        {question.options.map((option, index) => (
          <button
            className={`answer-button ${selectedOption === index ? "answer-button--selected" : ""}`.trim()}
            disabled={disabled}
            key={`${question.id}-${index}`}
            onClick={() => onAnswer(index)}
            type="button"
          >
            <span className="answer-button__index">0{index + 1}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {waitingForPartner ? (
        <div className="sync-wait-banner">
          <strong>Waiting for your partner to answer...</strong>
          <span>Your choice is locked in for this round.</span>
        </div>
      ) : null}
    </article>
  );
}

export default SyncQuestionCard;
