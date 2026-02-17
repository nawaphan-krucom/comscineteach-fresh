import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import Emoji from './primitives/Emoji';

interface Props {
  daysDefault?: number;
  onViewStudent?: (studentId: string) => void;
}

const formatDate = (raw: any) => {
  if (!raw) return '—';
  try {
    if (typeof raw === 'string') return new Date(raw).toLocaleString();
    if (raw && typeof raw.toDate === 'function') return raw.toDate().toLocaleString();
    return String(raw);
  } catch {
    return String(raw);
  }
};

const toISO = (raw: any) => {
  if (!raw) return null;
  try {
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw.toDate === 'function') return raw.toDate().toISOString();
    return new Date(raw).toISOString();
  } catch { return null; }
};

const exportCSV = (users: any[]) => {
  const headers = ['id', 'username', 'name', 'createdAt', 'classLevel', 'room', 'seatNumber'];
  const rows = users.map(u => [u.id || '', u.username || '', u.name || '', toISO(u.createdAt) || '', u.classLevel || '', u.room || '', u.seatNumber || '']);
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `new_registrations_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const NewRegistrationsPanel: React.FC<Props> = ({ daysDefault = 30, onViewStudent }) => {
  const { allUsers } = useData();
  const [days, setDays] = useState<number>(daysDefault);
  const [query, setQuery] = useState('');

  const recentUsers = useMemo(() => {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return (allUsers || [])
      .filter(u => u.role === 'student')
      .map(u => ({ ...u, _createdIso: toISO(u.createdAt) }))
      .filter(u => {
        if (!u._createdIso) return false;
        return new Date(u._createdIso).getTime() >= cutoff;
      })
      .filter(u => {
        if (!query) return true;
        const q = query.toLowerCase().trim();
        return (u.name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
      })
      .sort((a: any, b: any) => (new Date(b._createdIso).getTime() - new Date(a._createdIso).getTime()));
  }, [allUsers, days, query]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold">นักเรียนสมัครใหม่ (ล่าสุด {days} วัน)</h4>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={days} onChange={(e) => setDays(parseInt(e.target.value || '30', 10))}>
            <option value={7}>7 วัน</option>
            <option value={30}>30 วัน</option>
            <option value={90}>90 วัน</option>
            <option value={365}>ปีที่ผ่านมา</option>
          </select>
          <button onClick={() => exportCSV(recentUsers)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2">
            <Emoji symbol="⬇️" label="export" className="text-sm"/> ส่งออก CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input type="text" placeholder="ค้นหา (ชื่อหรือรหัส)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="max-h-44 overflow-y-auto custom-scrollbar">
        {recentUsers.length === 0 ? (
          <div className="text-xs text-slate-400">ไม่มีผู้ใช้งานใหม่ภายในช่วงเวลาที่กำหนด</div>
        ) : (
          <ul className="space-y-2">
            {recentUsers.slice(0, 20).map(u => (
              <li key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">{u.avatar || '🧑‍🎓'}</div>
                  <div>
                    <div className="font-bold text-sm">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.username} • {formatDate(u.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onViewStudent && onViewStudent(u.id)} className="text-xs px-3 py-1 bg-white border border-slate-200 rounded-lg">ดูโปรไฟล์</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NewRegistrationsPanel;
