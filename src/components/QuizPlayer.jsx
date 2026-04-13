import { useEffect, useState } from "react";
import { FEEDBACK_DURATION } from "../utils/constants";
import {
  calculatePercentage,
  generateId,
  normalizeQuizCode,
} from "../utils/helpers";
import {
  clearActivePlayState,
  getActivePlayState,
  getQuizByCode,
  saveActivePlayState,
  saveAttempt,
  saveLatestResult,
} from "../utils/storage";
import AnswerFeedbackOverlay from "./AnswerFeedbackOverlay";
import QuestionCard from "./QuestionCard";

function QuizPlayer({ initialQuizCode = "", onComplete }) {
  const [playerName, setPlayerName] = useState("");
  const [quizCode, setQuizCode] = useState(normalizeQuizCode(initialQuizCode));
  const [quiz, setQuiz] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [stage, setStage] = useState("setup");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [restoredSession, setRestoredSession] = useState(false);

  useEffect(() => {
    const activeState = getActivePlayState();
    if (!activeState) {
      return;
    }

    const routeQuizCode = normalizeQuizCode(initialQuizCode);
    if (routeQuizCode && activeState.quizCode !== routeQuizCode) {
      return;
    }

    const savedQuiz = getQuizByCode(activeState.quizCode);
    if (!savedQuiz) {
      clearActivePlayState();
      return;
    }

    setQuiz(savedQuiz);
    setQuizCode(activeState.quizCode);
    setPlayerName(activeState.playerName);
    setCurrentIndex(activeState.currentIndex);
    setScore(activeState.score);
    setStage(activeState.stage);
    setRestoredSession(activeState.stage === "playing");
  }, [initialQuizCode]);

  useEffect(() => {
    if (!initialQuizCode) {
      return;
    }

    const savedQuiz = getQuizByCode(normalizeQuizCode(initialQuizCode));
    if (!savedQuiz) {
      setLookupError("That love quiz could not be found. Double-check the code or link.");
      return;
    }

    setQuiz(savedQuiz);
    setQuizCode(savedQuiz.quizCode);
    setLookupError("");
  }, [initialQuizCode]);

  useEffect(() => {
    if (stage !== "playing" || !quiz) {
      return;
    }

    saveActivePlayState({
      quizCode,
      playerName,
      currentIndex,
      score,
      stage,
    });
  }, [currentIndex, playerName, quiz, quizCode, score, stage]);

  const loadQuiz = () => {
    const normalizedCode = normalizeQuizCode(quizCode);

    if (!normalizedCode) {
      setLookupError("Enter a quiz code to continue.");
      return null;
    }

    const savedQuiz = getQuizByCode(normalizedCode);
    if (!savedQuiz) {
      setLookupError("That love quiz could not be found. Double-check the code or link.");
      setQuiz(null);
      return null;
    }

    setQuiz(savedQuiz);
    setQuizCode(savedQuiz.quizCode);
    setLookupError("");
    return savedQuiz;
  };

  const handleStartQuiz = () => {
    if (!playerName.trim()) {
      setLookupError("Enter your name before starting the quiz.");
      return;
    }

    const loadedQuiz = quiz ?? loadQuiz();
    if (!loadedQuiz) {
      return;
    }

    setLookupError("");
    setStage("playing");
  };

  const handleAnswer = (optionIndex) => {
    if (!quiz || feedback) {
      return;
    }

    const currentQuestion = quiz.questions[currentIndex];
    const isCorrect = currentQuestion.correctOption === optionIndex;
    const updatedScore = score + (isCorrect ? 1 : 0);

    setScore(updatedScore);
    setSelectedOption(optionIndex);
    setFeedback(isCorrect ? "correct" : "wrong");

    window.setTimeout(() => {
      const isLastQuestion = currentIndex === quiz.questions.length - 1;

      if (isLastQuestion) {
        const attempt = {
          id: generateId("attempt"),
          quizCode: quiz.quizCode,
          playerName: playerName.trim(),
          score: updatedScore,
          totalQuestions: quiz.questions.length,
          percentage: calculatePercentage(updatedScore, quiz.questions.length),
          playedAt: new Date().toISOString(),
        };

        const resultPayload = { attempt: saveAttempt(attempt), quiz };
        saveLatestResult(resultPayload);
        clearActivePlayState();
        onComplete(resultPayload);
        return;
      }

      setCurrentIndex((currentValue) => currentValue + 1);
      setSelectedOption(null);
      setFeedback("");
    }, FEEDBACK_DURATION);
  };

  if (stage === "playing" && quiz) {
    return (
      <div className="quiz-player">
        {restoredSession ? (
          <p className="resume-banner">
            Your in-progress quiz was restored for this browser session.
          </p>
        ) : null}

        <div className="player-summary glass-panel">
          <div>
            <span className="eyebrow">Now playing</span>
            <h1>{quiz.quizTitle}</h1>
            <p>
              By {quiz.creatorName} · Playing as {playerName}
            </p>
          </div>
          <div className="score-pill">
            <span>Score</span>
            <strong>
              {score}/{quiz.questions.length}
            </strong>
          </div>
        </div>

        <QuestionCard
          currentQuestion={currentIndex + 1}
          locked={Boolean(feedback)}
          onAnswer={handleAnswer}
          question={quiz.questions[currentIndex]}
          selectedOption={selectedOption}
          totalQuestions={quiz.questions.length}
        />
        <AnswerFeedbackOverlay feedback={feedback} />
      </div>
    );
  }

  return (
    <section className="player-setup glass-panel">
      <span className="eyebrow">Play a quiz</span>
      <h1>Step into your partner&apos;s love quiz</h1>
      <p>
        Enter your name, paste the quiz code, and answer the questions one by one.
      </p>

      <div className="form-grid">
        <label className="field-group">
          <span>Your name</span>
          <input
            className="input-field"
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Your name"
            type="text"
            value={playerName}
          />
        </label>

        <label className="field-group">
          <span>Quiz code</span>
          <div className="inline-field">
            <input
              className="input-field"
              onChange={(event) => setQuizCode(normalizeQuizCode(event.target.value))}
              placeholder="Enter quiz code"
              type="text"
              value={quizCode}
            />
            <button className="button button--ghost" onClick={loadQuiz} type="button">
              Load Quiz
            </button>
          </div>
        </label>
      </div>

      {quiz ? (
        <div className="quiz-preview-card">
          <strong>{quiz.quizTitle}</strong>
          <span>
            {quiz.questions.length} questions · by {quiz.creatorName}
          </span>
        </div>
      ) : null}

      {lookupError ? <p className="form-error">{lookupError}</p> : null}

      <div className="form-actions">
        <button className="button button--primary" onClick={handleStartQuiz} type="button">
          Start Quiz
        </button>
      </div>
    </section>
  );
}

export default QuizPlayer;
