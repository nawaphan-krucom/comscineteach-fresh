import React, { useState } from "react";
import type { User } from "../types";
import {
  Book,
  LogIn,
  UserPlus,
  ArrowRight,
  User as UserIcon,
  Lock,
  Hash,
  Wifi,
  WifiOff,
  Loader2,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
} from "./icons/EmojiIcons";
import { useError } from "../contexts/ErrorContext";
import { useData } from "../contexts/DataContext";

interface AuthViewProps {
  onLogin?: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [viewState, setViewState] = useState<"login" | "register" | "forgot">(
    "login",
  );
  const [isLoading, setIsLoading] = useState(false);
  const { logError } = useError();
  const { login, register, isOnline, validateResetCode } = useData();

  // Common Login State
  const [username, setUsername] = useState(""); // Student ID or 'teacher'
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Registration State
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("เด็กชาย");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [room, setRoom] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password State
  const [resetCode, setResetCode] = useState("");
  const [newResetPassword, setNewResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // The login function from context will handle both online (Firebase) and offline logic
      const success = await login({
        username,
        password,
        // Dummy data for type compliance
        id: "",
        name: "",
        role: "student",
      });

      if (!success) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
      // On success, the DataContext's onAuthStateChanged will handle user state and navigation,
      // so no 'else' block or onLogin call is needed here.
    } catch (e) {
      console.error(e);
      logError(
        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดตรวจสอบการเชื่อมต่อของคุณ",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !studentId ||
      !firstName ||
      !lastName ||
      !classLevel ||
      !room ||
      !seatNumber ||
      !regPassword
    ) {
      const msg = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
      setError(msg);
      logError(msg, "warning");
      return;
    }

    if (!classLevel.startsWith("ม.")) {
      const msg = 'กรุณากรอกระดับชั้นให้ถูกต้อง (ต้องขึ้นต้นด้วย "ม.")';
      setError(msg);
      logError(msg, "warning");
      return;
    }

    if (regPassword !== confirmPassword) {
      const msg = "รหัสผ่านไม่ตรงกัน";
      setError(msg);
      logError(msg, "warning");
      return;
    }

    setIsLoading(true);

    try {
      const newUser: User = {
        id: studentId,
        username: studentId,
        password: regPassword,
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
        logError("ลงทะเบียนสำเร็จ! ยินดีต้อนรับครับ", "info");
        // Automatically log in the new user
        const loginSuccess = await login(newUser);
        if (!loginSuccess && onLogin) {
          // Fallback for offline registration if auto-login fails
          onLogin(newUser);
        }
      }
    } catch (e) {
      console.error(e);
      logError(
        "การลงทะเบียนล้มเหลว โปรดตรวจสอบการเชื่อมต่อและลองอีกครั้ง",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim() || !newResetPassword.trim()) {
      setError("กรุณากรอกรหัสรีเซ็ตและรหัสผ่านใหม่");
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await validateResetCode(
        resetCode.toUpperCase(),
        newResetPassword,
      );
      if (success) {
        setViewState("login");
        setResetCode("");
        setNewResetPassword("");
        setConfirmResetPassword("");
      }
    } catch (e: unknown) {
      console.error(e);
      setError("รหัสรีเซ็ตไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center aurora-bg p-4 sm:p-6">
      <div className="mac-window auth-mac-window w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-[30px] shadow-2xl animate-fade-in relative overflow-hidden flex flex-col full-height">
        {/* Status Indicator */}
        <div
          className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm border ${isOnline ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
        >
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? "Online (Firebase)" : "Offline (Local)"}
        </div>

        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white">
              <Book size={56} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 font-cute">
              {viewState === "login"
                ? "เข้าสู่ระบบ"
                : viewState === "register"
                  ? "ลงทะเบียนนักเรียนใหม่"
                  : viewState === "forgot" && !resetCode
                    ? "กู้คืนรหัสผ่าน"
                    : "ตั้งรหัสผ่านใหม่"}
            </h1>
            <p className="text-slate-500 text-sm">
              {viewState === "login"
                ? "ยินดีต้อนรับสู่ห้องเรียนคอมพิวเตอร์"
                : viewState === "register"
                  ? "กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งาน"
                  : viewState === "forgot" && !resetCode
                    ? "กรอกรหัสรีเซ็ตจากครูของคุณ"
                    : "กรอกรหัสรีเซ็ตและตั้งรหัสผ่านใหม่"}
            </p>
          </div>

          {viewState === "login" && (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  ชื่อผู้ใช้ / รหัสประจำตัวนักเรียน
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium text-slate-800"
                    placeholder="เช่น 66001 หรือ teacher"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium text-slate-800"
                    placeholder="รหัสผ่าน"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-indigo-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewState("forgot");
                      setError("");
                    }}
                    className="text-xs text-indigo-500 font-bold hover:text-indigo-700"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 login-cta rounded-xl font-bold shadow-2xl transition-transform transform-gpu flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <LogIn size={20} />
                )}
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          )}

