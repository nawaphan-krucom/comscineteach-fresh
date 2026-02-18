import React, { useMemo } from 'react';
import type { User, UserProgress } from '../types';
import StudentsViewMinimal from './StudentsViewMinimal';

interface Props {
  students: User[];
  allProgress: Record<string, UserProgress>;
  onViewStudent?: (studentId: string) => void;
}

const smallSparkline = (data: number[] = []) => {
  const max = Math.max(...data, 1);
  const points = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const StudentsViewBalanced: React.FC<Props> = ({ students, allProgress, onViewStudent }) => {
  const kpis = useMemo(() => {
    const total = students.length;
    const last30 = students.filter(u => u.createdAt).length; // conservative
    const active = Object.keys(allProgress || {}).length;
    return { total, last30, active };
  }, [students, allProgress]);

  // mock trend data for demo (in real app compute by createdAt)
  const trend = [2,5,3,6,4,8,6,7,9,6,8,10];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-400">Total Students</div>
          <div className="text-2xl font-bold text-slate-800">{kpis.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-400">New (30d)</div>
          <div className="text-2xl font-bold text-slate-800">{kpis.last30}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-400">Active Progress Docs</div>
          <div className="text-2xl font-bold text-slate-800">{kpis.active}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="text-xs text-slate-400 mb-2">Recent registrations (trend)</div>
        {smallSparkline(trend)}
      </div>

      <StudentsViewMinimal students={students} allProgress={allProgress} onViewStudent={onViewStudent} />
    </div>
  );
};

export default StudentsViewBalanced;
