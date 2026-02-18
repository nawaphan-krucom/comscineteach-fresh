import React, { useEffect, useState } from 'react';
import { db } from '../firebase';

const RealtimeStats: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [progressCount, setProgressCount] = useState<number | null>(null);
  const [recentUsers, setRecentUsers] = useState<Array<{id:string;data:any}>>([]);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    let unsubUsers: (() => void) | null = null;
    let unsubProg: (() => void) | null = null;

    try {
      unsubUsers = db.collection('users').onSnapshot(snap => {
        setUsersCount(snap.size);
        setRecentUsers(snap.docs.slice(0,5).map(d => ({ id: d.id, data: d.data() })));
        setStatus('Connected');
      }, err => {
        console.error('Users listener error', err);
        setStatus('Users listener error');
      });

      unsubProg = db.collection('progress').onSnapshot(snap => {
        setProgressCount(snap.size);
        setStatus('Connected');
      }, err => {
        console.error('Progress listener error', err);
        setStatus('Progress listener error');
      });
    } catch (err) {
      console.error('Failed to attach listeners', err);
      setStatus('Failed');
    }

    return () => { if (unsubUsers) unsubUsers(); if (unsubProg) unsubProg(); };
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Realtime Stats</h2>
        <div className="text-sm text-slate-500">Status: {status}</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Users (role=student)</div>
          <div className="text-2xl font-bold">{usersCount ?? '—'}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Progress docs</div>
          <div className="text-2xl font-bold">{progressCount ?? '—'}</div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold">Recent users</h3>
          <ul className="mt-2 space-y-2">
            {recentUsers.length === 0 && <li className="text-sm text-slate-400">No users</li>}
            {recentUsers.map(u => (
              <li key={u.id} className="text-sm p-2 bg-slate-50 rounded">
                <div className="font-bold truncate">{u.data.name || u.id}</div>
                <div className="text-xs text-slate-500">{u.id}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => onBack && onBack()} className="px-3 py-2 bg-slate-200 rounded">Back</button>
        </div>
      </div>
    </div>
  );
};

export default RealtimeStats;
