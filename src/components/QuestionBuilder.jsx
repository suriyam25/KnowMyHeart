function QuestionBuilder({
  question,
  index,
  canRemove,
  onChange,
  onRemove,
}) {
  const updateOption = (optionIndex, value) => {
    const updatedOptions = question.options.map((option, currentIndex) =>
      currentIndex === optionIndex ? value : option
    );

    onChange(question.id, { options: updatedOptions });
  };

  return (
    <article className="builder-card glass-panel">
      <div className="builder-card__header">
        <div>
          <span className="builder-label">Question {index + 1}</span>
          <h3>Build a sweet little challenge</h3>
        </div>

        {canRemove ? (
          <button
            className="button button--text"
            onClick={() => onRemove(question.id)}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>

      <label className="field-group">
        <span>Question text</span>
        <textarea
          className="input-field input-field--area"
          onChange={(event) =>
            onChange(question.id, { questionText: event.target.value })
          }
          placeholder="Ask something only your partner should know."
          rows={3}
          value={question.questionText}
        />
      </label>

      <div className="option-grid">
        {question.options.map((option, optionIndex) => (
          <div className="option-editor" key={optionIndex}>
            <label className="field-group">
              <span>Option {optionIndex + 1}</span>
              <input
                className="input-field"
                onChange={(event) => updateOption(optionIndex, event.target.value)}
                placeholder={`Choice ${optionIndex + 1}`}
                type="text"
                value={option}
              />
            </label>

            <label className="correct-choice">
              <input
                checked={question.correctOption === optionIndex}
                name={`correct-option-${question.id}`}
                onChange={() =>
                  onChange(question.id, { correctOption: optionIndex })
                }
                type="radio"
              />
              <span>Correct answer</span>
            </label>
          </div>
        ))}
      </div>
    </article>
  );
}

export default QuestionBuilder;
