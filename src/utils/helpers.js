import { RESULT_BADGES, SYNC_ROOM_PREFIX } from "./constants";

const QUIZ_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateId(prefix = "kmh") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateQuizCode(length = 6) {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * QUIZ_CODE_CHARS.length);
    code += QUIZ_CODE_CHARS[randomIndex];
  }

  return code;
}

export function normalizeQuizCode(value = "") {
  return value.trim().toUpperCase();
}

export function normalizeRoomCode(value = "") {
  return value.trim().toUpperCase();
}

export function createEmptyQuestion() {
  return {
    id: generateId("question"),
    questionText: "",
    options: ["", "", "", ""],
    correctOption: 0,
  };
}

export function calculatePercentage(score, totalQuestions) {
  if (!totalQuestions) {
    return 0;
  }

  return Math.round((score / totalQuestions) * 100);
}

export function getResultBadge(percentage) {
  return (
    RESULT_BADGES.find((badge) => percentage >= badge.min) ??
    RESULT_BADGES[RESULT_BADGES.length - 1]
  );
}

export function formatDateTime(timestamp) {
  if (!timestamp) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function buildAbsoluteLink(pathname) {
  if (typeof window === "undefined") {
    return pathname;
  }

  return `${window.location.origin}${pathname}`;
}

export function buildShareLink(quizCode) {
  return buildAbsoluteLink(`/play/${quizCode}`);
}

export function buildSyncShareLink(roomCode) {
  return buildAbsoluteLink(`/sync/${roomCode}`);
}

export function generateHeartCode() {
  const randomDigits = `${Math.floor(1000 + Math.random() * 9000)}`;
  return `${SYNC_ROOM_PREFIX}${randomDigits}`;
}

export function copyToClipboard(text) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.reject(new Error("Clipboard not supported."));
  }

  return navigator.clipboard.writeText(text);
}
