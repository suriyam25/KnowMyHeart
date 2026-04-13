function QuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  locked,
  selectedOption,
  onAnswer,
}) {
  const progress = `${((currentQuestion / totalQuestions) * 100).toFixed(0)}%`;

  return (
    <article className="question-card glass-panel">
      <div className="question-card__progress">
        <div>
          <span className="eyebrow">Question {currentQuestion} of {totalQuestions}</span>
          <h2>{question.questionText}</h2>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: progress }} />
        </div>
      </div>

      <div className="answer-stack">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          return (
            <button
              className={`answer-button ${isSelected ? "answer-button--selected" : ""}`.trim()}
              disabled={locked}
              key={`${question.id}-${index}`}
              onClick={() => onAnswer(index)}
              type="button"
            >
              <span className="answer-button__index">0{index + 1}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export default QuestionCard;
