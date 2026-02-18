import React from 'react';
import { useData } from '../contexts/DataContext';
import { MIDTERM_EXAM, FINAL_EXAM } from '../constants';
import Emoji from './primitives/Emoji';

interface ExamResultsViewProps {
  onBack?: () => void;
}

const ExamResultsView: React.FC<ExamResultsViewProps> = ({ onBack }) => {
  const { user, userProgress } = useData();

  if (!user || !userProgress) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    );
  }

  const midtermScore = userProgress.quizzes?.[MIDTERM_EXAM.id]?.score || 0;
  const finalScore = userProgress.quizzes?.[FINAL_EXAM.id]?.score || 0;
  const midtermSubmitted = !!userProgress.quizzes?.[MIDTERM_EXAM.id]?.submitted;
  const finalSubmitted = !!userProgress.quizzes?.[FINAL_EXAM.id]?.submitted;

  const getPerformanceRating = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return { emoji: '🌟', text: 'ดีเยี่ยม', color: 'text-yellow-600' };
    if (percentage >= 60) return { emoji: '👍', text: 'ดี', color: 'text-green-600' };
    return { emoji: '📚', text: 'ศึกษาต่อไป', color: 'text-blue-600' };
  };

  const midtermRating = getPerformanceRating(midtermScore, MIDTERM_EXAM.maxScore);
  const finalRating = getPerformanceRating(finalScore, FINAL_EXAM.maxScore);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Exam Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 mt-8">
        {/* Midterm Exam */}
        <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 rounded-3xl p-8 border-3 border-amber-300 shadow-xl transform hover:scale-105 transition-transform duration-300">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex justify-center gap-3 text-4xl">
              <Emoji symbol="📝" label="midterm" className="" />
              <span className="font-bold text-amber-900">สอบกลางภาค</span>
              <Emoji symbol="📝" label="midterm" className="" />
            </div>

            {/* Divider */}
            <div className="text-sm font-bold text-amber-700 tracking-widest">
              ━━━━━━━━━━━━━━━
            </div>

            {/* Status */}
            {!midtermSubmitted ? (
              <div className="bg-white rounded-2xl p-4 border-2 border-amber-400">
                <Emoji symbol="⏳" label="pending" className="text-3xl mb-2 block" />
                <p className="text-amber-800 font-bold">ยังไม่ได้ทำการสอบ</p>
              </div>
            ) : (
              <>
                {/* Score Display */}
                <div className="bg-white rounded-2xl p-6 border-3 border-amber-300 shadow-lg">
                  <div className="flex justify-center gap-2 text-3xl animate-bounce mb-3" style={{ animationDelay: '0s' }}>
                    <Emoji symbol="✨" label="sparkle" className="" />
                    <Emoji symbol="🎯" label="target" className="" />
                    <Emoji symbol="✨" label="sparkle" className="" />
                  </div>
                  <div className="text-6xl font-black text-amber-600 mb-2">
                    {midtermScore}
                  </div>
                  <div className="text-sm text-amber-600 font-bold">
                    คะแนนสูงสุด {MIDTERM_EXAM.maxScore}
                  </div>
                </div>

                {/* Performance Rating */}
                <div className="bg-white rounded-2xl p-4 border-2 border-amber-400 shadow-md">
                  <div className={`text-2xl font-bold ${midtermRating.color}`}>
                    <span className="text-3xl mr-2">{midtermRating.emoji}</span>
                    {midtermRating.text}
                  </div>
                </div>

                {/* Encouragement */}
                <div className="bg-amber-100 rounded-xl p-3 border-2 border-amber-300">
                  <p className="text-amber-800 font-bold text-sm">
                    <Emoji symbol="💪" label="muscle" className="mr-1" />
                    ทำได้ดี! เก่งมากจริงๆ
                    <Emoji symbol="💪" label="muscle" className="ml-1" />
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Final Exam */}
        <div className="bg-gradient-to-br from-rose-50 via-rose-100 to-pink-100 rounded-3xl p-8 border-3 border-rose-300 shadow-xl transform hover:scale-105 transition-transform duration-300">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex justify-center gap-3 text-4xl">
              <Emoji symbol="🏆" label="final" className="" />
              <span className="font-bold text-rose-900">สอบปลายภาค</span>
              <Emoji symbol="🏆" label="final" className="" />
            </div>

            {/* Divider */}
            <div className="text-sm font-bold text-rose-700 tracking-widest">
              ━━━━━━━━━━━━━━━
            </div>

            {/* Status */}
            {!finalSubmitted ? (
              <div className="bg-white rounded-2xl p-4 border-2 border-rose-400">
                <Emoji symbol="⏳" label="pending" className="text-3xl mb-2 block" />
                <p className="text-rose-800 font-bold">ยังไม่ได้ทำการสอบ</p>
              </div>
            ) : (
              <>
                {/* Score Display */}
                <div className="bg-white rounded-2xl p-6 border-3 border-rose-300 shadow-lg">
                  <div className="flex justify-center gap-2 text-3xl animate-bounce mb-3" style={{ animationDelay: '0s' }}>
                    <Emoji symbol="✨" label="sparkle" className="" />
                    <Emoji symbol="🎯" label="target" className="" />
                    <Emoji symbol="✨" label="sparkle" className="" />
                  </div>
                  <div className="text-6xl font-black text-rose-600 mb-2">
                    {finalScore}
                  </div>
                  <div className="text-sm text-rose-600 font-bold">
                    คะแนนสูงสุด {FINAL_EXAM.maxScore}
                  </div>
                </div>

                {/* Performance Rating */}
                <div className="bg-white rounded-2xl p-4 border-2 border-rose-400 shadow-md">
                  <div className={`text-2xl font-bold ${finalRating.color}`}>
                    <span className="text-3xl mr-2">{finalRating.emoji}</span>
                    {finalRating.text}
                  </div>
                </div>

                {/* Encouragement */}
                <div className="bg-rose-100 rounded-xl p-3 border-2 border-rose-300">
                  <p className="text-rose-800 font-bold text-sm">
                    <Emoji symbol="🎉" label="celebrate" className="mr-1" />
                    ยอดเยี่ยม! สุดเก่ง!
                    <Emoji symbol="🎉" label="celebrate" className="ml-1" />
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="text-center mt-12">
          <button
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
          >
            <Emoji symbol="⬅️" label="back" className="mr-2" />
            กลับไปหน้าหลัก
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamResultsView;
