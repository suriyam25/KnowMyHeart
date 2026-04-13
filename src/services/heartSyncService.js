import { get, onValue, ref, runTransaction } from "firebase/database";
import { realtimeDatabase, isFirebaseConfigured, missingFirebaseConfigKeys } from "../lib/firebase";
import { generateHeartCode, generateId, normalizeRoomCode } from "../utils/helpers";
import { DEFAULT_SYNC_QUESTION_SET } from "../utils/syncQuestions";

function createRoomError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function assertDatabaseReady() {
  if (!isFirebaseConfigured || !realtimeDatabase) {
    throw createRoomError(
      "FIREBASE_NOT_CONFIGURED",
      `Firebase is not configured. Missing: ${missingFirebaseConfigKeys.join(", ")}`
    );
  }
}

function getRoomRef(roomCode) {
  assertDatabaseReady();
  return ref(realtimeDatabase, `rooms/${normalizeRoomCode(roomCode)}`);
}

function hasSubmittedAnswer(answers, playerId) {
  return Object.prototype.hasOwnProperty.call(answers ?? {}, playerId);
}

function getRoomQuestions(room) {
  if (Array.isArray(room?.questions) && room.questions.length > 0) {
    return room.questions;
  }

  return DEFAULT_SYNC_QUESTION_SET;
}

function normalizeRoom(room) {
  if (!room) {
    return null;
  }

  return {
    ...room,
    roomCode: normalizeRoomCode(room.roomCode ?? ""),
    players: Array.isArray(room.players) ? room.players.filter(Boolean) : [],
    questions: getRoomQuestions(room),
    answers: room.answers && typeof room.answers === "object" ? room.answers : {},
    currentRound: room.currentRound ?? 1,
    currentQuestionIndex: room.currentQuestionIndex ?? 0,
    answererIndex: room.answererIndex ?? 0,
    matchCount: room.matchCount ?? 0,
    status: room.status ?? "waiting",
    roundStatus: room.roundStatus ?? "collecting",
    revealStartedAt: room.revealStartedAt ?? null,
    lastRoundMatch: room.lastRoundMatch ?? null,
    result: room.result ?? null,
    createdAt: room.createdAt ?? Date.now(),
    updatedAt: room.updatedAt ?? null,
    finishedAt: room.finishedAt ?? null,
  };
}

function buildRoomResult(room) {
  const questions = getRoomQuestions(room);
  const totalRounds = questions.length;
  const percentage = totalRounds
    ? Math.round((room.matchCount / totalRounds) * 100)
    : 0;

  return {
    totalRounds,
    matchCount: room.matchCount,
    percentage,
  };
}

async function runRoomTransaction(roomCode, updater) {
  const normalizedCode = normalizeRoomCode(roomCode);
  const roomRef = getRoomRef(normalizedCode);
  let transactionError = null;

  const result = await runTransaction(roomRef, (currentRoom) => {
    const normalizedRoom = normalizeRoom(currentRoom);
    const nextRoom = updater(normalizedRoom, (code, message) => {
      transactionError = createRoomError(code, message);
      return undefined;
    });

    return nextRoom;
  });

  if (!result.committed) {
    throw transactionError ?? createRoomError("ROOM_UPDATE_FAILED", "Unable to update the room.");
  }

  return normalizeRoom(result.snapshot.val());
}

export async function getRoom(roomCode) {
  const snapshot = await get(getRoomRef(roomCode));
  return normalizeRoom(snapshot.val());
}

