import React, { useState } from 'react';
import type { User } from '../types';
import { Save, Camera, ArrowLeft, RefreshCw, AlertTriangle } from './icons/EmojiIcons';
import { AVATAR_OPTIONS } from '../constants';
import { useData } from '../contexts/DataContext';
import { useError } from '../contexts/ErrorContext';
import ConfirmationDialog from './ConfirmationDialog';
import { auth } from '../firebase';

interface ProfileViewProps {
  user: User;
  onBack: () => void;
  onUpdate?: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack }) => {
  const { updateUser, resetProgress } = useData();
  const { logError } = useError();

  const [avatar, setAvatar] = useState(user.avatar || '🧑‍🎓');
  const [firstName, setFirstName] = useState(user.firstName || user.name.split(' ')[0]);
  const [lastName, setLastName] = useState(user.lastName || user.name.split(' ')[1] || '');
  const [classLevel, setClassLevel] = useState(user.classLevel || '');
  const [room, setRoom] = useState(user.room || '');
  const [seatNumber, setSeatNumber] = useState(user.seatNumber || '');
  const [title, setTitle] = useState(user.title || 'เด็กชาย');
  
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = () => {
    const updatedUser: User = {
        ...user,
        avatar,
        firstName,
        lastName,
        name: `${title}${firstName} ${lastName}`,
        title,
        classLevel,
        room,
        seatNumber
    };

    updateUser(updatedUser);
    logError('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
  };

  // If a teacher has reset this user's password, show a prominent notice and a quick "Set new password" flow
  const handleSetNewPassword = async () => {
    const pwd = window.prompt('กรุณาตั้งรหัสผ่านใหม่ (8-12 ตัวอักษร):');
    if (!pwd) return;
    if (pwd.length < 8 || pwd.length > 12) {
      logError('รหัสผ่านต้องมี 8-12 ตัวอักษร', 'error');
      return;
    }

    if (!auth || !auth.currentUser) {
      logError('ไม่พบผู้ใช้ที่เข้าสู่ระบบ', 'error');
      return;
    }

    try {
      await auth.currentUser.updatePassword(pwd);
      logError('ตั้งรหัสผ่านเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.error(err);
      logError('ไม่สามารถตั้งรหัสผ่านได้ กรุณาลองใหม่', 'error');
    }
  };

  const handleReset = () => {
      setIsResetConfirmOpen(false);
      resetProgress();
      logError('รีเซ็ตข้อมูลเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่เพื่อเริ่มเรียน', 'info');
      setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="animate-fade-in p-4 md:p-6 max-w-3xl mx-auto h-full flex flex-col relative">
        
        <ConfirmationDialog
            isOpen={isResetConfirmOpen}
            onClose={() => setIsResetConfirmOpen(false)}
            onConfirm={handleReset}
            title="ยืนยันการรีเซ็ตข้อมูล?"
            message="คุณกำลังจะลบข้อมูลการเรียนทั้งหมด รวมถึงคะแนน, การบ้าน, และบันทึกต่างๆ การกระทำนี้ไม่สามารถย้อนกลับได้"
            confirmText="ยืนยันรีเซ็ต"
            variant="danger"
        />

        <header className="flex items-center gap-4 mb-6 shrink-0">
            <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
                <ArrowLeft size={20}/>
            </button>
            <h1 className="text-3xl font-bold text-slate-800 font-cute">แก้ไขข้อมูลส่วนตัว</h1>
        </header>

        <div className="glass-card p-6 md:p-8 rounded-[30px] shadow-lg flex-1 overflow-y-auto custom-scrollbar">

                {/* Password reset notice (shown when admin reset password) */}
                {user?.passwordResetAt ? (
                  <div data-testid="PasswordResetNotice" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3" role="status" aria-live="polite">
                    <div className="flex-1 text-sm">
                      <p className="font-bold mb-1">รหัสผ่านของคุณถูกรีเซ็ตเมื่อ {(() => {
                        const ts: any = user.passwordResetAt;
                        if (!ts) return '';
                        const d = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts);
                        return d.toLocaleString('th-TH');
                      })()}</p>
                      <p className="text-sm text-slate-600">หากคุณยังไม่ได้ตั้งรหัสผ่านใหม่ กรุณาตั้งรหัสผ่านใหม่เพื่อใช้งานต่อได้ทันที</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button data-testid="SetPasswordBtn" onClick={handleSetNewPassword} className="py-2 px-3 bg-emerald-500 text-white rounded-lg font-bold">ตั้งรหัสผ่านใหม่</button>
                    </div>
                  </div>
                ) : null}
            {/* Avatar Selection */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-white shadow-md relative group">
                    {avatar}
                    <div className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full text-white shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
                        <Camera size={16}/>
                    </div>
                </div>
                <div className="text-sm font-bold text-slate-500 mb-3">เลือกรูปโปรไฟล์</div>
                <div className="flex gap-2 flex-wrap justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                    {AVATAR_OPTIONS.map(emoji => (
                        <button 
                            key={emoji}
                            onClick={() => setAvatar(emoji)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-white transition hover:scale-110 ${avatar === emoji ? 'bg-white shadow-md ring-2 ring-indigo-400 scale-110' : 'bg-transparent grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Read-Only Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 opacity-70">
                    <label className="text-xs font-bold text-slate-500 uppercase">รหัสประจำตัว (Username สำหรับ Login)</label>
                    <div className="font-mono font-bold text-lg text-slate-700">{user.username}</div>
                </div>
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 opacity-70">
                    <label className="text-xs font-bold text-slate-500 uppercase">สถานะ</label>
                    <div className="font-bold text-lg text-slate-700 uppercase">{user.role}</div>
                </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">คำนำหน้า</label>
                        <select 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                        >
                            <option value="เด็กชาย">เด็กชาย</option>
                            <option value="เด็กหญิง">เด็กหญิง</option>
                            <option value="นาย">นาย</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ชื่อจริง</label>
                        <input 
                            type="text" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">นามสกุล</label>
                    <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-800"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ชั้น</label>
                        <input 
                            type="text" 
                            value={classLevel} 
                            onChange={(e) => setClassLevel(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-center text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ห้อง</label>
                        <input 
                            type="text" 
                            value={room} 
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-center text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">เลขที่</label>
                        <input 
                            type="text" 
                            value={seatNumber} 
                            onChange={(e) => setSeatNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-center text-slate-800"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1"
                >
                    <Save size={20}/> บันทึกการเปลี่ยนแปลง
                </button>

                <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle size={16}/> พื้นที่อันตราย (Danger Zone)
                    </h3>
                    <button 
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18}/> รีเซ็ตข้อมูลการเรียนทั้งหมด (Start Over)
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileView;
