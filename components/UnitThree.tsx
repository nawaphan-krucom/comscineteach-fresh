
import React, { useState, useMemo } from 'react';
import { TECH_RELATIONSHIPS, SYSTEM_EXAMPLES, COMPLEX_SYSTEM_LIST, TECH_IMPACTS, TECH_CHANGE_CAUSES, SYSTEM_CONCEPTS, TECH_EVOLUTION } from '../constants';
import { GitMerge, Box, Car, History, Activity, Cpu, Zap, ArrowRight, ArrowDown, RotateCcw, CheckCircle2, AlertTriangle, Settings, Globe, RefreshCw, Users, TrendingUp, Palette, Leaf, Microscope, Link, Layers, Wind, Droplet, Puzzle, Check, Trophy, BrainCircuit, Sparkles, Smartphone } from './icons/EmojiIcons';
import SelfAssessment from './SelfAssessment';
import UnitHero from './UnitHero';
import PillTabs from './PillTabs';
 

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={24} />,
  "trending-up": <TrendingUp size={24} />,
  palette: <Palette size={24} />,
  leaf: <Leaf size={24} />,
  microscope: <Microscope size={24} />,
  layers: <Layers size={24} />,
  cpu: <Cpu size={24} />,
  settings: <Settings size={24} />
};

