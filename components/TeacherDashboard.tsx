import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
  useRef,
} from "react";
import type {
  User,
  UserProgress,
  UnitResourceCollection,
  CourseUnit,
  Submission,
  QuizData,
  ActivityData,
  NotebookSubmission,
} from "../types";
import {
  UNIT_ASSIGNMENTS,
  UNIT_QUIZZES,
  UNIT_ACTIVITIES,
  FINAL_EXAM,
  MIDTERM_EXAM,
  NOTEBOOK_MAX_SCORE,
  DEFAULT_COURSE_UNITS,
} from "../constants";
import {
  Users,
  Search,
  Download,
  X,
  Trash2,
  Database,
  Eye,
  EyeOff,
  BookOpen,
  MessageSquare,
  PieChart,
  Upload,
  FolderPlus,
  Trophy,
  Loader2,
  FileSpreadsheet,
  Coffee,
  Monitor,
  Zap,
  PenTool,
  Layers,
  Activity,
  Book,
  ClipboardCheck,
  Plus,
  Edit,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  ShieldAlert,
  ScanFace,
  PlusSquare,
  KeyRound,
  UserPlus as UserPlusIcon,
} from "./icons/EmojiIcons";
import { useData } from "../contexts/DataContext";
import { t } from "../utils/i18n";
import { useError } from "../contexts/ErrorContext";
import Fuse from "fuse.js";
import { lazyWithRetry } from "../utils/lazyWithRetry";

