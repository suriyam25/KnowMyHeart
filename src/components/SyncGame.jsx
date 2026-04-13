import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrokenHeartEffect from "./BrokenHeartEffect";
import FloatingHearts from "./FloatingHearts";
import HeartBloom from "./HeartBloom";
import SyncQuestionCard from "./SyncQuestionCard";
import SyncResultOverlay from "./SyncResultOverlay";
import {
  PASS_PERCENTAGE,
  SYNC_REVEAL_DURATION,
} from "../utils/constants";
import { calculatePercentage, getResultBadge } from "../utils/helpers";
import { advanceRound, submitAnswer } from "../services/heartSyncService";
import { DEFAULT_SYNC_QUESTION_SET } from "../utils/syncQuestions";

function hasSubmittedAnswer(answers, playerId) {
  return Object.prototype.hasOwnProperty.call(answers ?? {}, playerId);
}

function getRoomQuestions(room) {
  if (Array.isArray(room.questions) && room.questions.length > 0) {
    return room.questions;
  }

  return DEFAULT_SYNC_QUESTION_SET;
}

function SyncGame({ room, currentPlayerId, onRoomUpdate }) {
  const [roundError, setRoundError] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const questionSet = getRoomQuestions(room);
  const players = room.players;
  const currentPlayer = players.find((player) => player.id === currentPlayerId);
  const answerer = players[room.answererIndex] ?? players[0];
  const guesser = players.find((player) => player.id !== answerer?.id) ?? players[1];
  const currentQuestion = questionSet[room.currentQuestionIndex];
  const currentAnswers = room.answers ?? {};
  const currentPlayerAnswer = hasSubmittedAnswer(currentAnswers, currentPlayerId)
    ? currentAnswers[currentPlayerId]
    : null;
  const bothAnswered =
    players.length === 2 &&
    players.every((player) => hasSubmittedAnswer(currentAnswers, player.id));

  const isAnswerer = answerer?.id === currentPlayerId;
  const waitingForPartner = currentPlayerAnswer !== null && !bothAnswered;
  const isRevealOpen = room.roundStatus === "revealed";
  const isMatch = answerer && guesser
    ? currentAnswers[answerer.id] === currentAnswers[guesser.id]
    : false;
  const revealedOptionIndex = answerer ? currentAnswers[answerer.id] : null;
  const revealedAnswerText =
    revealedOptionIndex !== null && currentQuestion
      ? currentQuestion.options[revealedOptionIndex]
      : "";
  const totalRounds = questionSet.length;

  useEffect(() => {
    if (room.roundStatus !== "collecting") {
      setIsSubmittingAnswer(false);
    }
  }, [room.roundStatus]);

  useEffect(() => {
    if (room.status !== "playing" || room.roundStatus !== "revealed") {
      return undefined;
    }

    const revealEndsAt = (room.revealStartedAt ?? 0) + SYNC_REVEAL_DURATION;
    const delay = Math.max(revealEndsAt - Date.now(), 0);

    const timeoutId = window.setTimeout(() => {
      advanceRound(room.roomCode)
        .then((updatedRoom) => {
          onRoomUpdate?.(updatedRoom);
        })
        .catch((error) => {
          setRoundError(error.message);
        });
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [onRoomUpdate, room]);

  if (!currentPlayer || !currentQuestion) {
    return null;
  }

  const handleAnswer = async (optionIndex) => {
    if (room.status !== "playing" || room.roundStatus !== "collecting") {
      return;
    }

    try {
      setRoundError("");
      setIsSubmittingAnswer(true);
      const updatedRoom = await submitAnswer(room.roomCode, currentPlayerId, optionIndex);
      onRoomUpdate?.(updatedRoom);
    } catch (error) {
      setRoundError(error.message);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  if (room.status === "finished") {
    const percentage = calculatePercentage(room.matchCount, totalRounds);
    const passed = percentage >= PASS_PERCENTAGE;
    const badge = getResultBadge(percentage);

    return (
      <section className="sync-final-screen">
        {passed ? <FloatingHearts variant="love" /> : <BrokenHeartEffect />}

        <article className={`result-card glass-panel ${passed ? "result-card--win" : "result-card--loss"}`}>
          {passed ? <HeartBloom /> : null}
          <div className="result-card__top">
            <span className={`result-badge ${passed ? "result-badge--win" : "result-badge--loss"}`}>
              {badge.label}
            </span>
            <h1>{passed ? "Heart Sync unlocked" : "More syncing needed"}</h1>
            <p>
              {passed
                ? "You matched often enough to unlock the full celebration."
                : "Aww... more heart homework needed 💔"}
            </p>
          </div>

          <div className="result-stats">
            <article>
              <span>Players</span>
              <strong>{players.map((player) => player.name).join(" & ")}</strong>
            </article>
            <article>
              <span>Matches</span>
              <strong>{room.matchCount}</strong>
            </article>
            <article>
              <span>Total rounds</span>
              <strong>{totalRounds}</strong>
            </article>
            <article>
              <span>Percentage</span>
              <strong>{percentage}%</strong>
            </article>
          </div>

          <div className="result-summary">
            <h2>Heart Sync Mode</h2>
            <p>
              {passed
                ? "Your answers aligned with real couple-game energy."
                : `You needed ${PASS_PERCENTAGE}% matches to unlock the celebration. Open a new room and try another round together.`}
            </p>
          </div>

          <div className="result-actions">
            <Link className="button button--primary" to="/sync">
              New Room
            </Link>
            <Link className="button button--ghost" to="/">
              Back Home
            </Link>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="sync-game">
      <div className="player-summary glass-panel">
        <div>
          <span className="eyebrow">Heart Sync in progress</span>
          <h1>{players[0]?.name} & {players[1]?.name}</h1>
          <p>
            {isAnswerer
              ? `You are the answerer this round. ${guesser?.name ?? "Your partner"} is guessing your pick.`
              : `You are the guesser this round. Predict what ${answerer?.name ?? "your partner"} will choose.`}
          </p>
        </div>
        <div className="score-pill">
          <span>Matches</span>
          <strong>
            {room.matchCount}/{totalRounds}
          </strong>
        </div>
      </div>

      <SyncQuestionCard
        disabled={currentPlayerAnswer !== null || isRevealOpen || isSubmittingAnswer}
        matchCount={room.matchCount}
        onAnswer={handleAnswer}
        prompt={
          isAnswerer
            ? "Choose your honest answer for this question."
            : `What do you think ${answerer?.name ?? "your partner"} selected?`
        }
        question={currentQuestion}
        roleLabel={isAnswerer ? "Answerer" : "Guesser"}
        roundNumber={room.currentRound}
        selectedOption={currentPlayerAnswer}
        totalRounds={totalRounds}
        waitingForPartner={waitingForPartner}
      />

      <SyncResultOverlay
        answerText={revealedAnswerText}
        isMatch={isMatch}
        isOpen={isRevealOpen}
      />
      {roundError ? <p className="form-error">{roundError}</p> : null}
    </section>
  );
}

export default SyncGame;
