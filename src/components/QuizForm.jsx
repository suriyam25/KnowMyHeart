import { useMemo, useState } from "react";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "../utils/constants";
import { createEmptyQuestion } from "../utils/helpers";
import QuestionBuilder from "./QuestionBuilder";

const INITIAL_FORM_STATE = {
  creatorName: "",
  quizTitle: "",
  finalMessage: "",
  questions: Array.from({ length: MIN_QUESTIONS }, () => createEmptyQuestion()),
};

function QuizForm({ onCreate }) {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState("");

  const questionCountLabel = useMemo(
    () => `${formState.questions.length}/${MAX_QUESTIONS} questions`,
    [formState.questions.length]
  );

  const updateField = (field, value) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

  const updateQuestion = (questionId, changes) => {
    setFormState((currentState) => ({
      ...currentState,
      questions: currentState.questions.map((question) =>
        question.id === questionId ? { ...question, ...changes } : question
      ),
    }));
  };

  const addQuestion = () => {
    if (formState.questions.length >= MAX_QUESTIONS) {
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      questions: [...currentState.questions, createEmptyQuestion()],
    }));
  };

  const removeQuestion = (questionId) => {
    if (formState.questions.length <= MIN_QUESTIONS) {
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      questions: currentState.questions.filter((question) => question.id !== questionId),
    }));
  };

  const validateForm = () => {
    if (!formState.creatorName.trim()) {
      return "Add the quiz creator name.";
    }

    if (!formState.quizTitle.trim()) {
      return "Add a title for the quiz.";
    }

    if (formState.questions.length < MIN_QUESTIONS) {
      return `Add at least ${MIN_QUESTIONS} questions.`;
    }

    for (let index = 0; index < formState.questions.length; index += 1) {
      const question = formState.questions[index];

      if (!question.questionText.trim()) {
        return `Question ${index + 1} needs question text.`;
      }

      const emptyOption = question.options.findIndex((option) => !option.trim());
      if (emptyOption !== -1) {
        return `Question ${index + 1} has an empty option.`;
      }
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      setSubmitError(errorMessage);
      return;
    }

    setSubmitError("");

    onCreate({
      creatorName: formState.creatorName.trim(),
      quizTitle: formState.quizTitle.trim(),
      finalMessage: formState.finalMessage.trim(),
      questions: formState.questions.map((question) => ({
        ...question,
        questionText: question.questionText.trim(),
        options: question.options.map((option) => option.trim()),
      })),
    });
  };

  return (
    <form className="quiz-form" onSubmit={handleSubmit}>
      <div className="form-header glass-panel">
        <div>
          <span className="eyebrow">Create your quiz</span>
          <h1>Design a playful love test</h1>
          <p>
            Build five to ten multiple-choice questions, pick the right answers,
            and generate a shareable link instantly.
          </p>
        </div>

        <div className="form-header__meta">
          <span>{questionCountLabel}</span>
          <span>No login needed</span>
          <span>Saved locally</span>
        </div>
      </div>

      <div className="form-grid">
        <label className="field-group">
          <span>Creator name</span>
          <input
            className="input-field"
            onChange={(event) => updateField("creatorName", event.target.value)}
            placeholder="Your name"
            type="text"
            value={formState.creatorName}
          />
        </label>

        <label className="field-group">
          <span>Quiz title</span>
          <input
            className="input-field"
            onChange={(event) => updateField("quizTitle", event.target.value)}
            placeholder="How well do you know me?"
            type="text"
            value={formState.quizTitle}
          />
        </label>
      </div>

      <label className="field-group">
        <span>Final love message (optional)</span>
        <textarea
          className="input-field input-field--area"
          onChange={(event) => updateField("finalMessage", event.target.value)}
          placeholder="Leave a sweet message for the celebration screen."
          rows={4}
          value={formState.finalMessage}
        />
      </label>

      <div className="builder-stack">
        {formState.questions.map((question, index) => (
          <QuestionBuilder
            canRemove={formState.questions.length > MIN_QUESTIONS}
            index={index}
            key={question.id}
            onChange={updateQuestion}
            onRemove={removeQuestion}
            question={question}
          />
        ))}
      </div>

      <div className="form-actions">
        <button
          className="button button--ghost"
          onClick={addQuestion}
          type="button"
        >
          Add Question
        </button>

        <button className="button button--primary" type="submit">
          Generate Love Quiz
        </button>
      </div>

      {submitError ? <p className="form-error">{submitError}</p> : null}
    </form>
  );
}

export default QuizForm;
