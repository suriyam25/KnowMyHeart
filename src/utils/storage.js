import {
  ACTIVE_PLAY_STORAGE_KEY,
  ATTEMPTS_STORAGE_KEY,
  LATEST_RESULT_STORAGE_KEY,
  QUIZZES_STORAGE_KEY,
  SYNC_PLAYER_SESSION_KEY_PREFIX,
  SYNC_ROOMS_STORAGE_KEY,
} from "./constants";

function canUseStorage(storageType = "localStorage") {
  return typeof window !== "undefined" && Boolean(window[storageType]);
}

function readJson(storageType, key, fallbackValue) {
  if (!canUseStorage(storageType)) {
    return fallbackValue;
  }

  try {
    const rawValue = window[storageType].getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeJson(storageType, key, value) {
  if (!canUseStorage(storageType)) {
    return;
  }

  window[storageType].setItem(key, JSON.stringify(value));
}

export function getQuizzes() {
  return readJson("localStorage", QUIZZES_STORAGE_KEY, []);
}

export function saveQuiz(quiz) {
  const quizzes = getQuizzes();
  const updatedQuizzes = [quiz, ...quizzes];
  writeJson("localStorage", QUIZZES_STORAGE_KEY, updatedQuizzes);
  return quiz;
}

export function quizCodeExists(quizCode) {
  return getQuizzes().some((quiz) => quiz.quizCode === quizCode);
}

export function getQuizByCode(quizCode) {
  return (
    getQuizzes().find((quiz) => quiz.quizCode === quizCode) ?? null
  );
}

export function getAttempts() {
  return readJson("localStorage", ATTEMPTS_STORAGE_KEY, []);
}

export function saveAttempt(attempt) {
  const attempts = getAttempts();
  const updatedAttempts = [attempt, ...attempts];
  writeJson("localStorage", ATTEMPTS_STORAGE_KEY, updatedAttempts);
  return attempt;
}

export function saveLatestResult(resultPayload) {
  writeJson("localStorage", LATEST_RESULT_STORAGE_KEY, resultPayload);
}

export function getLatestResult() {
  return readJson("localStorage", LATEST_RESULT_STORAGE_KEY, null);
}

export function clearLatestResult() {
  if (!canUseStorage("localStorage")) {
    return;
  }

  window.localStorage.removeItem(LATEST_RESULT_STORAGE_KEY);
}

export function saveActivePlayState(state) {
  writeJson("sessionStorage", ACTIVE_PLAY_STORAGE_KEY, state);
}

export function getActivePlayState() {
  return readJson("sessionStorage", ACTIVE_PLAY_STORAGE_KEY, null);
}

export function clearActivePlayState() {
  if (!canUseStorage("sessionStorage")) {
    return;
  }

  window.sessionStorage.removeItem(ACTIVE_PLAY_STORAGE_KEY);
}

export function getSyncRooms() {
  return readJson("localStorage", SYNC_ROOMS_STORAGE_KEY, []);
}

export function getSyncRoomByCode(roomCode) {
  return getSyncRooms().find((room) => room.roomCode === roomCode) ?? null;
}

export function saveSyncRoom(room) {
  const rooms = getSyncRooms().filter((currentRoom) => currentRoom.roomCode !== room.roomCode);
  const updatedRooms = [room, ...rooms];
  writeJson("localStorage", SYNC_ROOMS_STORAGE_KEY, updatedRooms);
  return room;
}

export function updateSyncRoom(roomCode, updater) {
  const rooms = getSyncRooms();
  const roomIndex = rooms.findIndex((room) => room.roomCode === roomCode);

  if (roomIndex === -1) {
    return null;
  }

  const currentRoom = rooms[roomIndex];
  const updatedRoom = updater(currentRoom);

  if (!updatedRoom) {
    return currentRoom;
  }

  rooms[roomIndex] = updatedRoom;
  writeJson("localStorage", SYNC_ROOMS_STORAGE_KEY, rooms);
  return updatedRoom;
}

export function syncRoomCodeExists(roomCode) {
  return getSyncRooms().some((room) => room.roomCode === roomCode);
}

export function getSyncPlayerSession(roomCode) {
  return readJson(
    "sessionStorage",
    `${SYNC_PLAYER_SESSION_KEY_PREFIX}-${roomCode}`,
    null
  );
}

export function saveSyncPlayerSession(roomCode, session) {
  writeJson(
    "sessionStorage",
    `${SYNC_PLAYER_SESSION_KEY_PREFIX}-${roomCode}`,
    session
  );
}
