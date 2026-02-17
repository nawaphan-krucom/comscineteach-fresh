

export enum ViewState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  UNIT_1 = 'UNIT_1',
  UNIT_2 = 'UNIT_2',
  UNIT_3 = 'UNIT_3',
  UNIT_4 = 'UNIT_4',
  UNIT_5 = 'UNIT_5',
  GENERIC_UNIT = 'GENERIC_UNIT',
  ACTIVITY = 'ACTIVITY',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  RESOURCES = 'RESOURCES',
  COMMUNICATION = 'COMMUNICATION',
  PROFILE = 'PROFILE',
  CERTIFICATE = 'CERTIFICATE',
  NOTEBOOK = 'NOTEBOOK',
  PLAYGROUND = 'PLAYGROUND',
  CALENDAR = 'CALENDAR',
  FLOWCHART_BUILDER = 'FLOWCHART_BUILDER',
  PROJECT_HUB = 'PROJECT_HUB',
  STUDY_GROUPS = 'STUDY_GROUPS',

  // --- NEW VIEWS ---
  PORTFOLIO = 'PORTFOLIO',
  LEADERBOARD = 'LEADERBOARD',
  QUIZ_BATTLE = 'QUIZ_BATTLE',
  SHOP = 'SHOP',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  EXAM_RESULTS = 'EXAM_RESULTS',

  // --- FIREBASE DEMO & STATS ---
  FIREBASE_DEMO = 'FIREBASE_DEMO',
  REALTIME_STATS = 'REALTIME_STATS',
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  classLevel?: string;
  room?: string;
  seatNumber?: string;
  sessionToken?: string;
  // Optional metadata
  createdAt?: string;
  studentId?: string;
  // optional audit timestamp written by server when password was reset (admin action)
  passwordResetAt?: string | number | Date | { toDate?: () => Date };
}

export interface CourseUnit {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  // Pedagogy fields
  objectives?: string[]; // 3–5 concise learning objectives
  workedExamples?: { id?: string; title: string; description: string; code?: string; explanation?: string }[];
  practiceExercises?: { id: string; title: string; difficulty: 'easy' | 'medium' | 'hard'; prompt: string; hints?: string[]; solution?: string }[];
  summary?: string;
  nextSteps?: string[];
  notebookRubric?: RubricItem[];
}

export interface RubricItem {
  criteria: string;
  maxScore: number;
  keywords?: string[];
  feedbackIfMissing?: string;
  feedbackIfPresent?: string;
}

export interface Assignment {
  rubric?: RubricItem[];
  id: string;
  unitId: string;
  title: string;
  description: string;
  deadline: string;
  maxScore: number;
  submissionType: 'text' | 'file';
}

export interface GradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string[];
  breakdown: {
    criteria: string;
    score: number;
    maxScore: number;
    aiComment: string;
  }[];
}

export interface PlagiarismResult {
  isPlagiarized: boolean;
  originalStudentId?: string;
  similarityPercentage: number;
  penalty: number;
}

export interface Submission {
  assignmentId: string;
  studentId: string;
  submittedAt: number;
  answerText?: string;
  fileUrl?: string;
  fileName?: string;
  score?: number;
  feedback?: string;
  aiResult?: GradingResult;
  plagiarismDetection?: PlagiarismResult;
  status: 'pending' | 'graded';
}

export interface NotebookSubmission {
  unitId: string;
  content: string;
  submittedAt: number;
  score?: number;
  feedback?: string;
  aiResult?: GradingResult;
}

// --- NEW: Project Hub Models ---
export interface ProjectTask {
  id: string;
  content: string;
  status: 'todo' | 'inprogress' | 'done';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  isPublic: boolean; // For portfolio
  tasks: ProjectTask[];
  createdAt: string;
}

// --- NEW: Study Group Models ---
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: string[]; // Array of student IDs
  createdBy: string;
  createdAt: string;
}

export interface UserProgress {
  studentName: string;
  studentId: string;
  avatar?: string;
  activities: Record<string, { submitted: boolean; score: number; submittedAt: string; feedback?: string; status?: 'pending' | 'graded' }>;
  quizzes: Record<string, { submitted: boolean; score: number; cheatAttempts?: number; submittedAt: string }>;
  assignments: Record<string, Submission>;
  units: Record<string, { completed: boolean }>;
  notebook?: Record<string, string>;
  notebookScores?: Record<string, number>;
  notebookSubmissions?: Record<string, NotebookSubmission>;
  level: number;
  xp: number;
  coins: number;
  quests: Record<string, { completed: boolean; date: string; }>;
  achievements: string[];
  purchasedItems?: {
    themes?: string[];
    frames?: string[];
  };
  activeTheme?: string;
  lastLogin: string;
  loginStreak: number;
  projects?: Project[];
}

export interface AppDatabase {
  users: User[];
  progress: Record<string, UserProgress>;
}

export interface AnnouncementData {
  id: number | string;
  text: string;
  date: string;
}

export type QnATopic = 'general' | 'project' | 'showcase';

export interface QnAData {
  id: number | string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  question: string;
  answer?: string;
  date: string;
  answeredAt?: string;
  topic?: QnATopic;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatar: string;
  totalScore: number;
  badges: string[];
}