export function subscribeToRoom(roomCode, onRoomChange, onError) {
  const roomRef = getRoomRef(roomCode);

  return onValue(
    roomRef,
    (snapshot) => {
      onRoomChange(normalizeRoom(snapshot.val()));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createRoom({ playerName, questions }) {
  const trimmedName = playerName.trim();
  if (!trimmedName) {
    throw createRoomError("INVALID_PLAYER_NAME", "Enter your name before creating a room.");
  }

  const hostSession = {
    playerId: generateId("sync-player"),
    name: trimmedName,
  };

  const roomQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions
      : DEFAULT_SYNC_QUESTION_SET;

  for (let attemptIndex = 0; attemptIndex < 8; attemptIndex += 1) {
    const roomCode = generateHeartCode();
    const roomRef = getRoomRef(roomCode);
    const now = Date.now();
    const nextRoom = {
      roomCode,
      createdAt: now,
      updatedAt: now,
      status: "waiting",
      roundStatus: "collecting",
      currentRound: 1,
      currentQuestionIndex: 0,
      answererIndex: 0,
      answers: {},
      matchCount: 0,
      lastRoundMatch: null,
      revealStartedAt: null,
      result: null,
      players: [
        {
          id: hostSession.playerId,
          name: hostSession.name,
          joinedAt: now,
        },
      ],
      questions: roomQuestions,
    };

    const result = await runTransaction(roomRef, (currentRoom) => {
      if (currentRoom) {
        return;
      }

      return nextRoom;
    });

    if (result.committed) {
      return {
        room: normalizeRoom(result.snapshot.val()),
        session: hostSession,
      };
    }
  }

  throw createRoomError("ROOM_CODE_COLLISION", "Unable to generate a unique Heart Code. Try again.");
}

export async function joinRoom({ roomCode, playerName, existingSession }) {
  const trimmedName = playerName.trim();
  if (!trimmedName) {
    throw createRoomError("INVALID_PLAYER_NAME", "Enter your name before joining the room.");
  }

  const normalizedCode = normalizeRoomCode(roomCode);
  const session = existingSession?.playerId
    ? {
        playerId: existingSession.playerId,
        name: existingSession.name || trimmedName,
      }
    : {
        playerId: generateId("sync-player"),
        name: trimmedName,
      };

  const room = await runRoomTransaction(normalizedCode, (currentRoom, fail) => {
    if (!currentRoom) {
      return fail("ROOM_NOT_FOUND", "That Heart Sync room could not be found. Check the code and try again.");
    }

    const players = currentRoom.players ?? [];
    const existingPlayer = players.find((player) => player.id === session.playerId);

    if (existingPlayer) {
      return {
        ...currentRoom,
        players: players.map((player) =>
          player.id === session.playerId
            ? { ...player, name: existingPlayer.name }
            : player
        ),
      };
    }

    if (currentRoom.status !== "waiting") {
      return fail("ROOM_STARTED", "This Heart Sync game has already started.");
    }

    if (players.length >= 2) {
      return fail("ROOM_FULL", "This Heart Sync room is already full.");
    }

    return {
      ...currentRoom,
      players: [
        ...players,
        {
          id: session.playerId,
          name: trimmedName,
          joinedAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    };
  });

  return {
    room,
    session: {
      playerId: session.playerId,
      name: room.players.find((player) => player.id === session.playerId)?.name ?? trimmedName,
    },
  };
}

export async function startRoom(roomCode) {
  return runRoomTransaction(roomCode, (currentRoom, fail) => {
    if (!currentRoom) {
      return fail("ROOM_NOT_FOUND", "That Heart Sync room could not be found.");
    }

    if (currentRoom.status !== "waiting") {
      return currentRoom;
    }

    if ((currentRoom.players ?? []).length !== 2) {
      return fail("ROOM_NOT_READY", "Both players must join before the game can start.");
    }

    return {
      ...currentRoom,
      status: "playing",
      roundStatus: "collecting",
      currentRound: 1,
      currentQuestionIndex: 0,
      answererIndex: 0,
      answers: {},
      matchCount: 0,
      lastRoundMatch: null,
      revealStartedAt: null,
      result: null,
      updatedAt: Date.now(),
    };
  });
}

export async function updateRoom(roomCode, updater) {
  return runRoomTransaction(roomCode, (currentRoom, fail) => {
    if (!currentRoom) {
      return fail("ROOM_NOT_FOUND", "That Heart Sync room could not be found.");
    }

    return updater(currentRoom, fail);
  });
}

export async function submitAnswer(roomCode, playerId, optionIndex) {
  return runRoomTransaction(roomCode, (currentRoom, fail) => {
    if (!currentRoom) {
      return fail("ROOM_NOT_FOUND", "That Heart Sync room could not be found.");
    }

    if (currentRoom.status !== "playing" || currentRoom.roundStatus !== "collecting") {
      return currentRoom;
    }

    const players = currentRoom.players ?? [];
    if (!players.some((player) => player.id === playerId)) {
      return fail("PLAYER_NOT_IN_ROOM", "This player is not part of the room.");
    }

    const answers = currentRoom.answers ?? {};
    if (hasSubmittedAnswer(answers, playerId)) {
      return currentRoom;
    }

    const nextAnswers = {
      ...answers,
      [playerId]: optionIndex,
    };

    const bothAnswered =
      players.length === 2 &&
      players.every((player) => hasSubmittedAnswer(nextAnswers, player.id));

    if (!bothAnswered) {
      return {
        ...currentRoom,
        answers: nextAnswers,
        updatedAt: Date.now(),
      };
    }

    const answerer = players[currentRoom.answererIndex] ?? players[0];
    const guesser = players.find((player) => player.id !== answerer?.id) ?? players[1];
    const match =
      answerer && guesser
        ? nextAnswers[answerer.id] === nextAnswers[guesser.id]
        : false;

    return {
      ...currentRoom,
      answers: nextAnswers,
      roundStatus: "revealed",
      revealStartedAt: Date.now(),
      lastRoundMatch: match,
      matchCount: currentRoom.matchCount + (match ? 1 : 0),
      updatedAt: Date.now(),
    };
  });
}

export async function advanceRound(roomCode) {
  return runRoomTransaction(roomCode, (currentRoom, fail) => {
    if (!currentRoom) {
      return fail("ROOM_NOT_FOUND", "That Heart Sync room could not be found.");
    }

    if (currentRoom.status !== "playing" || currentRoom.roundStatus !== "revealed") {
      return currentRoom;
    }

    const totalRounds = getRoomQuestions(currentRoom).length;
    const isLastRound = currentRoom.currentQuestionIndex >= totalRounds - 1;

    if (isLastRound) {
      const result = buildRoomResult(currentRoom);
      return {
        ...currentRoom,
        status: "finished",
        result,
        finishedAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return {
      ...currentRoom,
      currentQuestionIndex: currentRoom.currentQuestionIndex + 1,
      currentRound: currentRoom.currentRound + 1,
      answererIndex: currentRoom.answererIndex === 0 ? 1 : 0,
      answers: {},
      roundStatus: "collecting",
      revealStartedAt: null,
      lastRoundMatch: null,
      updatedAt: Date.now(),
    };
  });
}

export async function finishRoom(roomCode) {
  return runRoomTransaction(roomCode, (currentRoom, fail) => {
    if (!currentRoom) {
      return fail("ROOM_NOT_FOUND", "That Heart Sync room could not be found.");
    }

    const result = buildRoomResult(currentRoom);
    return {
      ...currentRoom,
      status: "finished",
      result,
      finishedAt: Date.now(),
      updatedAt: Date.now(),
    };
  });
}
