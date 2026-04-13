import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const FIREBASE_ENV_KEY_MAP = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  databaseURL: "VITE_FIREBASE_DATABASE_URL",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

export const missingFirebaseConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const missingFirebaseEnvVars = missingFirebaseConfigKeys.map(
  (key) => FIREBASE_ENV_KEY_MAP[key]
);

export const isFirebaseConfigured = missingFirebaseConfigKeys.length === 0;

export const firebaseEnvDebugSnapshot = {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  baseUrl: import.meta.env.BASE_URL,
  firebaseEnvLoaded: Object.fromEntries(
    Object.entries(FIREBASE_ENV_KEY_MAP).map(([configKey, envKey]) => [
      envKey,
      Boolean(firebaseConfig[configKey]),
    ])
  ),
};

export const firebaseConfigErrorMessage = isFirebaseConfigured
  ? ""
  : [
      "Firebase environment variables are missing or not loaded.",
      `Missing config keys: ${missingFirebaseConfigKeys.join(", ")}`,
      `Missing Vite env vars: ${missingFirebaseEnvVars.join(", ")}`,
      "Add them to a project-root .env file for local development or to Vercel Project Settings -> Environment Variables, then restart the Vite dev server or redeploy.",
    ].join(" ");

if (typeof window !== "undefined") {
  if (!window.__KMH_FIREBASE_ENV_DEBUG_LOGGED__) {
    if (import.meta.env.DEV) {
      console.log("ENV CHECK:", import.meta.env);
    }

    if (isFirebaseConfigured && import.meta.env.DEV) {
      console.info("[KnowMyHeart] Firebase env check:", firebaseEnvDebugSnapshot);
    } else if (!isFirebaseConfigured) {
      if (import.meta.env.DEV) {
        console.error("Firebase ENV not loaded. Did you restart Vite?");
      }

      console.error("[KnowMyHeart] Firebase env check failed:", {
        ...firebaseEnvDebugSnapshot,
        message: firebaseConfigErrorMessage,
      });
    }

    window.__KMH_FIREBASE_ENV_DEBUG_LOGGED__ = true;
  }
}

export const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const realtimeDatabase = firebaseApp ? getDatabase(firebaseApp) : null;
