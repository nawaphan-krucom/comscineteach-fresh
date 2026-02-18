import React, { useState, useMemo } from 'react';
import type { User, UserProgress, QnAData, CourseUnit, QuizData, ActivityData } from '../types';
import { UNIT_ACTIVITIES, UNIT_QUIZZES, UNIT_ASSIGNMENTS, MIDTERM_EXAM, FINAL_EXAM, DEFAULT_COURSE_UNITS, NOTEBOOK_MAX_SCORE } from '../constants';
import { Users, CheckCircle, MessageSquare, Trophy, ChevronRight, Eye, BarChart3, PieChart, ClipboardCheck, X } from './icons/EmojiIcons';


const isStudentCompleted = (progress: UserProgress, courseUnits: CourseUnit[]) => {
    // Check if all units are completed
    const allUnitsCompleted = courseUnits.filter(u=>u.isActive).every(u => progress?.units?.[u.id]?.completed);
    if (!allUnitsCompleted) return false;

    // Check if all activities are submitted (and graded for manual activities)
    const allActivitiesCompleted = UNIT_ACTIVITIES.every(act => {
        const actProgress = progress.activities?.[act.id];
        return actProgress?.submitted && (actProgress.status === 'graded' || ['matching', 'ordering', 'multiple_choice_game'].includes(act.type));
    });

    // Check if all quizzes are submitted
    const allQuizzesCompleted = UNIT_QUIZZES.every(quiz => progress.quizzes?.[quiz.id]?.submitted);

    // Check if midterm and final exams are submitted
    const midtermCompleted = progress.quizzes?.[MIDTERM_EXAM.id]?.submitted;
    const finalCompleted = progress.quizzes?.[FINAL_EXAM.id]?.submitted;

    // Check if all assignments are graded
    const allAssignmentsCompleted = UNIT_ASSIGNMENTS.every(assign => {
        const assignProgress = progress.assignments?.[assign.id];
        return assignProgress?.status === 'graded';
    });

    // Check if all notebooks are graded
    const allNotebooksCompleted = courseUnits.filter(u=>u.isActive).every(unit => {
        const score = progress.notebookScores?.[unit.id];
        return score !== undefined && score > 0;
    });

    return allActivitiesCompleted && allQuizzesCompleted && midtermCompleted && finalCompleted && allAssignmentsCompleted && allNotebooksCompleted;
};

const calculateMaxTotalScore = () => {
    let max = 0;
    UNIT_ACTIVITIES.forEach(act => max += act.maxScore);
    UNIT_QUIZZES.forEach(quiz => max += quiz.maxScore);
    max += MIDTERM_EXAM.maxScore;
    // Unit assignments are not included here — teacher dashboard focuses on quizzes/activities/notebook
    DEFAULT_COURSE_UNITS.forEach(() => max += NOTEBOOK_MAX_SCORE);
    max += FINAL_EXAM.maxScore;
    return max;
};

const calculateTotalScore = (progress: UserProgress | undefined) => {
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

    DEFAULT_COURSE_UNITS.forEach(unit => {
        const score = progress.notebookScores?.[unit.id];
        if (score) total += (score || 0);
    });

    const finalP = progress.quizzes?.[FINAL_EXAM.id];
    if (finalP) total += (finalP.score || 0);

    return total;
};

