import React from 'react';
import type { User, UserProgress } from '../types';

interface Props {
  students: User[];
  allProgress: Record<string, UserProgress>;
  onViewStudent?: (studentId: string) => void;
}

const RowSparkline: React.FC<{ values?: number[] }> = ({ values = [1,2,1,3,2] }) => {
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => `${(i/(values.length-1))*100},${100-(v/max)*100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-8"><polyline points={points} fill="none" stroke="#06b6d4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
};

const StudentsViewRich: React.FC<Props> = ({ students, allProgress, onViewStudent }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="text-sm font-bold mb-3">Detailed Student List</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="text-left py-2">Student</th>
              <th className="text-left py-2">Class</th>
              <th className="py-2">Trend</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const prog = allProgress[s.id];
              const percent = prog ? Math.round(((Object.values(prog.notebookScores || {}).reduce((a,b) => a + (b||0), 0) || 0) / 1) * 100) : 0;
              return (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">{s.avatar || '🧑‍🎓'}</div>
                      <div>
                        <div className="font-bold text-sm">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{s.classLevel}/{s.room}</td>
                  <td className="py-3"><RowSparkline /></td>
                  <td className="py-3 text-center">{percent}%</td>
                  <td className="py-3 text-right"><button onClick={() => onViewStudent && onViewStudent(s.id)} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold">ดูโปรไฟล์</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsViewRich;
