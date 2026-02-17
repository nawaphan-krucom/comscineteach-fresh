import React, { useState, useEffect } from 'react';
import Emoji from './primitives/Emoji';
import { useData } from '../contexts/DataContext';

interface Exercise {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  hints?: string[];
  solution?: string;
}

interface Props {
  exercises: Exercise[];
}

const DifficultyBadge: React.FC<{ level: Exercise['difficulty'] }> = ({ level }) => {
  const map = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  } as Record<string, string>;
  return <span className={`text-xs px-2 py-0.5 rounded-full ${map[level]}`}>{level}</span>;
};

const PracticeExerciseList: React.FC<Props> = ({ exercises }) => {
  const { user } = useData();
  return (
    <div className="space-y-3">
      {exercises.map(ex => (
        <PracticeExercise key={ex.id} exercise={ex} isTeacher={user?.role === 'teacher'} userId={user?.id} />
      ))}
    </div>
  );
};

const PracticeExercise: React.FC<{ exercise: Exercise; isTeacher?: boolean; userId?: string }> = ({ exercise, isTeacher, userId }) => {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(!!isTeacher);
  const doneKey = `exercise_done_${userId || 'anon'}_${exercise.id}`;
  const [done, setDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(doneKey) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(doneKey, done ? '1' : '0');
    } catch {}
  }, [done, doneKey]);

  return (
    <div className={`bg-white p-4 rounded-lg border shadow-sm ${done ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <span>{exercise.title}</span>
              <DifficultyBadge level={exercise.difficulty} />
              {done && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">✓ เสร็จแล้ว</span>}
            </div>
            <div className="text-sm text-slate-500 mt-1">{exercise.prompt}</div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            aria-pressed={done}
            className={`text-xs px-3 py-1 rounded-full font-bold ${done ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white'}`}
            onClick={() => setDone(d => !d)}
          >
            {done ? 'Undo' : 'Mark as done'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {exercise.hints && exercise.hints.length > 0 && (
          <button
            className="text-sm px-3 py-2 rounded-lg bg-slate-50 border"
            onClick={() => setShowHint(s => !s)}
            aria-expanded={showHint}
            aria-controls={`hint-${exercise.id}`}
          >
            {showHint ? 'ซ่อนคำใบ้' : 'ดูคำใบ้'}
          </button>
        )}

        <button
          className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white"
          onClick={() => setShowSolution(s => !s)}
          aria-expanded={showSolution}
          aria-controls={`sol-${exercise.id}`}
        >
          {showSolution ? 'ซ่อนคำตอบ' : 'ดูคำตอบ'}
        </button>
      </div>

      {showHint && exercise.hints && (
        <div id={`hint-${exercise.id}`} className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{exercise.hints.join(' • ')}</div>
      )}

      {showSolution && exercise.solution && (
        <div id={`sol-${exercise.id}`} className="mt-3 text-sm text-slate-700 bg-green-50 p-3 rounded-md">{exercise.solution}</div>
      )}
    </div>
  );
};

export default PracticeExerciseList;