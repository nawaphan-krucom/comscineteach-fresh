
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Share2, BarChart3, Gem, Briefcase, Trophy, CheckCircle, Award, ClipboardCheck, BookOpen, PenTool, PlayCircle } from './icons/EmojiIcons';
import { ACHIEVEMENTS_LIST, UNIT_ACTIVITIES, UNIT_QUIZZES, UNIT_ASSIGNMENTS, NOTEBOOK_MAX_SCORE, DEFAULT_COURSE_UNITS, MIDTERM_EXAM, FINAL_EXAM } from '../constants';
import { useError } from '../contexts/ErrorContext';

interface PortfolioViewProps {
  onBack: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ onBack }) => {
  const { user, userProgress } = useData();
  const { logError } = useError();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !userProgress) {
    return <div>Loading...</div>;
  }
  
  const handleShare = () => {
      navigator.clipboard.writeText(`https://cs-hub.com/portfolio/${user.id}`);
      logError('คัดลอกลิงก์ Portfolio แล้ว!', 'success');
  }

  const completedProjects = userProgress.projects?.filter(p => p.status === 'completed') || [];
  const earnedAchievements = userProgress.achievements || [];

  const TABS = [
    { id: 'overview', label: 'ภาพรวม', icon: <BarChart3 size={16}/> },
    { id: 'scores', label: 'คะแนนการเรียน', icon: <ClipboardCheck size={16}/> },
    { id: 'achievements', label: 'ความสำเร็จ', icon: <Trophy size={16}/> },
  ];

  // รวมข้อมูลคะแนนทั้งหมด
  const allAssessments = [
    ...UNIT_ACTIVITIES.map(a => ({...a, type: 'Activity', icon: <PlayCircle size={16} className="text-blue-500"/> })),
    ...UNIT_QUIZZES.map(q => ({...q, type: 'Quiz', icon: <BookOpen size={16} className="text-green-500"/> })),
    {...MIDTERM_EXAM, type: 'Midterm Exam', icon: <BookOpen size={16} className="text-orange-500"/>},
    ...UNIT_ASSIGNMENTS.map(a => ({...a, type: 'Assignment', icon: <PenTool size={16} className="text-purple-500"/> })),
    ...DEFAULT_COURSE_UNITS.map(u => ({id: `notebook_${u.id}`, title: `สมุดบันทึก: ${u.title}`, maxScore: NOTEBOOK_MAX_SCORE, type: 'Notebook', icon: <BookOpen size={16} className="text-indigo-500"/> })),
    {...FINAL_EXAM, type: 'Final Exam', icon: <BookOpen size={16} className="text-red-500"/>}
  ];

  const stats = [
    { label: 'Level', value: userProgress.level, icon: <BarChart3/>, color: 'text-blue-500 bg-blue-50' },
    { label: 'Coins', value: userProgress.coins, icon: <Gem/>, color: 'text-amber-500 bg-amber-50' },
    { label: 'Projects Done', value: completedProjects.length, icon: <Briefcase/>, color: 'text-purple-500 bg-purple-50' },
    { label: 'Achievements', value: earnedAchievements.length, icon: <Trophy/>, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
              <ArrowLeft size={20}/>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
                <Award className="text-teal-500" size={32}/> แฟ้มผลงานของฉัน
              </h1>
              <p className="text-slate-500 text-sm">แสดงความสำเร็จและผลงานที่ดีที่สุดของคุณ</p>
            </div>
        </div>
        <button onClick={handleShare} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-700 transition-all">
            <Share2 size={18}/> แชร์ Portfolio
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-8">
        {activeTab === 'overview' && (
          <>
            {/* Profile Header */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 text-6xl rounded-full flex items-center justify-center shadow-md border-4 border-white bg-gradient-to-br from-teal-100 to-cyan-200">
                    {user.avatar}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl font-black text-slate-800 font-cute">{user.name}</h2>
                    <p className="text-slate-500 mt-1">Student ID: {user.id}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-4">
                    {stats.map(stat => (
                        <div key={stat.label} className={`p-4 rounded-2xl text-center ${stat.color.split(' ')[1]}`}>
                            <div className="text-3xl font-black">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Projects */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-purple-800 font-cute mb-6">โครงงานที่เสร็จสิ้น (Completed Projects)</h3>
                {completedProjects.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {completedProjects.map(proj => (
                            <div key={proj.id} className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100">
                                <h4 className="font-bold text-purple-900 flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> {proj.title}</h4>
                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-8">ยังไม่มีโครงงานที่เสร็จสมบูรณ์...</p>
                )}
            </div>
          </>
        )}

        {activeTab === 'scores' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-blue-800 font-cute mb-6 flex items-center gap-2">
              <ClipboardCheck size={24} className="text-blue-500"/> คะแนนการเรียนของฉัน
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 rounded-t-lg">
                  <tr>
                    <th className="p-4 text-left rounded-tl-lg">ประเภท</th>
                    <th className="p-4 text-left">หัวข้อ</th>
                    <th className="p-4 text-center">สถานะ</th>
                    <th className="p-4 text-center">วันที่ส่ง</th>
                    <th className="p-4 text-right rounded-tr-lg">คะแนน</th>
                  </tr>
                </thead>
                <tbody>
                  {allAssessments.map(item => {
                    let status, score, maxScore, submittedAt;
                    if (item.type === 'Activity') {
                      const p = userProgress.activities?.[item.id];
                      status = p?.submitted ? 'เสร็จสิ้น' : 'ยังไม่ทำ';
                      score = p?.score;
                      maxScore = item.maxScore;
                      submittedAt = p?.submittedAt;
                    } else if (item.type === 'Quiz' || item.type === 'Final Exam' || item.type === 'Midterm Exam') {
                      const p = userProgress.quizzes?.[item.id];
                      status = p?.submitted ? 'เสร็จสิ้น' : 'ยังไม่ทำ';
                      score = p?.score;
                      maxScore = item.maxScore;
                      submittedAt = p?.submittedAt;
                    } else if (item.type === 'Assignment') {
                      const p = userProgress.assignments?.[item.id];
                      status = p?.status === 'graded' ? 'ตรวจแล้ว' : p?.status === 'pending' ? 'ส่งแล้ว' : 'ยังไม่ส่ง';
                      score = p?.score;
                      maxScore = item.maxScore;
                      submittedAt = p?.submittedAt;
                    } else { // Notebook
                      const unitId = item.id.replace('notebook_', '');
                      const p = userProgress.notebookScores?.[unitId];
                      const sub = userProgress.notebookSubmissions?.[unitId];
                      status = p ? 'เสร็จสิ้น' : 'ยังไม่ทำ';
                      score = p;
                      maxScore = NOTEBOOK_MAX_SCORE;
                      submittedAt = sub?.submittedAt;
                    }
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="font-medium text-slate-700">{item.type}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{item.title}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            status === 'เสร็จสิ้น' || status === 'ตรวจแล้ว' ? 'bg-green-100 text-green-700' :
                            status === 'ส่งแล้ว' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-500 text-xs">
                          {submittedAt ? new Date(submittedAt).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-700">
                          {typeof score === 'number' ? (
                            <span className={score >= maxScore * 0.8 ? 'text-green-600' : score >= maxScore * 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                              {score}
                            </span>
                          ) : '-'} 
                          <span className="text-slate-400"> / {maxScore}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-2">คำอธิบายสถานะ:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>เสร็จสิ้น / ตรวจแล้ว</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>ส่งแล้ว (รอตรวจ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                  <span>ยังไม่ทำ / ยังไม่ส่ง</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-red-800 font-cute mb-6">เหรียญรางวัลความสำเร็จ (Achievements)</h3>
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                {ACHIEVEMENTS_LIST.map(ach => {
                    const isEarned = earnedAchievements.includes(ach.id);
                    return (
                        <div key={ach.id} className={`flex flex-col items-center text-center transition-opacity ${!isEarned && 'opacity-40 grayscale'}`}>
                            <div className="w-20 h-20 text-4xl rounded-full flex items-center justify-center bg-gradient-to-br from-red-100 to-amber-100 mb-2">
                                {ach.icon}
                            </div>
                            <p className="text-xs font-bold text-slate-700">{ach.title}</p>
                        </div>
                    );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioView;
