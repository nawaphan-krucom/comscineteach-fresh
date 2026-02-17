

/* eslint-disable react-refresh/only-export-components */
/* global process */
import React, { createContext, useContext, useEffect, ReactNode, useRef, useCallback, useReducer } from 'react';
import { ViewState } from '../types';
import type { DataContextType, User, UserProgress, AnnouncementData, QnAData, Submission, LeaderboardEntry, UnitResourceCollection, CourseUnit, QuizData, ActivityData, ShopItem, Project, StudyGroup, Notification, ResetCode, NotebookSubmission, UnitDiscussion, UnitDiscussionReply } from '../types';
import { NOTEBOOK_MAX_SCORE, FINAL_EXAM, DEFAULT_COURSE_UNITS, UNIT_ASSIGNMENTS, ACHIEVEMENTS_LIST, UNIT_QUIZZES, UNIT_ACTIVITIES, MIDTERM_EXAM, UNIT_RESOURCES, MOCK_USERS } from '../constants';
import { useError } from './ErrorContext';
import { db, auth } from '../firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/functions';
import ExcelJS from 'exceljs';

// --- Reducer Setup ---
type DataState = {
  user: User | null;
  allUsers: User[];
  connectedCollections: string[];
  userProgress: UserProgress | null;
  allProgress: Record<string, UserProgress>;
  announcements: AnnouncementData[];
  qnaList: QnAData[];
  resources: UnitResourceCollection[];
  courseUnits: CourseUnit[];
  studyGroups: StudyGroup[];
  customQuizzes: QuizData[];
  customActivities: ActivityData[];
  unitDiscussions: Record<string, UnitDiscussion[]>;
  isInitializing: boolean;
  isOnline: boolean;
  hasNewAnnouncements: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  resetCodes: ResetCode[];
  statusSummary: { users?: number; progressDocs?: number; latestSubmissionIso?: string; updatedAt?: string | null } | null;
  studentMapping: Record<string, { userId: string; matchType: string; createdAt?: string }>;
  listenerHealth: Record<string, { lastUpdate: number; status: 'active' | 'stale' }>;
};