export interface VideoResource {
  title: string;
  url: string;
  description: string;
  duration?: string;
}

export interface PDFResource {
  title: string;
  url: string;
  description: string;
  size?: string;
  content?: string;
}

export interface ImageResource {
  title: string;
  url: string;
  description: string;
}

export interface AudioResource {
  title: string;
  url: string;
  description: string;
  duration?: string;
}

export interface LinkResource {
  title: string;
  url: string;
  description: string;
}

export interface UnitResourceCollection {
  unitId: string;
  unitTitle: string;
  videos: VideoResource[];
  pdfs: PDFResource[];
  images?: ImageResource[];
  audios?: AudioResource[];
  links?: LinkResource[];
}

export interface ResetCode {
  code: string;
  studentId: string;
  expiresAt: number; // timestamp
  used: boolean;
}

export interface ShopItem {
  id: string;
  type: 'theme' | 'frame';
  name: string;
  description: string;
  price: number;
  value: string;
}

export interface IntellectualPropertyConcept {
  type: string;
  description: string;
  examples: string[];
  icon: string;
}

export interface CreativeCommonsLicense {
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface UnitDiscussion {
  id: string;
  unitId: string;
  userId: string;
  type: 'note' | 'question';
  content: string;
  timestamp: number;
  likes?: number;
  replies?: UnitDiscussionReply[];
}

export interface UnitDiscussionReply {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'announcement' | 'deadline' | 'grading' | 'qna' | 'achievement' | 'general' | 'award' | 'submission';
  message: string;
  link?: ViewState;
  linkTarget?: string;
  timestamp: number;
  isRead: boolean;
  studentId?: string;
  assignmentId?: string;
  qnaId?: string | number;
}

export interface DataContextType {
  user: User | null;
  allUsers: User[];
  userProgress: UserProgress | null;
  allProgress: Record<string, UserProgress>;
  announcements: AnnouncementData[];
  qnaList: QnAData[];
  resources: UnitResourceCollection[];
  courseUnits: CourseUnit[];
  studyGroups: StudyGroup[];
  isOnline: boolean;
  isInitializing: boolean;
  hasNewAnnouncements: boolean;

  customQuizzes: QuizData[];
  customActivities: ActivityData[];

  unitDiscussions: Record<string, UnitDiscussion[]>;
  loadUnitDiscussions: (unitId: string) => Promise<void>;
  addUnitDiscussion: (unitId: string, discussion: Omit<UnitDiscussion, 'id' | 'timestamp'>) => Promise<void>;
  addDiscussionReply: (discussionId: string, reply: Omit<UnitDiscussionReply, 'id' | 'timestamp'>) => Promise<void>;

  // New Notification properties
  notifications: Notification[];
  unreadNotificationCount: number;
  connectedCollections?: string[];
  statusSummary?: {
    users?: number;
    progressDocs?: number;
    latestSubmissionIso?: string;
    updatedAt?: string | null;
  };

  // Mapping between progress doc id and user doc id. Auto-generated via admin script.
  studentMapping: Record<string, { userId: string; matchType: string; createdAt?: string }>;
  loadStudentMapping?: (force?: boolean) => Promise<void>;
  getUserForProgress?: (progressDocId: string) => User | null;

  login: (u: User) => Promise<boolean>;
  logout: () => void;
  register: (u: User) => Promise<boolean>;
  updateUser: (u: User) => void;
  deleteStudent: (studentId: string) => Promise<void>;

  updateProgress: (prog: UserProgress) => void;
  saveQuizResult: (quizId: string, score: number, cheatAttempts?: number) => Promise<void>;
  saveActivityResult: (actId: string, score: number, status?: 'pending' | 'graded') => Promise<void>;
  submitAssignment: (sub: Submission) => void;
  saveNote: (unitId: string, content: string) => void;
  submitNotebook: (unitId: string, content: string) => void;
  gradeNotebook: (studentId: string, unitId: string, score: number, feedback: string) => void;
  resetProgress: () => void;
  purchaseItem: (item: ShopItem) => void;

  addAnnouncement: (text: string) => void;
  deleteAnnouncement: (id: number | string) => void;
  addQuestion: (q: QnAData) => void;
  answerQuestion: (id: number | string, answer: string) => void;
  gradeAssignment: (studentId: string, assignId: string, score: number, feedback: string) => void;
  gradeActivity: (studentId: string, actId: string, score: number, feedback: string) => void;
  updateResources: (newResources: UnitResourceCollection[]) => void;
  awardBonusToStudent: (studentId: string, bonus: { xp?: number; coins?: number }) => void;
  markAnnouncementsAsSeen: () => void;

  addCourseUnit: (unit: CourseUnit) => void;
  updateCourseUnit: (unit: CourseUnit) => void;
  deleteCourseUnit: (unitId: string) => void;
  addCustomQuiz: (unitId: string, quiz: QuizData) => void;
  addCustomActivity: (unitId: string, activity: ActivityData) => void;

  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;