// --- Helper Components ---
// Defined BEFORE usage to fix ReferenceError
const Inbox = ({size, className}: {size:number, className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
);

// --- System Game Data ---
const GAME_LEVELS = [
    {
        id: 1,
        name: "พัดลมตั้งโต๊ะ (Electric Fan)",
        icon: <Wind size={40} className="text-blue-500"/>,
        slots: { input: "พลังงานไฟฟ้า", process: "มอเตอร์หมุนใบพัด", output: "ลมเย็น/การหมุน", feedback: "-" },
        options: ["พลังงานไฟฟ้า", "มอเตอร์หมุนใบพัด", "ลมเย็น/การหมุน", "ความร้อน", "น้ำ", "ตัดไฟอัตโนมัติ"]
    },
    {
        id: 2,
        name: "หม้อหุงข้าว (Rice Cooker)",
        icon: <Inbox size={40} className="text-orange-500"/>, 
        customIcon: "🍚",
        slots: { input: "ไฟฟ้า + ข้าว/น้ำ", process: "เปลี่ยนไฟฟ้าเป็นความร้อน", output: "ข้าวสุก", feedback: "เทอร์โมสตัทตัดไฟ" },
        options: ["ไฟฟ้า + ข้าว/น้ำ", "เปลี่ยนไฟฟ้าเป็นความร้อน", "ข้าวสุก", "เทอร์โมสตัทตัดไฟ", "แสงสว่าง", "เสียงเพลง"]
    },
    {
        id: 3,
        name: "ระบบรดน้ำอัตโนมัติ",
        icon: <Droplet size={40} className="text-cyan-500"/>,
        slots: { input: "ค่าความชื้นในดิน", process: "เซนเซอร์สั่งเปิดวาล์ว", output: "ละอองน้ำ", feedback: "ความชื้นถึงกำหนด" },
        options: ["ค่าความชื้นในดิน", "เซนเซอร์สั่งเปิดวาล์ว", "ละอองน้ำ", "ความชื้นถึงกำหนด", "แสงแดด", "ใส่ปุ๋ย"]
    }
];

const UnitThree: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState(0);
  const [activeSystemExample, setActiveSystemExample] = useState(0);
  const [activeComplexSystem, setActiveComplexSystem] = useState(0);
  const [showExercisesUnit3, setShowExercisesUnit3] = useState(false);

  // Game State
  const [gameLevel, setGameLevel] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{input: string|null, process: string|null, output: string|null, feedback: string|null}>({input: null, process: null, output: null, feedback: null});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [gameFeedback, setGameFeedback] = useState<{type: 'success'|'error', msg: string} | null>(null);
  const isLevelComplete = useMemo(() => {
      const game = GAME_LEVELS[gameLevel];
      return userAnswers.input && userAnswers.process && userAnswers.output && (game.slots.feedback === '-' || userAnswers.feedback);
  }, [userAnswers, gameLevel]);
  const [allLevelsDone, setAllLevelsDone] = useState(false);

  const topics = [
    { title: "ความสัมพันธ์", icon: <GitMerge size={18} /> },
    { title: "ระบบเทคโนโลยี", icon: <Box size={18} /> },
    { title: "ฝึกวิเคราะห์ (Game)", icon: <Puzzle size={18} /> }, // Interactive Game Added
    { title: "ระบบซับซ้อน", icon: <Settings size={18} /> },
    { title: "การเปลี่ยนแปลง", icon: <RefreshCw size={18} /> },
    { title: "ผลกระทบ", icon: <History size={18} /> },
    { title: "นวัตกรรมและเทคโนโลยีใหม่", icon: <Zap size={18} /> },
  ];

  const currentComplexSystem = COMPLEX_SYSTEM_LIST[activeComplexSystem];
  const currentGame = GAME_LEVELS[gameLevel];

  // Game Logic
  const handleSlotClick = (slotType: 'input' | 'process' | 'output' | 'feedback') => {
      if (!selectedOption) return;
      
      const correct = currentGame.slots[slotType];
      
      // Special case for feedback "-"
      if (correct === "-" && selectedOption !== "-") {
           setGameFeedback({ type: 'error', msg: 'ระบบนี้ไม่มี Feedback (ใช้ตัวเลือกอื่น)' });
           return;
      }

      if (selectedOption === correct) {
          setUserAnswers(prev => ({...prev, [slotType]: selectedOption}));
          setGameFeedback({ type: 'success', msg: 'ถูกต้อง! เก่งมาก' });
          setSelectedOption(null);
      } else {
          setGameFeedback({ type: 'error', msg: 'ยังไม่ใช่นะ ลองวิเคราะห์ใหม่' });
      }
  };

  const nextLevel = () => {
      if (gameLevel < GAME_LEVELS.length - 1) {
          setGameLevel(prev => prev + 1);
          resetGame();
      } else {
          setAllLevelsDone(true);
      }
  };

  const resetGame = () => {
      setUserAnswers({input: null, process: null, output: null, feedback: null});
      setGameFeedback(null);
      setSelectedOption(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <UnitHero
        unitNumber={3}
        title={<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ระบบทางเทคโนโลยี</span>}
        subtitle={<span className="text-base sm:text-lg font-semibold text-slate-700 max-w-2xl mx-auto">เข้าใจองค์ประกอบ การทำงาน และผลกระทบของเทคโนโลยีรอบตัว</span>}
        divider
      />

      {/* Topic Navigation */}
      <PillTabs
        items={topics.map((t, i) => ({ id: i, icon: t.icon, label: t.title }))}
        active={activeTopic}
        onChange={(id) => setActiveTopic(Number(id))}
        outerClassName="flex justify-center bg-gradient-to-r from-emerald-50 to-teal-50 p-2 rounded-[20px] w-full md:w-fit mx-auto mb-12 overflow-x-auto scrollbar-hide border-2 border-emerald-100 shadow-lg"
        activeClassName="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105"
        inactiveClassName="text-slate-600 hover:text-emerald-600 hover:bg-white/70"
      />

      <div className="min-h-[500px]">
        
        {/* Topic 1: Relationship */}
        {activeTopic === 0 && (
          <div className="animate-fade-in space-y-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-emerald-800 mb-4 flex items-center gap-2 font-cute">
                <GitMerge size={28}/> ความสัมพันธ์กับศาสตร์อื่น
              </h3>
              <p className="text-slate-700 leading-relaxed text-lg mb-6">
                เทคโนโลยีไม่ได้เกิดขึ้นลอยๆ แต่เกิดจากการนำความรู้พื้นฐานจาก <strong>วิทยาศาสตร์ (Science)</strong> 
                และ <strong>คณิตศาสตร์ (Mathematics)</strong> มาประยุกต์ใช้ร่วมกันเพื่อสร้างนวัตกรรม
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TECH_RELATIONSHIPS.map((rel, idx) => (
                  <div key={idx} className={`p-8 rounded-[30px] border-2 border-emerald-100 hover:border-teal-300 bg-white shadow-lg hover:shadow-xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2`}>
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 ${rel.color}`}>
                      {rel.icon === 'activity' && <Activity size={28} />}
                      {rel.icon === 'calculator' && <Cpu size={28} />}
                      {rel.icon === 'users' && <Users size={28} />}
                       {rel.icon === 'globe' && <Globe size={28} />}
                    </div>
                    <h4 className="font-black text-slate-900 text-lg mb-3">{rel.science}</h4>
                    <p className="text-base text-slate-700 mb-4 min-h-[50px] leading-relaxed">{rel.description}</p>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-[16px] text-sm text-slate-700 font-semibold border border-emerald-100">
                      💡 {rel.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Topic 2: System Components (Theory) */}
        {activeTopic === 1 && (
          <div className="animate-fade-in space-y-12">
            
            {/* PART 1: Theory */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-emerald-100">
              <div className="text-center mb-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 font-cute">1. ทฤษฎีระบบ (System Model)</h3>
                <p className="text-slate-600 mt-2">
                  ระบบทางเทคโนโลยีประกอบด้วย 4 ส่วนหลักที่ทำงานสัมพันธ์กัน
                </p>
              </div>

              {/* Diagram Flow */}
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 relative mb-12 max-w-6xl mx-auto">
                 <div className="flex-1 p-6 rounded-[24px] border-2 flex flex-col items-center text-center bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-800 border-cyan-300 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="text-4xl mb-3">📥</div>
                    <h4 className="font-bold text-xl uppercase mb-1">Input</h4>
                    <p className="text-sm opacity-80">(ตัวป้อน)</p>
                 </div>
                 <ArrowRight className="hidden md:block w-8 h-8 text-emerald-400 flex-shrink-0 self-center" />
                 <ArrowDown className="md:hidden w-8 h-8 text-emerald-400 flex-shrink-0 self-center" />
                 <div className="flex-1 p-6 rounded-[24px] border-2 flex flex-col items-center text-center bg-gradient-to-br from-purple-50 to-pink-50 text-purple-800 border-purple-300 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="text-4xl mb-3">⚙️</div>
                    <h4 className="font-bold text-xl uppercase mb-1">Process</h4>
                    <p className="text-sm opacity-80">(กระบวนการ)</p>
                 </div>
                 <ArrowRight className="hidden md:block w-8 h-8 text-emerald-400 flex-shrink-0 self-center" />
                 <ArrowDown className="md:hidden w-8 h-8 text-emerald-400 flex-shrink-0 self-center" />
                 <div className="flex-1 p-6 rounded-[24px] border-2 flex flex-col items-center text-center bg-gradient-to-br from-lime-50 to-green-50 text-lime-800 border-lime-300 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="text-4xl mb-3">📦</div>
                    <h4 className="font-bold text-xl uppercase mb-1">Output</h4>
                    <p className="text-sm opacity-80">(ผลผลิต)</p>
                 </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative p-6 rounded-[32px] border-2 border-dashed border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col md:flex-row items-center justify-center gap-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl animate-bounce">🔄</div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="font-bold text-xl text-emerald-800">FEEDBACK (ข้อมูลย้อนกลับ)</h4>
                    <p className="text-emerald-700 text-sm mt-1">
                      ข้อมูลที่ส่งกลับเพื่อปรับปรุงการทำงาน (ไม่ได้มีในทุกระบบ)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PART 2: Applied Examples */}
            <div className="bg-gradient-to-b from-white to-emerald-50/30 p-10 md:p-16 rounded-[40px] border-2 border-emerald-200 shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:shadow-[0_30px_70px_rgba(16,185,129,0.25)] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
              <div className="text-center mb-10">
                <h3 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 font-cute">2. ตัวอย่างการวิเคราะห์ระบบ</h3>
                <p className="text-slate-600 mt-3 text-base">คลิกเลือกตัวอย่างด้านล่างเพื่อดูการวิเคราะห์เชิงลึก</p>
              </div>

              <div className="flex justify-center gap-4 mb-10">
                {SYSTEM_EXAMPLES.map((sys, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSystemExample(idx)}
                    className={`px-6 py-3 rounded-[20px] font-bold transition-all shadow-lg border-2 flex items-center gap-2 hover:scale-105 hover:-translate-y-2 duration-300 ${
                      activeSystemExample === idx 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-xl scale-105' 
                      : 'bg-white border-emerald-200 text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    {idx === 0 ? <Zap size={18}/> : <RotateCcw size={18}/>}
                    {sys.name}
                  </button>
                ))}
              </div>

              <div className="max-w-6xl mx-auto bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(16,185,129,0.15)] border-2 border-emerald-200 relative overflow-hidden hover:shadow-[0_30px_70px_rgba(16,185,129,0.25)] transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                <div className="mb-8 pb-6 border-b border-slate-100">
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">{SYSTEM_EXAMPLES[activeSystemExample].name}</h4>
                  <p className="text-slate-500">{SYSTEM_EXAMPLES[activeSystemExample].description}</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
                  {/* INPUT */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-[24px] border-2 border-cyan-200 p-6 flex-1 w-full shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <h5 className="font-bold text-lg text-cyan-900 mb-2">📥 Input</h5>
                    <p className="text-slate-700 leading-relaxed text-sm">{SYSTEM_EXAMPLES[activeSystemExample].input}</p>
                  </div>

                  <ArrowRight className="hidden md:block text-emerald-400 self-center" size={32} />
                  <ArrowDown className="md:hidden text-emerald-400 self-center" size={32} />

                  {/* PROCESS */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[24px] border-2 border-purple-200 p-6 flex-1 w-full shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <h5 className="font-bold text-lg text-purple-900 mb-2">⚙️ Process</h5>
                    <p className="text-slate-700 leading-relaxed text-sm">{SYSTEM_EXAMPLES[activeSystemExample].process}</p>
                  </div>

                  <ArrowRight className="hidden md:block text-emerald-400 self-center" size={32} />
                  <ArrowDown className="md:hidden text-emerald-400 self-center" size={32} />

                  {/* OUTPUT */}
                  <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-[24px] border-2 border-lime-200 p-6 flex-1 w-full shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <h5 className="font-bold text-lg text-lime-900 mb-2">📦 Output</h5>
                    <p className="text-slate-700 leading-relaxed text-sm">{SYSTEM_EXAMPLES[activeSystemExample].output}</p>
                  </div>
                </div>

                 <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[24px] border-2 border-emerald-200 p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="p-3 bg-white rounded-full text-emerald-600 shadow-md shrink-0"><RotateCcw size={24}/></div>
                    <div className="text-left">
                      <h5 className="font-bold text-emerald-900 text-lg">🔄 Feedback</h5>
                      <p className="text-emerald-800/80 text-sm">{SYSTEM_EXAMPLES[activeSystemExample].feedback}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Topic 3: System Builder Game (New) */}
        {activeTopic === 2 && (
            <div className="animate-fade-in bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[36px] p-10 md:p-12 text-white relative overflow-hidden shadow-[0_30px_70px_rgba(16,185,129,0.35)] hover:shadow-[0_40px_80px_rgba(16,185,129,0.45)] transition-all duration-500 noselect border-2 border-emerald-400/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="relative z-10">
                    <div className="mb-10">
                        <div className="flex items-start justify-between gap-6 mb-6">
                            <div>
                                <h3 className="text-3xl font-black flex items-center gap-3 font-cute mb-3">
                                    <span className="p-3 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xl"><Puzzle size={32} className="text-white"/></span> 
                                    <span className="text-white">นักวิเคราะห์ระบบ</span>
                                </h3>
                                <p className="text-white/80 text-sm font-medium">เลือกคำตอบด้านล่าง แล้วคลิกที่ช่องว่างเพื่อเติมเต็มระบบให้สมบูรณ์</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl px-5 py-3 rounded-[20px] text-sm font-black flex items-center gap-3 border-2 border-white/30 shadow-lg whitespace-nowrap">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/30 text-white text-xs">
                                    {gameLevel + 1}
                                </span>
                                <span>Level {gameLevel + 1}/{GAME_LEVELS.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Object Info */}
                        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-[28px] p-8 border-2 border-white/30 text-center flex flex-col items-center justify-center min-h-[240px] shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300">
                            <div className="w-32 h-32 bg-gradient-to-br from-white/30 to-white/10 rounded-[24px] flex items-center justify-center shadow-xl mb-6 text-6xl border-2 border-white/40 backdrop-blur-xl hover:scale-110 transition-transform duration-300">
                                {currentGame.customIcon || currentGame.icon}
                            </div>
                            <h4 className="text-2xl font-black text-white mb-2">{currentGame.name}</h4>
                            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent my-3"></div>
                            <p className="text-sm text-white/80 font-medium">📊 วิเคราะห์การทำงานของอุปกรณ์นี้</p>
                        </div>

                        {/* System Slots */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-6">
                            {[
                              { id: 'input', label: 'Input', icon: '📥', color: 'from-blue-100 to-cyan-100 border-cyan-400 text-cyan-700' },
                              { id: 'process', label: 'Process', icon: '⚙️', color: 'from-purple-100 to-violet-100 border-purple-400 text-purple-700' },
                              { id: 'output', label: 'Output', icon: '📤', color: 'from-green-100 to-emerald-100 border-green-400 text-green-700' },
                              { id: 'feedback', label: 'Feedback', icon: '🔄', color: 'from-orange-100 to-amber-100 border-amber-400 text-amber-700' },
                            ].map((slot: { id: 'input' | 'process' | 'output' | 'feedback'; label: string; icon: string; color: string }) => (
                                <div 
                                    key={slot.id}
                                    onClick={() => handleSlotClick(slot.id)}
                                    className={`relative p-5 rounded-[22px] border-2 transition-all cursor-pointer min-h-[130px] flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg
                                        ${userAnswers[slot.id as keyof typeof userAnswers] 
                                            ? `bg-gradient-to-br from-white to-emerald-50 border-emerald-500 text-emerald-900` 
                                            : `bg-gradient-to-br ${slot.color} border-current hover:shadow-xl hover:scale-105 transition-all duration-300`}
                                    `}
                                >
                                    <span className="text-2xl mb-2">{slot.icon}</span>
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-2">{slot.label}</span>
                                    { userAnswers[slot.id as keyof typeof userAnswers] ? (
                                        <span className="font-bold text-sm animate-fade-in flex items-center gap-2 text-emerald-700">
                                            <CheckCircle2 size={16} className="text-emerald-600"/> {userAnswers[slot.id as keyof typeof userAnswers]}
                                        </span>
                                    ) : (
                                        <span className="text-xs opacity-60 font-medium">คลิกวาง</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Options Bank */}
                    <div className="mt-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-[28px] p-7 border-2 border-white/40 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h5 className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="text-lg">💡</span> ตัวเลือกคำตอบ
                            </h5>
                            {gameFeedback && (
                                <span className={`text-xs font-bold px-4 py-2 rounded-full backdrop-blur-xl border-2 ${gameFeedback.type === 'success' ? 'bg-emerald-500/80 text-white border-emerald-300 shadow-lg shadow-emerald-500/30' : 'bg-red-500/80 text-white border-red-300 shadow-lg shadow-red-500/30'}`}>
                                    {gameFeedback.msg}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {currentGame.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedOption(opt)}
                                    className={`px-5 py-3 rounded-[16px] text-sm font-bold transition-all shadow-md hover:shadow-xl border-2
                                        ${selectedOption === opt 
                                            ? 'bg-white text-emerald-700 scale-105 ring-2 ring-emerald-400 border-emerald-400 shadow-lg shadow-emerald-400/40' 
                                            : Object.values(userAnswers).includes(opt) 
                                                ? 'bg-white/30 text-white/60 cursor-not-allowed opacity-50 border-white/30'
                                                : 'bg-white/25 text-white hover:bg-white/40 hover:border-white/60 border-white/40 hover:scale-105'}
                                    `}
                                    disabled={Object.values(userAnswers).includes(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level Complete Overlay */}
                    {isLevelComplete && !allLevelsDone && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 to-emerald-800/95 backdrop-blur-lg flex flex-col items-center justify-center z-20 animate-fade-in rounded-[36px]">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(16,185,129,0.4)] animate-bounce border-4 border-white/30">
                                <Check size={48} className="text-white font-black"/>
                            </div>
                            <h2 className="text-4xl font-black font-cute text-white mb-2">ถูกต้องเยี่ยมมาก!</h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full mb-4"></div>
                            <p className="text-white/80 mb-8 font-medium text-lg">คุณเข้าใจการทำงานของระบบนี้แล้ว</p>
                            <button 
                                onClick={nextLevel}
                                className="px-8 py-4 bg-white text-emerald-700 rounded-[20px] font-black hover:scale-110 transition-all shadow-lg shadow-white/40 flex items-center gap-3 border-2 border-white/30 hover:shadow-xl hover:bg-white/95"
                            >
                                ไปด่านถัดไป <ArrowRight size={24} className="font-bold"/>
                            </button>
                        </div>
                    )}

                    {/* All Levels Complete Screen */}
                    {allLevelsDone && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/98 to-teal-900/98 backdrop-blur-lg flex flex-col items-center justify-center z-30 animate-fade-in text-center p-8 rounded-[36px]">
                            <Trophy size={96} className="text-amber-300 mb-8 animate-bounce drop-shadow-xl"/>
                            <h2 className="text-5xl font-black font-cute text-white mb-3">สุดยอดไปเลย! 🎉</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-full mb-6"></div>
                            <p className="text-white/85 mb-10 text-xl font-bold max-w-md">คุณผ่านการทดสอบวิเคราะห์ระบบครบทุกด่านแล้ว!</p>
                            <div className="flex gap-4 flex-col sm:flex-row">
                                <button 
                                    onClick={() => { setAllLevelsDone(false); setGameLevel(0); resetGame(); }}
                                    className="px-8 py-4 bg-white text-emerald-700 rounded-[20px] font-black hover:scale-110 transition-all shadow-lg shadow-white/40 flex items-center gap-3 border-2 border-white/30 hover:shadow-xl"
                                >
                                    <RotateCcw size={24}/> เล่นใหม่
                                </button>
                                <button 
                                    onClick={() => setActiveTopic(3)}
                                    className="px-8 py-4 bg-gradient-to-r from-white/20 to-white/10 text-white rounded-[20px] font-black hover:scale-110 transition-all shadow-lg border-2 border-white/40 hover:border-white/60 flex items-center gap-3 backdrop-blur-xl"
                                >
                                    <ArrowRight size={24}/> ไปหัวข้อถัดไป
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Topic 4: Complex Systems */}
        {activeTopic === 3 && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {SYSTEM_CONCEPTS.map((concept, idx) => (
                 <div key={idx} className="bg-gradient-to-br from-white/95 to-emerald-50/50 p-7 rounded-[28px] border-2 border-emerald-200/60 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-xl group">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[18px] flex items-center justify-center text-emerald-700 mb-5 shadow-md group-hover:scale-110 transition-transform duration-300 border-2 border-emerald-200/50">{iconMap[concept.icon]}</div>
                    <h4 className="font-black text-lg text-slate-800 mb-2">{concept.title}</h4>
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-4 tracking-widest">{concept.engTitle}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{concept.description}</p>
                 </div>
               ))}
            </div>

            {/* Selector */}
            <div className="flex flex-wrap justify-center gap-4">
               {COMPLEX_SYSTEM_LIST.map((system, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveComplexSystem(idx)}
                    className={`px-7 py-3 rounded-[22px] font-black flex items-center gap-3 transition-all shadow-lg border-2 hover:scale-110 hover:-translate-y-2 duration-300 ${
                       activeComplexSystem === idx 
                       ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-[0_15px_40px_rgba(16,185,129,0.3)] border-emerald-300 scale-105' 
                       : 'bg-white border-emerald-300 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-400'
                    }`}
                  >
                     {idx === 0 ? <Car size={22}/> : idx === 1 ? <Smartphone size={22}/> : <Zap size={22}/>}
                     {system.name.split(' ')[0]}
                  </button>
               ))}
            </div>

            {/* Selected System Detail */}
            <div className="bg-gradient-to-br from-white/98 to-emerald-50/80 p-10 md:p-16 rounded-[40px] border-2 border-emerald-300 shadow-[0_25px_60px_rgba(16,185,129,0.2)] hover:shadow-[0_35px_80px_rgba(16,185,129,0.3)] transition-all duration-500 backdrop-blur-xl">
               <div className="relative z-10 animate-fade-in" key={activeComplexSystem}>
                 <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">{currentComplexSystem.name}</h3>
                   <p className="text-slate-700 text-lg font-medium">{currentComplexSystem.description}</p>
                 </div>

                 {/* Subsystems */}
                 <div className="max-w-5xl mx-auto">
                    <h4 className="font-black text-xl text-slate-800 mb-8 flex items-center gap-3">
                      <span className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[14px] border border-emerald-300"><Link size={24} className="text-emerald-700"/></span>
                      ระบบย่อย (Subsystems)
                    </h4>
                    <div className="space-y-6">
                      {currentComplexSystem.subSystems.map((sub, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-white/95 to-white/50 p-7 rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-200/60 hover:-translate-y-1 group backdrop-blur-sm">
                          <h5 className="font-black text-xl text-slate-800 mb-3">{sub.name}</h5>
                          <p className="text-slate-700 text-sm mb-6 font-medium">{sub.description}</p>
                          <div className="grid md:grid-cols-3 gap-4">
                             <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-5 rounded-[16px] shadow-md">
                                <span className="block text-xs font-black text-cyan-700 uppercase mb-2 tracking-widest">📥 Input</span>
                                <p className="text-sm text-slate-800 font-medium">{sub.input}</p>
                             </div>
                             <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-l-4 border-purple-500 p-5 rounded-[16px] shadow-md">
                                <span className="block text-xs font-black text-purple-700 uppercase mb-2 tracking-widest">⚙️ Process</span>
                                <p className="text-sm text-slate-800 font-medium">{sub.process}</p>
                             </div>
                             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-emerald-500 p-5 rounded-[16px] shadow-md">
                                <span className="block text-xs font-black text-emerald-700 uppercase mb-2 tracking-widest">📤 Output</span>
                                <p className="text-sm text-slate-800 font-medium">{sub.output}</p>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Topic 5: Changes */}
        {activeTopic === 4 && (
          <div className="animate-fade-in space-y-12">
              <div className="bg-gradient-to-br from-white/98 to-emerald-50/80 p-8 rounded-[36px] shadow-lg hover:shadow-xl transition-all duration-500 border-2 border-emerald-300 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 font-cute">
                  <span className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[16px] border-2 border-emerald-300 text-emerald-700 shadow-md"><RefreshCw size={28}/></span> 
                  <span className="text-slate-900">สาเหตุของการเปลี่ยนแปลง</span>
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {TECH_CHANGE_CAUSES.map((cause, idx) => (
                    <div key={idx} className="p-7 bg-gradient-to-br from-white/95 to-emerald-50/50 rounded-[28px] border-2 border-emerald-200/60 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm group">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[18px] flex items-center justify-center mb-5 text-emerald-700 shadow-md border-2 border-emerald-200/50 group-hover:scale-110 transition-transform duration-300">
                        {iconMap[cause.icon]}
                      </div>
                      <h4 className="font-black text-lg text-slate-800 mb-2">{cause.title}</h4>
                      <p className="text-sm text-slate-700 mb-5 font-medium">{cause.description}</p>
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-[16px] border-l-4 border-emerald-500 shadow-md">
                        <p className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 font-black uppercase mb-2 tracking-widest">💡 ตัวอย่าง</p>
                        <p className="text-sm text-slate-700 italic font-medium">{cause.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/98 to-emerald-50/80 p-8 rounded-[36px] shadow-lg hover:shadow-xl transition-all duration-500 border-2 border-emerald-300 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 font-cute">
                  <span className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[16px] border-2 border-emerald-300 text-emerald-700 shadow-md"><History size={28}/></span>
                  <span className="text-slate-900">วิวัฒนาการ (Evolution)</span>
                </h3>
                <div className="space-y-8">
                  {TECH_EVOLUTION.map((evo, idx) => (
                    <div key={idx} className="relative pl-8 border-l-4 border-emerald-300">
                      <div className="absolute -left-[10px] top-2 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-white shadow-lg"></div>
                      <h4 className="text-xl font-black text-slate-800 mb-4">{evo.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-[20px] border-2 border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-xs font-black text-slate-700 uppercase mb-3 tracking-widest">⏰ อดีต</div>
                            <div className="font-black text-slate-800 text-base leading-relaxed">{evo.past}</div>
                         </div>
                         <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-[20px] border-2 border-emerald-300 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-xs font-black text-emerald-700 uppercase mb-3 tracking-widest">📍 ปัจจุบัน</div>
                            <div className="font-black text-emerald-900 text-base leading-relaxed">{evo.present}</div>
                         </div>
                         <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-[20px] border-2 border-teal-300 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-xs font-black text-teal-700 uppercase mb-3 tracking-widest">🚀 อนาคต</div>
                            <div className="font-black text-teal-900 text-base leading-relaxed">{evo.future}</div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        {/* Topic 6: Impacts */}
        {activeTopic === 5 && (
          <div className="animate-fade-in">
             <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 mb-4 font-cute bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">ผลกระทบของเทคโนโลยี (Impacts)</h3>
                <p className="text-slate-700 text-lg font-medium max-w-2xl mx-auto">เทคโนโลยีมีทั้งด้านบวกและด้านลบต่อสังคม เศรษฐกิจ และสิ่งแวดล้อม</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                {TECH_IMPACTS.map((impact, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/98 to-emerald-50/40 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl border-2 border-emerald-200/60 flex flex-col hover:-translate-y-3 transition-all duration-300 backdrop-blur-sm group">
                    <div className={`p-6 font-black text-xl text-white text-center border-b-4 border-white/30 bg-gradient-to-r shadow-md ${
                      idx === 0 ? 'from-emerald-600 to-teal-600' : idx === 1 ? 'from-emerald-700 to-teal-600' : 'from-teal-600 to-emerald-600'
                    }`}>
                      {impact.aspect}
                    </div>
                    <div className="p-7 flex-1 flex flex-col gap-8">
                      <div>
                        <h5 className="font-black text-emerald-700 text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                          <span className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-[10px] text-emerald-700"><CheckCircle2 size={16}/></span> 
                          <span>ผลกระทบทางบวก</span>
                        </h5>
                        <ul className="text-sm text-slate-700 space-y-3 font-medium">
                          {impact.positive.map((p, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <span className="text-emerald-500 mt-1.5 font-black text-lg">✓</span> 
                              <span className="leading-relaxed">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t-2 border-emerald-200/50 pt-8 mt-auto">
                        <h5 className="font-black text-red-600 text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                          <span className="p-2 bg-gradient-to-br from-red-100 to-red-50 rounded-[10px] text-red-600"><AlertTriangle size={16}/></span>
                          <span>ผลกระทบทางลบ</span>
                        </h5>
                        <ul className="text-sm text-slate-600 space-y-2">
                          {impact.negative.map((n, i) => (
                             <li key={i} className="flex gap-2 items-start">
                              <span className="text-red-400 mt-1">•</span> {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

        {activeTopic === 6 && (
          <div className="animate-fade-in space-y-10">
            <div className="text-center mb-12">
              <h3 className="text-4xl sm:text-4xl font-black text-slate-900 mb-4 font-cute bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">นวัตกรรมและเทคโนโลยีใหม่</h3>
              <p className="text-slate-700 text-lg font-medium max-w-2xl mx-auto">การพัฒนาเทคโนโลยีเพื่อสร้างอนาคตที่ดีกว่า</p>
            </div>

            <section className="bg-gradient-to-br from-white/98 to-emerald-50/60 p-12 rounded-[40px] border-2 border-emerald-300 shadow-lg hover:shadow-2xl transition-all duration-500 backdrop-blur-xl">
              <h4 className="text-3xl font-black text-slate-900 mb-10 font-cute bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 flex items-center gap-4">
                <span className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-[16px] border-2 border-emerald-300 text-emerald-700 shadow-md"><Zap size={28}/></span>
                เทคโนโลยีเกิดใหม่
              </h4>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/80 p-8 rounded-[28px] border-2 border-cyan-300 shadow-lg hover:shadow-xl hover:-translate-y-3 transition-all duration-300 group">
                  <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-[16px] inline-block border-2 border-cyan-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="text-cyan-700" size={24}/>
                  </div>
                  <h5 className="font-black text-cyan-900 mb-3 text-lg">Internet of Things (IoT)</h5>
                  <p className="text-sm text-cyan-800 mb-5 font-medium leading-relaxed">การเชื่อมต่ออุปกรณ์ต่างๆ เข้าด้วยกันผ่านอินเทอร์เน็ต</p>
                  <div className="text-xs text-cyan-700 space-y-2.5 font-medium">
                    <div className="flex gap-2 items-start"><span className="text-cyan-600 font-black">✓</span> <span>สมาร์ทโฮม</span></div>
                    <div className="flex gap-2 items-start"><span className="text-cyan-600 font-black">✓</span> <span>วีรสุทธิ์อุตสาหกรรม</span></div>
                    <div className="flex gap-2 items-start"><span className="text-cyan-600 font-black">✓</span> <span>การเกษตรอัจฉริยะ</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-8 rounded-[28px] border-2 border-emerald-300 shadow-lg hover:shadow-xl hover:-translate-y-3 transition-all duration-300 group">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-[16px] inline-block border-2 border-emerald-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BrainCircuit className="text-emerald-700" size={24}/>
                  </div>
                  <h5 className="font-black text-emerald-900 mb-3 text-lg">Blockchain</h5>
                  <p className="text-sm text-emerald-800 mb-5 font-medium leading-relaxed">เทคโนโลยีฐานข้อมูลกระจายที่ปลอดภัยและโปร่งใส</p>
                  <div className="text-xs text-emerald-700 space-y-2.5 font-medium">
                    <div className="flex gap-2 items-start"><span className="text-emerald-600 font-black">✓</span> <span>สกุลเงินดิจิทัล</span></div>
                    <div className="flex gap-2 items-start"><span className="text-emerald-600 font-black">✓</span> <span>สัญญาอัจฉริยะ</span></div>
                    <div className="flex gap-2 items-start"><span className="text-emerald-600 font-black">✓</span> <span>การจัดการห่วงโซ่อุปทาน</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/80 p-8 rounded-[28px] border-2 border-teal-300 shadow-lg hover:shadow-xl hover:-translate-y-3 transition-all duration-300 group">
                  <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-50 rounded-[16px] inline-block border-2 border-teal-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="text-teal-700" size={24}/>
                  </div>
                  <h5 className="font-black text-teal-900 mb-3 text-lg">Augmented Reality (AR)</h5>
                  <p className="text-sm text-teal-800 mb-5 font-medium leading-relaxed">การผสมผสานโลกจริงกับโลกเสมือน</p>
                  <div className="text-xs text-teal-700 space-y-2.5 font-medium">
                    <div className="flex gap-2 items-start"><span className="text-teal-600 font-black">✓</span> <span>การศึกษาและการฝึกอบรม</span></div>
                    <div className="flex gap-2 items-start"><span className="text-teal-600 font-black">✓</span> <span>การค้าปลีก</span></div>
                    <div className="flex gap-2 items-start"><span className="text-teal-600 font-black">✓</span> <span>การแพทย์</span></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-emerald-700 via-teal-600 to-teal-800 p-14 rounded-[45px] text-white shadow-2xl hover:shadow-[0_30px_80px_rgba(16,185,129,0.40)] transition-all duration-300 border-2 border-emerald-400/70 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full -mr-48 -mt-48 blur-3xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
              <h4 className="text-4xl font-black mb-10 font-cute relative z-10 flex items-center gap-4">
                <span className="p-3 bg-white/20 backdrop-blur-xl rounded-[16px] border-2 border-white/30 text-emerald-200"><Zap size={32}/></span>
                แนวโน้มเทคโนโลยีในอนาคต
              </h4>
              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="bg-white/15 backdrop-blur-2xl p-10 rounded-[32px] border-2 border-white/40 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 hover:bg-white/20 group/card">
                  <h5 className="font-black text-3xl mb-5 flex items-center gap-3">
                    <span className="p-2 bg-emerald-400/30 rounded-[12px] border-2 border-emerald-300/60 group-hover/card:bg-emerald-400/50 transition-all duration-300">5G/6G</span>
                  </h5>
                  <p className="text-sm opacity-95 mb-7 leading-relaxed font-medium">การเชื่อมต่อความเร็วสูงและความหน่วงต่ำ</p>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center gap-4"><span className="text-emerald-200 font-black text-xl">✓</span> <span className="font-medium">ความเร็วสูงสุด 10 Gbps</span></div>
                    <div className="flex items-center gap-4"><span className="text-emerald-200 font-black text-xl">✓</span> <span className="font-medium">รองรับ IoT จำนวนมาก</span></div>
                    <div className="flex items-center gap-4"><span className="text-emerald-200 font-black text-xl">✓</span> <span className="font-medium">เปิดทางให้ AR/VR ที่สมจริง</span></div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-2xl p-10 rounded-[32px] border-2 border-white/40 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 hover:bg-white/20 group/card">
                  <h5 className="font-black text-3xl mb-5 flex items-center gap-3">
                    <span className="p-2 bg-teal-400/30 rounded-[12px] border-2 border-teal-300/60 group-hover/card:bg-teal-400/50 transition-all duration-300">Quantum</span>
                  </h5>
                  <p className="text-sm opacity-95 mb-7 leading-relaxed font-medium">การคำนวณด้วยหลักควอนตัม</p>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center gap-4"><span className="text-teal-200 font-black text-xl">✓</span> <span className="font-medium">แก้ปัญหาที่ซับซ้อนได้เร็วขึ้น</span></div>
                    <div className="flex items-center gap-4"><span className="text-teal-200 font-black text-xl">✓</span> <span className="font-medium">พัฒนายาและวัสดุใหม่</span></div>
                    <div className="flex items-center gap-4"><span className="text-teal-200 font-black text-xl">✓</span> <span className="font-medium">เข้ารหัสข้อมูลที่ปลอดภัยยิ่งขึ้น</span></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Self-Assessment Section for UnitThree */}
        <SelfAssessment
          title={"⚙️ ประเมินความเข้าใจระบบทางเทคโนโลยี"}
          levels={[
            { heading: '✓ พื้นฐาน', colorClass: 'text-green-600', items: ['บอก Input/Process/Output', 'ยกตัวอย่างระบบง่าย ๆ', 'อธิบาย Feedback ได้'] },
            { heading: '✓ ระดับกลาง', colorClass: 'text-cyan-600', items: ['วิเคราะห์ระบบจริง', 'เข้าใจระบบซับซ้อน', 'อธิบายผลกระทบ Tech'] },
            { heading: '⭐ ระดับสูง', colorClass: 'text-teal-600', items: ['ออกแบบระบบใหม่', 'วิเคราะห์สาเหตุการเปลี่ยน', 'เสนอวิธีแก้ปัญหา Tech'] }
          ]}
          note={<p className="text-sm text-slate-600 mb-3">🔎 <span className="font-bold">ความท้าทาย:</span> วิเคราะห์ระบบใกล้ตัวและเสนอการปรับปรุง</p>}
        />


      </div>
    </div>
  );
};

export default UnitThree;