type Action =
  | { type: 'SET_INITIALIZING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ALL_USERS'; payload: User[] }
  | { type: 'SET_USER_PROGRESS'; payload: UserProgress | null }
  | { type: 'SET_ALL_PROGRESS'; payload: Record<string, UserProgress> }
  | { type: 'UPDATE_SINGLE_PROGRESS'; payload: UserProgress }
  | { type: 'SET_ANNOUNCEMENTS'; payload: AnnouncementData[] }
  | { type: 'SET_QNA'; payload: QnAData[] }
  | { type: 'SET_RESOURCES'; payload: UnitResourceCollection[] }
  | { type: 'SET_COURSE_UNITS'; payload: CourseUnit[] }
  | { type: 'SET_STUDY_GROUPS'; payload: StudyGroup[] }
  | { type: 'SET_CUSTOM_QUIZZES'; payload: QuizData[] }
  | { type: 'SET_CUSTOM_ACTIVITIES'; payload: ActivityData[] }
  | { type: 'SET_HAS_NEW_ANNOUNCEMENTS'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_CONNECTED_COLLECTIONS'; payload: string[] }
  | { type: 'SET_STATUS_SUMMARY'; payload: { users?: number; progressDocs?: number; latestSubmissionIso?: string; updatedAt?: string | null } }
  | { type: 'SET_RESET_CODES'; payload: ResetCode[] }
  | { type: 'SET_UNIT_DISCUSSIONS'; payload: Record<string, UnitDiscussion[]> }
  | { type: 'SET_STUDENT_MAPPING'; payload: Record<string, { userId: string; matchType: string; createdAt?: string }> }
  | { type: 'UPDATE_LISTENER_HEALTH'; payload: { collectionName: string; status: 'active' | 'stale' } }


const initialState: DataState = {
  user: null,
  allUsers: [],
  connectedCollections: [],
  userProgress: null,
  allProgress: {},
  announcements: [],
  qnaList: [],
  resources: [],
  courseUnits: [],
  studyGroups: [],
  customQuizzes: [],
  customActivities: [],
  unitDiscussions: {},
  isInitializing: true,
  isOnline: !!auth && !!db,
  hasNewAnnouncements: false,
  notifications: [],
  unreadNotificationCount: 0,
  resetCodes: [],
  statusSummary: null,
  studentMapping: {},
  listenerHealth: {},
};

const dataReducer = (state: DataState, action: Action): DataState => {
  switch (action.type) {
    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ALL_USERS':
      return { ...state, allUsers: action.payload };
    case 'SET_USER_PROGRESS':
      return { ...state, userProgress: action.payload };
    case 'SET_ALL_PROGRESS': {
      const normalizedProgress = Object.fromEntries(
        Object.entries(action.payload).map(([id, prog]) => [id, {
          activities: {},
          quizzes: {},
          assignments: {},
          units: {},
          notebookScores: {},
          level: 1,
          xp: 0,
          coins: 0,
          quests: {},
          achievements: [],
          lastLogin: new Date().toISOString(),
          loginStreak: 0,
          ...prog
        }])
      );
      return { ...state, allProgress: normalizedProgress };
    }
    case 'UPDATE_SINGLE_PROGRESS': {
      const newAllProgress = { ...state.allProgress, [action.payload.studentId]: action.payload };
      return { 
          ...state, 
          allProgress: newAllProgress,
          userProgress: state.user?.id === action.payload.studentId ? action.payload : state.userProgress,
      };
    }
    case 'SET_ANNOUNCEMENTS':
      return { ...state, announcements: action.payload };
    case 'SET_QNA':
      return { ...state, qnaList: action.payload };
    case 'SET_RESOURCES':
      return { ...state, resources: action.payload };
    case 'SET_COURSE_UNITS':
      return { ...state, courseUnits: action.payload };
    case 'SET_STUDY_GROUPS':
      return { ...state, studyGroups: action.payload };
    case 'SET_CUSTOM_QUIZZES':
        return { ...state, customQuizzes: action.payload };
    case 'SET_CUSTOM_ACTIVITIES':
        return { ...state, customActivities: action.payload };
    case 'SET_HAS_NEW_ANNOUNCEMENTS':
        return { ...state, hasNewAnnouncements: action.payload };
    case 'SET_NOTIFICATIONS': {
      const unreadCount = action.payload.filter(n => !n.isRead).length;
      return { ...state, notifications: action.payload, unreadNotificationCount: unreadCount };
    }
    case 'SET_RESET_CODES':
      return { ...state, resetCodes: action.payload };
    case 'SET_CONNECTED_COLLECTIONS':
      return { ...state, connectedCollections: action.payload };
    case 'SET_STATUS_SUMMARY':
      return { ...state, statusSummary: action.payload };
    case 'UPDATE_LISTENER_HEALTH':
      return { ...state, listenerHealth: { ...state.listenerHealth, [action.payload.collectionName]: { lastUpdate: Date.now(), status: action.payload.status } } };
    default:
      return state;
  }
};

const LOCAL_STORAGE_KEY = 'cs_learning_platform_data_v8';

const createDefaultProgress = (student: User): UserProgress => ({
  studentId: student.id,
  studentName: student.name,
  avatar: student.avatar || '🧑‍🎓',
  activities: {},
  quizzes: {},
  assignments: {},
  units: {},
  notebook: {},
  notebookScores: {},
  notebookSubmissions: {},
  level: 1,
  xp: 0,
  coins: 100,
  quests: {},
  achievements: [],
  purchasedItems: { themes: [], frames: [] },
  lastLogin: new Date().toISOString().split('T')[0],
  loginStreak: 1,
  projects: [],
});

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { logError } = useError();
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, allUsers, userProgress, allProgress, announcements, qnaList, resources, courseUnits, studyGroups, isInitializing, isOnline, hasNewAnnouncements, customActivities, customQuizzes, studentMapping, notifications, unreadNotificationCount } = state; 

  const authChecked = useRef(false);
  const localDataLoaded = useRef(false);
  const connectedCollectionsRef = useRef<string[]>(state.connectedCollections || []);

  useEffect(() => {
    connectedCollectionsRef.current = state.connectedCollections || [];
  }, [state.connectedCollections]);
  
  const checkInitialization = useCallback(() => {
    if (authChecked.current && localDataLoaded.current) {
      dispatch({ type: 'SET_INITIALIZING', payload: false });
    }
  }, []);
  
  const saveToLocalStorage = useCallback((data: Record<string, unknown>) => {
      try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          const currentData = raw ? JSON.parse(raw) : {};
          const newData = { ...currentData, ...data };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      } catch (e: unknown) {
          console.error("Local Save Error:", e);
      }
  }, []);

  useEffect(() => {
    const localDataRaw = localStorage.getItem(LOCAL_STORAGE_KEY);

    // Detect whether the app is intentionally pointing at a live Firebase project.
    // When VITE_SHOW_FIREBASE_PROJECT=true we must not restore or persist cached `users`.
    let usingLiveProject = false;
    try {
      const metaEnv = new Function('return typeof import !== "undefined" && import.meta ? import.meta.env : undefined')();
      usingLiveProject = !!(metaEnv && (metaEnv as any).VITE_SHOW_FIREBASE_PROJECT === 'true');
    } catch {
      usingLiveProject = (typeof process !== 'undefined' && (process.env as any).VITE_SHOW_FIREBASE_PROJECT === 'true');
    }

    // Default to the bundled mock users in dev/test so offline flows and `?testLogin=` work reliably.
    // Production builds that use Firebase will still be able to override this via Firestore.
    let initialUsers = MOCK_USERS;
    let initialResources = UNIT_RESOURCES;
    let initialCourseUnits = DEFAULT_COURSE_UNITS;
    let loadedProgress: Record<string, UserProgress> = {};

    if (localDataRaw) {
        try {
          const data = JSON.parse(localDataRaw);
          // Only trust persisted `users` when NOT using a live project.
          if (!usingLiveProject && data.users?.length) initialUsers = data.users;

          // If using a live project, proactively remove any cached users/currentUser so they
          // cannot shadow an empty Firestore instance.
          if (usingLiveProject && data.users) {
            delete data.users;
            try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
            try { localStorage.removeItem('currentUser'); } catch { /* ignore */ }
            console.info('Cleared persisted local users/currentUser because VITE_SHOW_FIREBASE_PROJECT=true');
          }

          if (data.progress) {
            loadedProgress = data.progress;
            dispatch({ type: 'SET_ALL_PROGRESS', payload: data.progress });
          }
          if (data.announcements) dispatch({ type: 'SET_ANNOUNCEMENTS', payload: data.announcements });
          if (data.qna) dispatch({ type: 'SET_QNA', payload: data.qna });
          if (data.studyGroups) dispatch({ type: 'SET_STUDY_GROUPS', payload: data.studyGroups });
          if (data.customQuizzes) dispatch({ type: 'SET_CUSTOM_QUIZZES', payload: data.customQuizzes });
          if (data.customActivities) dispatch({ type: 'SET_CUSTOM_ACTIVITIES', payload: data.customActivities });

          const finalUnitsMap = new Map<string, CourseUnit>();
          DEFAULT_COURSE_UNITS.forEach(unit => finalUnitsMap.set(unit.id, unit));
          const localUnits: CourseUnit[] = data.courseUnits || [];
          localUnits.forEach(localUnit => {
              if (!finalUnitsMap.has(localUnit.id)) finalUnitsMap.set(localUnit.id, localUnit);
          });
          initialCourseUnits = Array.from(finalUnitsMap.values());
          
          const finalResourcesMap = new Map<string, UnitResourceCollection>();
          UNIT_RESOURCES.forEach(unit => finalResourcesMap.set(unit.unitId, unit));
          const localResources: UnitResourceCollection[] = data.resources || [];
          localResources.forEach(localUnit => {
              if (!finalResourcesMap.has(localUnit.unitId)) finalResourcesMap.set(localUnit.unitId, localUnit);
          });
          initialResources = Array.from(finalResourcesMap.values());

        } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
    dispatch({ type: 'SET_ALL_USERS', payload: initialUsers });
    dispatch({ type: 'SET_RESOURCES', payload: initialResources });
    dispatch({ type: 'SET_COURSE_UNITS', payload: initialCourseUnits });

    // If a user was persisted in localStorage (e.g. test seeding or offline teacher), restore it
    // When pointing at a live Firebase project we must NOT restore a local test user.
    try {
      if (!usingLiveProject) {
        const rawCurrent = localStorage.getItem('currentUser');
        if (rawCurrent) {
          const parsed = JSON.parse(rawCurrent);
          if (parsed && parsed.id) {
            dispatch({ type: 'SET_USER', payload: parsed });
          }
        }
      } else {
        // Clear any persisted currentUser to avoid stale/mock sessions on live projects
        try { localStorage.removeItem('currentUser'); } catch { /* ignore */ }
      }
    } catch (e) {
      console.warn('Could not parse persisted currentUser from localStorage', e);
    }

    // Save to localStorage — do NOT persist `users` when using a live Firebase project.
    const storagePayload: Record<string, unknown> = {
      resources: initialResources,
      courseUnits: initialCourseUnits,
      progress: loadedProgress
    };
    if (!usingLiveProject) storagePayload.users = initialUsers;
    saveToLocalStorage(storagePayload);
    
    localDataLoaded.current = true;
    checkInitialization();
  }, [checkInitialization, saveToLocalStorage]);

  useEffect(() => {
    console.log('🔥 DataProvider: Initializing Firebase connection...');
    console.log('📊 isOnline:', isOnline);
    console.log('🗄️ db available:', !!db);
    
    if (!isOnline || !db) {
        console.log('⚠️ DataProvider: Firebase not available, using offline mode');
        authChecked.current = true;
        checkInitialization();
        return;
    }

    const unsubAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
          if (userDoc.exists) {
            dispatch({ type: 'SET_USER', payload: userDoc.data() as User });
          } else {
            // Teacher account safety: don't auto-signout if teacher user doc is missing.
            // Create a minimal teacher profile so the app can load real Firestore data.
            function getBrowserMetaEnv() {
              try {
                // Access import.meta.env in an indirect way so CommonJS/Jest won't parse the literal token
                return new Function('return typeof import !== "undefined" && import.meta ? import.meta.env : undefined')();
              } catch {
                return undefined;
              }
            }
            const metaEnv = (getBrowserMetaEnv() as Record<string, any>) || (typeof process !== 'undefined' ? (process.env as Record<string, any>) : undefined);
            const teacherEmail = (metaEnv && (metaEnv.VITE_TEACHER_EMAIL as string)) || 'teacher@school.com';
            const isTeacher =
              (firebaseUser.email && firebaseUser.email.toLowerCase() === String(teacherEmail).toLowerCase()) ||
              (firebaseUser.email && firebaseUser.email.toLowerCase().startsWith('teacher@'));

            if (isTeacher) {
              const teacherUser: User = {
                id: firebaseUser.uid,
                username: 'teacher',
                name: 'คุณครู ผู้สอน',
                role: 'teacher',
                avatar: '👩‍🏫',
              };
              try {
                await db.collection('users').doc(firebaseUser.uid).set(teacherUser, { merge: true });
              } catch (e) {
                console.warn('Failed to create teacher user doc', (e as { code?: string })?.code || e);
              }
              dispatch({ type: 'SET_USER', payload: teacherUser });
            } else {
              dispatch({ type: 'SET_USER', payload: null });
              auth.signOut();
            }
          }
        } catch (err) {
          console.warn('Error fetching user doc during auth state change', (err as { code?: string })?.code || err);
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      authChecked.current = true;
      checkInitialization();
    });

    // Defer setting up Firestore listeners until auth check completes.
    // Listeners are created in a separate effect below that depends on `user`.
    return () => { unsubAuth(); };
  }, [isOnline, db, checkInitialization]);

  useEffect(() => {
    if (!isOnline || !db) return;
    if (!user || !auth.currentUser) return;

    // Signal to E2E tests that an authenticated session is present and listeners are being attached.
    try { if (typeof window !== 'undefined') (window as any).__E2E_AUTH_READY = true; } catch { /* ignore in non-browser env */ }

    console.log('🔴 REAL-TIME MODE ACTIVATED: Attaching Firestore listeners for continuous sync...');

    const unsubAnnounce = db.collection('announcements').orderBy('date', 'desc').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'announcements', status: 'active' } });
        dispatch({ type: 'SET_ANNOUNCEMENTS', payload: snap.docs.map(d => ({id: d.id, ...(d.data() as AnnouncementData)})) as AnnouncementData[]});
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'announcements'])) });
      },
      (err) => console.warn('Announcements listener error:', (err as { code?: string })?.code || err)
    );

    const unsubQnA = db.collection('qna').orderBy('date', 'desc').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'qna', status: 'active' } });
        dispatch({ type: 'SET_QNA', payload: snap.docs.map(d => ({id: d.id, ...(d.data() as QnAData)})) as QnAData[]});
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'qna'])) });
      },
      (err) => console.warn('QnA listener error:', (err as { code?: string })?.code || err)
    );

    const unsubUsers = db.collection('users').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'users', status: 'active' } });
        dispatch({ type: 'SET_ALL_USERS', payload: snap.docs.map(d => d.data() as User)} );
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'users'])) });
      },
      (err) => console.warn('Users listener error:', (err as { code?: string })?.code || err)
    );

    const unsubProgress = db.collection('progress').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'progress', status: 'active' } });
        const prog: Record<string, UserProgress> = {};
        snap.docs.forEach(d => { prog[d.id] = d.data() as UserProgress; });
        dispatch({ type: 'SET_ALL_PROGRESS', payload: prog });
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'progress'])) });
      },
      (err) => console.warn('Progress listener error:', (err as { code?: string })?.code || err)
    );

    const unsubGroups = db.collection('studyGroups').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'studyGroups', status: 'active' } });
        dispatch({ type: 'SET_STUDY_GROUPS', payload: snap.docs.map(d => ({id: d.id, ...d.data()})) as StudyGroup[]});
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'studyGroups'])) });
      },
      (err) => console.warn('StudyGroups listener error:', (err as { code?: string })?.code || err)
    );

    const unsubConfig = db.collection('config').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'config', status: 'active' } });
        snap.docs.forEach(doc => {
          if (doc.id === 'resources' && doc.exists) {
            const firestoreResources: UnitResourceCollection[] = doc.data()?.data || [];
            if (firestoreResources.length > 0) dispatch({ type: 'SET_RESOURCES', payload: firestoreResources });
          }
          if (doc.id === 'courseUnits' && doc.exists) {
            const firestoreUnits: CourseUnit[] = doc.data()?.data || [];
            if (firestoreUnits.length > 0) dispatch({ type: 'SET_COURSE_UNITS', payload: firestoreUnits.sort((a,b)=> a.order - b.order) });
          }
          if (doc.id === 'customQuizzes' && doc.exists) {
            dispatch({ type: 'SET_CUSTOM_QUIZZES', payload: doc.data()?.data || [] });
          }
          if (doc.id === 'customActivities' && doc.exists) {
            dispatch({ type: 'SET_CUSTOM_ACTIVITIES', payload: doc.data()?.data || [] });
          }
        });
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'config'])) });
      },
      (err) => console.warn('Config listener error:', (err as { code?: string })?.code || err)
    );

    const unsubStatus = db.doc('status/summary').onSnapshot(
      snap => {
        dispatch({ type: 'UPDATE_LISTENER_HEALTH', payload: { collectionName: 'status/summary', status: 'active' } });
        if (snap.exists) {
          const raw = snap.data() as Record<string, unknown>;
          const updatedAtRaw = raw.updatedAt as any;
          let updatedAtIso: string | null = null;
          try {
            if (updatedAtRaw && typeof updatedAtRaw.toDate === 'function') {
              updatedAtIso = updatedAtRaw.toDate().toISOString();
            } else if (typeof updatedAtRaw === 'string') {
              updatedAtIso = updatedAtRaw;
            }
          } catch {
            updatedAtIso = null;
          }
          const payload = {
            users: typeof raw.users === 'number' ? raw.users : undefined,
            progressDocs: typeof raw.progressDocs === 'number' ? raw.progressDocs : undefined,
            latestSubmissionIso: typeof raw.latestSubmissionIso === 'string' ? raw.latestSubmissionIso : undefined,
            updatedAt: updatedAtIso
          };
          dispatch({ type: 'SET_STATUS_SUMMARY', payload });
        }
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'status/summary'])) });
      },
      (err) => console.warn('Status listener error:', (err as { code?: string })?.code || err)
    );

    return () => { unsubAnnounce(); unsubQnA(); unsubUsers(); unsubProgress(); unsubConfig(); unsubGroups(); unsubStatus(); };
  }, [isOnline, db, user]);

  // LISTENER HEALTH CHECK: Periodic self-check (every 30 seconds) to detect stale listeners
  useEffect(() => {
    if (!isOnline || !db) return;
    if (!user || !auth.currentUser) return;

    const STALE_THRESHOLD = 35 * 1000; // Mark as stale if no update in 35 seconds
    const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

    const healthCheckInterval = setInterval(() => {
      const now = Date.now();
      const expectedCollections = ['announcements', 'qna', 'users', 'progress', 'studyGroups', 'config', 'status/summary', 'student_mapping'];
      
      expectedCollections.forEach(collectionName => {
        const health = state.listenerHealth[collectionName];
        if (!health) {
          console.warn(`🔴 [Listener Health] "${collectionName}" listener not yet initialized.`);
        } else if (now - health.lastUpdate > STALE_THRESHOLD) {
          console.warn(`🟡 [Listener Health] "${collectionName}" listener is STALE (last update ${Math.round((now - health.lastUpdate) / 1000)}s ago). May have disconnected.`);
        } else if (health.status === 'active') {
          console.log(`🟢 [Listener Health] "${collectionName}" is active.`);
        }
      });
    }, CHECK_INTERVAL);

    return () => clearInterval(healthCheckInterval);
  }, [isOnline, db, user, state.listenerHealth]);

  // Optional: connect to a local SSE proxy for near-real-time updates when available.
  // This allows the app to receive data without Firebase Auth (useful for local teacher workflows).
  // NOTE: SSE proxy is opt-in. Set VITE_SSE_PROXY_URL in your env (e.g. http://localhost:3000) to enable.
  useEffect(() => {
    // Only attempt proxy if we have no auth session (to avoid duplicate listeners).
    if (auth?.currentUser) return;

    let proxyBase: string | undefined;
    try {
      // Access import.meta.env dynamically to avoid syntax errors in non-ESM test environments.
      const env = new Function('return typeof import !== "undefined" && import.meta ? import.meta.env : undefined')();
      proxyBase = env?.VITE_SSE_PROXY_URL;
    } catch {
      // When running under Jest / Node (non-ESM env) import.meta may be unavailable.
      proxyBase = (typeof process !== 'undefined' && (process.env as any).VITE_SSE_PROXY_URL) || undefined;
    }
    if (!proxyBase) return; // SSE proxy disabled by default

    const PROXY_URL = `${proxyBase.replace(/\/$/, '')}/events`;
    let es: EventSource | null = null;
    try {
      es = new EventSource(PROXY_URL);
    } catch {
      console.debug('SSE proxy not available at', PROXY_URL);
      return;
    }

    const onMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        if (data && Array.isArray(data.records)) {
          // Build maps similar to Firestore onSnapshot handlers
          const usersArr = data.records.map(r => (r.user ? r.user : { id: r.studentId, username: r.studentId, name: r.studentName, role: 'student', avatar: r.progress?.avatar || '🧑‍🎓' }));
          const progMap: Record<string, UserProgress> = {};
          data.records.forEach(r => { progMap[r.studentId] = r.progress; });

          dispatch({ type: 'SET_ALL_USERS', payload: usersArr });
          dispatch({ type: 'SET_ALL_PROGRESS', payload: progMap });
          dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'proxy'])) });
          console.log('Realtime proxy: received', data.count, 'records');
        }
      } catch (err) {
        console.warn('Error parsing SSE proxy message', err);
      }
    };

    const onError = (err: unknown) => {
      console.debug('SSE proxy connection error', (err as { message?: string })?.message || err);
    };

    es.addEventListener('message', onMessage);
    es.addEventListener('error', (ev: Event) => onError(ev));

    return () => {
      if (es) {
        es.removeEventListener('message', onMessage);
        es.removeEventListener('error', (ev: Event) => onError(ev));
        es.close();
      }
    };
  }, [auth?.currentUser]);

  // Realtime: student -> progress mapping (auto-generated mapping collection)
  // Only attach this listener when we have a real authenticated Firebase session to avoid
  // permission-denied errors when running in offline/test-login mode (localStorage seeded).
  useEffect(() => {
    if (!isOnline || !db) return;
    if (!user || !auth?.currentUser) {
      console.debug('Skipping student_mapping listener: no authenticated Firebase session');
      return;
    }

    try {
      const unsub = db.collection('student_mapping').onSnapshot(snap => {
        const map: Record<string, { userId: string; matchType: string; createdAt?: string }> = {};
        snap.docs.forEach(d => {
          const data = d.data() || {};
          map[d.id] = { userId: data.userId || data.mappedUserDoc || '', matchType: data.matchType || 'auto', createdAt: data.createdAt || undefined };
        });
        dispatch({ type: 'SET_STUDENT_MAPPING', payload: map });
        dispatch({ type: 'SET_CONNECTED_COLLECTIONS', payload: Array.from(new Set([...(connectedCollectionsRef.current || []), 'student_mapping'])) });
      }, (err) => console.warn('student_mapping snapshot error', (err as { code?: string })?.code || err));

      return () => { unsub(); };
    } catch (e) {
      console.debug('student_mapping listener unavailable', e);
    }
  }, [isOnline, db, user, auth?.currentUser]);

  useEffect(() => {
    if (user) {
      const prog = allProgress[user.id];
      if (prog) dispatch({ type: 'SET_USER_PROGRESS', payload: prog });
      else if (user.role === 'student') dispatch({ type: 'SET_USER_PROGRESS', payload: createDefaultProgress(user) });
    } else {
      dispatch({ type: 'SET_USER_PROGRESS', payload: null });
    }
  }, [user, allProgress]);

  const markAnnouncementsAsSeen = useCallback(() => {
    if (!user) return;
    const latestTimestamp = announcements.length > 0
        ? Math.max(...announcements.map(a => new Date(a.date).getTime()))
        : Date.now();
    localStorage.setItem(`lastSeenAnnouncement_${user.id}`, String(latestTimestamp));
    dispatch({ type: 'SET_HAS_NEW_ANNOUNCEMENTS', payload: false });
  }, [user, announcements]);

  useEffect(() => {
    if (user && user.role === 'student' && announcements.length > 0) {
      const lastSeenTimestamp = parseInt(localStorage.getItem(`lastSeenAnnouncement_${user.id}`) || '0', 10);
      const latestTimestamp = Math.max(...announcements.map(a => new Date(a.date).getTime()));
      dispatch({ type: 'SET_HAS_NEW_ANNOUNCEMENTS', payload: latestTimestamp > lastSeenTimestamp });
    } else if (user) {
      dispatch({ type: 'SET_HAS_NEW_ANNOUNCEMENTS', payload: false });
    }
  }, [user, announcements]);

  useEffect(() => {
    if (!user || isInitializing) return;

    const readNotificationIds = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
    
    let generatedNotifications: Notification[] = [];

    announcements.forEach(ann => {
        const timestamp = new Date(ann.date).getTime();
        generatedNotifications.push({
            id: `ann-${ann.id}`,
            type: 'announcement',
            message: `ประกาศใหม่: ${ann.text.substring(0, 30)}...`,
            link: ViewState.COMMUNICATION,
            timestamp: timestamp,
            isRead: readNotificationIds.includes(`ann-${ann.id}`) || timestamp < (Date.now() - 30 * 24 * 60 * 60 * 1000)
        });
    });

    if (user.role === 'student' && userProgress) {
        UNIT_ASSIGNMENTS.forEach(assign => {
            const deadline = new Date(assign.deadline).getTime();
            const daysLeft = (deadline - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysLeft > 0 && daysLeft < 3) {
                 generatedNotifications.push({
                    id: `deadline-${assign.id}`,
                    studentId: user.id,
                    type: 'deadline',
                    message: `การบ้าน "${assign.title}" ใกล้จะถึงกำหนดส่งแล้ว!`,
                    link: ViewState.ASSIGNMENT,
                    linkTarget: assign.unitId,
                    timestamp: Date.now(),
                    isRead: readNotificationIds.includes(`deadline-${assign.id}`)
                });
            }
        });

        Object.values(userProgress.assignments).forEach((sub: Submission) => {
            if (sub.status === 'graded' && sub.score !== undefined) {
                 generatedNotifications.push({
                    id: `graded-${sub.assignmentId}`,
                    studentId: user.id,
                    type: 'grading',
                    message: `ครูตรวจการบ้าน "${UNIT_ASSIGNMENTS.find(a => a.id === sub.assignmentId)?.title}" แล้ว ได้ ${sub.score} คะแนน`,
                    link: ViewState.ASSIGNMENT,
                    linkTarget: UNIT_ASSIGNMENTS.find(a => a.id === sub.assignmentId)?.unitId,
                    timestamp: new Date(sub.submittedAt).getTime() + 1,
                    isRead: readNotificationIds.includes(`graded-${sub.assignmentId}`)
                });
            }
            const assignment = UNIT_ASSIGNMENTS.find(a => a.id === sub.assignmentId);
            if (assignment) {
                const notifId = `student-sub-${sub.assignmentId}-${new Date(sub.submittedAt).getTime()}`;
                generatedNotifications.push({
                    id: notifId,
                    type: 'submission',
                    message: `คุณส่งงาน "${assignment.title}" สำเร็จแล้ว`,
                    link: ViewState.ASSIGNMENT,
                    linkTarget: assignment.unitId,
                    studentId: user.id,
                    assignmentId: sub.assignmentId,
                    timestamp: new Date(sub.submittedAt).getTime(),
                    isRead: readNotificationIds.includes(notifId)
                });
            }
        });

        qnaList.forEach(qna => {
            if (qna.studentId === user.id && qna.answer && qna.answeredAt) {
                generatedNotifications.push({
                    id: `qna-${qna.id}`,
                    studentId: user.id,
                    type: 'qna',
                    message: `ครูตอบคำถามของคุณแล้ว: "${qna.question.substring(0, 20)}..."`,
                    link: ViewState.COMMUNICATION,
                    qnaId: qna.id,
                    timestamp: new Date(qna.answeredAt).getTime(),
                    isRead: readNotificationIds.includes(`qna-${qna.id}`)
                });
            }
        });

        (userProgress.achievements || []).forEach(achId => {
            const achievementData = ACHIEVEMENTS_LIST.find(a => a.id === achId);
            if(achievementData) {
                generatedNotifications.push({
                    id: `ach-${achId}`,
                    studentId: user.id,
                    type: 'achievement',
                    message: `ยินดีด้วย! คุณได้รับเหรียญรางวัล: ${achievementData.title}`,
                    link: ViewState.ACHIEVEMENTS,
                    timestamp: Date.now() - Math.random() * 100000,
                    isRead: readNotificationIds.includes(`ach-${achId}`)
                });
            }
        });

        Object.entries(userProgress.quizzes || {}).forEach(([quizId, result]) => {
            const quizResult = result as { submitted: boolean; submittedAt: string };
            if (quizResult.submitted && quizResult.submittedAt) {
                const quiz = [...UNIT_QUIZZES, MIDTERM_EXAM, FINAL_EXAM, ...customQuizzes].find(q => q.id === quizId);
                if (quiz) {
                    const notifId = `student-quiz-${quizId}-${new Date(quizResult.submittedAt).getTime()}`;
                    generatedNotifications.push({ id: notifId, type: 'submission', message: `คุณทำแบบทดสอบ "${quiz.title}" เสร็จแล้ว`, link: ViewState.HOME, timestamp: new Date(quizResult.submittedAt).getTime(), isRead: readNotificationIds.includes(notifId) });
                }
            }
        });
        Object.entries(userProgress.activities || {}).forEach(([activityId, result]) => {
            const activityResult = result as { submitted: boolean; submittedAt: string };
            if (activityResult.submitted && activityResult.submittedAt) {
                const activity = [...UNIT_ACTIVITIES, ...customActivities].find(a => a.id === activityId);
                if (activity) {
                    const notifId = `student-act-${activityId}-${new Date(activityResult.submittedAt).getTime()}`;
                    generatedNotifications.push({ id: notifId, type: 'submission', message: `คุณทำกิจกรรม "${activity.title}" สำเร็จแล้ว`, link: ViewState.HOME, timestamp: new Date(activityResult.submittedAt).getTime(), isRead: readNotificationIds.includes(notifId) });
                }
            }
        });
        Object.entries(userProgress.notebookSubmissions || {}).forEach(([unitId, submission]) => {
            const notebookSubmission = submission as NotebookSubmission;
            if (notebookSubmission.submittedAt) {
                const unit = courseUnits.find(u => u.id === unitId);
                if (unit) {
                    const notifId = `student-note-${unitId}-${notebookSubmission.submittedAt}`;
                    generatedNotifications.push({ id: notifId, type: 'submission', message: `คุณส่งสมุดบันทึกสำหรับ "${unit.title}" แล้ว`, link: ViewState.NOTEBOOK, timestamp: notebookSubmission.submittedAt, isRead: readNotificationIds.includes(notifId) });
                }
            }
        });

    }

    if (user.role === 'teacher') {
        Object.values(allProgress).forEach((progress: UserProgress) => {
            if (!progress) return;

            Object.values(progress.assignments || {}).forEach((sub: Submission) => {
                if (sub.status === 'pending') {
                    const assignment = UNIT_ASSIGNMENTS.find(a => a.id === sub.assignmentId);
                    if (assignment) {
                        const notifId = `sub-${progress.studentId}-${sub.assignmentId}-${new Date(sub.submittedAt).getTime()}`;
                        generatedNotifications.push({ id: notifId, type: 'submission', message: `${progress.studentName} ได้ส่งการบ้าน "${assignment.title}"`, link: ViewState.TEACHER_DASHBOARD, linkTarget: 'grading', studentId: progress.studentId, assignmentId: sub.assignmentId, timestamp: new Date(sub.submittedAt).getTime(), isRead: readNotificationIds.includes(notifId) });
                    }
                }
            });

            Object.entries(progress.quizzes || {}).forEach(([quizId, result]) => {
                const quizResult = result as { submitted: boolean; submittedAt: string };
                if (quizResult.submitted && quizResult.submittedAt) {
                    const quiz = [...UNIT_QUIZZES, MIDTERM_EXAM, FINAL_EXAM, ...customQuizzes].find(q => q.id === quizId);
                    if (quiz) {
                        const notifId = `teacher-quiz-${progress.studentId}-${quizId}-${new Date(quizResult.submittedAt).getTime()}`;
                        generatedNotifications.push({ id: notifId, type: 'submission', message: `${progress.studentName} ทำแบบทดสอบ "${quiz.title}" เสร็จแล้ว`, link: ViewState.TEACHER_DASHBOARD, studentId: progress.studentId, timestamp: new Date(quizResult.submittedAt).getTime(), isRead: readNotificationIds.includes(notifId) });
                    }
                }
            });
            Object.entries(progress.activities || {}).forEach(([activityId, result]) => {
                const activityResult = result as { submitted: boolean; submittedAt: string };
                if (activityResult.submitted && activityResult.submittedAt) {
                    const activity = [...UNIT_ACTIVITIES, ...customActivities].find(a => a.id === activityId);
                    if (activity) {
                        const notifId = `teacher-act-${progress.studentId}-${activityId}-${new Date(activityResult.submittedAt).getTime()}`;
                        generatedNotifications.push({ id: notifId, type: 'submission', message: `${progress.studentName} ทำกิจกรรม "${activity.title}" เสร็จแล้ว`, link: ViewState.TEACHER_DASHBOARD, studentId: progress.studentId, timestamp: new Date(activityResult.submittedAt).getTime(), isRead: readNotificationIds.includes(notifId) });
                    }
                }
            });
            Object.entries(progress.notebookSubmissions || {}).forEach(([unitId, submission]) => {
                const notebookSubmission = submission as NotebookSubmission;
                if (notebookSubmission.submittedAt && !notebookSubmission.score) { // Only notify if not graded yet
                    const unit = courseUnits.find(u => u.id === unitId);
                    if (unit) {
                        const notifId = `teacher-note-${progress.studentId}-${unitId}-${notebookSubmission.submittedAt}`;
                        generatedNotifications.push({ id: notifId, type: 'submission', message: `${progress.studentName} ส่งสมุดบันทึก "${unit.title}"`, link: ViewState.TEACHER_DASHBOARD, studentId: progress.studentId, timestamp: notebookSubmission.submittedAt, isRead: readNotificationIds.includes(notifId) });
                    }
                }
            });
        });
    }

    generatedNotifications.sort((a, b) => b.timestamp - a.timestamp);
    dispatch({ type: 'SET_NOTIFICATIONS', payload: generatedNotifications });

  }, [user, userProgress, allProgress, announcements, qnaList, courseUnits, isInitializing]);

  const markNotificationAsRead = useCallback((id: string) => {
    if (!user) return;
    const readNotificationIds = JSON.parse(localStorage.getItem(`read_notifications_${user.id}`) || '[]');
    if (!readNotificationIds.includes(id)) {
        const newReadIds = [...readNotificationIds, id];
        localStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(newReadIds));

        const newNotifications = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: newNotifications });
    }
  }, [user, notifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    if (!user) return;
    const allNotificationIds = notifications.map(n => n.id);
    localStorage.setItem(`read_notifications_${user.id}`, JSON.stringify(allNotificationIds));

    const newNotifications = notifications.map(n => ({ ...n, isRead: true }));
    dispatch({ type: 'SET_NOTIFICATIONS', payload: newNotifications });
  }, [user, notifications]);

  const updateProgress = useCallback(async (prog: UserProgress) => {
    const originalProgress = allProgress[prog.studentId];
    
    if(isOnline && db) {
      try {
        // ใช้ set with merge เพื่อให้แน่ใจว่าข้อมูล nested objects ถูกอัปเดตถูกต้อง
        // set(..., { merge: true }) จะ merge nested objects อัตโนมัติ
        await db.collection('progress').doc(prog.studentId).set(prog, { merge: true });
        console.log(`✅ Progress saved to Firebase for ${prog.studentId}:`, {
          activities: Object.keys(prog.activities || {}).length,
          quizzes: Object.keys(prog.quizzes || {}).length,
          assignments: Object.keys(prog.assignments || {}).length,
          notebookScores: Object.keys(prog.notebookScores || {}).length
        });
        
        // อัปเดต state หลังจากบันทึกลง Firebase สำเร็จ
        dispatch({ type: 'UPDATE_SINGLE_PROGRESS', payload: prog });
      } catch (error) {
        console.error("Error updating progress online:", error);
        logError("บันทึกข้อมูลไม่สำเร็จ กำลังย้อนกลับการเปลี่ยนแปลง", "error");
        if (originalProgress) {
            dispatch({ type: 'UPDATE_SINGLE_PROGRESS', payload: originalProgress });
        }
        throw error;
      }
    } else {
        // Offline: อัปเดต state ก่อน แล้วบันทึกลง localStorage
        dispatch({ type: 'UPDATE_SINGLE_PROGRESS', payload: prog });
        const currentProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}').progress || {};
        saveToLocalStorage({ progress: { ...currentProgress, [prog.studentId]: prog } });
    }
  }, [isOnline, db, logError, allProgress, saveToLocalStorage]);

  const login = useCallback(async (u: User) => {
    // Teacher: prefer Firebase sign-in so data loads from Firestore immediately.
    // If Firebase sign-in fails, still create local teacher user so the app can continue.
    if (u.username === 'teacher') {
        const teacherUser: User = { 
            id: 'TCH001', 
            username: 'teacher', 
            name: 'คุณครู ผู้สอน', 
            role: 'teacher', 
            avatar: '👩‍🏫' 
        };
        
        if (isOnline && auth) {
            try {
                const email = u.username.includes('@') ? u.username : `${u.username}@school.com`;
                await auth.signInWithEmailAndPassword(email, u.password || 'teacher1234');
                // Firebase auth state change will set user from Firestore, but set local user as fallback
                dispatch({ type: 'SET_USER', payload: teacherUser });
                localStorage.setItem('currentUser', JSON.stringify(teacherUser));
                return true;
            } catch (error: unknown) {
              console.log('Firebase auth error (teacher):', (error as { code?: string; message?: string })?.code || error);
                // Still create local teacher user so app continues; auto sign-in will retry in App.tsx
                dispatch({ type: 'SET_USER', payload: teacherUser });
                localStorage.setItem('currentUser', JSON.stringify(teacherUser));
                // Don't show error - let auto sign-in in App.tsx handle it silently
                return true;
            }
        }
        // Offline: use local teacher account
        dispatch({ type: 'SET_USER', payload: teacherUser });
        localStorage.setItem('currentUser', JSON.stringify(teacherUser));
        return true;
    }

    if (!isOnline || !auth) {
        const foundUser = allUsers.find(user => user.username === u.username && user.password === u.password);
        if (foundUser) {
            dispatch({ type: 'SET_USER', payload: foundUser });
            return true;
        }
        return false;
    }

    try {
        const email = u.username.includes('@') ? u.username : `${u.username}@school.com`;
        await auth.signInWithEmailAndPassword(email, u.password!);
        return true; 
    } catch (error: unknown) {
      // If Firebase sign-in fails, fall back to any matching local user (best-effort).
      // This makes developer & CI flows (where Firebase users don't exist) deterministic
      // while preserving the primary online auth path.
      if ((error as { code?: string })?.code && (String((error as { code?: string }).code).startsWith('auth/'))) {
        console.log('Firebase auth error:', (error as { message?: string })?.message);
      } else {
        logError('เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดลองอีกครั้ง', 'error');
      }

      const fallbackUser = allUsers.find(user => user.username === u.username && user.password === u.password);
      if (fallbackUser) {
        console.warn('Firebase auth failed; falling back to local user for', u.username);
        dispatch({ type: 'SET_USER', payload: fallbackUser });
        localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        return true;
      }

      return false;
    }
  }, [isOnline, auth, allUsers, logError]);

  const register = useCallback(async (newUser: User) => {
    if (allUsers.find(u => u.id === newUser.id)) {
        logError('รหัสนักเรียนนี้มีในระบบแล้ว', 'error');
        return false;
    }
    
    if (!isOnline || !auth || !db) {
        const updatedUsers = [...allUsers, newUser];
        dispatch({ type: 'SET_ALL_USERS', payload: updatedUsers });
        saveToLocalStorage({ users: updatedUsers });
        return true;
    }

    try {
        const email = `${newUser.username}@school.com`;
        const cred = await auth.createUserWithEmailAndPassword(email, newUser.password!);
        const userToSave = { ...newUser, id: cred.user!.uid };
        delete userToSave.password;
        
        await db.collection('users').doc(cred.user!.uid).set(userToSave);
        await db.collection('progress').doc(cred.user!.uid).set(createDefaultProgress(userToSave));
        
        return true;
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'auth/email-already-in-use') logError('รหัสนักเรียนนี้มีผู้ใช้งานในระบบแล้ว', 'error');
      else logError('เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้ง', 'error');
        return false;
    }
  }, [isOnline, auth, db, allUsers, logError, saveToLocalStorage]);

  const logout = useCallback(async () => {
    try {
        if (isOnline && auth) await auth.signOut();
    } catch {
      logError("เกิดข้อผิดพลาดในการออกจากระบบ", "error");
    } finally {
        dispatch({ type: 'SET_USER', payload: null });
        localStorage.removeItem('currentUser');
    }
  }, [isOnline, auth, logError]);

  const updateUser = useCallback(async (updatedUser: User) => {
    if (isOnline && db) {
        try {
            await db.collection('users').doc(updatedUser.id).set(updatedUser, { merge: true });
            const studentProg = allProgress[updatedUser.id];
            if (studentProg && studentProg.studentName !== updatedUser.name) {
                await db.collection('progress').doc(updatedUser.id).update({ studentName: updatedUser.name });
            }
        } catch (e) { logError("ไม่สามารถบันทึกข้อมูลผู้ใช้ได้", "error"); throw e; }
    } else {
        const newAllUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
        dispatch({ type: 'SET_ALL_USERS', payload: newAllUsers });
        saveToLocalStorage({ users: newAllUsers });
    }
    if (user?.id === updatedUser.id) dispatch({ type: 'SET_USER', payload: updatedUser });
  }, [isOnline, db, allUsers, user, allProgress, logError, saveToLocalStorage]);

  // Reset a user's password via callable cloud function (requires teacher/admin claim)
  const resetUserPassword = useCallback(async (userId: string, newPassword: string) => {
    if (!isOnline) throw new Error('ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อรีเซ็ตรหัสผ่าน');
    try {
      const fn = firebase.functions().httpsCallable('resetUserPassword');
      const res = await fn({ userId, newPassword });
      return res.data;
    } catch (err: unknown) {
      logError('ไม่สามารถรีเซ็ตรหัสผ่านได้: ' + ((err as { message?: string })?.message || String(err)), 'error');
      throw err;
    }
  }, [logError, isOnline]);

  // Send a password reset email using Firebase Auth
  const sendPasswordResetEmail = useCallback(async (raw: string) => {
    if (!isOnline || !auth) throw new Error('ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อส่งอีเมลรีเซ็ต');
    // Accept either username (without @) or full email
    const cleaned = raw.trim();
    const normalized = cleaned.includes('@') ? cleaned.replace(/\s+/g, '') : `${cleaned.replace(/\s+/g, '')}@school.com`;
    const email = normalized.toLowerCase();
    try {
      await auth.sendPasswordResetEmail(email);
      // Do not reveal whether the email exists — caller should show a generic message
      return true;
    } catch {
      // For security, still return true for any error like user-not-found to avoid leaking account existence
      logError('ส่งคำขอรีเซ็ตรหัสผ่านเสร็จแล้ว (ถ้าบัญชีมีอยู่คุณจะได้รับอีเมล)', 'info');
      return true;
    }
  }, [isOnline, auth, logError]);

  // Confirm a password reset using an oobCode from an email link (Firebase flow)
  const confirmPasswordReset = useCallback(async (oobCode: string, newPassword: string) => {
    try {
      await auth.confirmPasswordReset(oobCode, newPassword);
      logError('รีเซ็ตรหัสผ่านสำเร็จ', 'success');
      return true;
    } catch (err: unknown) {
      console.error(err);
      logError('ไม่สามารถรีเซ็ตรหัสผ่านได้ โปรดตรวจสอบลิงก์หรือรหัสรีเซ็ต', 'error');
      return false;
    }
  }, [auth, logError]);


  // Generate a one-time reset code for a student (expires in 24 hours)
  const generateResetCode = useCallback(async (studentId: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const resetCode: ResetCode = { code, studentId, expiresAt, used: false };

    const newResetCodes = [...state.resetCodes, resetCode];
    dispatch({ type: 'SET_RESET_CODES', payload: newResetCodes });

    // Save to localStorage
    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    data.resetCodes = newResetCodes;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

    return code;
  }, [state.resetCodes]);

  // Validate and use a reset code
  const validateResetCode = useCallback(async (code: string, newPassword: string) => {
    const resetCode = state.resetCodes.find(rc => rc.code === code && !rc.used && rc.expiresAt > Date.now());
    if (!resetCode) {
      logError('รหัสรีเซ็ตไม่ถูกต้องหรือหมดอายุ', 'error');
      return false;
    }

    // Update user's password
    const userToUpdate = allUsers.find(u => u.id === resetCode.studentId);
    if (!userToUpdate) {
      logError('ไม่พบนักเรียน', 'error');
      return false;
    }

    const updatedUser = { ...userToUpdate, password: newPassword };
    await updateUser(updatedUser);

    // Mark code as used
    const newResetCodes = state.resetCodes.map(rc => rc.code === code ? { ...rc, used: true } : rc);
    dispatch({ type: 'SET_RESET_CODES', payload: newResetCodes });

    // Save to localStorage
    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    data.resetCodes = newResetCodes;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

    logError('รีเซ็ตรหัสผ่านสำเร็จ', 'success');
    return true;
  }, [state.resetCodes, allUsers, updateUser, logError]);

  // Export grades to Excel
  const exportGradesToExcel = useCallback(async (students: User[], progressData: Record<string, UserProgress>) => {
    const data = [];
    const headers = ['ชื่อนักเรียน', 'รหัสประจำตัว'];

    // Add assignment headers
    UNIT_ASSIGNMENTS.forEach(assign => {
      headers.push(`${assign.title} (${assign.maxScore}คะแนน)`);
    });

    // Add activity headers
    UNIT_ACTIVITIES.forEach(act => {
      headers.push(`${act.title} (${act.maxScore}คะแนน)`);
    });

    // Add quiz headers
    UNIT_QUIZZES.forEach(quiz => {
      headers.push(`${quiz.title} (${quiz.maxScore}คะแนน)`);
    });

    // Add midterm, notebook, final
    headers.push(`สอบกลางภาค (${MIDTERM_EXAM.maxScore}คะแนน)`);
    headers.push(`สมุดบันทึก (${NOTEBOOK_MAX_SCORE * DEFAULT_COURSE_UNITS.length}คะแนน)`);
    headers.push(`สอบปลายภาค (${FINAL_EXAM.maxScore}คะแนน)`);
    headers.push('คะแนนรวม');

    // Calculate total score function
    const calculateTotalScore = (progress: UserProgress) => {
      if (!progress) return 0;
      let total = 0;

      UNIT_ACTIVITIES.forEach(act => {
        const p = progress.activities?.[act.id];
        if (p) total += (p.score || 0);
      });

      UNIT_QUIZZES.forEach(quiz => {
        const p = progress.quizzes?.[quiz.id];
        if (p) total += (p.score || 0);
      });
      
      const midtermP = progress.quizzes?.[MIDTERM_EXAM.id];
      if (midtermP) total += (midtermP.score || 0);

      UNIT_ASSIGNMENTS.forEach(assign => {
        const sub = progress.assignments?.[assign.id];
        if (sub && sub.status === 'graded') {
          total += (sub.score || 0);
        }
      });

      DEFAULT_COURSE_UNITS.forEach(unit => {
        const score = progress.notebookScores?.[unit.id];
        if (score) total += (score || 0);
      });

      const finalP = progress.quizzes?.[FINAL_EXAM.id];
      if (finalP) total += (finalP.score || 0);

      return total;
    };

    // Add data rows
    students.forEach(student => {
      const progress = progressData[student.id];
      if (!progress) return;

      const row: string[] = [student.name, student.username];

      // Assignments
      UNIT_ASSIGNMENTS.forEach(assign => {
        const sub = progress.assignments?.[assign.id];
        row.push(sub && sub.status === 'graded' ? String(sub.score || 0) : '-');
      });

      // Activities
      UNIT_ACTIVITIES.forEach(act => {
        const p = progress.activities?.[act.id];
        row.push(p ? String(p.score || 0) : '-');
      });

      // Quizzes
      UNIT_QUIZZES.forEach(quiz => {
        const p = progress.quizzes?.[quiz.id];
        row.push(p ? String(p.score || 0) : '-');
      });

      // Midterm
      const midtermP = progress.quizzes?.[MIDTERM_EXAM.id];
      row.push(midtermP ? String(midtermP.score || 0) : '-');

      // Notebook
      let notebookTotal = 0;
      DEFAULT_COURSE_UNITS.forEach(unit => {
        const score = progress.notebookScores?.[unit.id];
        if (score) notebookTotal += score;
      });
      row.push(String(notebookTotal));

      // Final
      const finalP = progress.quizzes?.[FINAL_EXAM.id];
      row.push(finalP ? String(finalP.score || 0) : '-');

      // Total
      const total = calculateTotalScore(progress);
      row.push(String(total));

      data.push(row);
    });

    // Create workbook using ExcelJS
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('คะแนนนักเรียน');
    ws.addRow(headers);
    for (const r of data) ws.addRow(r);

    // Save file (browser download)
    const fileName = `คะแนนนักเรียน_${new Date().toISOString().split('T')[0]}.xlsx`;
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    logError(`ส่งออกไฟล์ ${fileName} สำเร็จ`, 'success');
  }, [logError]);

  const deleteStudent = useCallback(async (studentId: string) => {
    if (isOnline && db) {
        try {
            await db.collection('users').doc(studentId).delete();
            await db.collection('progress').doc(studentId).delete();
        } catch (e) { logError("ไม่สามารถลบข้อมูลนักเรียนได้", "error"); throw e; }
    } else {
        const updatedUsers = allUsers.filter(u => u.id !== studentId);
        dispatch({ type: 'SET_ALL_USERS', payload: updatedUsers });
        const nextProgress = { ...allProgress };
        delete nextProgress[studentId];
        dispatch({ type: 'SET_ALL_PROGRESS', payload: nextProgress });
        saveToLocalStorage({ users: updatedUsers, progress: nextProgress });
    }
  }, [isOnline, db, allUsers, allProgress, logError, saveToLocalStorage]);

  const purchaseItem = useCallback((item: ShopItem) => {
      if (!userProgress) return;
      if (userProgress.coins < item.price) { logError("Coins ไม่พอ!", 'warning'); return; }
      const newProgress = { ...userProgress, coins: userProgress.coins - item.price };
      if (!newProgress.purchasedItems) newProgress.purchasedItems = { themes: [], frames: [] };

      if (item.type === 'theme') {
          newProgress.purchasedItems.themes = [...(newProgress.purchasedItems.themes || []), item.id];
          newProgress.activeTheme = item.value;
      } else if (item.type === 'frame') {
          newProgress.purchasedItems.frames = [...(newProgress.purchasedItems.frames || []), item.id];
      }
      updateProgress(newProgress);
      logError(`ซื้อ ${item.name} สำเร็จ!`, 'success');
  }, [userProgress, updateProgress, logError]);

  const saveQuizResult = useCallback(async (quizId: string, score: number, cheatAttempts = 0) => {
      if (!userProgress) {
        console.warn('saveQuizResult: userProgress is null');
        return;
      }
      // Check if quiz already submitted
      if (userProgress.quizzes?.[quizId]?.submitted) {
        console.warn(`Quiz ${quizId} already submitted, skipping save`);
        return;
      }
      const newQuizzes = { ...(userProgress.quizzes || {}), [quizId]: { submitted: true, score, cheatAttempts, submittedAt: new Date().toISOString() } };
      const updatedProgress = { ...userProgress, quizzes: newQuizzes };
      console.log(`💾 Saving quiz result: ${quizId} = ${score} for student ${userProgress.studentId}`);
      await updateProgress(updatedProgress);
  }, [userProgress, updateProgress]);

  const saveActivityResult = useCallback(async (actId: string, score: number, status: 'pending' | 'graded' = 'graded') => {
    if (!userProgress) {
      console.warn('saveActivityResult: userProgress is null');
      return;
    }
    // Check if activity already submitted
    if (userProgress.activities?.[actId]?.submitted) {
      console.warn(`Activity ${actId} already submitted, skipping save`);
      return;
    }
    const newActivities = { ...(userProgress.activities || {}), [actId]: { submitted: true, score, submittedAt: new Date().toISOString(), status } };
    const updatedProgress = { ...userProgress, activities: newActivities };
    console.log(`💾 Saving activity result: ${actId} = ${score} for student ${userProgress.studentId}`);
    await updateProgress(updatedProgress);
  }, [userProgress, updateProgress]);

  const submitAssignment = useCallback((sub: Submission) => {
    if (!userProgress) return;
    const newAssignments = { ...userProgress.assignments, [sub.assignmentId]: sub };
    updateProgress({ ...userProgress, assignments: newAssignments });
  }, [userProgress, updateProgress]);
  
  const saveNote = useCallback((unitId: string, content: string) => {
    if (!userProgress) return;
    const newNotebook = { ...(userProgress.notebook || {}), [unitId]: content };
    const newScores = { ...(userProgress.notebookScores || {}), [unitId]: NOTEBOOK_MAX_SCORE };
    updateProgress({ ...userProgress, notebook: newNotebook, notebookScores: newScores });
  }, [userProgress, updateProgress]);
  
  const submitNotebook = useCallback((unitId: string, content: string) => {
    if (!userProgress) return;
    const submission: NotebookSubmission = {
      unitId,
      content,
      submittedAt: Date.now()
    };
    const newNotebookSubmissions = { ...(userProgress.notebookSubmissions || {}), [unitId]: submission };
    // Also persist the latest submitted content into `notebook` so teacher/student views
    // can read the submitted text directly from `progress.notebook[unitId]`.
    const newNotebook = { ...(userProgress.notebook || {}), [unitId]: content };
    updateProgress({ ...userProgress, notebookSubmissions: newNotebookSubmissions, notebook: newNotebook });
  }, [userProgress, updateProgress]);
  
  const gradeNotebook = useCallback(async (studentId: string, unitId: string, score: number, feedback: string) => {
    if(isOnline && db) {
        try {
          await db.collection('progress').doc(studentId).update({
            [`notebookSubmissions.${unitId}.score`]: score,
            [`notebookSubmissions.${unitId}.feedback`]: feedback,
            [`notebookScores.${unitId}`]: score,
          });
        } catch (e: unknown) {
          console.error('gradeNotebook error:', e);
          const msg = (e as { code?: string; message?: string })?.code ? `${(e as { code?: string; message?: string }).code}: ${(e as { message?: string })?.message || String(e)}` : ((e as { message?: string })?.message || String(e));
          logError(`ไม่สามารถให้คะแนนสมุดบันทึกได้ — ${msg}`, 'error');
          throw e;
        }
    } else {
        const studentProgress = allProgress[studentId];
        if(studentProgress?.notebookSubmissions?.[unitId]) {
            const newNotebookSubmissions = { ...(studentProgress.notebookSubmissions || {}), [unitId]: { ...studentProgress.notebookSubmissions[unitId], score, feedback } };
            const newNotebookScores = { ...(studentProgress.notebookScores || {}), [unitId]: score };
            updateProgress({ ...studentProgress, notebookSubmissions: newNotebookSubmissions, notebookScores: newNotebookScores });
        }
    }
  }, [isOnline, db, allProgress, updateProgress, logError]);
  
  const resetProgress = useCallback(() => {
    if(!user) return;
    updateProgress(createDefaultProgress(user));
    logout();
  }, [user, updateProgress, logout]);
  
  const addAnnouncement = useCallback(async (text: string) => {
    const newAnn: Omit<AnnouncementData, 'id'> = { text, date: new Date().toISOString() };
    if (isOnline && db) {
        try { await db.collection('announcements').add(newAnn); } 
        catch (e) { logError("ไม่สามารถเพิ่มประกาศได้", "error"); throw e; }
    } else {
        const newAnnouncements = [...announcements, { ...newAnn, id: Date.now() }];
        dispatch({ type: 'SET_ANNOUNCEMENTS', payload: newAnnouncements });
        saveToLocalStorage({ announcements: newAnnouncements });
    }
  }, [isOnline, db, announcements, logError, saveToLocalStorage]);

  const deleteAnnouncement = useCallback(async (id: string | number) => {
    if (isOnline && db) {
        try { await db.collection('announcements').doc(String(id)).delete(); } 
        catch (e) { logError("ไม่สามารถลบประกาศได้", "error"); throw e; }
    } else {
        const newAnnouncements = announcements.filter(a => a.id !== id);
        dispatch({ type: 'SET_ANNOUNCEMENTS', payload: newAnnouncements });
        saveToLocalStorage({ announcements: newAnnouncements });
    }
  }, [isOnline, db, announcements, logError, saveToLocalStorage]);

  const answerQuestion = useCallback(async (id: string | number, answer: string) => {
    if(isOnline && db) {
        try { await db.collection('qna').doc(String(id)).update({ answer, answeredAt: new Date().toISOString() }); }
        catch (e) { logError("ไม่สามารถตอบคำถามได้", "error"); throw e; }
    } else {
        const newQna = qnaList.map(q => q.id === id ? {...q, answer, answeredAt: new Date().toISOString()} : q);
        dispatch({ type: 'SET_QNA', payload: newQna });
        saveToLocalStorage({ qna: newQna });
    }
  }, [isOnline, db, qnaList, logError, saveToLocalStorage]);

  const gradeAssignment = useCallback(async (studentId: string, assignId: string, score: number, feedback: string) => {
    if(isOnline && db) {
        try {
          await db.collection('progress').doc(studentId).update({
            [`assignments.${assignId}.score`]: score,
            [`assignments.${assignId}.feedback`]: feedback,
            [`assignments.${assignId}.status`]: 'graded',
          });
        } catch (e: unknown) {
          console.error('gradeAssignment error:', e);
          const msg = (e as { code?: string; message?: string })?.code ? `${(e as { code?: string }).code}: ${(e as { message?: string })?.message || String(e)}` : ((e as { message?: string })?.message || String(e));
          logError(`ไม่สามารถให้คะแนนได้ — ${msg}`, 'error');
          throw e;
        }
    } else {
        const studentProg = allProgress[studentId];
        if(studentProg?.assignments[assignId]) {
            studentProg.assignments[assignId] = { ...studentProg.assignments[assignId], score, feedback, status: 'graded' };
            updateProgress(studentProg);
        }
    }
  }, [isOnline, db, allProgress, updateProgress, logError]);

  const gradeActivity = useCallback(async (studentId: string, actId: string, score: number, feedback: string) => {
    if(isOnline && db) {
        try {
          await db.collection('progress').doc(studentId).update({
            [`activities.${actId}.score`]: score,
            [`activities.${actId}.feedback`]: feedback,
            [`activities.${actId}.status`]: 'graded',
          });
        } catch (e: unknown) {
          console.error('gradeActivity error:', e);
          const msg = (e as { code?: string; message?: string })?.code ? `${(e as { code?: string }).code}: ${(e as { message?: string })?.message || String(e)}` : ((e as { message?: string })?.message || String(e));
          logError(`ไม่สามารถให้คะแนนกิจกรรมได้ — ${msg}`, 'error');
          throw e;
        }
    } else {
        const studentProg = allProgress[studentId];
        if(studentProg?.activities[actId]) {
            studentProg.activities[actId] = { ...studentProg.activities[actId], score, feedback, status: 'graded' };
            updateProgress(studentProg);
        }
    }
  }, [isOnline, db, allProgress, updateProgress, logError]);

  const updateResources = useCallback(async (newResources: UnitResourceCollection[]) => {
    dispatch({ type: 'SET_RESOURCES', payload: newResources });
    if (isOnline && db) {
        try { await db.collection('config').doc('resources').set({ data: newResources }); }
        catch (e) { logError("ไม่สามารถอัปเดตสื่อการสอนได้", "error"); throw e; }
    } else saveToLocalStorage({ resources: newResources });
  }, [isOnline, db, logError, saveToLocalStorage]);

  const addCourseUnit = useCallback(async (unit: CourseUnit) => {
      const newUnits = [...courseUnits, unit];
      dispatch({ type: 'SET_COURSE_UNITS', payload: newUnits });
      if (isOnline && db) {
          try { await db.collection('config').doc('courseUnits').set({ data: newUnits }); }
          catch (e) { logError("ไม่สามารถเพิ่มหน่วยการเรียนรู้ได้", "error"); throw e; }
      } else saveToLocalStorage({ courseUnits: newUnits });
  }, [courseUnits, isOnline, db, logError, saveToLocalStorage]);

  const updateCourseUnit = useCallback(async (unit: CourseUnit) => {
      const newUnits = courseUnits.map(u => u.id === unit.id ? unit : u);
      dispatch({ type: 'SET_COURSE_UNITS', payload: newUnits });
      if (isOnline && db) {
          try { await db.collection('config').doc('courseUnits').set({ data: newUnits }); }
          catch (e) { logError("ไม่สามารถแก้ไขหน่วยการเรียนรู้ได้", "error"); throw e; }
      } else saveToLocalStorage({ courseUnits: newUnits });
  }, [courseUnits, isOnline, db, logError, saveToLocalStorage]);

  const deleteCourseUnit = useCallback(async (unitId: string) => {
      const newUnits = courseUnits.filter(u => u.id !== unitId);
      dispatch({ type: 'SET_COURSE_UNITS', payload: newUnits });
      if (isOnline && db) {
          try { await db.collection('config').doc('courseUnits').set({ data: newUnits }); }
          catch (e) { logError("ไม่สามารถลบหน่วยการเรียนรู้ได้", "error"); throw e; }
      } else saveToLocalStorage({ courseUnits: newUnits });
  }, [courseUnits, isOnline, db, logError, saveToLocalStorage]);

  const getLeaderboard = useCallback((): LeaderboardEntry[] => {
    return Object.entries(allProgress)
      .map(([docId, p]: [string, UserProgress]) => {
        // Use Strict Summation logic for consistent scores in leaderboard
        let total = 0;
        UNIT_ACTIVITIES.forEach(act => total += (p.activities?.[act.id]?.score || 0));
        UNIT_QUIZZES.forEach(quiz => total += (p.quizzes?.[quiz.id]?.score || 0));
        total += (p.quizzes?.[MIDTERM_EXAM.id]?.score || 0);
        UNIT_ASSIGNMENTS.forEach(assign => {
            const sub = p.assignments?.[assign.id];
            if (sub && sub.status === 'graded') total += (sub.score || 0);
        });
        DEFAULT_COURSE_UNITS.forEach(unit => total += (p.notebookScores?.[unit.id] || 0));
        total += (p.quizzes?.[FINAL_EXAM.id]?.score || 0);

        // Prefer mapped user info when available
        const mappedUserId = (studentMapping && studentMapping[docId]?.userId) || (studentMapping && studentMapping[p.studentId]?.userId) || null;
        const user = mappedUserId ? allUsers.find(u => u.id === mappedUserId) : undefined;

        return {
            studentId: user?.id || p.studentId || docId,
            name: user?.name || p.studentName,
            avatar: user?.avatar || p.avatar || '🧑‍🎓',
            totalScore: total,
            badges: p.achievements || [],
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [allProgress, allUsers, studentMapping]);
  
  const checkCourseCompletion = useCallback(() => {
    if(!userProgress) return false;

    // Check if all units are completed
    const allUnitsCompleted = courseUnits.filter(u=>u.isActive).every(u => userProgress.units?.[u.id]?.completed);
    if (!allUnitsCompleted) return false;

    // Constants are already imported at the top

    // Check if all activities are submitted (and graded for manual activities)
    const allActivitiesCompleted = UNIT_ACTIVITIES.every(act => {
      const progress = userProgress.activities?.[act.id];
      return progress?.submitted && (progress.status === 'graded' || ['matching', 'ordering', 'multiple_choice_game'].includes(act.type));
    });

    // Check if all quizzes are submitted
    const allQuizzesCompleted = UNIT_QUIZZES.every(quiz => userProgress.quizzes?.[quiz.id]?.submitted);

    // Check if midterm and final exams are submitted
    const midtermCompleted = userProgress.quizzes?.[MIDTERM_EXAM.id]?.submitted;
    const finalCompleted = userProgress.quizzes?.[FINAL_EXAM.id]?.submitted;

    // Check if all assignments are graded
    const allAssignmentsCompleted = UNIT_ASSIGNMENTS.every(assign => {
      const progress = userProgress.assignments?.[assign.id];
      return progress?.status === 'graded';
    });

    // Check if all notebooks are graded
    const allNotebooksCompleted = courseUnits.filter(u=>u.isActive).every(unit => {
      const score = userProgress.notebookScores?.[unit.id];
      return score !== undefined && score > 0;
    });

    return allActivitiesCompleted && allQuizzesCompleted && midtermCompleted && finalCompleted && allAssignmentsCompleted && allNotebooksCompleted;
  }, [userProgress, courseUnits]);
  
  const addQuestion = useCallback(async (q: QnAData) => {
    if (isOnline && db) {
        try { await db.collection('qna').add(q); } 
        catch (e) { logError("ไม่สามารถส่งคำถามได้", "error"); throw e; }
    } else {
        const newQna = [...qnaList, { ...q, id: Date.now() }];
        dispatch({ type: 'SET_QNA', payload: newQna });
        saveToLocalStorage({ qna: newQna });
    }
  }, [isOnline, db, qnaList, logError, saveToLocalStorage]);
  
  const updateProject = useCallback((project: Project) => {
    if (!userProgress) return;
    const existing = userProgress.projects || [];
    const idx = existing.findIndex(p => p.id === project.id);
    const newProjects = idx > -1 ? [...existing.slice(0, idx), project, ...existing.slice(idx + 1)] : [...existing, project];
    updateProgress({ ...userProgress, projects: newProjects });
  }, [userProgress, updateProgress]);

  const deleteProject = useCallback((projectId: string) => {
    if (!userProgress) return;
    updateProgress({ ...userProgress, projects: (userProgress.projects || []).filter(p => p.id !== projectId) });
  }, [userProgress, updateProgress]);

  const createStudyGroup = useCallback(async (group: Omit<StudyGroup, 'id' | 'createdAt'>) => {
    const newGroup = { ...group, id: `group_${Date.now()}`, createdAt: new Date().toISOString() };
    if (isOnline && db) {
        try { await db.collection('studyGroups').add(newGroup); }
        catch (e) { logError("ไม่สามารถสร้างกลุ่มได้", "error"); throw e; }
    } else {
        const newGroups = [...studyGroups, newGroup];
        dispatch({ type: 'SET_STUDY_GROUPS', payload: newGroups });
        saveToLocalStorage({ studyGroups: newGroups });
    }
  }, [studyGroups, isOnline, db, logError, saveToLocalStorage]);

  const joinStudyGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    const group = studyGroups.find(g => g.id === groupId);
    if (!group || group.members.includes(user.id)) return;
    const updatedGroup = { ...group, members: [...group.members, user.id] };
    if (isOnline && db) {
        try { await db.collection('studyGroups').doc(groupId).update({ members: updatedGroup.members }); }
        catch (e) { logError("ไม่สามารถเข้าร่วมกลุ่มได้", "error"); throw e; }
    } else {
        const newGroups = studyGroups.map(g => (g.id === groupId ? updatedGroup : g));
        dispatch({ type: 'SET_STUDY_GROUPS', payload: newGroups });
        saveToLocalStorage({ studyGroups: newGroups });
    }
  }, [studyGroups, isOnline, db, user, logError, saveToLocalStorage]);

  const awardBonusToStudent = useCallback((studentId: string, bonus: { xp?: number; coins?: number }) => {
    const progress = allProgress[studentId];
    if (!progress) return;
    const newProgress = { ...progress };
    if (bonus.xp) newProgress.xp = (newProgress.xp || 0) + bonus.xp;
    if (bonus.coins) newProgress.coins = (newProgress.coins || 0) + bonus.coins;
    updateProgress(newProgress);
    logError(`มอบรางวัลให้ ${progress.studentName} สำเร็จ!`, 'success');
  }, [allProgress, updateProgress, logError]);

  const addCustomQuiz = useCallback(async (unitId: string, quiz: QuizData) => {
      const newQuizzes = [...customQuizzes, quiz];
      dispatch({ type: 'SET_CUSTOM_QUIZZES', payload: newQuizzes });
      
      if (isOnline && db) {
          try { await db.collection('config').doc('customQuizzes').set({ data: newQuizzes }); }
          catch (e) { logError("ไม่สามารถเพิ่มแบบทดสอบได้", "error"); throw e; }
      } else {
          saveToLocalStorage({ customQuizzes: newQuizzes });
      }
      logError(`เพิ่มแบบทดสอบ "${quiz.title}" สำเร็จ`, 'success');
  }, [customQuizzes, logError, isOnline, saveToLocalStorage]);

  const addCustomActivity = useCallback(async (unitId: string, activity: ActivityData) => {
      const newActivities = [...customActivities, activity];
      dispatch({ type: 'SET_CUSTOM_ACTIVITIES', payload: newActivities });

      if (isOnline && db) {
          try { await db.collection('config').doc('customActivities').set({ data: newActivities }); }
          catch (e) { logError("ไม่สามารถเพิ่มกิจกรรมได้", "error"); throw e; }
      } else {
          saveToLocalStorage({ customActivities: newActivities });
      }
      logError(`เพิ่มกิจกรรม "${activity.title}" สำเร็จ`, 'success');
  }, [customActivities, logError, isOnline, saveToLocalStorage]);
  
  const exportData = useCallback(() => {
    const data = { allUsers, allProgress, announcements, qnaList, resources, courseUnits, studyGroups, customQuizzes, customActivities };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `cs_learning_platform_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    logError("ส่งออกข้อมูลสำเร็จ", "success");
  }, [allUsers, allProgress, announcements, qnaList, resources, courseUnits, studyGroups, customQuizzes, customActivities, logError]);
  
  const importData = useCallback((json: string): boolean => {
    try {
        const data = JSON.parse(json);
        if (data.users && data.progress) {
            dispatch({ type: 'SET_ALL_USERS', payload: data.users || allUsers });
            dispatch({ type: 'SET_ALL_PROGRESS', payload: data.progress || allProgress });
            dispatch({ type: 'SET_ANNOUNCEMENTS', payload: data.announcements || announcements });
            dispatch({ type: 'SET_QNA', payload: data.qna || qnaList });
            dispatch({ type: 'SET_RESOURCES', payload: data.resources || resources });
            dispatch({ type: 'SET_COURSE_UNITS', payload: data.courseUnits || courseUnits });
            dispatch({ type: 'SET_STUDY_GROUPS', payload: data.studyGroups || studyGroups });
            dispatch({ type: 'SET_CUSTOM_QUIZZES', payload: data.customQuizzes || customQuizzes });
            dispatch({ type: 'SET_CUSTOM_ACTIVITIES', payload: data.customActivities || customActivities });
            saveToLocalStorage(data);
            logError('นำเข้าข้อมูลสำเร็จแล้ว กรุณารีเฟรชหน้าจอ', 'success');
            return true;
        }
        logError('ไฟล์ข้อมูลไม่ถูกต้อง', 'error'); return false;
    } catch { logError('เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error'); return false; }
  }, [logError, allUsers, allProgress, announcements, qnaList, resources, courseUnits, studyGroups, customQuizzes, customActivities, dispatch, saveToLocalStorage]);

  const loadUnitDiscussions = useCallback(async (unitId: string) => {
    if (!db) return;
    try {
      const discussionsRef = db.collection('unitDiscussions').where('unitId', '==', unitId).orderBy('timestamp', 'desc');
      const snapshot = await discussionsRef.get();
      const discussions: UnitDiscussion[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitDiscussion));
      dispatch({ type: 'SET_UNIT_DISCUSSIONS', payload: { ...state.unitDiscussions, [unitId]: discussions } });
    } catch (error) {
      console.error('Error loading unit discussions:', error);
    }
  }, []);

  const addUnitDiscussion = useCallback(async (unitId: string, discussion: Omit<UnitDiscussion, 'id' | 'timestamp'>) => {
    if (!db || !user) return;
    try {
      const newDiscussion = {
        ...discussion,
        timestamp: Date.now(),
      };
      const docRef = await db.collection('unitDiscussions').add(newDiscussion);
      const newDisc: UnitDiscussion = { id: docRef.id, ...newDiscussion };
      dispatch({ type: 'SET_UNIT_DISCUSSIONS', payload: { ...state.unitDiscussions, [unitId]: [newDisc, ...(state.unitDiscussions[unitId] || [])] } });
    } catch (error) {
      console.error('Error adding unit discussion:', error);
    }
  }, [user]);

  const addDiscussionReply = useCallback(async (discussionId: string, reply: Omit<UnitDiscussionReply, 'id' | 'timestamp'>) => {
    // Minimal stub: log info. Implement proper Firestore append later.
    logError(`ตอบกระทู้ ${discussionId}: ${JSON.stringify(reply).slice(0, 200)}`, 'info');
    // Intentionally no return value to satisfy Promise<void> signature
    return;
  }, [logError]);

  const loadStudentMapping = useCallback(async () => {
    if (!db) return;
    try {
      const snap = await db.collection('student_mapping').get();
      const map: Record<string, { userId: string; matchType: string; createdAt?: string }> = {};
      snap.docs.forEach(d => {
        const data = d.data() || {};
        map[d.id] = { userId: data.userId || data.mappedUserDoc || '', matchType: data.matchType || 'auto', createdAt: data.createdAt || undefined };
      });
      dispatch({ type: 'SET_STUDENT_MAPPING', payload: map });
    } catch (e) {
      console.warn('loadStudentMapping error', e);
    }
  }, []);

  const getUserForProgress = useCallback((progressDocId: string) => {
    const mapped = state.studentMapping?.[progressDocId]?.userId;
    if (mapped) return allUsers.find(u => u.id === mapped) || null;
    return null;
  }, [state.studentMapping, allUsers]);

  const value: DataContextType & { connectedCollections: string[] } = { user, allUsers, userProgress, allProgress, announcements, qnaList, resources, courseUnits, studyGroups, isOnline, isInitializing, customQuizzes, customActivities, studentMapping: state.studentMapping || {}, unitDiscussions: state.unitDiscussions, loadUnitDiscussions, addUnitDiscussion, addDiscussionReply, hasNewAnnouncements, notifications, unreadNotificationCount, connectedCollections: state.connectedCollections || [], login, logout, register, updateUser, deleteStudent, updateProgress, saveQuizResult, saveActivityResult, submitAssignment, saveNote, submitNotebook, gradeNotebook, gradeActivity, resetProgress, purchaseItem, addAnnouncement, deleteAnnouncement, addQuestion, answerQuestion, gradeAssignment, updateResources, awardBonusToStudent, addCourseUnit, updateCourseUnit, deleteCourseUnit, addCustomQuiz, addCustomActivity, updateProject, deleteProject, createStudyGroup, joinStudyGroup, exportData, importData, getLeaderboard, checkCourseCompletion, markAnnouncementsAsSeen, markNotificationAsRead, markAllNotificationsAsRead, loadStudentMapping, getUserForProgress, resetUserPassword, sendPasswordResetEmail, confirmPasswordReset, generateResetCode, validateResetCode, exportGradesToExcel };
  return (
    <div className="flex-1 flex items-center justify-center">
        {isInitializing ? (
            <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="font-bold text-sm">กำลังเตรียมข้อมูลห้องเรียน...</p>
            </div>
        ) : (
            <DataContext.Provider value={value}>
              {children}
            </DataContext.Provider>
        )}
    </div>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