  createStudyGroup: (group: Omit<StudyGroup, 'id' | 'createdAt'>) => void;
  joinStudyGroup: (groupId: string) => void;

  exportData: () => void;
  importData: (json: string) => boolean;
  getLeaderboard: () => LeaderboardEntry[];
  checkCourseCompletion: () => boolean;

  // New Notification functions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetUserPassword?: (userId: string, newPassword: string) => Promise<any>;
  sendPasswordResetEmail?: (raw: string) => Promise<boolean>;
  confirmPasswordReset?: (code: string, newPassword: string) => Promise<boolean>;
  generateResetCode: (studentId: string) => Promise<string>;
  validateResetCode: (code: string, newPassword: string) => Promise<boolean>;
  exportGradesToExcel: (students: User[], progressData: Record<string, UserProgress>) => Promise<void>;
}

export interface CTSkill {
  title: string;
  engTitle: string;
  description: string;
  example: string;
  additionalExamples: string[];
  icon: string;
  color: string;
  scenario?: string;
}

export interface ReportSection {
  part: string;
  title: string;
  description: string;
  color: string;
  items: {
    name: string;
    detail: string;
  }[];
}

export interface SDLCStep {
  step: number;
  title: string;
  engTitle: string;
  description: string;
  process: string[];
  outcome: string;
  icon: string;
}

export interface CaseStudyData {
  id: number;
  title: string;
  problem: string;
  solution: string;
  ctAnalysis: {
    concept: string;
    application: string;
  }[];
  sdlcSteps: {
    phase: string;
    description: string;
    activities: string[];
  }[];
}

export interface TechRelationship {
  science: string;
  description: string;
  example: string;
  icon: string;
  color: string;
}

export interface SystemDefinition {
  type: 'input' | 'process' | 'output' | 'feedback';
  label: string;
  engLabel: string;
  description: string;
  color: string;
  icon: string;
}

export interface SystemExampleData {
  name: string;
  description: string;
  input: string;
  process: string;
  output: string;
  feedback: string;
}

export interface TechImpactData {
  aspect: string;
  positive: string[];
  negative: string[];
}

export interface ChangeCauseData {
  title: string;
  description: string;
  example: string;
  icon: string;
}

export interface EvolutionExample {
  title: string;
  past: string;
  present: string;
  future: string;
}

export interface ComplexSystemSub {
  name: string;
  function: string;
  description: string;
  input: string;
  process: string;
  output: string;
  feedback?: string;
}

export interface ComplexSystemData {
  name: string;
  description: string;
  systemStructure: string;
  efficiency: string;
  mainSystem: {
    input: string;
    process: string;
    output: string;
    feedback: string;
  };
  subSystems: ComplexSystemSub[];
}

export interface SystemConcept {
  title: string;
  engTitle: string;
  description: string;
  icon: string;
}

export interface EngineeringDefinition {
  definition: string;
  keyPoint: string;
}

export interface ComparisonItem {
  aspect: string;
  science: string;
  engineering: string;
}

export interface EngineeringStep {
  step: number;
  title: string;
  engTitle: string;
  description: string;
  details: string[];
  methods: string[];
  exampleCases: string[];
}

export interface MaterialProperty {
  type: string;
  engType: string;
  description: string;
  examples: string[];
}

export interface MaterialType {
  name: string;
  description: string;
  subTypes?: {
    name: string;
    detail: string;
  }[];
  examples: string;
}

export interface MechanismDetail {
  name: string;
  description: string;
  workingPrinciple: string;
  example: string;
}

export interface ElectronicsDetail {
  category: string;
  description: string;
  examples: {
    name: string;
    usage: string;
  }[];
}

export interface ToolDetail {
  category: string;
  description: string;
  tools: {
    name: string;
    usage: string;
  }[];
}

export interface ProjectStepDetail {
  stepNumber: number;
  stepTitle: string;
  description: string;
  actions: string[];
  icon: string;
  empathyMap?: {
    say: string;
    think: string;
    do: string;
    feel: string;
  };
  systemComponents?: string[];
  testResults?: string;
}

export interface DesignProject {
  id: number;
  title: string;
  problem: string;
  concept: string;
  projectSteps: ProjectStepDetail[];
  keyTakeaways: string[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizData {
  id: string;
  title: string;
  questions: Question[];
  maxScore: number;
  timeLimit?: number;
  skill: 'decomposition' | 'pattern' | 'abstraction' | 'algorithm' | 'system' | 'design';
  rewardCoins?: number;
}

export interface ActivityData {
  id: string;
  unitId: string;
  title: string;
  description: string;
  type: 'matching' | 'ordering' | 'fill_blank' | 'multiple_choice_game' | 'short_answer' | 'drawing';
  maxScore: number;
  content: unknown;
  skill: 'decomposition' | 'pattern' | 'abstraction' | 'algorithm' | 'system' | 'design';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rewardCoins?: number;
}

export interface CommonMistake {
  title: string;
  desc: string;
}

export interface CareerPath {
  title: string;
  desc: string;
}

export interface RealWorldApp {
  company: string;
  desc: string;
}

export interface KeyConcept {
  title: string;
  desc: string;
  icon: string;
}
