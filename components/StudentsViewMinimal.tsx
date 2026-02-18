import React from 'react';
import type { User, UserProgress } from '../types';


interface Props {
  students: User[];
  allProgress: Record<string, UserProgress>;
  onViewStudent?: (studentId: string) => void;
}

const StudentsViewMinimal: React.FC<Props> = ({ students, allProgress, onViewStudent }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="text-sm font-bold mb-3">รายชื่อนักเรียน</div>
      <div className="space-y-3">
        {students.map(s => {
          const prog = allProgress[s.id];
          const percent = prog ? Math.round(((Object.values(prog.notebookScores || {}).reduce((a,b) => a + (b||0), 0) || 0) / 1) * 100) : 0;
          return (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => onViewStudent && onViewStudent(s.id)}>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">{s.avatar || '🧑‍🎓'}</div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  <div className="text-xs text-slate-400 font-mono truncate">{s.username} • {s.classLevel}/{s.room}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{percent}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentsViewMinimal;