// Small helper to show proxy status and a quick health check button
const ProxyStatusButton: React.FC<{ connectedCollections: string[] }> = ({
  connectedCollections,
}) => {
  const [checking, setChecking] = useState(false);
  const { logError } = useError();
  const isConnected = connectedCollections.includes("proxy");

  const checkProxy = async () => {
    setChecking(true);
    try {
      const proxyBase =
        import.meta.env.VITE_SSE_PROXY_URL || "http://localhost:3000";
      const res = await fetch(proxyBase.replace(/\/$/, "") + "/");
      if (res.ok) logError("Local SSE proxy reachable", "success");
      else logError("Local SSE proxy not reachable", "warning");
    } catch {
      logError("Local SSE proxy not reachable", "warning");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-medium ${isConnected ? "text-emerald-600" : "text-slate-500"}`}
      >
        Proxy: {isConnected ? "connected" : "disconnected"}
      </span>
      <button
        onClick={checkProxy}
        disabled={checking}
        className="px-2 py-1 bg-white border rounded text-xs"
      >
        {checking ? "กำลังตรวจ..." : "ตรวจสอบ Proxy"}
      </button>
    </div>
  );
};
const ItemAnalysisModal = lazy(() => import("./ItemAnalysisModal"));
const ContentCreatorView = lazyWithRetry(() => import("./ContentCreatorView"));
const StudentPortfolioView = lazy(() => import("./StudentPortfolioView"));
import ConfirmationDialog from "./ConfirmationDialog";
import GradebookView from "./GradebookView";

// --- Helper Functions ---

const calculateMaxTotalScore = () => {
  let max = 0;
  UNIT_ACTIVITIES.forEach((act) => (max += act.maxScore));
  UNIT_QUIZZES.forEach((quiz) => (max += quiz.maxScore));
  max += MIDTERM_EXAM.maxScore;
  UNIT_ASSIGNMENTS.forEach((assign) => (max += assign.maxScore));
  DEFAULT_COURSE_UNITS.forEach(() => (max += NOTEBOOK_MAX_SCORE));
  max += FINAL_EXAM.maxScore;
  return max;
};

// Lightweight runtime helpers for unknown payloads
const asRecord = (v: unknown): Record<string, unknown> | null =>
  typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
const extractId = (v: unknown): string | undefined => {
  const r = asRecord(v);
  if (!r) return undefined;
  if (typeof r.id === "string") return r.id;
  if (typeof r.id === "number") return String(r.id);
  return undefined;
};
const extractTypeIndex = (v: unknown): { type?: string; index?: number } => {
  const r = asRecord(v);
  return {
    type: r && typeof r.type === "string" ? r.type : undefined,
    index: r && typeof r.index === "number" ? r.index : undefined,
  };
};

const calculateTotalScore = (progress: UserProgress) => {
  if (!progress) return 0;
  let total = 0;

  UNIT_ACTIVITIES.forEach((act) => {
    const p = progress.activities?.[act.id];
    if (p) total += p.score || 0;
  });

  UNIT_QUIZZES.forEach((quiz) => {
    const p = progress.quizzes?.[quiz.id];
    if (p) total += p.score || 0;
  });

  const midtermP = progress.quizzes?.[MIDTERM_EXAM.id];
  if (midtermP) total += midtermP.score || 0;

  UNIT_ASSIGNMENTS.forEach((assign) => {
    const sub = progress.assignments?.[assign.id];
    if (sub && sub.status === "graded") {
      total += sub.score || 0;
    }
  });

  DEFAULT_COURSE_UNITS.forEach((unit) => {
    const score = progress.notebookScores?.[unit.id];
    if (score) total += score || 0;
  });

  const finalP = progress.quizzes?.[FINAL_EXAM.id];
  if (finalP) total += finalP.score || 0;

  return total;
};

const getStatus = (percent: number) => {
  if (percent >= 80)
    return { text: "ผลงานดีเยี่ยม", color: "emerald", icon: "🌟" };
  if (percent >= 50) return { text: "ตามเกณฑ์", color: "blue", icon: "✅" };
  return { text: "ควรดูแลพิเศษ", color: "red", icon: "⚠️" };
};

import { calculateSimilarity, highlightMatches } from "./utils/searchUtils";

const ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee size={24} />,
  Monitor: <Monitor size={24} />,
  Zap: <Zap size={24} />,
  PenTool: <PenTool size={24} />,
  Layers: <Layers size={24} />,
  Book: <Book size={24} />,
  Activity: <Activity size={24} />,
  Trophy: <Trophy size={24} />,
};

// AnalyticsTab is large — load it lazily to reduce initial bundle size
const AnalyticsTab = lazy(() => import("./TeacherDashboardAnalytics.tsx"));
interface TeacherDashboardProps {
  onSwitchToStudentView: () => void;
  deepLinkInfo?: { studentId?: string; assignmentId?: string } | null;
  onDeepLinkHandled?: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onSwitchToStudentView,
  deepLinkInfo,
  onDeepLinkHandled,
}) => {
  const {
    user,
    connectedCollections,
    allUsers,
    allProgress,
    announcements,
    qnaList,
    resources,
    courseUnits,
    addAnnouncement,
    deleteAnnouncement,
    answerQuestion,
    gradeAssignment,
    updateResources,
    addCourseUnit,
    updateCourseUnit,
    deleteCourseUnit,
    exportData,
    importData,
    updateUser,
    deleteStudent,
    isOnline,
    register,
    generateResetCode,
    gradeNotebook,
    gradeActivity,
resetUserPassword,
    } = useData();
  const { logError } = useError();

  const students = useMemo(() => {
    const nameToBestUser = new Map<string, User>();

    allUsers.forEach((user) => {
      if (user.role !== "student" || !user.name) return;

      const existingUser = nameToBestUser.get(user.name);
      if (!existingUser) {
        nameToBestUser.set(user.name, user);
      } else {
        const existingScore = calculateTotalScore(allProgress[existingUser.id]);
        const currentScore = calculateTotalScore(allProgress[user.id]);
        if (currentScore > existingScore) {
          nameToBestUser.set(user.name, user);
        }
      }
    });

    Object.values(allProgress).forEach((progress: UserProgress) => {
      const studentName =
        progress.studentName || `Student ${progress.studentId}`;
      if (studentName && !nameToBestUser.has(studentName)) {
        nameToBestUser.set(studentName, {
          id: progress.studentId,
          username: progress.studentId,
          name: studentName,
          role: "student",
          avatar: progress.avatar || "🧑‍🎓",
        });
      }
    });

    return Array.from(nameToBestUser.values());
  }, [allUsers, allProgress]);

  const [activeTab, setActiveTab] = useState<
    | "analytics"
    | "students"
    | "courses"
    | "content_creator"
    | "grading"
    | "gradebook"
    | "communication"
    | "backup"
    | "resources"
  >("students");



  const [gradingSubmission, setGradingSubmission] = useState<
    (Submission & { studentName?: string }) | null
  >(null);
  const [gradingNotebook, setGradingNotebook] = useState<
    | (NotebookSubmission & {
        studentName?: string;
        studentId: string;
        unitId: string;
      })
    | null
  >(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [similarityResults, setSimilarityResults] = useState<
    { name: string; score: number }[]
  >([]);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
  const [aiInsight, setAiInsight] = useState<{
    content: string;
    assignmentTitle: string;
  } | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const [nameSearchQuery, setNameSearchQuery] = useState("");
  const [idSearchQuery, setIdSearchQuery] = useState("");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("all");
  const [studentViewMode, setStudentViewMode] = useState<"list" | "grid">(
    "list",
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  const [filterStatus, setFilterStatus] = useState<
    "all" | "at_risk" | "on_track" | "high_achiever" | "cheat_warning"
  >("all");
  const [selectedStudent, setSelectedStudent] = useState<
    (User & { score?: number; percent?: number; totalCheats?: number }) | null
  >(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    id: "",
    title: "เด็กชาย",
    firstName: "",
    lastName: "",
    classLevel: "",
    room: "",
    seatNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CourseUnit | null>(null);
  const [courseFormData, setCourseFormData] = useState<Partial<CourseUnit>>({
    title: "",
    subtitle: "",
    description: "",
    icon: "Book",
    color: "blue",
    isActive: true,
    order: courseUnits.length + 1,
  });

  const [selectedUnitForResource, setSelectedUnitForResource] = useState(
    courseUnits[0]?.id || "unit_1",
  );
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [resourceFormData, setResourceFormData] = useState<{
    type: string;
    title: string;
    url: string;
    description: string;
  }>({ type: "video", title: "", url: "", description: "" });
  const [analyzingAssessment, setAnalyzingAssessment] = useState<
    QuizData | ActivityData | null
  >(null);
  const [resourcePage, setResourcePage] = useState({
    videos: 1,
    pdfs: 1,
    links: 1,
  });
  const [resourceItemsPerPage, setResourceItemsPerPage] = useState(10);

  const [resettingStudent, setResettingStudent] = useState<
    (User & { score: number; percent: number; totalCheats: number }) | null
  >(null);
  const [newPassword, setNewPassword] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "student" | "unit" | "announcement" | "resource";
    data: unknown;
  } | null>(null);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    UNIT_ASSIGNMENTS[0]?.id || "",
  );
  const [gradingMode, setGradingMode] = useState<"assignments" | "notebooks">(
    "assignments",
  );
  const [selectedNotebookUnit, setSelectedNotebookUnit] = useState(
    courseUnits[0]?.id || "unit_1",
  );
  const [selectedClass, setSelectedClass] = useState("all");
  const [gradingNameQuery, setGradingNameQuery] = useState("");
  const [gradingIdQuery, setGradingIdQuery] = useState("");
  const [gradingNotebookQuery, setGradingNotebookQuery] = useState("");
  const [gradingNotebookQueryDebounced, setGradingNotebookQueryDebounced] =
    useState("");
  const [gradingDateStart, setGradingDateStart] = useState("");
  const [gradingDateEnd, setGradingDateEnd] = useState("");
  const [gradingMinScore, setGradingMinScore] = useState("");
  const [gradingMaxScore, setGradingMaxScore] = useState("");
  const [gradingFuzzyEnabled, setGradingFuzzyEnabled] = useState(false);
  const [gradingFuzzyThreshold, setGradingFuzzyThreshold] = useState(60);
  useEffect(() => {
    const t = setTimeout(
      () => setGradingNotebookQueryDebounced(gradingNotebookQuery),
      300,
    );
    return () => clearTimeout(t);
  }, [gradingNotebookQuery]);
  const [gradingViewMode, setGradingViewMode] = useState<"table" | "card">(
    "table",
  );
  const [gradingCurrentPage, setGradingCurrentPage] = useState(1);
  const [gradingItemsPerPage, setGradingItemsPerPage] = useState(10);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [batchScore, setBatchScore] = useState("");
  const [batchFeedback, setBatchFeedback] = useState("");
  const [gradingFilterStatus, setGradingFilterStatus] = useState<
    "all" | "pending" | "graded" | "missing"
  >("pending");

  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);

  const [gbNameQuery, _setGbNameQuery] = useState("");
  const [gbIdQuery, _setGbIdQuery] = useState("");
  const [gbRoomFilter, _setGbRoomFilter] = useState("all");
  const [gbCurrentPage, setGbCurrentPage] = useState(1);
  const [gbItemsPerPage, setGbItemsPerPage] = useState(10);

  const openGrading = useCallback(
    (studentId: string, assignmentId: string) => {
      const prog = allProgress[studentId];
      if (prog && prog.assignments[assignmentId]) {
        const sub = prog.assignments[assignmentId];
        const student = students.find((s) => s.id === studentId);
        setGradingSubmission({
          ...sub,
          studentName: student?.name || prog.studentName,
        });
        setScoreInput(sub.score?.toString() || "");
        setFeedbackInput(sub.feedback || "");
        setSimilarityResults([]);
      }
    },
    [allProgress, students],
  );

  const openNotebookGrading = useCallback(
    (studentId: string, unitId: string) => {
      const prog = allProgress[studentId];
      if (prog && prog.notebookSubmissions?.[unitId]) {
        const sub = prog.notebookSubmissions[unitId];
        const student = students.find((s) => s.id === studentId);
        // Ensure `content` is present on the grading object. Older records
        // might have the student's answer in `prog.notebook[unitId]` rather
        // than `sub.content`, so prefer that as a fallback.
        const content = sub.content || prog.notebook?.[unitId] || "";
        setGradingNotebook({
          ...sub,
          content,
          studentName: student?.name || prog.studentName,
          studentId,
          unitId,
        });
        setScoreInput(sub.score?.toString() || "");
        setFeedbackInput(sub.feedback || "");
      }
    },
    [allProgress, students],
  );

  useEffect(() => {
    if (deepLinkInfo && onDeepLinkHandled) {
      setActiveTab("grading");
      if (deepLinkInfo.studentId && deepLinkInfo.assignmentId) {
        setTimeout(() => {
          openGrading(deepLinkInfo.studentId!, deepLinkInfo.assignmentId!);
        }, 100);
      }
      onDeepLinkHandled();
    }
  }, [deepLinkInfo, onDeepLinkHandled, openGrading]);

  useEffect(() => {
    if (editingStudent) {
      setEditFormData(editingStudent);
    } else {
      setEditFormData(null);
    }
  }, [editingStudent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    nameSearchQuery,
    idSearchQuery,
    selectedRoomFilter,
    filterStatus,
    studentsPerPage,
  ]);

  useEffect(() => {
    setGradingCurrentPage(1);
  }, [
    selectedClass,
    gradingNameQuery,
    gradingIdQuery,
    gradingNotebookQuery,
    gradingDateStart,
    gradingDateEnd,
    gradingMinScore,
    gradingMaxScore,
    gradingFuzzyEnabled,
    gradingFuzzyThreshold,
    gradingItemsPerPage,
    selectedAssignmentId,
    gradingFilterStatus,
  ]);

  useEffect(() => {
    setGbCurrentPage(1);
  }, [gbNameQuery, gbIdQuery, gbRoomFilter, gbItemsPerPage]);

  const uniqueRooms = useMemo(() => {
    const rooms = new Set(
      students
        .map((s) =>
          s.classLevel && s.room ? `${s.classLevel}/${s.room}` : null,
        )
        .filter(Boolean),
    );
    return ["all", ...Array.from(rooms).sort()];
  }, [students]);

  const selectedAssignment = useMemo(() => {
    return UNIT_ASSIGNMENTS.find((a) => a.id === selectedAssignmentId);
  }, [selectedAssignmentId]);

  const filteredStudentsForGrading = useMemo(() => {
    let filtered = students;

    if (selectedClass !== "all") {
      filtered = filtered.filter(
        (s) =>
          s.classLevel &&
          s.room &&
          `${s.classLevel}/${s.room}` === selectedClass,
      );
    }
    if (gradingNameQuery) {
      const q = gradingNameQuery.toLowerCase().replace(/\s/g, "");
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().replace(/\s/g, "").includes(q),
      );
    }
    if (gradingIdQuery) {
      const q = gradingIdQuery.toLowerCase();
      filtered = filtered.filter((s) => s.id.toLowerCase().includes(q));
    }

    return filtered;
  }, [students, selectedClass, gradingNameQuery, gradingIdQuery, allProgress]);

  const submissionData = useMemo(() => {
    if (!selectedAssignment) return [];
    return filteredStudentsForGrading.map((student) => {
      const submission =
        allProgress[student.id]?.assignments?.[selectedAssignmentId];
      const isLate =
        submission &&
        new Date(submission.submittedAt) >
          new Date(selectedAssignment.deadline);
      let status: "graded" | "pending" | "missing" = "missing";
      if (submission) {
        status = submission.status;
      }
      return {
        student,
        submission,
        isLate,
        status,
      };
    });
  }, [filteredStudentsForGrading, allProgress, selectedAssignment]);

  const filteredSubmissionData = useMemo(() => {
    let data = submissionData;
    if (gradingFilterStatus !== "all") {
      data = data.filter((s) => s.status === gradingFilterStatus);
    }
    // Date range filter (assignments)
    if (gradingDateStart) {
      const start = new Date(gradingDateStart).getTime();
      data = data.filter(
        (d) =>
          d.submission && new Date(d.submission.submittedAt).getTime() >= start,
      );
    }
    if (gradingDateEnd) {
      const end = new Date(gradingDateEnd).getTime();
      data = data.filter(
        (d) =>
          d.submission && new Date(d.submission.submittedAt).getTime() <= end,
      );
    }
    // Score range filter (assignments)
    if (gradingMinScore) {
      const min = parseFloat(gradingMinScore);
      if (!isNaN(min))
        data = data.filter(
          (d) => d.submission && (d.submission.score ?? 0) >= min,
        );
    }
    if (gradingMaxScore) {
      const max = parseFloat(gradingMaxScore);
      if (!isNaN(max))
        data = data.filter(
          (d) => d.submission && (d.submission.score ?? 0) <= max,
        );
    }
    // General text / fuzzy search for assignments (use debounced query)
    if (
      gradingNotebookQueryDebounced &&
      gradingNotebookQueryDebounced.trim().length > 0
    ) {
      const q = gradingNotebookQueryDebounced.toLowerCase().trim();
      if (!gradingFuzzyEnabled) {
        data = data.filter((item) => {
          const studentName = (item.student?.name || "").toLowerCase();
          const studentId = (item.student?.id || "").toLowerCase();
          const answer = (item.submission?.answerText || "").toLowerCase();
          const feedback = (item.submission?.feedback || "").toLowerCase();
          const assignmentTitle = (
            selectedAssignment?.title || ""
          ).toLowerCase();
          return (
            studentName.includes(q) ||
            studentId.includes(q) ||
            answer.includes(q) ||
            feedback.includes(q) ||
            assignmentTitle.includes(q)
          );
        });
      } else {
        // fuzzy: use Fuse.js to match approximately across combined text
        const list = data.map((item, idx) => ({
          idx,
          text: `${item.student?.name || ""} ${item.student?.id || ""} ${item.submission?.answerText || ""} ${item.submission?.feedback || ""} ${selectedAssignment?.title || ""}`,
        }));
        const fuse = new Fuse(list, {
          keys: ["text"],
          includeScore: true,
          threshold: Math.max(0, 1 - gradingFuzzyThreshold / 100),
          ignoreLocation: true,
        });
        const res = fuse.search(q);
        const matched = new Set(res.map((r) => r.item.idx));
        data = data.filter((_, idx) => matched.has(idx));
      }
    }
    return data.sort((a, b) => {
      if (!a.submission) return 1;
      if (!b.submission) return -1;
      return (
        new Date(a.submission.submittedAt).getTime() -
        new Date(b.submission.submittedAt).getTime()
      );
    });
  }, [
    submissionData,
    gradingFilterStatus,
    gradingDateStart,
    gradingDateEnd,
    gradingMinScore,
    gradingMaxScore,
    gradingNotebookQuery,
    gradingFuzzyEnabled,
    gradingFuzzyThreshold,
    selectedAssignment,
  ]);

  const paginatedSubmissionData = useMemo(() => {
    const indexOfLast = gradingCurrentPage * gradingItemsPerPage;
    const indexOfFirst = indexOfLast - gradingItemsPerPage;
    return filteredSubmissionData.slice(indexOfFirst, indexOfLast);
  }, [filteredSubmissionData, gradingCurrentPage, gradingItemsPerPage]);

  const gradingStats = useMemo(() => {
    const total = filteredStudentsForGrading.length;
    const graded = submissionData.filter((s) => s.status === "graded").length;
    const pending = submissionData.filter((s) => s.status === "pending").length;
    const missing = total - graded - pending;
    return { total, graded, pending, missing };
  }, [filteredStudentsForGrading, submissionData]);

  const notebookSubmissionData = useMemo(() => {
    return filteredStudentsForGrading.map((student) => {
      const submission =
        allProgress[student.id]?.notebookSubmissions?.[selectedNotebookUnit];
      const isGraded = submission?.score !== undefined;
      return {
        student,
        submission,
        isGraded,
      };
    });
  }, [filteredStudentsForGrading, allProgress, selectedNotebookUnit]);

  const filteredNotebookSubmissionData = useMemo(() => {
    let data = notebookSubmissionData;
    if (gradingFilterStatus !== "all") {
      if (gradingFilterStatus === "graded") {
        data = data.filter((s) => s.isGraded);
      } else if (gradingFilterStatus === "pending") {
        data = data.filter((s) => s.submission && !s.isGraded);
      } else if (gradingFilterStatus === "missing") {
        data = data.filter((s) => !s.submission);
      }
    }
    // Date range filter (notebooks)
    if (gradingDateStart) {
      const start = new Date(gradingDateStart).getTime();
      data = data.filter(
        (d) =>
          d.submission && new Date(d.submission.submittedAt).getTime() >= start,
      );
    }
    if (gradingDateEnd) {
      const end = new Date(gradingDateEnd).getTime();
      data = data.filter(
        (d) =>
          d.submission && new Date(d.submission.submittedAt).getTime() <= end,
      );
    }
    // Score range filter (notebooks)
    if (gradingMinScore) {
      const min = parseFloat(gradingMinScore);
      if (!isNaN(min))
        data = data.filter(
          (d) => d.submission && (d.submission.score ?? 0) >= min,
        );
    }
    if (gradingMaxScore) {
      const max = parseFloat(gradingMaxScore);
      if (!isNaN(max))
        data = data.filter(
          (d) => d.submission && (d.submission.score ?? 0) <= max,
        );
    }
    // Text search across multiple fields: student name, id, submission content, feedback, unit title
    if (
      gradingNotebookQueryDebounced &&
      gradingNotebookQueryDebounced.trim().length > 0
    ) {
      const q = gradingNotebookQueryDebounced.toLowerCase().trim();
      if (!gradingFuzzyEnabled) {
        data = data.filter((item) => {
          const studentName = (item.student?.name || "").toLowerCase();
          const studentId = (item.student?.id || "").toLowerCase();
          const content = (item.submission?.content || "").toLowerCase();
          const feedback = (item.submission?.feedback || "").toLowerCase();
          const unitTitle = (
            courseUnits.find((u) => u.id === selectedNotebookUnit)?.subtitle ||
            ""
          ).toLowerCase();
          return (
            studentName.includes(q) ||
            studentId.includes(q) ||
            content.includes(q) ||
            feedback.includes(q) ||
            unitTitle.includes(q)
          );
        });
      } else {
        const list = data.map((item, idx) => ({
          idx,
          text: `${item.student?.name || ""} ${item.student?.id || ""} ${item.submission?.content || ""} ${item.submission?.feedback || ""} ${courseUnits.find((u) => u.id === selectedNotebookUnit)?.subtitle || ""}`,
        }));
        const fuse = new Fuse(list, {
          keys: ["text"],
          includeScore: true,
          threshold: Math.max(0, 1 - gradingFuzzyThreshold / 100),
          ignoreLocation: true,
        });
        const res = fuse.search(q);
        const matched = new Set(res.map((r) => r.item.idx));
        data = data.filter((_, idx) => matched.has(idx));
      }
    }
    return data;
  }, [
    notebookSubmissionData,
    gradingFilterStatus,
    gradingNotebookQuery,
    gradingDateStart,
    gradingDateEnd,
    gradingMinScore,
    gradingMaxScore,
    gradingFuzzyEnabled,
    gradingFuzzyThreshold,
    selectedNotebookUnit,
    courseUnits,
  ]);

  const paginatedNotebookSubmissionData = useMemo(() => {
    const indexOfLast = gradingCurrentPage * gradingItemsPerPage;
    const indexOfFirst = indexOfLast - gradingItemsPerPage;
    return filteredNotebookSubmissionData.slice(indexOfFirst, indexOfLast);
  }, [filteredNotebookSubmissionData, gradingCurrentPage, gradingItemsPerPage]);

  // Use the appropriate filtered dataset depending on the grading mode (assignments vs notebooks)
  const gradingTotalPages = Math.ceil(
    (gradingMode === "assignments"
      ? filteredSubmissionData.length
      : filteredNotebookSubmissionData.length) / gradingItemsPerPage,
  );

  const notebookGradingStats = useMemo(() => {
    const total = filteredStudentsForGrading.length;
    const graded = notebookSubmissionData.filter((s) => s.isGraded).length;
    const pending = notebookSubmissionData.filter(
      (s) => s.submission && !s.isGraded,
    ).length;
    const missing = total - graded - pending;
    return { total, graded, pending, missing };
  }, [filteredStudentsForGrading, notebookSubmissionData]);

  const handleSelectAll = () => {
    const currentStudentIdsOnPage = paginatedSubmissionData.map(
      (s) => s.student.id,
    );
    const allSelectedOnPage = currentStudentIdsOnPage.every((id) =>
      selectedStudentIds.includes(id),
    );

    if (allSelectedOnPage) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !currentStudentIdsOnPage.includes(id)),
      );
    } else {
      setSelectedStudentIds((prev) => [
        ...new Set([...prev, ...currentStudentIdsOnPage]),
      ]);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleBatchGrade = () => {
    if (selectedStudentIds.length === 0 || !batchScore) {
      logError("กรุณาเลือกนักเรียนและใส่คะแนนสำหรับ Batch Grading", "warning");
      return;
    }
    const score = parseInt(batchScore);
    if (isNaN(score) || score < 0) {
      logError("คะแนนไม่ถูกต้อง", "warning");
      return;
    }
    if (
      window.confirm(
        `ยืนยันการให้คะแนน ${score} คะแนน พร้อม Feedback แก่นักเรียน ${selectedStudentIds.length} คน?`,
      )
    ) {
      selectedStudentIds.forEach((studentId) => {
        gradeAssignment(studentId, selectedAssignmentId, score, batchFeedback);
      });
      setSelectedStudentIds([]);
      setBatchScore("");
      setBatchFeedback("");
      logError("ให้คะแนนแบบกลุ่มเรียบร้อย", "success");
    }
  };

  const handleClearFilters = () => {
    setGradingDateStart("");
    setGradingDateEnd("");
    setGradingMinScore("");
    setGradingMaxScore("");
    setGradingNotebookQuery("");
    setGradingNotebookQueryDebounced("");
    setGradingNameQuery("");
    setGradingIdQuery("");
    setGradingFuzzyEnabled(false);
    setGradingFuzzyThreshold(60);
  };

  const exportGradebookCsv = (
    dataToExport: Record<string, unknown>[],
    fileName: string,
  ) => {
    if (dataToExport.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = Object.keys(dataToExport[0]);
    csvContent += headers.join(",") + "\r\n";
    dataToExport.forEach((item) => {
      const row = headers
        .map((header) => `"${String(item[header] ?? "").replace(/"/g, '""')}"`)
        .join(",");
      csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logError("ส่งออกข้อมูลคะแนนสำเร็จ", "info");
  };

  const handleExportGrading = () => {
    if (!selectedAssignment) return;
    const data = submissionData.map(({ student, submission, status }) => ({
      รหัสนักเรียน: student.username,
      "ชื่อ-สกุล": student.name,
      สถานะ: status,
      คะแนน: submission?.score ?? "",
    }));
    exportGradebookCsv(
      data,
      `grades_${selectedAssignment.id}_${selectedClass}`,
    );
  };

  const maxTotalScore = useMemo(() => calculateMaxTotalScore(), []);

  const filteredAndSortedStudents = useMemo(() => {
    let studentData = students.map((s) => {
      const prog = allProgress[s.id];
      const score = prog ? calculateTotalScore(prog) : 0;
      const percent =
        maxTotalScore > 0 ? Math.round((score / maxTotalScore) * 100) : 0;
      const totalCheats = Object.values(prog?.quizzes || {}).reduce(
        (acc: number, q: { cheatAttempts?: number } | undefined) =>
          acc + (q?.cheatAttempts || 0),
        0,
      );
      return { ...s, score, percent, totalCheats };
    });

    if (nameSearchQuery) {
      const q = nameSearchQuery.toLowerCase().replace(/\s/g, "");
      studentData = studentData.filter((s) =>
        s.name.toLowerCase().replace(/\s/g, "").includes(q),
      );
    }

    if (idSearchQuery) {
      const q = idSearchQuery.toLowerCase();
      studentData = studentData.filter((s) => s.id.toLowerCase().includes(q));
    }

    if (selectedRoomFilter !== "all") {
      studentData = studentData.filter(
        (s) =>
          s.classLevel &&
          s.room &&
          `${s.classLevel}/${s.room}` === selectedRoomFilter,
      );
    }

    if (filterStatus !== "all") {
      studentData = studentData.filter((s) => {
        if (filterStatus === "cheat_warning") return s.totalCheats > 0;
        const status = getStatus(s.percent).text;
        if (filterStatus === "at_risk") return status === "ควรดูแลพิเศษ";
        if (filterStatus === "on_track") return status === "ตามเกณฑ์";
        if (filterStatus === "high_achiever") return status === "ผลงานดีเยี่ยม";
        return true;
      });
    }

    studentData.sort((a, b) => {
      const key = sortConfig.key as keyof typeof a;
      const valA = a[key] ?? "";
      const valB = b[key] ?? "";
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return studentData;
  }, [
    students,
    allProgress,
    nameSearchQuery,
    idSearchQuery,
    selectedRoomFilter,
    filterStatus,
    sortConfig,
    maxTotalScore,
  ]);

  const paginatedStudents = useMemo(() => {
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    return filteredAndSortedStudents.slice(
      indexOfFirstStudent,
      indexOfLastStudent,
    );
  }, [filteredAndSortedStudents, currentPage, studentsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedStudents.length / studentsPerPage,
  );

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleGradeSubmit = () => {
    if (!gradingSubmission) return;
    gradeAssignment(
      gradingSubmission.studentId,
      gradingSubmission.assignmentId,
      parseInt(scoreInput) || 0,
      feedbackInput,
    );
    setGradingSubmission(null);
    logError("บันทึกคะแนนเรียบร้อย", "success");
  };

  const handleNotebookGradeSubmit = () => {
    if (!gradingNotebook) return;
    gradeNotebook(
      gradingNotebook.studentId,
      gradingNotebook.unitId,
      parseInt(scoreInput) || 0,
      feedbackInput,
    );
    setGradingNotebook(null);
    logError("บันทึกคะแนนสมุดบันทึกเรียบร้อย", "success");
  };

  const handlePostAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    addAnnouncement(newAnnouncement);
    setNewAnnouncement("");
    setIsCreatingAnnouncement(false);
    logError("ส่งประกาศเรียบร้อย", "success");
  };

  const handleReplyQnA = (id: string | number) => {
    const text = replyTexts[String(id)];
    if (!text?.trim()) return;
    answerQuestion(id, text);
    setReplyTexts((prev) => ({ ...prev, [String(id)]: "" }));
    logError("ตอบกลับคำถามแล้ว", "success");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content))
        logError("นำเข้าข้อมูลสำเร็จ กรุณารีเฟรชหน้าจอ", "success");
      else logError("ไฟล์ข้อมูลไม่ถูกต้อง", "error");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleOpenCourseModal = (unit?: CourseUnit, isDuplicate = false) => {
    if (unit) {
      if (isDuplicate) {
        setEditingUnit(null);
        setCourseFormData({
          ...unit,
          id: `unit_${Date.now()}`,
          subtitle: `[สำเนา] ${unit.subtitle}`,
          order: courseUnits.length + 1,
        });
      } else {
        setEditingUnit(unit);
        setCourseFormData(unit);
      }
    } else {
      setEditingUnit(null);
      setCourseFormData({
        id: `unit_${Date.now()}`,
        title: "",
        subtitle: "",
        description: "",
        icon: "Book",
        color: "blue",
        isActive: true,
        order: courseUnits.length + 1,
      });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = () => {
    if (!courseFormData.title || !courseFormData.subtitle) {
      logError("กรุณากรอกหัวข้อหน่วยการเรียนรู้", "warning");
      return;
    }

    const confirmMessage = editingUnit
      ? "ยืนยันการแก้ไข?"
      : "ยืนยันการสร้างบทเรียนใหม่?";

    if (confirm(confirmMessage)) {
      if (editingUnit) {
        updateCourseUnit(courseFormData as CourseUnit);
        logError("แก้ไขหน่วยการเรียนรู้สำเร็จ", "success");
      } else {
        addCourseUnit(courseFormData as CourseUnit);
        logError("เพิ่มบทเรียนใหม่สำเร็จ", "success");
      }
      setIsCourseModalOpen(false);
    }
  };

  const handleSaveResource = () => {
    const { type, title, url, description } = resourceFormData;
    if (!title.trim() || !url.trim()) {
      logError("กรุณากรอกชื่อและ URL ของสื่อ", "warning");
      return;
    }

    if (
      !confirm(
        editingResource ? "ยืนยันการแก้ไขข้อมูล?" : "ยืนยันการเพิ่มข้อมูล?",
      )
    )
      return;

    const newItem = { title, url, description };
    const targetListKey = `${type}s` as "videos" | "pdfs" | "links";
    let nextResources = [...resources];

    if (editingResource) {
      const unitIndex = nextResources.findIndex(
        (u) => u.unitId === selectedUnitForResource,
      );
      if (unitIndex === -1) return;
      const unitToEdit = { ...nextResources[unitIndex] };
      const originalListKey =
        `${(editingResource as Record<string, unknown>).originalType}s` as
          | "videos"
          | "pdfs"
          | "links";

      if (targetListKey === originalListKey) {
        const list = [...(unitToEdit[targetListKey] || [])];
        (list as UnitResourceCollection["videos"])[
          (editingResource as Record<string, unknown>).originalIndex as number
        ] = newItem as unknown as UnitResourceCollection["videos"][0];
        unitToEdit[targetListKey] = list as UnitResourceCollection["videos"];
      } else {
        const oldList = (unitToEdit[originalListKey] || []).filter(
          (_: unknown, index: number) =>
            index !==
            ((editingResource as Record<string, unknown>)
              .originalIndex as number),
        );
        const newList = [...(unitToEdit[targetListKey] || []), newItem];
        unitToEdit[originalListKey] =
          oldList as UnitResourceCollection["videos"];
        unitToEdit[targetListKey] = newList as UnitResourceCollection["videos"];
      }
      nextResources[unitIndex] = unitToEdit;
    } else {
      let unitIndex = nextResources.findIndex(
        (u) => u.unitId === selectedUnitForResource,
      );
      if (unitIndex !== -1) {
        const unitToUpdate = { ...nextResources[unitIndex] };
        const list = [...(unitToUpdate[targetListKey] || []), newItem];
        unitToUpdate[targetListKey] = list as UnitResourceCollection["videos"];
        nextResources[unitIndex] = unitToUpdate;
      } else {
        const newUnitCollection: UnitResourceCollection = {
          unitId: selectedUnitForResource,
          unitTitle:
            courseUnits.find((u) => u.id === selectedUnitForResource)
              ?.subtitle || "New Unit",
          videos: [],
          pdfs: [],
          links: [],
        };
        newUnitCollection[targetListKey] = [
          newItem,
        ] as UnitResourceCollection["videos"];
        nextResources.push(newUnitCollection);
      }
    }
    updateResources(nextResources);
    setIsResourceModalOpen(false);
    logError(
      editingResource ? "แก้ไขสื่อสำเร็จ" : "เพิ่มสื่อสำเร็จ",
      "success",
    );
  };

  const handleAiGrade = async () => {
    if (!gradingSubmission) return;
    if (!gradingSubmission.answerText) {
      logError("AI สามารถตรวจได้เฉพาะคำตอบที่เป็นข้อความเท่านั้น", "warning");
      return;
    }
    setIsAiGrading(true);
    try {
      logError(
        "ฟีเจอร์ AI ยังไม่พร้อมใช้งานบนฝั่งไคลเอ็นต์ โปรดตั้งค่า backend เพื่อใช้งาน",
        "error",
      );
      setFeedbackInput(
        "AI grading ไม่พร้อมในเวอร์ชันเว็บนี้ — โปรดตั้งค่า server-side AI endpoint.",
      );
    } catch {
      console.error("AI Grading Fallback Error");
    } finally {
      setIsAiGrading(false);
    }
  };

  const handleCheckSimilarity = () => {
    if (!gradingSubmission || !gradingSubmission.answerText) return;
    setIsCheckingSimilarity(true);

    const results: { name: string; score: number }[] = [];
    const currentAnswer = gradingSubmission.answerText;
    const assignmentId = gradingSubmission.assignmentId;

    Object.values(allProgress).forEach((prog: UserProgress) => {
      if (prog.studentId === gradingSubmission.studentId) return;

      const peerSub = prog.assignments?.[assignmentId];
      if (peerSub && peerSub.answerText) {
        const score = calculateSimilarity(currentAnswer, peerSub.answerText);
        if (score > 40) {
          results.push({ name: prog.studentName, score: Math.round(score) });
        }
      }
    });

    const sortedResults = results.sort((a, b) => b.score - a.score);
    setSimilarityResults(sortedResults);

    if (sortedResults.length > 0 && sortedResults[0].score >= 60) {
      const topMatch = sortedResults[0];
      let newScore = 8;
      if (topMatch.score >= 90) {
        newScore = 6;
      } else if (topMatch.score >= 80) {
        newScore = 7;
      }

      const deductionReason = `มีการหักคะแนนเนื่องจากคำตอบมีความคล้ายคลึงกับงานของ ${topMatch.name} สูงถึง ${topMatch.score}%.`;

      setScoreInput(String(newScore));
      setFeedbackInput((prev) =>
        prev
          ? `${prev}\n\n[ประเมินความคล้ายคลึง]: ${deductionReason}`
          : `[ประเมินความคล้ายคลึง]: ${deductionReason}`,
      );
      logError(
        "ตรวจพบความคล้ายคลึงสูง และได้ปรับคะแนนเบื้องต้นแล้ว",
        "warning",
      );
    } else {
      logError(
        "ตรวจสอบความคล้ายคลึงเสร็จสิ้น ไม่พบความคล้ายคลึงที่น่าสงสัย",
        "info",
      );
    }

    setIsCheckingSimilarity(false);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!editFormData) return;
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveStudentEdit = async (updatedData: User) => {
    try {
      await updateUser(updatedData);
      setEditingStudent(null);
      logError("แก้ไขข้อมูลนักเรียนเรียบร้อยแล้ว", "success");
    } catch {
      logError("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    }
  };

  const handleConfirmSaveStudent = () => {
    if (!editFormData) return;

    if (editFormData.classLevel && !editFormData.classLevel.startsWith("ม.")) {
      logError('กรุณากรอกระดับชั้นให้ขึ้นต้นด้วย "ม." (เช่น ม.4)', "warning");
      return;
    }

    const finalData = {
      ...editFormData,
      name: `${editFormData.title || ""}${editFormData.firstName || ""} ${editFormData.lastName || ""}`.trim(),
    };
    handleSaveStudentEdit(finalData);
  };

  // Permanent password reset - generates a random permanent password
  const [generatedPermanentPassword, setGeneratedPermanentPassword] = useState<
    string | null
  >(null);
  const [generatedOneTimeCode, setGeneratedOneTimeCode] = useState<
    string | null
  >(null);

  // UI + safety states for confirm + undo flow
  const [isConfirmingPermanentReset, setIsConfirmingPermanentReset] = useState(false);
  const [confirmTargetStudent, setConfirmTargetStudent] = useState<(User & { score: number; percent: number; totalCheats: number }) | null>(null);
  const [pendingReset, setPendingReset] = useState<{
    student: User & { score: number; percent: number; totalCheats: number };
    password: string;
  } | null>(null);
  const [pendingSecondsLeft, setPendingSecondsLeft] = useState<number>(0);
  const [isExecutingReset, setIsExecutingReset] = useState(false);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  // transient UI state for copy feedback
  const [copiedPassword, setCopiedPassword] = useState(false);

  const pendingTimerRef = useRef<number | null>(null);
  const autoHidePasswordTimerRef = useRef<number | null>(null);

  // For tests we allow overriding the countdown and auto-hide timers via query params
  const urlSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
  const PENDING_RESET_SECONDS = Math.max(1, Number(urlSearch.get('resetCountdown') || 15));
  const PASSWORD_AUTO_HIDE_SECONDS = Math.max(1, Number(urlSearch.get('passwordAutoHide') || 15));

  // Initiates confirmation flow — the actual reset will happen after a short countdown allowing Undo
  const handlePermanentPasswordReset = async (
    student: User & { score: number; percent: number; totalCheats: number },
  ) => {
    // Open confirmation dialog
    setConfirmTargetStudent(student);
    setIsConfirmingPermanentReset(true);
  };

  // Called when user confirms in the confirmation dialog: starts countdown and shows undo banner
  const startPendingReset = (student: User & { score: number; percent: number; totalCheats: number }) => {
    // generate password
    const permanentPassword = Math.random().toString(36).slice(2, 10).toUpperCase();
    setPendingReset({ student, password: permanentPassword });
    setPendingSecondsLeft(PENDING_RESET_SECONDS);
    // start countdown timer
    if (pendingTimerRef.current) window.clearInterval(pendingTimerRef.current);
    pendingTimerRef.current = window.setInterval(() => {
      setPendingSecondsLeft((s) => {
        if (s <= 1) {
          if (pendingTimerRef.current) {
            window.clearInterval(pendingTimerRef.current);
            pendingTimerRef.current = null;
          }
          // execute the reset
          void executePendingReset();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    setIsConfirmingPermanentReset(false);
    setConfirmTargetStudent(null);
    logError(`เริ่มนับถอยหลังการรีเซ็ตรหัสผ่านสำหรับ ${student.name} (${PENDING_RESET_SECONDS} วินาที)`, 'info');
  };

  const cancelPendingReset = () => {
    if (pendingTimerRef.current) {
      window.clearInterval(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    setPendingReset(null);
    setPendingSecondsLeft(0);
    logError('ยกเลิกการรีเซ็ตรหัสผ่าน', 'info');
  };

  const executePendingReset = async () => {
    if (!pendingReset) return;
    const { student, password } = pendingReset;
    setIsExecutingReset(true);
    try {
      const targetUid = student.id || student.studentId;
      if (!targetUid) {
        logError('ไม่พบรหัสนักเรียน', 'error');
        setIsExecutingReset(false);
        setPendingReset(null);
        return;
      }
      try {
        const res = await resetUserPassword(targetUid, password);
        const rr = res as any;
        const ok = !!(rr === true || (rr && (rr.ok || (rr.result && rr.result.ok))));
        if (ok) {
          setGeneratedPermanentPassword(password);
          setShowGeneratedPassword(true);
          // auto-hide revealed password after a short interval
          if (autoHidePasswordTimerRef.current) window.clearTimeout(autoHidePasswordTimerRef.current);
          autoHidePasswordTimerRef.current = window.setTimeout(() => {
            setShowGeneratedPassword(false);
            // clear the generated password from UI after auto-hide for safety
            setTimeout(() => setGeneratedPermanentPassword(null), 200);
          }, PASSWORD_AUTO_HIDE_SECONDS * 1000);

          logError(`รีเซ็ตรหัสผ่านสำหรับ ${student.name} เรียบร้อยแล้ว`, 'success');
        } else {
          console.error('resetUserPassword returned non-ok response', res);
          logError('ไม่สามารถรีเซ็ตรหัสผ่านถาวรได้ กรุณาลองใหม่', 'error');
        }
      } catch (error: unknown) {
        console.error(error);
        // detect rate-limit-ish responses
        const err = error as any;
        if (err && (err.code === 429 || /rate/i.test(err?.message || ''))) {
          logError('การรีเซ็ตรหัสผ่านถูกจำกัดชั่วคราว กรุณาลองใหม่ในภายหลัง', 'error');
        } else {
          logError('ไม่สามารถรีเซ็ตรหัสผ่านถาวรได้ กรุณาลองใหม่ (ตรวจสอบการเชื่อมต่อและสิทธิ์)', 'error');
        }
      }
    } finally {
      setIsExecutingReset(false);
      setPendingReset(null);
      setPendingSecondsLeft(0);
    }
  };

  // Custom password setting - allows teacher to set a custom password
  const handleSetCustomPassword = async (
    student: User & { score: number; percent: number; totalCheats: number },
  ) => {
    const customPassword = window.prompt(
      `ตั้งรหัสผ่านให้ ${student.name}:\n\nรหัสผ่านควรมี 8-12 ตัวอักษร`,
    );
    if (!customPassword) return;
    if (customPassword.length < 8 || customPassword.length > 12) {
      logError("รหัสผ่านต้องมี 8-12 ตัวอักษร", "error");
      return;
    }
    try {
      const targetUid = student.id || student.studentId;
      if (!targetUid) {
        logError("ไม่พบรหัสนักเรียน", "error");
        return;
      }

      // Attempt to call cloud function to set the custom password
      try {
        const res = await resetUserPassword(targetUid, customPassword);
        const rr = res as any;
        const ok = !!(
          rr === true ||
          (rr && (rr.ok || (rr.result && rr.result.ok)))
        );
        if (ok) {
          logError(
            `ตั้งรหัสผ่านสำหรับ ${student.name} เรียบร้อยแล้ว!\nรหัสใหม่: ${customPassword}\nนักเรียนสามารถใช้รหัสนี้ได้ทันที`,
            "success",
          );
        } else {
          console.error('resetUserPassword returned non-ok response', res);
          logError("ไม่สามารถตั้งรหัสผ่านได้ กรุณาลองใหม่", "error");
        }
      } catch (error) {
        console.error(error);
        logError("ไม่สามารถตั้งรหัสผ่านได้ กรุณาลองใหม่ (ตรวจสอบการเชื่อมต่อและสิทธิ์)", "error");
      }
    } catch (error) {
      console.error(error);
      logError("ไม่สามารถตั้งรหัสผ่านได้ กรุณาลองใหม่", "error");
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resettingStudent) return;

    try {
      // Generate a one-time reset code for the student
      const resetCode = await generateResetCode(resettingStudent.id);
      setGeneratedOneTimeCode(resetCode);
      logError(`รหัสรีเซ็ตสร้างเรียบร้อย (หมดอายุ 24 ชม.)`, "success");
      setNewPassword("");
    } catch (err: unknown) {
      console.error(err);
      logError("เกิดข้อผิดพลาดในการสร้างรหัสรีเซ็ต", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      switch (deleteTarget.type) {
        case "student": {
          const id = extractId(deleteTarget.data);
          if (id) {
            await deleteStudent(id);
            logError("ลบข้อมูลนักเรียนเรียบร้อยแล้ว", "info");
          } else {
            logError("ไม่พบรหัสนักเรียนสำหรับการลบ", "error");
          }
          break;
        }
        case "unit": {
          const id = extractId(deleteTarget.data);
          if (id) {
            await deleteCourseUnit(id);
            logError("ลบหน่วยการเรียนรู้เรียบร้อย", "info");
          } else {
            logError("ไม่พบรหัสหน่วยสำหรับการลบ", "error");
          }
          break;
        }
        case "announcement": {
          const id = extractId(deleteTarget.data);
          if (id) {
            await deleteAnnouncement(id);
            logError("ลบประกาศเรียบร้อย", "info");
          } else {
            logError("ไม่พบรหัสประกาศสำหรับการลบ", "error");
          }
          break;
        }
        case "resource": {
          const { type, index: indexToDelete } = extractTypeIndex(
            deleteTarget.data,
          );
          if (!type || typeof indexToDelete !== "number") {
            logError("ข้อมูลสื่อไม่ครบถ้วนสำหรับการลบ", "error");
            break;
          }
          const listKey = `${type}s` as "videos" | "pdfs" | "links";
          const unitIndex = resources.findIndex(
            (u) => u.unitId === selectedUnitForResource,
          );

          if (unitIndex !== -1) {
            const nextResources = [...resources];
            const unitToUpdate = { ...nextResources[unitIndex] };
            const list = (unitToUpdate[listKey] as unknown[]) || [];

            if (list && list.length > 0) {
              unitToUpdate[listKey] = list.filter(
                (_: unknown, index) => index !== indexToDelete,
              ) as UnitResourceCollection["videos"];
              nextResources[unitIndex] = unitToUpdate;
              updateResources(nextResources);
              logError("ลบสื่อการสอนเรียบร้อยแล้ว", "info");
            }
          }
          break;
        }
      }
    } catch (e) {
      console.error(e);
      logError("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const getDeleteInfo = () => {
    if (!deleteTarget)
      return { title: "ยืนยันการลบ", message: "คุณแน่ใจหรือไม่?" };

    const dt = asRecord(deleteTarget.data) || {};
    const name =
      (typeof dt.name === "string" && dt.name) ||
      (typeof dt.subtitle === "string" && dt.subtitle) ||
      (typeof dt.title === "string" && dt.title) ||
      `ประกาศ ณ ${new Date(String(dt.date || "")).toLocaleDateString()}`;

    let title = "ยืนยันการลบ";
    if (deleteTarget.type === "student") title = "ยืนยันการลบนักเรียน";
    if (deleteTarget.type === "unit") title = "ยืนยันการลบหน่วยการเรียนรู้";

    return {
      title,
      message: `คุณต้องการลบ "${name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
    };
  };

  const pendingGradingCount = Object.values(allProgress).reduce(
    (acc: number, p: UserProgress) => {
      return (
        acc +
        Object.values(p.assignments || {}).filter(
          (a: Submission) => a.status === "pending",
        ).length
      );
    },
    0,
  );
  const pendingQnaCount = qnaList.filter((q) => !q.answer).length;
  const lastProgressTimestamp = (() => {
    let max = 0;
    Object.values(allProgress || {}).forEach((p: UserProgress) => {
      if (!p) return;
      Object.values(p.assignments || {}).forEach((a: unknown) => {
        const item = a as Record<string, unknown>;
        if (item?.submittedAt)
          max = Math.max(
            max,
            new Date(item.submittedAt as string | number).getTime(),
          );
      });
      Object.values(p.quizzes || {}).forEach((q: unknown) => {
        const item = q as Record<string, unknown>;
        if (item?.submittedAt)
          max = Math.max(
            max,
            new Date(item.submittedAt as string | number).getTime(),
          );
      });
      Object.values(p.activities || {}).forEach((ac: unknown) => {
        const item = ac as Record<string, unknown>;
        if (item?.submittedAt)
          max = Math.max(
            max,
            new Date(item.submittedAt as string | number).getTime(),
          );
      });
      Object.values(p.notebookSubmissions || {}).forEach((n: unknown) => {
        const item = n as Record<string, unknown>;
        if (item?.submittedAt)
          max = Math.max(
            max,
            new Date(item.submittedAt as string | number).getTime(),
          );
      });
    });
    return max
      ? new Date(max).toLocaleString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "ยังไม่มีข้อมูลล่าสุด";
  })();

  const tabs = [
    { id: "analytics", label: "วิเคราะห์ผล", icon: <PieChart size={20} /> },
    { id: "students", label: "รายชื่อนักเรียน", icon: <Users size={20} /> },
    { id: "courses", label: "จัดการหลักสูตร", icon: <BookOpen size={20} /> },
    {
      id: "content_creator",
      label: "สร้างเนื้อหา",
      icon: <PlusSquare size={20} />,
    },
    {
      id: "grading",
      label: "ตรวจงาน",
      icon: <ClipboardCheck size={20} />,
      badge: pendingGradingCount,
    },
    { id: "gradebook", label: "สมุดพก", icon: <FileSpreadsheet size={20} /> },
    { id: "resources", label: "สื่อการสอน", icon: <FolderPlus size={20} /> },
    {
      id: "communication",
      label: "ประกาศ/ถามตอบ",
      icon: <MessageSquare size={20} />,
      badge: pendingQnaCount,
    },
    { id: "backup", label: "สำรองข้อมูล", icon: <Database size={20} /> },
  ];

  const currentUnitResources = resources.find(
    (r) => r.unitId === selectedUnitForResource,
  );

  const allAssessments = useMemo(() => {
    return [
      ...UNIT_ACTIVITIES.map((a) => ({
        id: a.id,
        title: `กิจกรรม: ${a.title}`,
        maxScore: a.maxScore,
        type: "activity",
      })),
      ...UNIT_QUIZZES.map((q) => ({
        id: q.id,
        title: `Quiz: ${q.title}`,
        maxScore: q.maxScore,
        type: "quiz",
      })),
      {
        id: MIDTERM_EXAM.id,
        title: "สอบกลางภาค",
        maxScore: MIDTERM_EXAM.maxScore,
        type: "quiz",
      },
      ...UNIT_ASSIGNMENTS.map((a) => ({
        id: a.id,
        title: `ใบงาน: ${a.title}`,
        maxScore: a.maxScore,
        type: "assignment",
      })),
      ...DEFAULT_COURSE_UNITS.map((u) => ({
        id: `notebook_${u.id}`,
        title: `Note: ${u.title}`,
        maxScore: NOTEBOOK_MAX_SCORE,
        type: "notebook",
      })),
      {
        id: FINAL_EXAM.id,
        title: "สอบปลายภาค",
        maxScore: FINAL_EXAM.maxScore,
        type: "quiz",
      },
    ];
  }, []);

  const filteredStudentsForGradebook = useMemo(() => {
    let filtered = students;
    if (gbRoomFilter !== "all") {
      filtered = filtered.filter(
        (s) =>
          s.classLevel &&
          s.room &&
          `${s.classLevel}/${s.room}` === gbRoomFilter,
      );
    }
    if (gbNameQuery) {
      const q = gbNameQuery.toLowerCase().replace(/\s/g, "");
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().replace(/\s/g, "").includes(q),
      );
    }
    if (gbIdQuery) {
      const q = gbIdQuery.toLowerCase();
      filtered = filtered.filter((s) => s.id.toLowerCase().includes(q));
    }
    return filtered;
  }, [students, gbRoomFilter, gbNameQuery, gbIdQuery, allProgress]);

  const paginatedStudentsForGradebook = useMemo(() => {
    const startIndex = (gbCurrentPage - 1) * gbItemsPerPage;
    return filteredStudentsForGradebook.slice(
      startIndex,
      startIndex + gbItemsPerPage,
    );
  }, [filteredStudentsForGradebook, gbCurrentPage, gbItemsPerPage]);

  const gbTotalPages = Math.ceil(
    filteredStudentsForGradebook.length / gbItemsPerPage,
  );

  const handleExportGradebook = () => {
    const data = filteredStudentsForGradebook.map((student) => {
      const progress = allProgress[student.id];
      const totalScore = progress ? calculateTotalScore(progress) : 0;
      const row: Record<string, unknown> = {
        รหัสนักเรียน: student.username,
        "ชื่อ-สกุล": student.name,
        คะแนนรวม: totalScore,
      };
      allAssessments.forEach((a) => {
        let score: number | string | undefined = "";
        if (progress) {
          switch (a.type) {
            case "activity":
              score = progress.activities?.[a.id]?.score;
              break;
            case "quiz":
              score = progress.quizzes?.[a.id]?.score;
              break;
            case "assignment":
              score = progress.assignments?.[a.id]?.score;
              break;
            case "notebook": {
              const unitId = a.id.replace("notebook_", "");
              score = progress.notebookScores?.[unitId];
              break;
            }
          }
        }
        row[a.title] = typeof score === "number" ? score : "";
      });
      return row;
    });
    exportGradebookCsv(data, "full_gradebook");
  };

  const handleAddNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      id,
      firstName,
      lastName,
      classLevel,
      room,
      seatNumber,
      password,
      confirmPassword,
      title,
    } = newStudentData;
    if (
      !id ||
      !firstName ||
      !lastName ||
      !classLevel ||
      !room ||
      !seatNumber ||
      !password
    ) {
      logError("กรุณากรอกข้อมูลให้ครบทุกช่อง", "warning");
      return;
    }
    if (password !== confirmPassword) {
      logError("รหัสผ่านไม่ตรงกัน", "warning");
      return;
    }
    setIsAddingStudent(true);
    try {
      const newUser: User = {
        id,
        username: id,
        password,
        name: `${title}${firstName} ${lastName}`,
        role: "student",
        avatar: "🧑‍🎓",
        title,
        firstName,
        lastName,
        classLevel,
        room,
        seatNumber,
      };
      const success = await register(newUser);
      if (success) {
        logError(`เพิ่มนักเรียน ${newUser.name} สำเร็จ`, "success");
        setIsAddStudentModalOpen(false);
        setNewStudentData({
          id: "",
          title: "เด็กชาย",
          firstName: "",
          lastName: "",
          classLevel: "",
          room: "",
          seatNumber: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch {
      // Handle error silently or log if needed
    } finally {
      setIsAddingStudent(false);
    }
  };

  const paginatedResources = useMemo(() => {
    if (!currentUnitResources) return { videos: [], pdfs: [], links: [] };

    const paginate = (items: unknown[], page: number, perPage: number) => {
      const start = (page - 1) * perPage;
      return items.slice(start, start + perPage);
    };

    return {
      videos: paginate(
        currentUnitResources.videos,
        resourcePage.videos,
        resourceItemsPerPage,
      ),
      pdfs: paginate(
        currentUnitResources.pdfs,
        resourcePage.pdfs,
        resourceItemsPerPage,
      ),
      links: paginate(
        currentUnitResources.links || [],
        resourcePage.links,
        resourceItemsPerPage,
      ),
    };
  }, [currentUnitResources, resourcePage, resourceItemsPerPage]);

  const ResourcePaginationControls: React.FC<{
    type: "videos" | "pdfs" | "links";
  }> = ({ type }) => {
    if (!currentUnitResources) return null;
    const totalItems =
      ((currentUnitResources?.[type] as unknown as unknown[]) || []).length ||
      0;
    if (totalItems <= resourceItemsPerPage) return null;

    const totalPages = Math.ceil(totalItems / resourceItemsPerPage);
    const currentPage = resourcePage[type];

    return (
      <div className="flex justify-end items-center gap-2 mt-4">
        <span className="text-xs font-medium text-slate-500">
          หน้า {currentPage} / {totalPages}
        </span>
        <button
          onClick={() =>
            setResourcePage((p) => ({ ...p, [type]: Math.max(p[type] - 1, 1) }))
          }
          disabled={currentPage === 1}
          className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 disabled:opacity-50"
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() =>
            setResourcePage((p) => ({
              ...p,
              [type]: Math.min(p[type] + 1, totalPages),
            }))
          }
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 disabled:opacity-50"
        >
          ถัดไป
        </button>
      </div>
    );
  };

  const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (num: number) => void;
  }> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
  }) => (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
      <div>
        <label className="text-xs font-bold text-slate-500 mr-2">แสดง:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-600 outline-none focus:ring-2 ring-indigo-400"
        >
          <option value={10}>10 คน</option>
          <option value={20}>20 คน</option>
          <option value={30}>30 คน</option>
          <option value={50}>50 คน</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">
          หน้า {currentPage} / {totalPages > 0 ? totalPages : 1}
        </span>
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-600 disabled:opacity-50"
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-600 disabled:opacity-50"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );

  // Temporary reference hook: mark some in-scope variables as used to reduce noise
  // (will be replaced with proper refactors in the next pass)
  React.useEffect(() => {
    void gradingNotebook;
    void aiInsight;
    void isGeneratingInsight;
    void setAiInsight;
    void setIsGeneratingInsight;
    void setIdSearchQuery;
    void isCourseModalOpen;
    void isResourceModalOpen;
    void setResourceFormData;
    void _setGbNameQuery;
    void _setGbIdQuery;
    void _setGbRoomFilter;
    void setGbItemsPerPage;
    void handleSaveCourse;
    void handleSaveResource;
    void paginatedStudentsForGradebook;
    void gbTotalPages;
    void handleExportGradebook;
  }, [
    gradingNotebook,
    aiInsight,
    isGeneratingInsight,
    setAiInsight,
    setIsGeneratingInsight,
    setIdSearchQuery,
    isCourseModalOpen,
    isResourceModalOpen,
    setResourceFormData,
    _setGbNameQuery,
    _setGbIdQuery,
    _setGbRoomFilter,
    setGbItemsPerPage,
    handleSaveCourse,
    handleSaveResource,
    paginatedStudentsForGradebook,
    gbTotalPages,
    handleExportGradebook,
  ]);

  return (
    <div className="animate-fade-in pb-20">
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={getDeleteInfo().title}
        message={getDeleteInfo().message}
        confirmText="ยืนยันการลบ"
        variant="danger"
      />

      {/* Undo banner shown during pending reset countdown */}
      {pendingReset ? (
        <div data-testid="UndoBanner" role="status" aria-live="polite" className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] pointer-events-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl shadow-xl bg-yellow-50 border border-amber-200">
            <div className="text-sm">
              กำลังรีเซ็ตรหัสผ่านสำหรับ <strong>{pendingReset.student.name}</strong> ใน <strong data-testid="PendingSeconds">{pendingSecondsLeft}</strong> วินาที
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button onClick={cancelPendingReset} data-testid="UndoButton" className="py-2 px-3 bg-white border rounded text-sm">ยกเลิก</button>
              <div className="px-3 py-2 bg-white border rounded text-sm">{isExecutingReset ? 'กำลังดำเนินการ...' : 'กำลังรอ'}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmation dialog for permanent reset */}
      <ConfirmationDialog
        isOpen={isConfirmingPermanentReset}
        onClose={() => { setIsConfirmingPermanentReset(false); setConfirmTargetStudent(null); }}
        onConfirm={() => { if (confirmTargetStudent) startPendingReset(confirmTargetStudent); }}
        title={"ยืนยันการรีเซ็ตรหัสผ่านถาวร"}
        message={confirmTargetStudent ? `ยืนยันการรีเซ็ตรหัสผ่านถาวรสำหรับ ${confirmTargetStudent.name}?\n\nการกระทำนี้จะเริ่มนับถอยหลัง ${PENDING_RESET_SECONDS} วินาทีก่อนที่ระบบจะทำการรีเซ็ตจริง` : 'ยืนยันการรีเซ็ตรหัสผ่าน'}
        confirmText={`ยืนยันและเริ่มนับถอยหลัง (${PENDING_RESET_SECONDS}s)`}
        variant="danger"
      />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute">
            จัดการห้องเรียน
          </h1>
          <p className="text-slate-500 text-sm">
            ดูแลให้นักเรียน: {students.length} คน | บทเรียน:{" "}
            {courseUnits.length} หน่วย
          </p>
          <p className="text-xs text-slate-400 mt-1">
            DB:{" "}
            {isOnline ? (
              <span className="text-emerald-600 font-bold">Online</span>
            ) : (
              <span className="text-amber-600 font-bold">Offline</span>
            )}{" "}
            · ผู้ใช้งานในระบบ: {allUsers.length} · บันทึกความก้าวหน้า:{" "}
            {Object.keys(allProgress || {}).length} · ข้อมูลล่าสุด:{" "}
            {lastProgressTimestamp}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Auth session:{" "}
            {user && connectedCollections && connectedCollections.length > 0 ? (
              <span className="text-emerald-600 font-bold">
                Firebase auth present
              </span>
            ) : (
              "No Firebase auth session"
            )}
          </p>
          <p className="text-xs text-amber-500 mt-1">
            Connected listeners:{" "}
            {connectedCollections?.length
              ? connectedCollections.join(", ")
              : "none"}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <ProxyStatusButton
              connectedCollections={connectedCollections || []}
            />
          </div>
        </div>
        <button
          onClick={onSwitchToStudentView}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <Eye size={18} /> ดูมุมมองนักเรียน
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 flex-nowrap custom-scrollbar snap-x scroll-smooth">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "analytics"
                        | "students"
                        | "courses"
                        | "content_creator"
                        | "grading"
                        | "gradebook"
                        | "resources"
                        | "communication"
                        | "backup",
                    )
                  }
                  className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shrink-0 snap-start relative border-2 whitespace-nowrap
                        ${
                          activeTab === tab.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                            : "bg-white text-slate-500 border-transparent hover:bg-slate-50"
                        }`}
                >
                  {tab.icon} {tab.label}
                  {typeof tab.badge === "number" && tab.badge > 0 ? (
                    <span className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-md font-black px-1">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "analytics" && (
            <AnalyticsTab
              students={students}
              allProgress={allProgress}
              qnaList={qnaList}
              courseUnits={courseUnits}
              onAnalyze={setAnalyzingAssessment}
              onViewStudent={setSelectedStudent}
            />
          )}
          {activeTab === "content_creator" && (
            <Suspense
              fallback={
                <div className="p-6 text-center text-slate-500">
                  กำลังโหลดเครื่องมือสร้างเนื้อหา...
                </div>
              }
            >
              <ContentCreatorView />
            </Suspense>
          )}
          {activeTab === "students" && (
            <div className="bg-white rounded-[30px] p-4 md:p-8 animate-fade-in overflow-hidden shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold font-cute">
                  รายชื่อนักเรียน ({filteredAndSortedStudents.length})
                </h3>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="px-4 py-2 bg-indigo-50 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <UserPlusIcon size={16} /> {t('add_student') }
                  </button>
                  <div className="relative flex-1 md:flex-none">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder={t('search_placeholder')}
                      value={nameSearchQuery}
                      onChange={(e) => setNameSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 ring-indigo-400"
                    />
                  </div>
                  <select
                    value={selectedRoomFilter}
                    onChange={(e) => setSelectedRoomFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 outline-none focus:ring-2 ring-indigo-400"
                  >
                    <option value="all">ทุกห้อง</option>
                    {uniqueRooms
                      .filter((r) => r !== "all")
                      .map((room) => (
                        <option key={room as string} value={room as string}>
                          {room}
                        </option>
                      ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(
                        e.target.value as
                          | "all"
                          | "at_risk"
                          | "on_track"
                          | "high_achiever"
                          | "cheat_warning",
                      )
                    }
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 outline-none focus:ring-2 ring-indigo-400"
                  >
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="cheat_warning">🚨 ตรวจพบการทุจริต</option>
                    <option value="at_risk">ควรดูแลพิเศษ</option>
                    <option value="on_track">ตามเกณฑ์</option>
                    <option value="high_achiever">ผลงานดีเยี่ยม</option>
                  </select>
                  <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button
                      onClick={() => setStudentViewMode("list")}
                      className={`p-1.5 rounded-lg ${studentViewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
                    >
                      <List size={18} />
                    </button>
                    <button
                      onClick={() => setStudentViewMode("grid")}
                      className={`p-1.5 rounded-lg ${studentViewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* grading filters removed per UX request — kept student list and search intact */}

              {filteredAndSortedStudents.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-6 text-center text-slate-400">
                  <div className="text-6xl">👋</div>
                  <h4 className="text-lg font-bold">{t('student_list')} (0)</h4>
                  <p className="max-w-lg">ยังไม่มีนักเรียนในระบบ — คุณสามารถเพิ่มนักเรียนใหม่หรือเชื่อมข้อมูลนักเรียนจากไฟล์ CSV</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsAddStudentModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md"
                    >
                      {t('add_student')}
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600">
                      {t('import_csv')}
                    </button>
                  </div>
                </div>
              ) : studentViewMode === "list" ? (
                <>
                  <div className="hidden sm:flex bg-slate-50 rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 mb-3 items-center">
                    <div className="flex-1 pl-14">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1"
                      >
                        Student <ArrowUpDown size={12} />
                      </button>
                    </div>
                    <div className="w-32 text-left pl-2">
                      <span>Status</span>
                    </div>
                    <div className="w-32 text-left">
                      <button
                        onClick={() => handleSort("percent")}
                        className="flex items-center gap-1 pl-2"
                      >
                        Progress <ArrowUpDown size={12} />
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <button
                        onClick={() => handleSort("score")}
                        className="flex items-center gap-1 justify-end"
                      >
                        Score <ArrowUpDown size={12} />
                      </button>
                    </div>
                    <div className="w-24 text-right pr-2">Actions</div>
                  </div>
                  <div className="space-y-3">
                    {paginatedStudents.map((std) => {
                      const status = getStatus(std.percent);
                      return (
                        <div
                          key={std.id}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-indigo-100"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div
                              className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
                              onClick={() => setSelectedStudent(std)}
                            >
                              <div className="relative">
                                <span className="text-4xl">{std.avatar}</span>
                                {std.totalCheats > 0 && (
                                  <ShieldAlert
                                    size={18}
                                    className="absolute -bottom-1 -right-1 text-red-600 bg-white rounded-full p-0.5 shadow-sm"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-800 truncate">
                                  {std.name}
                                </div>
                                <div className="text-xs text-slate-500 font-mono truncate">
                                  {std.username} | {std.classLevel}/{std.room}{" "}
                                  No.{std.seatNumber}
                                </div>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <div className="w-full sm:w-32 text-left">
                                {std.totalCheats > 0 ? (
                                  <span className="px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit bg-red-600 text-white shadow-sm animate-pulse">
                                    <ShieldAlert size={12} /> ทุจริต{" "}
                                    {std.totalCheats} ครั้ง
                                  </span>
                                ) : (
                                  <span
                                    className={`px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit bg-${status.color}-100 text-${status.color}-700`}
                                  >
                                    {status.icon} {status.text}
                                  </span>
                                )}
                              </div>
                              <div className="w-full sm:w-32">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full">
                                    <div
                                      className="bg-indigo-500 h-full rounded-full"
                                      style={{ width: `${std.percent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {std.percent}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-left sm:text-right sm:w-24">
                                <span className="text-lg font-black text-indigo-600">
                                  {std.score}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {" "}
                                  / {maxTotalScore}
                                </span>
                              </div>
                              <div className="flex justify-start sm:justify-end gap-1 sm:w-24">
                                <button
                                  onClick={() => setEditingStudent(std)}
                                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => setResettingStudent(std)}
                                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                  title="รีเซ็ตรหัสผ่าน"
                                >
                                  <KeyRound size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "student",
                                      data: std,
                                    })
                                  }
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="ลบนักเรียน"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedStudents.map((std) => {
                    const status = getStatus(std.percent);
                    const circumference = 2 * Math.PI * 18;
                    const offset =
                      circumference - (std.percent / 100) * circumference;
                    return (
                      <div
                        key={std.id}
                        className={`bg-slate-50 rounded-3xl p-6 border-2 transition-all flex flex-col gap-4 relative group ${std.totalCheats > 0 ? "border-red-200 bg-red-50/30" : "border-slate-100 hover:shadow-lg hover:border-indigo-100"}`}
                      >
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingStudent(std)}
                            className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-amber-500 rounded-lg shadow-sm border border-slate-100 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setResettingStudent(std)}
                            className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-blue-500 rounded-lg shadow-sm border border-slate-100 transition-all"
                          >
                            <KeyRound size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ type: "student", data: std })
                            }
                            className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 rounded-lg shadow-sm border border-slate-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() => setSelectedStudent(std)}
                        >
                          <span className="text-4xl relative">
                            {std.avatar}
                            {std.totalCheats > 0 && (
                              <ShieldAlert
                                size={18}
                                className="absolute -bottom-1 -right-1 text-red-600 bg-white rounded-full p-0.5 shadow-sm"
                              />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="font-black text-slate-800 truncate flex items-center gap-1">
                              {std.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {std.classLevel}/{std.room} เลขที่{" "}
                              {std.seatNumber}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {std.totalCheats > 0 && (
                            <div className="px-2.5 py-1 text-xs font-black rounded-full flex items-center gap-1.5 w-fit bg-red-600 text-white shadow-md animate-pulse">
                              <ShieldAlert size={14} /> ทุจริต {std.totalCheats}{" "}
                              ครั้ง
                            </div>
                          )}
                          <div
                            className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit bg-${status.color}-100 text-${status.color}-700 border border-${status.color}-200`}
                          >
                            {status.icon} {status.text}
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl mt-auto">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              Score
                            </div>
                            <div className="font-black text-2xl text-indigo-600">
                              {std.score}
                            </div>
                          </div>
                          <div className="relative w-12 h-12">
                            <svg className="w-full h-full" viewBox="0 0 40 40">
                              <circle
                                className="text-slate-100"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="transparent"
                                r="18"
                                cx="20"
                                cy="20"
                              />
                              <circle
                                className="text-indigo-500"
                                strokeWidth="4"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="18"
                                cx="20"
                                cy="20"
                                style={{
                                  transform: "rotate(-90deg)",
                                  transformOrigin: "50% 50%",
                                }}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-600">
                              {std.percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={studentsPerPage}
                onItemsPerPageChange={setStudentsPerPage}
              />
            </div>
          )}

          {activeTab === "grading" && (
            <div className="bg-white rounded-[30px] p-4 md:p-8 animate-fade-in space-y-6 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex gap-4 flex-wrap">
                  <select
                    value={gradingMode}
                    onChange={(e) =>
                      setGradingMode(
                        e.target.value as "assignments" | "notebooks",
                      )
                    }
                    className="font-bold rounded-lg border-slate-200"
                  >
                    <option value="assignments">ตรวจใบงาน</option>
                    <option value="notebooks">ตรวจสมุดบันทึก</option>
                  </select>
                  {gradingMode === "assignments" ? (
                    <>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="font-bold rounded-lg border-slate-200"
                      >
                        <option value="all">ทุกห้อง</option>
                        {uniqueRooms
                          .filter((r) => r !== "all")
                          .map((room) => (
                            <option key={room as string} value={room as string}>
                              {room}
                            </option>
                          ))}
                      </select>
                      <select
                        value={selectedAssignmentId}
                        onChange={(e) =>
                          setSelectedAssignmentId(e.target.value)
                        }
                        className="font-bold rounded-lg border-slate-200"
                      >
                        {UNIT_ASSIGNMENTS.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <select
                      value={selectedNotebookUnit}
                      onChange={(e) => setSelectedNotebookUnit(e.target.value)}
                      className="font-bold rounded-lg border-slate-200"
                    >
                      {courseUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.subtitle}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button
                      onClick={() => setGradingViewMode("table")}
                      className={`p-1.5 rounded-lg ${gradingViewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
                    >
                      <List size={18} />
                    </button>
                    <button
                      onClick={() => setGradingViewMode("card")}
                      className={`p-1.5 rounded-lg ${gradingViewMode === "card" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                  </div>
                  <button
                    onClick={handleExportGrading}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold flex items-center gap-2 border border-emerald-200"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ-สกุล..."
                    value={gradingNameQuery}
                    onChange={(e) => setGradingNameQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 ring-indigo-400"
                  />
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="รหัสนักเรียน..."
                    value={gradingIdQuery}
                    onChange={(e) => setGradingIdQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 ring-indigo-400"
                  />
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="ค้นหาคำในสมุด/คำติชม..."
                    value={gradingNotebookQuery}
                    onChange={(e) => setGradingNotebookQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 ring-indigo-400"
                  />
                </div>
              </div>

              {/* Notebook-only compact filters (restores the red-box controls but scoped to the สมุดพก subtab) */}
              {gradingMode === "notebooks" && (
                <div
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mt-3 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
                  role="region"
                  aria-label="Notebook filters"
                >
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-[11px] text-slate-500">
                      วันที่เริ่มต้น
                    </label>
                    <input
                      aria-label="วันที่เริ่มต้น"
                      placeholder="วันที่เริ่มต้น"
                      type="date"
                      value={gradingDateStart}
                      onChange={(e) => setGradingDateStart(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-[11px] text-slate-500">
                      วันที่สิ้นสุด
                    </label>
                    <input
                      aria-label="วันที่สิ้นสุด"
                      placeholder="วันที่สิ้นสุด"
                      type="date"
                      value={gradingDateEnd}
                      onChange={(e) => setGradingDateEnd(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="text-[11px] text-slate-500">
                      คะแนนขั้นต่ำ
                    </label>
                    <input
                      aria-label="คะแนนขั้นต่ำ"
                      placeholder="คะแนนขั้นต่ำ"
                      type="number"
                      min={0}
                      value={gradingMinScore}
                      onChange={(e) => setGradingMinScore(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="text-[11px] text-slate-500">
                      คะแนนสูงสุด
                    </label>
                    <input
                      aria-label="คะแนนสูงสุด"
                      placeholder="คะแนนสูงสุด"
                      type="number"
                      min={0}
                      value={gradingMaxScore}
                      onChange={(e) => setGradingMaxScore(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 flex items-center gap-3">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          aria-label="เปิดการค้นหาแบบใกล้เคียง"
                          type="checkbox"
                          checked={gradingFuzzyEnabled}
                          onChange={(e) =>
                            setGradingFuzzyEnabled(e.target.checked)
                          }
                        />{" "}
                        <span>ค้นหาแบบใกล้เคียง</span>
                      </label>
                      {gradingFuzzyEnabled && (
                        <div className="mt-2">
                          <label className="text-[11px] text-slate-500">
                            เกณฑ์ความใกล้เคียง (%)
                          </label>
                          <input
                            aria-label="เกณฑ์ความใกล้เคียง"
                            placeholder="เช่น 60"
                            type="number"
                            min={1}
                            max={100}
                            value={gradingFuzzyThreshold}
                            onChange={(e) =>
                              setGradingFuzzyThreshold(Number(e.target.value))
                            }
                            className="w-28 p-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>
                      )}
                    </div>
                    <div className="ml-auto">
                      <button
                        aria-label="ล้างการกรอง"
                        onClick={handleClearFilters}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                      >
                        ล้าง
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    id: "all",
                    label: "นักเรียนทั้งหมด",
                    value:
                      gradingMode === "assignments"
                        ? gradingStats.total
                        : notebookGradingStats.total,
                    color: "slate",
                  },
                  {
                    id: "pending",
                    label: "รอตรวจ",
                    value:
                      gradingMode === "assignments"
                        ? gradingStats.pending
                        : notebookGradingStats.pending,
                    color: "yellow",
                  },
                  {
                    id: "graded",
                    label: "ตรวจแล้ว",
                    value:
                      gradingMode === "assignments"
                        ? gradingStats.graded
                        : notebookGradingStats.graded,
                    color: "green",
                  },
                  {
                    id: "missing",
                    label: "ยังไม่ส่ง",
                    value:
                      gradingMode === "assignments"
                        ? gradingStats.missing
                        : notebookGradingStats.missing,
                    color: "red",
                  },
                ].map((card) => (
                  <button
                    key={card.id}
                    onClick={() =>
                      setGradingFilterStatus(
                        card.id as "all" | "pending" | "graded" | "missing",
                      )
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      gradingFilterStatus === card.id
                        ? `bg-${card.color}-100 border-${card.color}-400 ring-2 ring-${card.color}-200`
                        : `bg-${card.color}-50 border-transparent hover:border-${card.color}-300`
                    }`}
                  >
                    <div
                      className={`text-3xl font-black text-${card.color}-700`}
                    >
                      {card.value}
                    </div>
                    <div className={`text-xs font-bold text-${card.color}-500`}>
                      {card.label}
                    </div>
                  </button>
                ))}
              </div>

              {selectedStudentIds.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-3">
                  <h4 className="font-bold text-sm text-indigo-700">
                    ให้คะแนนแบบกลุ่ม ({selectedStudentIds.length} คน)
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={batchScore}
                      onChange={(e) => setBatchScore(e.target.value)}
                      placeholder="คะแนน"
                      className="w-24 p-2 border rounded"
                    />
                    <input
                      type="text"
                      value={batchFeedback}
                      onChange={(e) => setBatchFeedback(e.target.value)}
                      placeholder="Feedback (Optional)"
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={handleBatchGrade}
                      className="px-4 bg-indigo-600 text-white font-bold rounded"
                    >
                      ยืนยัน
                    </button>
                  </div>
                </div>
              )}

              {(gradingMode === "assignments"
                ? filteredSubmissionData
                : filteredNotebookSubmissionData
              ).length === 0 ? (
                <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="font-bold">ไม่พบข้อมูล</p>
                  <p className="text-sm">
                    ไม่พบนักเรียนในสถานะ &apos;{gradingFilterStatus}&apos;
                    สำหรับ
                    {gradingMode === "assignments"
                      ? "งานชิ้นนี้"
                      : "สมุดบันทึกหน่วยนี้"}
                  </p>
                </div>
              ) : (
                <>
                  {gradingViewMode === "table" ? (
                    <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {gradingMode === "assignments" && (
                              <th className="p-3 w-10">
                                <input
                                  type="checkbox"
                                  onChange={handleSelectAll}
                                  checked={
                                    paginatedSubmissionData.length > 0 &&
                                    paginatedSubmissionData.every((s) =>
                                      selectedStudentIds.includes(s.student.id),
                                    )
                                  }
                                />
                              </th>
                            )}
                            <th className="p-3 text-left font-bold text-slate-600">
                              นักเรียน
                            </th>
                            <th className="p-3 text-left font-bold text-slate-600">
                              {gradingMode === "assignments"
                                ? "วันที่ส่ง"
                                : "สถานะ"}
                            </th>
                            <th className="p-3 text-center font-bold text-slate-600">
                              จัดการ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradingMode === "assignments"
                            ? paginatedSubmissionData.map(
                                ({ student, submission, isLate, status }) => (
                                  <tr
                                    key={student.id}
                                    className="border-t border-slate-100 hover:bg-slate-50"
                                  >
                                    <td className="p-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedStudentIds.includes(
                                          student.id,
                                        )}
                                        onChange={() =>
                                          handleStudentSelect(student.id)
                                        }
                                      />
                                    </td>
                                    <td className="p-3 font-medium text-slate-800">
                                      {student.name}
                                    </td>
                                    <td className="p-3 text-xs text-slate-500">
                                      {submission
                                        ? new Date(
                                            submission.submittedAt,
                                          ).toLocaleString("th-TH", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "-"}
                                      {isLate && (
                                        <span className="ml-2 text-[10px] font-bold bg-orange-500 text-white px-1.5 rounded">
                                          ส่งช้า
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      {status !== "missing" && (
                                        <button
                                          onClick={() =>
                                            openGrading(
                                              student.id,
                                              selectedAssignmentId,
                                            )
                                          }
                                          className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100"
                                        >
                                          {status === "graded"
                                            ? "ดู/แก้ไข"
                                            : "ตรวจงาน"}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ),
                              )
                            : paginatedNotebookSubmissionData.map(
                                ({ student, submission, isGraded }) => {
                                  const status = submission
                                    ? isGraded
                                      ? "graded"
                                      : "pending"
                                    : "missing";
                                  return (
                                    <tr
                                      key={student.id}
                                      className="border-t border-slate-100 hover:bg-slate-50"
                                    >
                                      <td className="p-3 font-medium text-slate-800">
                                        <div>{student.name}</div>
                                        {submission?.content && (
                                          <div
                                            className="text-xs text-slate-400 mt-1"
                                            dangerouslySetInnerHTML={{
                                              __html: highlightMatches(
                                                submission.content.slice(
                                                  0,
                                                  150,
                                                ),
                                                gradingNotebookQueryDebounced,
                                                gradingFuzzyEnabled,
                                                gradingFuzzyThreshold,
                                              ),
                                            }}
                                          />
                                        )}
                                      </td>
                                      <td className="p-3 text-xs text-slate-500">
                                        {submission
                                          ? new Date(
                                              submission.submittedAt,
                                            ).toLocaleString("th-TH", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "-"}
                                      </td>
                                      <td className="p-3 text-center">
                                        {submission && (
                                          <button
                                            onClick={() =>
                                              openNotebookGrading(
                                                student.id,
                                                selectedNotebookUnit,
                                              )
                                            }
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100"
                                          >
                                            {status === "graded"
                                              ? "ดู/แก้ไข"
                                              : "ตรวจสมุดบันทึก"}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                },
                              )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gradingMode === "assignments"
                        ? paginatedSubmissionData.map(
                            ({ student, submission, status }) => (
                              <div
                                key={student.id}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {student.avatar}
                                  </span>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-700">
                                      {student.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {student.classLevel}/{student.room} -{" "}
                                      {student.username}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1.5 w-fit
                                                        ${status === "pending" ? "bg-yellow-100 text-yellow-700" : status === "graded" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? "bg-yellow-500" : status === "graded" ? "bg-green-500" : "bg-red-500"}`}
                                    ></div>
                                    {status === "pending"
                                      ? "รอตรวจ"
                                      : status === "graded"
                                        ? "ตรวจแล้ว"
                                        : "ยังไม่ส่ง"}
                                  </span>
                                  <span className="text-slate-400">
                                    {submission
                                      ? new Date(
                                          submission.submittedAt,
                                        ).toLocaleString("th-TH", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "-"}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg mt-auto flex justify-between items-center">
                                  <div
                                    className={`font-bold ${submission?.score ? "text-indigo-600" : "text-slate-400"}`}
                                  >
                                    {submission?.score ?? "-"}{" "}
                                    <span className="text-sm text-slate-300">
                                      / {selectedAssignment?.maxScore}
                                    </span>
                                  </div>
                                  {submission && (
                                    <button
                                      onClick={() =>
                                        openGrading(
                                          student.id,
                                          selectedAssignmentId,
                                        )
                                      }
                                      className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600"
                                    >
                                      {status === "graded"
                                        ? "ดู/แก้ไข"
                                        : "ตรวจงาน"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        : paginatedNotebookSubmissionData.map(
                            ({ student, submission, isGraded }) => {
                              const status = submission
                                ? isGraded
                                  ? "graded"
                                  : "pending"
                                : "missing";
                              return (
                                <div
                                  key={student.id}
                                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                      {student.avatar}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-bold text-sm text-slate-700">
                                        {student.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {student.classLevel}/{student.room} -{" "}
                                        {student.username}
                                      </p>
                                      {submission?.content && (
                                        <div
                                          className="text-xs text-slate-400 mt-2"
                                          dangerouslySetInnerHTML={{
                                            __html: highlightMatches(
                                              submission.content.slice(0, 120),
                                              gradingNotebookQueryDebounced,
                                              gradingFuzzyEnabled,
                                              gradingFuzzyThreshold,
                                            ),
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1.5 w-fit
                                                            ${status === "pending" ? "bg-yellow-100 text-yellow-700" : status === "graded" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                    >
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? "bg-yellow-500" : status === "graded" ? "bg-green-500" : "bg-red-500"}`}
                                      ></div>
                                      {status === "pending"
                                        ? "รอตรวจ"
                                        : status === "graded"
                                          ? "ตรวจแล้ว"
                                          : "ยังไม่ส่ง"}
                                    </span>
                                    <span className="text-slate-400">
                                      {submission
                                        ? new Date(
                                            submission.submittedAt,
                                          ).toLocaleString("th-TH", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "-"}
                                    </span>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg mt-auto flex justify-between items-center">
                                    <div
                                      className={`font-bold ${submission?.score ? "text-indigo-600" : "text-slate-400"}`}
                                    >
                                      {submission?.score ?? "-"}{" "}
                                      <span className="text-sm text-slate-300">
                                        / {NOTEBOOK_MAX_SCORE}
                                      </span>
                                    </div>
                                    {submission && (
                                      <button
                                        onClick={() =>
                                          openNotebookGrading(
                                            student.id,
                                            selectedNotebookUnit,
                                          )
                                        }
                                        className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600"
                                      >
                                        {status === "graded"
                                          ? "ดู/แก้ไข"
                                          : "ตรวจสมุดบันทึก"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                    </div>
                  )}
                  <PaginationControls
                    currentPage={gradingCurrentPage}
                    totalPages={gradingTotalPages}
                    onPageChange={setGradingCurrentPage}
                    itemsPerPage={gradingItemsPerPage}
                    onItemsPerPageChange={setGradingItemsPerPage}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "gradebook" && (
            <GradebookView
              students={filteredStudentsForGradebook}
              allProgress={allProgress}
            />
          )}

          {activeTab === "courses" && (
            <div className="bg-white rounded-[30px] p-4 md:p-8 animate-fade-in shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-cute">
                  จัดการหน่วยการเรียนรู้
                </h3>
                <button
                  onClick={() => handleOpenCourseModal()}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <Plus size={16} /> สร้างบทเรียนใหม่
                </button>
              </div>
              <div className="space-y-3">
                {courseUnits
                  .sort((a, b) => a.order - b.order)
                  .map((unit) => (
                    <div
                      key={unit.id}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {ICON_MAP[unit.icon] || <Book size={24} />}
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm ${unit.isActive ? "text-slate-700" : "text-slate-400 line-through"}`}
                          >
                            {unit.subtitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            {unit.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            updateCourseUnit({
                              ...unit,
                              isActive: !unit.isActive,
                            })
                          }
                          className="p-2 hover:bg-slate-200 rounded-md"
                          title={unit.isActive ? "ซ่อน" : "แสดง"}
                        >
                          {unit.isActive ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenCourseModal(unit)}
                          className="p-2 hover:bg-slate-200 rounded-md"
                          title="แก้ไข"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ type: "unit", data: unit })
                          }
                          className="p-2 text-red-400 hover:bg-red-100 rounded-md"
                          title="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="bg-white rounded-[30px] p-4 md:p-8 animate-fade-in shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-cute">คลังสื่อการสอน</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={resourceItemsPerPage}
                    onChange={(e) =>
                      setResourceItemsPerPage(Number(e.target.value))
                    }
                    className="text-xs font-bold border-slate-200 rounded-lg"
                  >
                    <option value={10}>แสดง 10</option>
                    <option value={20}>แสดง 20</option>
                    <option value={30}>แสดง 30</option>
                  </select>
                  <button
                    onClick={() => setIsResourceModalOpen(true)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Plus size={16} /> เพิ่มสื่อใหม่
                  </button>
                </div>
              </div>
              <select
                onChange={(e) => setSelectedUnitForResource(e.target.value)}
                value={selectedUnitForResource}
                className="w-full p-3 border rounded-xl bg-slate-50 mb-6"
              >
                {courseUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.subtitle}
                  </option>
                ))}
              </select>
              <div className="space-y-4">
                {["videos", "pdfs", "links"].map((resType) => {
                  const items =
                    (currentUnitResources?.[resType] as unknown[]) || [];
                  const paginatedItems =
                    (paginatedResources[resType] as unknown[]) || [];
                  return (
                    <div key={resType}>
                      <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">
                        {resType} ({items.length})
                      </h4>
                      {paginatedItems.map(
                        (res: Record<string, unknown>, index: number) => (
                          <div
                            key={index}
                            className="bg-slate-50 p-3 rounded-lg flex justify-between items-center mb-2"
                          >
                            <p className="text-sm font-medium text-slate-600">
                              {String(res.title)}
                            </p>
                            <div>
                              <button
                                onClick={() => {
                                  setEditingResource({
                                    ...res,
                                    originalIndex: index,
                                    originalType: resType.slice(0, -1),
                                  });
                                  setIsResourceModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-slate-200 rounded-md"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "resource",
                                    data: {
                                      type: resType.slice(0, -1),
                                      index,
                                      title: res.title,
                                    },
                                  })
                                }
                                className="p-1.5 text-red-400 hover:bg-red-100 rounded-md"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                      <ResourcePaginationControls
                        type={resType as "videos" | "pdfs" | "links"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "communication" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-6 shadow-sm border flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">ประกาศ ({announcements.length})</h3>
                  <button
                    onClick={() =>
                      setIsCreatingAnnouncement(!isCreatingAnnouncement)
                    }
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-indigo-200"
                  >
                    <Plus size={14} />{" "}
                    {isCreatingAnnouncement ? "ยกเลิก" : "สร้างประกาศใหม่"}
                  </button>
                </div>

                {isCreatingAnnouncement && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <textarea
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      className="w-full p-2 border rounded-md h-20"
                      placeholder="พิมพ์ข้อความประกาศ..."
                    ></textarea>
                    <button
                      onClick={handlePostAnnouncement}
                      className="w-full mt-2 py-2 bg-indigo-500 text-white font-bold rounded-lg"
                    >
                      ส่งประกาศ
                    </button>
                  </div>
                )}

                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 max-h-96">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-slate-50 p-3 rounded-lg group relative"
                    >
                      <p className="text-sm text-slate-700">{ann.text}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(ann.date).toLocaleString("th-TH")}
                      </p>
                      <button
                        onClick={() =>
                          setDeleteTarget({ type: "announcement", data: ann })
                        }
                        className="absolute top-2 right-2 p-1 bg-white text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border">
                <h3 className="font-bold mb-4">
                  คำถามที่ยังไม่ได้ตอบ ({pendingQnaCount})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                  {qnaList
                    .filter((q) => !q.answer)
                    .map((q) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">
                          <span className="font-bold">{q.studentName}</span>:{" "}
                          {q.question}
                        </p>
                        <div className="flex mt-2 gap-2">
                          <input
                            value={replyTexts[String(q.id)] || ""}
                            onChange={(e) =>
                              setReplyTexts({
                                ...replyTexts,
                                [String(q.id)]: e.target.value,
                              })
                            }
                            type="text"
                            className="flex-1 p-1.5 text-xs border rounded"
                            placeholder="ตอบกลับ..."
                          />
                          <button
                            onClick={() => handleReplyQnA(q.id)}
                            className="px-2 bg-indigo-100 text-indigo-600 rounded text-xs font-bold"
                          >
                            ส่ง
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="bg-white rounded-[30px] p-8 animate-fade-in shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold font-cute mb-6">
                สำรองและนำเข้าข้อมูล
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={exportData}
                  className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-bold hover:bg-blue-100"
                >
                  <Download className="mx-auto mb-2" /> ส่งออกข้อมูล (.json)
                </button>
                <label className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer text-center">
                  <Upload className="mx-auto mb-2" /> นำเข้าข้อมูล (.json)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <Suspense
          fallback={
            <div className="p-6 text-center text-slate-500">
              กำลังโหลดแฟ้มผลงาน...
            </div>
          }
        >
          {(() => {
            const studentForView = {
              ...(selectedStudent as unknown as Record<string, unknown>),
              score: selectedStudent.score ?? 0,
              percent: selectedStudent.percent ?? 0,
              totalCheats: selectedStudent.totalCheats ?? 0,
            } as User & { score: number; percent: number; totalCheats: number };

            return (
              <StudentPortfolioView
                student={studentForView}
                progress={allProgress[selectedStudent.id]}
                maxTotalScore={maxTotalScore}
                onClose={() => setSelectedStudent(null)}
                onGradeAssignment={(studentId, assignmentId) => {
                  openGrading(studentId, assignmentId);
                  setSelectedStudent(null);
                }}
                onGradeNotebook={gradeNotebook}
                onGradeActivity={gradeActivity}
              />
            );
          })()}
        </Suspense>
      )}

      {analyzingAssessment && (
        <Suspense
          fallback={
            <div className="p-6 text-center text-slate-500">
              กำลังวิเคราะห์ข้อสอบ...
            </div>
          }
        >
          <ItemAnalysisModal
            assessment={analyzingAssessment}
            allProgress={allProgress}
            onClose={() => setAnalyzingAssessment(null)}
          />
        </Suspense>
      )}

      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleAddNewStudent}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                เพิ่มนักเรียนใหม่
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-2 -mt-2 -mr-2 text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </div>
            <input
              type="text"
              value={newStudentData.id}
              onChange={(e) =>
                setNewStudentData({ ...newStudentData, id: e.target.value })
              }
              placeholder="รหัสนักเรียน (Username)"
              className="w-full p-3 border rounded-xl bg-slate-50"
            />
            <div className="grid grid-cols-5 gap-3">
              <select
                value={newStudentData.title}
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    title: e.target.value,
                  })
                }
                className="col-span-2 w-full p-3 border rounded-xl bg-slate-50"
              >
                <option>เด็กชาย</option>
                <option>เด็กหญิง</option>
                <option>นาย</option>
                <option>นางสาว</option>
              </select>
              <input
                type="text"
                value={newStudentData.firstName}
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    firstName: e.target.value,
                  })
                }
                placeholder="ชื่อจริง"
                className="col-span-3 w-full p-3 border rounded-xl bg-slate-50"
              />
            </div>
            <input
              type="text"
              value={newStudentData.lastName}
              onChange={(e) =>
                setNewStudentData({
                  ...newStudentData,
                  lastName: e.target.value,
                })
              }
              placeholder="นามสกุล"
              className="w-full p-3 border rounded-xl bg-slate-50"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={newStudentData.classLevel}
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    classLevel: e.target.value,
                  })
                }
                placeholder="ชั้น (เช่น ม.4)"
                className="w-full p-3 border rounded-xl bg-slate-50"
              />
              <input
                type="text"
                value={newStudentData.room}
                onChange={(e) =>
                  setNewStudentData({ ...newStudentData, room: e.target.value })
                }
                placeholder="ห้อง"
                className="w-full p-3 border rounded-xl bg-slate-50"
              />
              <input
                type="text"
                value={newStudentData.seatNumber}
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    seatNumber: e.target.value,
                  })
                }
                placeholder="เลขที่"
                className="w-full p-3 border rounded-xl bg-slate-50"
              />
            </div>
            <input
              type="password"
              value={newStudentData.password}
              onChange={(e) =>
                setNewStudentData({
                  ...newStudentData,
                  password: e.target.value,
                })
              }
              placeholder="รหัสผ่าน"
              className="w-full p-3 border rounded-xl bg-slate-50"
            />
            <input
              type="password"
              value={newStudentData.confirmPassword}
              onChange={(e) =>
                setNewStudentData({
                  ...newStudentData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="ยืนยันรหัสผ่าน"
              className="w-full p-3 border rounded-xl bg-slate-50"
            />
            <button
              type="submit"
              disabled={isAddingStudent}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAddingStudent ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserPlusIcon />
              )}{" "}
              {isAddingStudent ? "กำลังเพิ่ม..." : "เพิ่มนักเรียน"}
            </button>
          </form>
        </div>
      )}

      {editingStudent && editFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              แก้ไขข้อมูลนักเรียน:{" "}
              <span className="text-indigo-600">{editingStudent.name}</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    คำนำหน้า
                  </label>
                  <select
                    name="title"
                    value={editFormData.title || ""}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                  >
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    ชื่อจริง
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName || ""}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  นามสกุล
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName || ""}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    ชั้น
                  </label>
                  <input
                    type="text"
                    name="classLevel"
                    value={editFormData.classLevel || ""}
                    onChange={handleEditFormChange}
                    placeholder="เช่น ม.4"
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    ห้อง
                  </label>
                  <input
                    type="text"
                    name="room"
                    value={editFormData.room || ""}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    เลขที่
                  </label>
                  <input
                    type="text"
                    name="seatNumber"
                    value={editFormData.seatNumber || ""}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-center"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmSaveStudent}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {resettingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-2xl md:max-w-3xl w-full shadow-2xl max-h-[80vh] overflow-y-auto glass-card animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" aria-hidden="true" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    จัดการรหัสผ่าน
                  </h3>
                  <p className="text-sm text-slate-500">
                    สำหรับนักเรียน:{" "}
                    <span className="font-bold">{resettingStudent.name}</span>
                  </p>
                </div>
              </div>
              <button
                aria-label="ปิด"
                onClick={() => setResettingStudent(null)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Temporary Reset Code */}
              <div className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors min-h-[140px] flex flex-col justify-between glass-card">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardCheck size={18} className="text-indigo-600" />
                    <h4 className="font-bold text-slate-800 mb-0">รีเซ็ตรหัสผ่านชั่วคราว</h4>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    สร้างรหัสใช้ครั้งเดียว (หมดอายุ 24 ชม.)
                  </p>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านชั่วคราว (optional)"
                    className="w-full p-2 border rounded-lg bg-slate-50 text-sm focus:ring-2 ring-indigo-400 outline-none mb-2"
                  />

                  {generatedOneTimeCode && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        readOnly
                        value={generatedOneTimeCode}
                        className="flex-1 p-2 border rounded-lg font-mono text-sm bg-white text-slate-800"
                      />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              generatedOneTimeCode,
                            );
                            logError("คัดลอกเรียบร้อย", "success");
                          } catch {
                            logError("คัดลอกไม่สำเร็จ", "error");
                          }
                        }}
                        className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200"
                      >
                        คัดลอก
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmResetPassword}
                    className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors"
                  >
                    สร้างรหัสชั่วคราว
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedOneTimeCode(null);
                      setNewPassword("");
                    }}
                    className="py-2 px-3 bg-white border rounded-lg text-sm"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              {/* Option 2: Permanent Password */}
              <div className="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors min-h-[140px] flex flex-col justify-between glass-card">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound size={18} className="text-emerald-600" />
                    <h4 className="font-bold text-slate-800 mb-0">รีเซ็ตรหัสผ่านถาวร</h4>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    สร้างรหัสผ่านแบบสุ่มที่ใช้ได้ตลอดไป
                  </p>
                  {generatedPermanentPassword ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        readOnly
                        value={showGeneratedPassword ? generatedPermanentPassword : '••••••••'}
                        aria-label="generated-password"
                        data-testid="GeneratedPassword"
                        className="flex-1 p-2 border rounded-lg font-mono text-sm bg-white text-slate-800"
                      />
                      <button
                        onClick={() => {
                          setShowGeneratedPassword((s) => !s);
                        }}
                        className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200"
                        data-testid="ShowPasswordBtn"
                      >
                        {showGeneratedPassword ? 'ซ่อน' : 'แสดง'}
                      </button>
                      <div className="flex items-center">
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(generatedPermanentPassword);
                              logError('คัดลอกเรียบร้อย', 'success');
                              setCopiedPassword(true);
                              window.setTimeout(() => setCopiedPassword(false), 2000);
                            } catch {
                              logError('คัดลอกไม่สำเร็จ', 'error');
                            }
                          }}
                          className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200"
                          data-testid="CopyPasswordBtn"
                        >
                          คัดลอก
                        </button>
                        {copiedPassword ? (
                          <span data-testid="CopyFeedback" aria-live="polite" className="text-emerald-700 text-sm ml-3">คัดลอกแล้ว</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePermanentPasswordReset(resettingStudent)}
                    disabled={isExecutingReset || !!pendingReset}
                    data-testid="CreatePermanentBtn"
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${isExecutingReset || !!pendingReset ? 'bg-slate-300 text-slate-700 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                  >
                    {isExecutingReset ? 'ดำเนินการ...' : 'สร้างรหัสถาวร'}
                  </button>
                  <button
                    onClick={() => setGeneratedPermanentPassword(null)}
                    className="py-2 px-3 bg-white border rounded-lg text-sm"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              {/* Option 3: Custom Password */}
              <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors min-h-[140px] flex flex-col justify-between glass-card">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Edit size={18} className="text-blue-600" />
                    <h4 className="font-bold text-slate-800 mb-0">ตั้งรหัสผ่านเอง</h4>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    ครูตั้งรหัสผ่านที่ต้องการให้นักเรียน (8-12 ตัวอักษร)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetCustomPassword(resettingStudent)}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
                  >
                    ตั้งรหัสผ่าน
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedPermanentPassword(null);
                      setGeneratedOneTimeCode(null);
                      setNewPassword("");
                    }}
                    className="py-2 px-3 bg-white border rounded-lg text-sm"
                  >
                    รีเซ็ต
                  </button>
                </div>
              </div>

              {/* (placeholder) Reserve space if odd number of items so layout stays balanced */}
              <div className="hidden md:block"></div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setResettingStudent(null)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {gradingSubmission && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setGradingSubmission(null)}
        >
          <div
            className="bg-slate-50 rounded-[35px] w-full max-w-4xl h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold font-cute text-slate-800">
                  ตรวจงาน
                </h3>
                <p className="text-sm text-slate-500">
                  {gradingSubmission.studentName} -{" "}
                  {
                    UNIT_ASSIGNMENTS.find(
                      (a) => a.id === gradingSubmission.assignmentId,
                    )?.title
                  }
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </header>
            <main className="flex-1 flex overflow-hidden">
              <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">
                  คำตอบของนักเรียน
                </h4>
                {gradingSubmission.answerText ? (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap text-sm">
                    {gradingSubmission.answerText}
                  </div>
                ) : gradingSubmission.fileUrl?.startsWith("data:") ? (
                  <img
                    src={gradingSubmission.fileUrl}
                    alt="submission"
                    className="rounded-lg border border-slate-200 max-w-full"
                  />
                ) : (
                  <a
                    href={gradingSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline break-words"
                  >
                    {gradingSubmission.fileUrl}
                  </a>
                )}
              </div>
              <div className="w-1/2 p-6 flex flex-col gap-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500">
                      คะแนน
                    </label>
                    <input
                      type="number"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-1 text-lg font-bold"
                    />
                  </div>
                  <span className="text-slate-400 pb-3">
                    /{" "}
                    {
                      UNIT_ASSIGNMENTS.find(
                        (a) => a.id === gradingSubmission.assignmentId,
                      )?.maxScore
                    }
                  </span>
                  <button
                    onClick={handleAiGrade}
                    disabled={isAiGrading || !gradingSubmission.answerText}
                    className="p-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="ให้ AI ช่วยตรวจ"
                  >
                    {isAiGrading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Feedback
                  </label>
                  <textarea
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full p-3 border rounded-lg mt-1 h-24"
                  ></textarea>
                </div>
                <div>
                  <button
                    onClick={handleCheckSimilarity}
                    disabled={
                      !gradingSubmission.answerText || isCheckingSimilarity
                    }
                    className="w-full text-sm text-center p-2 bg-slate-100 text-slate-600 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCheckingSimilarity ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ScanFace size={16} />
                    )}
                    {isCheckingSimilarity
                      ? "กำลังตรวจสอบ..."
                      : "ตรวจสอบ & ประเมินความคล้ายคลึง"}
                  </button>
                  {similarityResults.length > 0 && (
                    <div className="mt-2 text-xs bg-red-50 p-2 rounded-lg border border-red-200">
                      <p className="font-bold text-red-600">
                        พบความคล้ายคลึงกับ:
                      </p>
                      {similarityResults.slice(0, 3).map((r) => (
                        <p key={r.name}>
                          {r.name} ({r.score}%)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </main>
            <footer className="p-4 bg-white border-t border-slate-200">
              <button
                onClick={handleGradeSubmit}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl"
              >
                บันทึกคะแนน
              </button>
            </footer>
          </div>
        </div>
      )}
      {gradingNotebook && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setGradingNotebook(null)}
        >
          <div
            className="bg-slate-50 rounded-[35px] w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold font-cute text-slate-800">
                  ตรวจสมุดบันทึก
                </h3>
                <p className="text-sm text-slate-500">
                  {gradingNotebook.studentName} -{" "}
                  {courseUnits.find((u) => u.id === gradingNotebook.unitId)
                    ?.subtitle || gradingNotebook.unitId}
                </p>
              </div>
              <button
                onClick={() => setGradingNotebook(null)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </header>
            <main className="flex-1 flex overflow-hidden">
              <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">
                  ผลงานนักเรียน
                </h4>
                {gradingNotebook.content ? (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap text-sm">
                    {gradingNotebook.content}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">ยังไม่มีผลงาน</div>
                )}
              </div>
              <div className="w-1/2 p-6 flex flex-col gap-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500">
                      คะแนน
                    </label>
                    <input
                      type="number"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      className="w-full p-3 border rounded-lg mt-1 text-lg font-bold"
                    />
                  </div>
                  <span className="text-slate-400 pb-3">
                    / {NOTEBOOK_MAX_SCORE}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Feedback
                  </label>
                  <textarea
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full p-3 border rounded-lg mt-1 h-40"
                  ></textarea>
                </div>
              </div>
            </main>
            <footer className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setGradingNotebook(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleNotebookGradeSubmit}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  บันทึกคะแนน
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
