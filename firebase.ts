// Firebase compat library for compatibility with existing codebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Configs: prefer Vite env variables (VITE_FIREBASE_*) so projects can be swapped without editing code.
// Fallbacks keep the previous production project for backwards compatibility.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCEYSxf7X3kRE54YH62-Qu6q8xlH6IVMFw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "computing-science-2569.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://computing-science-2569-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "computing-science-2569",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "computing-science-2569.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "130179623668",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:130179623668:web:ac614bf347cc038678cca1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K76VS8HR1X",
};

// Helpful debug output so maintainers can confirm which project is active at runtime
console.info(`Firebase config active projectId=${firebaseConfig.projectId} (env override=${Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)})`);

// Initialize Firebase App
const app = firebase.initializeApp(firebaseConfig);
const env = (import.meta && (import.meta.env && import.meta.env.VITE_FIREBASE_ENV)) || undefined;
// Read raw env flags (use safer access to import.meta.env)
const _metaEnv = (import.meta && (import.meta.env)) || {} as any;
const useEmulatorFlag = Boolean(_metaEnv && _metaEnv.VITE_USE_EMULATOR === 'true');
const simulationMode = Boolean(_metaEnv && _metaEnv.VITE_SIMULATION_MODE === 'true');
const showFirebaseProject = Boolean(_metaEnv && _metaEnv.VITE_SHOW_FIREBASE_PROJECT === 'true');

// Safety: if the app is explicitly showing a real Firebase project, never enable emulator mode
const effectiveUseEmulator = useEmulatorFlag && !showFirebaseProject;
if (useEmulatorFlag && showFirebaseProject) {
  console.warn('VITE_SHOW_FIREBASE_PROJECT=true and VITE_USE_EMULATOR=true — overriding emulator to false for safety.');
}
console.log(`Firebase app initialized (env=${env || 'production'}, emulator=${effectiveUseEmulator})`);

// Configure for development (enable emulators)
const hostname = window && window.location && window.location.hostname;
// Determine emulator mode: explicit flag only (no implicit localhost auto-toggle)
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
const isEmulator = effectiveUseEmulator;

// Get service instances
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Only connect to emulators when running locally for development
if (isEmulator || simulationMode) {
  try {
    console.log('🔧 Development mode: Connecting to Firebase emulators...');
    // Suppress the Firebase SDK emulator DOM warning banner in local dev/tests.
    // NOTE: this only hides the visual warning — emulator safety checks remain (VITE_USE_EMULATOR still required).
    // The runtime accepts a second `options` arg but the TS types do not — cast to `any` to preserve intent.
    (auth as any).useEmulator('http://127.0.0.1:9099', { disableWarnings: true });
    db.useEmulator('127.0.0.1', 8080);
    storage.useEmulator('127.0.0.1', 9199);
    console.info('Firebase SDK configured to use local emulators (auth:9099, firestore:8080, storage:9199)');
  } catch (emErr) {
    console.warn('Failed to configure Firebase SDK to use emulators:', emErr);
  }
} else {
  console.log('🌐 Production mode: Connecting to real Firebase database');
}

// E2E helper for testing
try { 
  // Attach E2E helpers when running against emulators OR when simulation mode enabled
  if ((isEmulator || simulationMode) && typeof window !== 'undefined') {
    (window as any).__E2E_signIn = async (email: string, password: string) => {
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential;
      } catch (err) {
        console.error('Sign in error:', err);
        throw err;
      }
    };
    (window as any).__E2E_signOut = async () => { 
      if (auth) await auth.signOut(); 
    };
    console.info('E2E sign-in helper attached to window.__E2E_signIn (simulation=', simulationMode, ')');
  }
} catch (helperErr) {
  console.warn('Failed to attach E2E helpers to window:', helperErr);
}

console.log("Firebase services are ready.");

// Export active project id so UI/tests can surface which Firebase project is in use
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

// Also expose a read-only global for quick runtime verification in the browser (dev/staging only)
try {
  if (typeof window !== 'undefined') (window as any).__FIREBASE_PROJECT_ID = firebaseConfig.projectId;
} catch (e) {
  /* ignore in non-browser environments */
}

export { db, auth, storage };
