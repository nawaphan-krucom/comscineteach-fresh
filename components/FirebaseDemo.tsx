import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { ViewState } from '../types';

const FirebaseDemo: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('Hello from demo');
  const [docs, setDocs] = useState<Array<{ id: string; data: any }>>([]);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth && auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub && unsub();
  }, []);

  const signIn = async () => {
    setStatus(null);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setStatus('Signed in');
      await listDocs();
    } catch (err) {
      setStatus('Sign-in failed: ' + String(err));
    }
  };

  const signOut = async () => {
    setStatus(null);
    try {
      await auth.signOut();
      setStatus('Signed out');
    } catch (err) {
      setStatus('Sign-out failed: ' + String(err));
    }
  };

  const addDoc = async () => {
    setStatus(null);
    try {
      await db.collection('firebase_demo').add({ note, createdAt: new Date().toISOString(), by: user?.uid || 'anon' });
      setStatus('Document added');
      await listDocs();
    } catch (err) {
      setStatus('Add failed: ' + String(err));
    }
  };

  const listDocs = async () => {
    try {
      const snap = await db.collection('firebase_demo').orderBy('createdAt', 'desc').limit(20).get();
      setDocs(snap.docs.map(d => ({ id: d.id, data: d.data() })));
    } catch (err) {
      setStatus('List failed: ' + String(err));
    }
  };

  // initial list
  useEffect(() => { void listDocs(); }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Firebase Demo</h2>
        <div className="text-sm text-slate-500">User: {user ? user.email || user.uid : 'Not signed in'}</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-2">
          <input className="flex-1 p-2 border rounded" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-40 p-2 border rounded" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={signIn} className="px-3 py-2 bg-indigo-600 text-white rounded">Sign in</button>
          <button onClick={signOut} className="px-3 py-2 bg-gray-200 rounded">Sign out</button>
        </div>

        <div className="flex gap-2">
          <input className="flex-1 p-2 border rounded" placeholder="note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button onClick={addDoc} className="px-3 py-2 bg-green-600 text-white rounded">Add doc</button>
          <button onClick={listDocs} className="px-3 py-2 bg-gray-200 rounded">Refresh</button>
        </div>

        {status && <div className="text-sm text-slate-700">{status}</div>}

        <div>
          <h3 className="font-semibold">Recent docs</h3>
          <ul className="mt-2 space-y-2">
            {docs.map(d => (
              <li key={d.id} className="p-2 border rounded bg-slate-50">
                <div className="text-xs text-slate-500">{d.id}</div>
                <pre className="text-sm truncate">{JSON.stringify(d.data)}</pre>
              </li>
            ))}
            {docs.length === 0 && <li className="text-sm text-slate-400">No documents yet</li>}
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => onBack && onBack()} className="px-3 py-2 bg-slate-200 rounded">Back</button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDemo;