          {viewState === "register" && (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Student ID */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  เลขรหัสประจำตัวนักเรียน (ใช้เป็นชื่อผู้ใช้)
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium text-slate-800"
                    placeholder="เช่น 66101"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Name Section */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    คำนำหน้า
                  </label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium appearance-none text-slate-800"
                    disabled={isLoading}
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                    placeholder="สมชาย"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  นามสกุล
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                  placeholder="ใจดี"
                  disabled={isLoading}
                />
              </div>

              {/* Class Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    ชั้น
                  </label>
                  <input
                    type="text"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                    placeholder="ม.4"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    ห้อง
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                    placeholder="1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                    เลขที่
                  </label>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                    placeholder="15"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  สร้างรหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                    placeholder="รหัสผ่าน"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-indigo-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type={showRegPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                  placeholder="ยืนยันรหัสผ่าน"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
                {isLoading ? "กำลังลงทะเบียน..." : "สมัครสมาชิก"}
              </button>
            </form>
          )}

          {viewState === "forgot" && !resetCode && (
            /* RESET CODE INPUT FORM */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setResetCode(resetCode.toUpperCase());
              }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 mb-4">
                ครูของคุณได้ส่งรหัสรีเซ็ต (6 หลัก) ไปให้แล้ว กรุณากรอกรหัสนั้น
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  รหัสรีเซ็ต
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-800 tracking-widest"
                    placeholder="เช่น ABC123"
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || resetCode.length !== 6}
                className="w-full py-4 bg-primary text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ArrowRight size={20} />
                )}
                {isLoading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewState("login");
                  setError("");
                  setResetCode("");
                }}
                className="w-full py-3 bg-white/70 text-slate-600 border border-slate-200 rounded-full font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> กลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          )}

          {viewState === "forgot" && resetCode && (
            /* RESET PASSWORD FORM */
            <form onSubmit={handleResetWithCode} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-800 mb-4">
                รหัสรีเซ็ตของคุณถูกต้อง ตอนนี้กรุณาตั้งรหัสผ่านใหม่
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all font-medium text-slate-800"
                    placeholder="รหัสผ่านใหม่"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-green-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showResetPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all font-medium text-slate-800"
                    placeholder="ยืนยันรหัสผ่าน"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-green-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showResetPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <KeyRound size={20} />
                )}
                {isLoading ? "กำลังตั้งรหัสผ่าน..." : "ตั้งรหัสผ่านใหม่"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewState("login");
                  setError("");
                  setResetCode("");
                  setNewResetPassword("");
                  setConfirmResetPassword("");
                }}
                className="w-full py-3 bg-white/70 text-slate-600 border border-slate-200 rounded-full font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> ยกเลิก
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center pb-2">
            {viewState === "login" && (
              <>
                <button
                  onClick={() => {
                    setViewState("register");
                    setError("");
                  }}
                  className="text-sm font-bold text-indigo-500 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto mb-3"
                  disabled={isLoading}
                >
                  นักเรียนใหม่? ลงทะเบียนที่นี่ <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => {
                    setViewState("forgot");
                    setError("");
                    setResetCode("");
                  }}
                  className="text-sm font-bold text-amber-600 hover:text-amber-800 flex items-center justify-center gap-1 mx-auto"
                  disabled={isLoading}
                >
                  มีรหัสรีเซ็ต? ใช้ที่นี่ <KeyRound size={14} />
                </button>
              </>
            )}
            {viewState === "register" && (
              <button
                onClick={() => {
                  setViewState("login");
                  setError("");
                }}
                className="text-sm font-bold text-indigo-500 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto"
                disabled={isLoading}
              >
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
