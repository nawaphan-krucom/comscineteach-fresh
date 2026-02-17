
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Swords, PlusCircle, Users, Zap, Play, Clock, Trophy, Crown, RefreshCw } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import type { Question } from '../types';
import { UNIT_QUIZZES } from '../constants';
import { useError } from '../contexts/ErrorContext';

interface QuizBattleViewProps {
  onBack: () => void;
}

// --- MOCK DATA & TYPES ---
const MOCK_OPPONENTS = [
    { name: 'AcePlayer', avatar: '🤖' }, { name: 'QuizMaster', avatar: '🦊' },
    { name: 'BrainyBot', avatar: '🧠' }, { name: 'Speedy', avatar: '🐭' },
    { name: 'CaptainCode', avatar: '🚀' }, { name: 'CuriousCat', avatar: '🐱' },
    { name: 'LogicLion', avatar: '🦁' }
];

interface Player {
    id: string;
    name: string;
    avatar: string;
    score: number;
    isHost: boolean;
}

interface Room {
    id: number;
    name: string;
    players: Player[];
    maxPlayers: number;
    status: 'waiting' | 'playing' | 'finished';
    quizId: string;
}

// --- MAIN COMPONENT ---
const QuizBattleView: React.FC<QuizBattleViewProps> = ({ onBack }) => {
    const { user } = useData();
    const { logError } = useError();
    const [view, setView] = useState<'list' | 'lobby' | 'game' | 'results'>('list');
    
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | 'unanswered' | null>(null);

    const timerRef = useRef<number | null>(null);
    const opponentIntervalRef = useRef<number | null>(null);

    const initialRooms: Room[] = useMemo(() => [
        { id: 1, name: "🧠 ห้องด่วน CT Unit 1", players: [{id: 'bot1', name: MOCK_OPPONENTS[0].name, avatar: MOCK_OPPONENTS[0].avatar, score: 0, isHost: true}, {id: 'bot2', name: MOCK_OPPONENTS[1].name, avatar: MOCK_OPPONENTS[1].avatar, score: 0, isHost: false}], maxPlayers: 8, status: "waiting" as const, quizId: 'unit_1'},
        { id: 2, name: "🧠 SDLC Marathon", players: [...Array(8)].map((_, i) => ({id: `bot_p_${i}`, name: MOCK_OPPONENTS[i % MOCK_OPPONENTS.length].name, avatar: MOCK_OPPONENTS[i % MOCK_OPPONENTS.length].avatar, score: Math.floor(Math.random() * 30), isHost: i === 0})), maxPlayers: 8, status: "playing" as const, quizId: 'unit_2'},
    ], []);

    useEffect(() => {
        if (!user) return;
        if (rooms.length === 0) {
            setRooms(initialRooms);
        }
    }, [user, initialRooms, rooms.length]);

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setTimeLeft(15);
            setSelectedAnswer(null);
            setAnswerStatus(null);
        } else {
            setView('results');
            setCurrentRoom(prev => prev ? { ...prev, status: 'finished' } : null);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        if (answerStatus !== null) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setSelectedAnswer(optionIndex);
        const question = questions[currentQIndex];
        const isCorrect = optionIndex === question.correctAnswer;
        setAnswerStatus(optionIndex === -1 ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect'));

        // Simulate opponent answers and update scores
        setTimeout(() => {
            setCurrentRoom(prev => {
                if (!prev || !user) return null;
                return {
                    ...prev,
                    players: prev.players.map(p => {
                        let scoreToAdd = 0;
                        if (p.id === user.id) {
                            scoreToAdd = isCorrect ? 5 + timeLeft : 0;
                        } else { // Bot logic
                            const botCorrect = Math.random() > 0.4;
                            scoreToAdd = botCorrect ? 5 + Math.floor(Math.random() * 10) : 0;
                        }
                        return { ...p, score: p.score + scoreToAdd };
                    })
                }
            });
            // Move to next question or results after a delay
            setTimeout(nextQuestion, 2500);
        }, 500);
    };

    useEffect(() => {
        if (view === 'game' && answerStatus === null) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleAnswer(-1);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [view, currentQIndex, answerStatus]);
    
    useEffect(() => {
        if (view === 'lobby' && currentRoom && user && currentRoom.players[0]?.id === user.id && currentRoom.players.length < currentRoom.maxPlayers) {
            opponentIntervalRef.current = window.setInterval(() => {
                setCurrentRoom(prev => {
                    if (!prev || prev.players.length >= prev.maxPlayers) {
                        clearInterval(opponentIntervalRef.current!);
                        return prev;
                    }
                    const opponentPool = MOCK_OPPONENTS.filter(op => !prev.players.some(p => p.name === op.name));
                    if (opponentPool.length === 0) {
                        clearInterval(opponentIntervalRef.current!);
                        return prev;
                    }
                    const newOpponent = opponentPool[Math.floor(Math.random() * opponentPool.length)];
                    const newPlayer = { id: `bot_join_${Date.now()}`, name: newOpponent.name, avatar: newOpponent.avatar, score: 0, isHost: false };
                    return { ...prev, players: [...prev.players, newPlayer] };
                });
            }, Math.random() * 3000 + 2000);
        }
        return () => { if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current); };
    }, [view, currentRoom, user]);

    const handleCreateRoom = (quizId: string, roomName: string) => {
        if (!user) return;
        const newRoom: Room = {
            id: Date.now(),
            name: roomName || `ห้องของ ${user.name}`,
            players: [{ id: user.id, name: user.name, avatar: user.avatar || '🎓', score: 0, isHost: true }],
            maxPlayers: 8,
            status: 'waiting',
            quizId,
        };
        setRooms(prev => [newRoom, ...prev]);
        setCurrentRoom(newRoom);
        setView('lobby');
        setIsCreateModalOpen(false);
    };

    const handleJoinRoom = (roomId: number) => {
        if (!user) return;
        const roomToJoin = rooms.find(r => r.id === roomId);
        if (roomToJoin && roomToJoin.status === 'waiting' && roomToJoin.players.length < roomToJoin.maxPlayers) {
            if (roomToJoin.players.some(p => p.id === user.id)) {
                setCurrentRoom(roomToJoin);
            } else {
                const player: Player = { id: user.id, name: user.name, avatar: user.avatar || '🎓', score: 0, isHost: false };
                const updatedRoom = { ...roomToJoin, players: [...roomToJoin.players, player] };
                setCurrentRoom(updatedRoom);
                setRooms(rooms.map(r => r.id === roomId ? updatedRoom : r));
            }
            setView('lobby');
        } else {
            logError('ไม่สามารถเข้าร่วมห้องได้ (อาจจะเต็มหรือเริ่มเล่นไปแล้ว)', 'warning');
        }
    };
    
    const handleStartGame = () => {
        const quiz = UNIT_QUIZZES.find(q => q.id === currentRoom?.quizId);
        if (!quiz || !currentRoom || currentRoom.players.length < 2) {
            logError('ผู้เล่นไม่เพียงพอ (ต้องมีอย่างน้อย 2 คน)', 'warning');
            return;
        }
        
        const shuffled = [...quiz.questions].sort(() => 0.5 - Math.random()).slice(0, 5);
        setQuestions(shuffled);
        setCurrentQIndex(0);
        setView('game');
        setCurrentRoom(prev => prev ? { ...prev, players: prev.players.map(p => ({ ...p, score: 0 })), status: 'playing' } : null);
    };
    
    const handlePlayAgain = () => {
        setView('lobby');
        setCurrentQIndex(0);
        setSelectedAnswer(null);
        setAnswerStatus(null);
        setCurrentRoom(prev => prev ? { ...prev, status: 'waiting', players: prev.players.map(p => ({...p, score: 0})) } : null);
    };
    
    const handleLeaveLobby = () => {
        setView('list');
        setCurrentRoom(null);
    }
    
    const sortedPlayers = useMemo(() => {
        if (!currentRoom) return [];
        return [...currentRoom.players].sort((a, b) => b.score - a.score);
    }, [currentRoom]);
    
    // --- Render Functions ---

    const renderHeader = (title: string) => (
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={view === 'list' ? onBack : handleLeaveLobby} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
            <Swords className="text-red-500" size={32}/> {title}
          </h1>
        </div>
      </header>
    );

    const renderCreateModal = () => (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">สร้างห้องแข่งขัน</h3>
            <div className="space-y-4">
                <input type="text" placeholder="ชื่อห้อง (ไม่บังคับ)" id="roomNameInput" className="w-full p-3 border rounded-xl bg-slate-50"/>
                <select id="quizSelect" className="w-full p-3 border rounded-xl bg-slate-50 font-bold">
                    {UNIT_QUIZZES.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                </select>
            </div>
            <div className="flex gap-4 mt-6">
                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">ยกเลิก</button>
                <button onClick={() => handleCreateRoom(
                    (document.getElementById('quizSelect') as HTMLSelectElement).value,
                    (document.getElementById('roomNameInput') as HTMLInputElement).value
                )} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">สร้างห้อง</button>
            </div>
          </div>
      </div>
    );

    const renderPlayerList = (players: Player[]) => (
        <div className="space-y-3">
            {players.map((player) => (
                <div key={player.id} className="bg-white/50 p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{player.avatar}</span>
                        <span className="font-bold text-sm text-slate-700">{player.name}</span>
                        {player.isHost && <Crown size={14} className="text-amber-500" fill="currentColor"/>}
                    </div>
                    {view !== 'lobby' && <span className="font-bold text-sm text-indigo-600">{player.score} pts</span>}
                </div>
            ))}
        </div>
    );
    
    if (view === 'list') return (
        <div className="h-full flex flex-col animate-fade-in">
            {renderHeader("Quiz Battle")}
            {isCreateModalOpen && renderCreateModal()}
            <div className="flex justify-end gap-4 mb-6">
                <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                    <PlusCircle size={20}/> สร้างห้องใหม่
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <div key={room.id} className={`p-6 rounded-[30px] border transition-all group shadow-sm flex flex-col ${room.status === 'waiting' ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-200 opacity-80'}`}>
                            <div className="flex-1">
                                <div className="flex justify-between items-start"><h3 className="font-bold text-slate-800 text-lg mb-2">{room.name}</h3>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${room.status === 'waiting' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{room.status === 'waiting' ? 'รอผู้เล่น' : 'กำลังแข่ง'}</div></div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1 text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full"><Users size={14}/> {room.players.length}/{room.maxPlayers}</div>
                                <button onClick={() => handleJoinRoom(room.id)} disabled={room.status !== 'waiting' || room.players.length >= room.maxPlayers} className="flex items-center gap-2 text-sm font-bold bg-indigo-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-transform disabled:bg-slate-300 disabled:cursor-not-allowed"><Zap size={16}/> เข้าร่วม</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
    if (view === 'lobby' && currentRoom) return (
        <div className="h-full flex flex-col animate-fade-in">
            {renderHeader(currentRoom.name)}
            <div className="grid md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                <div className="bg-white/50 p-6 rounded-3xl border border-white flex flex-col">
                    <h3 className="text-lg font-bold text-slate-600 mb-4">ผู้เล่น ({currentRoom.players.length}/{currentRoom.maxPlayers})</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">{renderPlayerList(currentRoom.players)}</div>
                </div>
                <div className="bg-indigo-50 p-8 rounded-3xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center">
                    <h3 className="text-2xl font-bold text-indigo-800 font-cute">รอเริ่มการแข่งขัน...</h3>
                    <p className="text-indigo-600 mt-2 mb-6">หัวข้อ: {UNIT_QUIZZES.find(q=>q.id === currentRoom.quizId)?.title}</p>
                    {user && currentRoom.players[0]?.id === user.id ? (
                        <button onClick={handleStartGame} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"><Play size={20}/> เริ่มเกม</button>
                    ) : (
                        <p className="text-sm font-bold text-slate-500 animate-pulse">รอโฮสต์เริ่มเกม</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (view === 'game' && currentRoom && questions.length > 0) return (
        <div className="h-full flex flex-col animate-fade-in p-4 bg-slate-800 rounded-3xl">
            <div className="flex justify-between items-center text-white mb-4">
                <div className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full">ข้อที่ {currentQIndex + 1}/{questions.length}</div>
                <div className="flex items-center gap-2 text-lg font-bold bg-black/20 px-4 py-2 rounded-full"><Clock size={16}/> {timeLeft}</div>
                <div className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full">Score: {currentRoom.players.find(p => p.id === user?.id)?.score || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-8 flex-1 flex flex-col justify-center text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 font-cute">{questions[currentQIndex].question}</h3>
                <div className="grid grid-cols-2 gap-4">
                    {questions[currentQIndex].options.map((opt, i) => {
                        let style = 'bg-slate-100 text-slate-700 hover:bg-indigo-100';
                        if (answerStatus) {
                            if (i === questions[currentQIndex].correctAnswer) style = 'bg-green-500 text-white animate-pulse';
                            else if (i === selectedAnswer) style = 'bg-red-500 text-white';
                            else style = 'bg-slate-200 text-slate-500 opacity-70';
                        }
                        return <button key={i} onClick={() => handleAnswer(i)} disabled={!!answerStatus} className={`p-6 rounded-xl font-bold text-lg transition-all ${style}`}>{opt}</button>
                    })}
                </div>
            </div>
            <div className="h-28 pt-4 overflow-y-auto custom-scrollbar">
                {sortedPlayers.map(p => <div key={p.id} className="flex items-center justify-between p-2 text-white/80 text-sm"><span>{p.name}</span><span className="font-bold">{p.score}</span></div>)}
            </div>
        </div>
    );

    if (view === 'results' && currentRoom) return (
        <div className="h-full flex flex-col animate-fade-in items-center justify-center text-center p-4">
             <div className="glass-card p-8 rounded-[30px] w-full max-w-lg">
                <Trophy size={48} className="text-amber-500 mx-auto mb-4"/>
                <h2 className="text-3xl font-bold text-slate-800 font-cute">จบเกมแล้ว!</h2>
                <div className="my-6 space-y-3">
                    {sortedPlayers.map((player, idx) => (
                        <div key={player.id} className={`flex items-center p-3 rounded-xl ${idx === 0 ? 'bg-amber-100 border-2 border-amber-300' : 'bg-slate-100'}`}>
                           <span className="font-bold text-lg w-8">{idx + 1}</span>
                           <span className="text-xl">{player.avatar}</span>
                           <span className="flex-1 text-left ml-3 font-bold text-sm text-slate-700">{player.name} {user?.id === player.id && "(You)"}</span>
                           <span className="font-bold text-lg text-indigo-600">{player.score} pts</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={handleLeaveLobby} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold">กลับไปหน้าหลัก</button>
                    <button onClick={handlePlayAgain} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><RefreshCw size={16}/> เล่นอีกครั้ง</button>
                </div>
             </div>
        </div>
    );
    
    return null; // Fallback
};

export default QuizBattleView;