const AnalyticsTab: React.FC<{
    students: User[];
    allProgress: Record<string, UserProgress>;
    qnaList: QnAData[];
    courseUnits: CourseUnit[];
    onAnalyze: (assessment: QuizData | ActivityData) => void;
    onViewStudent: (student: User & { score?: number; percent?: number; totalCheats?: number }) => void;
}> = ({ students, allProgress, qnaList, courseUnits, onAnalyze, onViewStudent }) => {
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [showAllStudentsModal, setShowAllStudentsModal] = useState(false);
    const [showStudentsToWatchModal, setShowStudentsToWatchModal] = useState(false);
    const maxTotalScore = useMemo(() => calculateMaxTotalScore(), []);

    const analyticsData = useMemo(() => {
        const totalStudents = students.length;
        if (totalStudents === 0) return null;

        const progressValues = Object.values(allProgress).filter(p => p);
        const activeUnits = courseUnits.filter(c => c.isActive);

        const completedStudentsList = students.filter(s => {
            const p = allProgress[s.id];
            if (!p) return false;
            return isStudentCompleted(p, courseUnits);
        }).map(s => ({
            ...s,
            totalScore: calculateTotalScore(allProgress[s.id] || undefined)
        })).sort((a, b) => b.totalScore - a.totalScore);

        const totalScores = progressValues.map((p: UserProgress) => calculateTotalScore(p));
        const averageScore = totalStudents > 0 ? Math.round(totalScores.reduce((a: number, b: number) => a + b, 0) / totalStudents) : 0;
        const engagement = { qnaCount: qnaList.length };

        const scoreDistribution = [0, 0, 0, 0, 0];
        totalScores.forEach(score => {
            const percentage = (score / maxTotalScore) * 100;
            if (percentage <= 20) scoreDistribution[0]++;
            else if (percentage <= 40) scoreDistribution[1]++;
            else if (percentage <= 60) scoreDistribution[2]++;
            else if (percentage <= 80) scoreDistribution[3]++;
            else scoreDistribution[4]++;
        });

        const maxCountInDistribution = Math.max(...scoreDistribution, 1);

        const unitCompletionStats = activeUnits.map(unit => ({
            id: unit.id,
            title: unit.subtitle.split(':')[0],
            completed: progressValues.filter((p: UserProgress) => p?.units?.[unit.id]?.completed).length,
            percentage: totalStudents > 0 ? Math.round((progressValues.filter((p: UserProgress) => p?.units?.[unit.id]?.completed).length / totalStudents) * 100) : 0
        }));

        const studentsWithScores = students.map(s => ({ ...s, totalScore: calculateTotalScore(allProgress[s.id] || undefined) })).sort((a,b) => b.totalScore - a.totalScore);
        const studentsToWatch = studentsWithScores.slice(0, 5);

        const allAssessments: (QuizData | ActivityData)[] = [...UNIT_ACTIVITIES, ...UNIT_QUIZZES, MIDTERM_EXAM, FINAL_EXAM];
        const assessmentAverages = allAssessments.map(item => {
            const scores = progressValues.map((p: UserProgress) => (p?.activities?.[item.id]?.score ?? p?.quizzes?.[item.id]?.score)).filter(s => s !== undefined) as number[];
            const average = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
            return {
                item,
                average: Math.round(average),
                displayType: 'questions' in item ? 'Quiz' : 'Activity',
            };
        });

        return {
            totalStudents,
            completedStudentsCount: completedStudentsList.length,
            completedStudentsList,
            averageScore,
            engagement,
            scoreDistribution,
            maxCountInDistribution,
            unitCompletionStats,
            studentsToWatch,
            assessmentAverages
        };
    }, [students, allProgress, qnaList, courseUnits, maxTotalScore]);

    if (!analyticsData) {
        return <div className="text-center text-slate-400 py-20">ไม่มีข้อมูลนักเรียนสำหรับวิเคราะห์</div>;
    }

    const { totalStudents, completedStudentsCount, completedStudentsList, averageScore, engagement, scoreDistribution, maxCountInDistribution, unitCompletionStats, studentsToWatch, assessmentAverages } = analyticsData;

        const keyMetrics = [
        { label: "นักเรียนทั้งหมด", value: totalStudents, icon: <Users size={24}/> , color: "blue", action: () => setShowAllStudentsModal(true) },
        { label: "เรียนจบหลักสูตร", value: completedStudentsCount, icon: <CheckCircle size={24}/>, color: "emerald", action: () => setShowCompletedModal(true) },
        { label: "คะแนนเฉลี่ย", value: averageScore, icon: <BarChart3 size={24}/>, color: "indigo", action: null },
        { label: "Top 5 คะแนนสูงสุด", value: studentsToWatch.length, icon: <Trophy size={24}/>, color: "amber", action: () => setShowStudentsToWatchModal(true) },
        { label: "การมีส่วนร่วม (Q&A)", value: engagement.qnaCount, icon: <MessageSquare size={24}/>, color: "violet", action: null },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyMetrics.map(metric => (
                    <div 
                        key={metric.label} 
                        onClick={metric.action || undefined}
                        className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 transition-all ${metric.action ? 'cursor-pointer hover:shadow-md hover:border-emerald-200 group' : ''}`}
                    >
                        <div className={`w-12 h-12 bg-${metric.color}-100 text-${metric.color}-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            {metric.icon}
                        </div>
                        <div>
                            <div className={`text-3xl font-black text-slate-800 flex items-center gap-2`}>
                                {metric.value}
                                {metric.action && <ChevronRight size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all"/>}
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {showCompletedModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCompletedModal(false)}>
                    <div className="bg-white rounded-[35px] w-full max-w-2xl max-h-[80vh] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                            <div className="flex items-center gap-3 text-emerald-700">
                                <Trophy size={24}/>
                                <h3 className="text-xl font-bold font-cute">นักเรียนที่เรียนจบหลักสูตร ({completedStudentsList.length} คน)</h3>
                            </div>
                            <button onClick={() => setShowCompletedModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all"><X/></button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                            {completedStudentsList.length > 0 ? completedStudentsList.map((s: User & { totalScore?: number }) => {
                                const prog = allProgress[s.id];
                                const totalCheats = Object.values(prog?.quizzes || {}).reduce((acc: number, q: { cheatAttempts?: number }) => acc + (q.cheatAttempts || 0), 0);
                                return (
                                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl">{s.avatar}</div>
                                            <div>
                                                <p className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.classLevel}/{s.room} เลขที่ {s.seatNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
                                                <p className="font-black text-emerald-600">{s.totalScore} <span className="text-[10px] text-slate-300">/ {maxTotalScore}</span></p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const percent = Math.round((s.totalScore / maxTotalScore) * 100);
                                                    onViewStudent({ ...s, score: s.totalScore, percent, totalCheats });
                                                    setShowCompletedModal(false);
                                                }} 
                                                className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="ดูแฟ้มผลงาน"
                                            >
                                                <Eye size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                                    <Users size={48} className="opacity-10"/>
                                    <p className="font-bold">ยังไม่มีใครเรียนจบหลักสูตรในขณะนี้</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* All Students Modal */}
            {showAllStudentsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAllStudentsModal(false)}>
                    <div className="bg-white rounded-[35px] w-full max-w-2xl max-h-[80vh] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                            <div className="flex items-center gap-3 text-blue-700">
                                <Users size={24}/>
                                <h3 className="text-xl font-bold font-cute">นักเรียนทั้งหมด ({students.length} คน)</h3>
                            </div>
                            <button onClick={() => setShowAllStudentsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all"><X/></button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                            {students.map((s: User) => {
                                const prog = allProgress[s.id];
                                const totalScore = calculateTotalScore(prog);
                                const totalCheats = Object.values(prog?.quizzes || {}).reduce((acc: number, q: { cheatAttempts?: number }) => acc + (q.cheatAttempts || 0), 0);
                                const isCompleted = isStudentCompleted(prog, courseUnits);
                                return (
                                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl">{s.avatar}</div>
                                            <div>
                                                <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                    {s.name}
                                                    {isCompleted && <CheckCircle size={14} className="text-emerald-500"/>}
                                                </p>
                                                <p className="text-xs text-slate-400">{s.classLevel}/{s.room} เลขที่ {s.seatNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
                                                <p className="font-black text-brand-blue">{totalScore} <span className="text-[10px] text-slate-300">/ {maxTotalScore}</span></p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const percent = Math.round((totalScore / maxTotalScore) * 100);
                                                    onViewStudent({ ...s, score: totalScore, percent, totalCheats });
                                                    setShowAllStudentsModal(false);
                                                }} 
                                                className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="ดูแฟ้มผลงาน"
                                            >
                                                <Eye size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Students to Watch Modal */}
            {showStudentsToWatchModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowStudentsToWatchModal(false)}>
                    <div className="bg-white rounded-[35px] w-full max-w-2xl max-h-[80vh] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
                            <div className="flex items-center gap-3 text-amber-700">
                                <Trophy size={24}/>
                                <h3 className="text-xl font-bold font-cute">Top 5 นักเรียนคะแนนสูงสุด ({studentsToWatch.length} คน)</h3>
                            </div>
                            <button onClick={() => setShowStudentsToWatchModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all"><X/></button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                            {studentsToWatch.map((s: User & { totalScore?: number }) => {
                                const prog = allProgress[s.id];
                                const totalCheats = Object.values(prog?.quizzes || {}).reduce((acc: number, q: { cheatAttempts?: number }) => acc + (q.cheatAttempts || 0), 0);
                                return (
                                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl">{s.avatar}</div>
                                            <div>
                                                <p className="font-bold text-slate-700 group-hover:text-amber-600 transition-colors">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.classLevel}/{s.room} เลขที่ {s.seatNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
                                                <p className="font-black text-amber-600">{s.totalScore} <span className="text-[10px] text-slate-300">/ {maxTotalScore}</span></p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const percent = Math.round((s.totalScore / maxTotalScore) * 100);
                                                    onViewStudent({ ...s, score: s.totalScore, percent, totalCheats });
                                                    setShowStudentsToWatchModal(false);
                                                }} 
                                                className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="ดูแฟ้มผลงาน"
                                            >
                                                <Eye size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-10 flex items-center gap-2 font-cute">
                        <BarChart3 size={20} className="text-indigo-500"/> การกระจายคะแนน (Score Distribution)
                    </h3>
                    <div className="h-56 relative">
                        <div className="absolute inset-0 flex flex-col justify-between h-full pb-6">
                            <div className="flex items-center">
                                <span className="text-[10px] text-slate-400 w-8 text-right pr-2">{maxCountInDistribution}</span>
                                <div className="flex-1 border-t border-dashed border-slate-200"></div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-[10px] text-slate-400 w-8 text-right pr-2">{Math.ceil(maxCountInDistribution / 2)}</span>
                                <div className="flex-1 border-t border-dashed border-slate-200"></div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-[10px] text-slate-400 w-8 text-right pr-2">0</span>
                                <div className="flex-1 border-t border-solid border-slate-300"></div>
                            </div>
                        </div>
                        
                        <div className="absolute inset-0 pl-8 pr-2 flex items-end justify-around h-full pb-6 gap-2">
                            {scoreDistribution.map((count, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className="absolute -top-1 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none transform -translate-y-full">
                                        {count} คน
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                    </div>
                                    <div 
                                        className="w-[70%] bg-gradient-to-t from-indigo-400 to-indigo-500 rounded-t-lg transition-all duration-300 ease-out shadow-inner shadow-indigo-200/50 group-hover:from-indigo-500 group-hover:to-indigo-600"
                                        style={{ height: `calc(${(count / maxCountInDistribution) * 100 * 1}% + 1px)` }}
                                        title={`${count} คน`}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute -bottom-4 left-0 right-0 pl-8 pr-2 flex justify-around">
                            {scoreDistribution.map((_, i) => (
                                <span key={i} className="text-[10px] text-slate-500 font-bold text-center w-full">
                                    {i*20+1}-{(i+1)*20}%
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                     <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 font-cute"><PieChart size={20} className="text-brand-emerald"/> ความคืบหน้าตามหน่วยเรียน</h3>
                     <div className="space-y-4">
                        {unitCompletionStats.map(unit => (
                            <div key={unit.id}>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-slate-600">{unit.title}</span>
                                    <span className="text-emerald-600">{unit.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${unit.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 font-cute"><Trophy size={20} className="text-amber-500"/> Top 5 คะแนนสูงสุด</h3>
                    <div className="space-y-3">
                        {studentsToWatch.length > 0 ? studentsToWatch.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center text-lg rounded-full bg-white shadow-sm">{s.avatar}</div>
                                    <div className="text-sm font-bold text-slate-700">{s.name}</div>
                                </div>
                                <div className="text-lg font-black text-amber-600">{s.totalScore}</div>
                            </div>
                        )) : <p className="text-sm text-slate-400 text-center py-4">ไม่มีข้อมูล</p>}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                     <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 font-cute"><ClipboardCheck size={20} className="text-blue-500"/> คะแนนเฉลี่ยรายกิจกรรม</h3>
                     <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                        {assessmentAverages.map(data => (
                            <div key={data.item.id} className="flex items-center gap-4 text-sm group">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold ${data.displayType === 'Quiz' ? 'bg-amber-500' : 'bg-blue-500'}`}>{data.displayType.slice(0,1)}</div>
                                <div className="flex-1 font-medium text-slate-600 truncate">{data.item.title}</div>
                                <div className="font-bold text-slate-800">{data.average} <span className="text-xs text-slate-400">/ {data.item.maxScore}</span></div>
                                <button onClick={() => onAnalyze(data.item)} className="p-1.5 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 rounded-md" title="วิเคราะห์รายข้อ">
                                    <BarChart3 size={16}/>
                                </button>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
