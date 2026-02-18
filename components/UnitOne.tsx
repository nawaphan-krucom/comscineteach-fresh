import React, { useState, useRef } from 'react';
import { CT_SKILLS, SDLC_STEPS, REPORT_STRUCTURE } from '../constants';
// FIX: Added ChevronRight to lucide-react imports.
import { Scissors, Grid, Layers, ListOrdered, Settings, FileText, Brain, Bike, ArrowDown, BookOpen, Play, RefreshCw, CheckSquare, ChevronDown, ChevronUp, Search, GitCommit, MousePointer2, Trophy, CheckCircle, XCircle, ChevronLeft, ChevronRight, Code } from './icons/EmojiIcons';
import SelfAssessment from './SelfAssessment';
import UnitHero from './UnitHero';
 

const iconMap: Record<string, React.ReactNode> = {
  scissors: <Scissors size={28} />,
  grid: <Grid size={28} />,
  layers: <Layers size={28} />,
  "list-ordered": <ListOrdered size={28} />,
};

const PATTERN_GAME_LEVELS = [
  {
    sequence: ['🔴', '🔵', '🔴', '🔵'],
    options: ['🟢', '🔴', '🔵', '🟡'],
    correct: '🔴',
    hint: 'สังเกตการสลับสี'
  },
  {
    sequence: ['1', '3', '5', '7'],
    options: ['8', '9', '10', '6'],
    correct: '9',
    hint: 'นี่คือลำดับของเลขคี่'
  },
  {
    sequence: ['A', 'C', 'E', 'G'],
    options: ['H', 'I', 'F', 'J'],
    correct: 'I',
    hint: 'ตัวอักษรที่เว้นไป 1 ตัว'
  },
    {
    sequence: ['🔽', '🔽', '🔼', '🔼'],
    options: ['🔽', '⏹️', '🔼', '▶️'],
    correct: '🔽',
    hint: 'ลองมองเป็นคู่ดูสิ (สองลง, สองขึ้น, ...)'
  }
];

const UnitOne: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState(0);
  const [activeSkillIndex, setActiveSkillIndex] = useState(0); // For Carousel
  const [interactiveMode, setInteractiveMode] = useState<Record<string, boolean>>({});
  const [showScenarioAnalysis, setShowScenarioAnalysis] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [showExercises, setShowExercises] = useState(false);

  // Simple State for Mini-Interactions
  const [decompItems, setDecompItems] = useState([false, false, false]);
  const [patternLevel, setPatternLevel] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isPatternCorrect, setIsPatternCorrect] = useState<boolean | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [algoOrder, setAlgoOrder] = useState<string[]>([]);

  const topics = [
    { title: "แนวคิดเชิงคำนวณ", icon: <Brain size={18} /> },
    { title: "วงจรพัฒนาระบบ", icon: <Settings size={18} /> },
    { title: "การเขียนรายงาน", icon: <FileText size={18} /> },
    { title: "การเขียนโปรแกรมเบื้องต้น", icon: <Code size={18} /> },
  ];
  
  const currentSkill = CT_SKILLS[activeSkillIndex];

  const toggleInteractive = (key: string) => {
    setInteractiveMode(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleScenario = () => {
      setShowScenarioAnalysis(prev => {
          if (!prev) {
              setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
          }
          return !prev;
      });
  };
  
  // --- PATTERN GAME LOGIC ---
  const currentPattern = PATTERN_GAME_LEVELS[patternLevel];
  const handlePatternSelect = (option: string) => {
      if (isPatternCorrect !== null) return;
      setSelectedPattern(option);
      setIsPatternCorrect(option === currentPattern.correct);
  };
  const nextPattern = () => {
      if (patternLevel < PATTERN_GAME_LEVELS.length - 1) {
          setPatternLevel(patternLevel + 1);
          setSelectedPattern(null);
          setIsPatternCorrect(null);
      } else {
          setGameCompleted(true);
      }
  };
  const tryAgainPattern = () => {
      setSelectedPattern(null);
      setIsPatternCorrect(null);
  };
  const resetPatternGame = () => {
      setPatternLevel(0);
      setSelectedPattern(null);
      setIsPatternCorrect(null);
      setGameCompleted(false);
  };

  // Helper for Algorithm Game
  const algoSteps = ["ตอกไข่", "ตีไข่", "ตั้งกระทะ", "ทอด"];
  const handleAlgoClick = (step: string) => {
    if (algoOrder.includes(step)) {
      setAlgoOrder(algoOrder.filter(s => s !== step));
    } else {
      setAlgoOrder([...algoOrder, step]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <UnitHero
        unitNumber={1}
        title={<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">แนวคิดเชิงคำนวณ</span>}
        subtitle="พื้นฐานการคิดแก้ปัญหาและการพัฒนาโครงงานอย่างเป็นระบบ"
      />

      <div className="flex justify-center bg-slate-100 p-1.5 rounded-xl w-full md:w-fit mx-auto mb-10">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => setActiveTopic(index)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300
              ${activeTopic === index 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {topic.icon}
            <span>{topic.title}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTopic === 0 && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[30px] text-center relative overflow-hidden border border-slate-100 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 font-cute">Computational Thinking (CT)</h3>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">กระบวนการแก้ปัญหาแบบมีตรรกะ เพื่อหาวิธีแก้ปัญหาที่ทั้งมนุษย์และคอมพิวเตอร์สามารถเข้าใจได้</p>
            </div>

            <section className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="md:w-1/3 flex flex-col items-center text-center">
                  <div className="w-40 h-40 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6 shadow-inner ring-8 ring-white">
                    <Bike size={80} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 font-cute">ตัวอย่างสถานการณ์</h3>
                  <p className="text-gray-600 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 font-medium shadow-sm">&quot;จักรยานของต้นปั่นไม่ได้&quot;</p>
                </div>
                <div className="md:w-2/3 space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    เมื่อเจอปัญหา <strong>&quot;จักรยานเสีย&quot;</strong> เราจะใช้แนวคิดเชิงคำนวณแก้ปัญหาอย่างไร? 
                  </p>
                  
                  <button 
                    onClick={toggleScenario}
                    className={`w-full py-3 px-6 rounded-2xl border-2 flex items-center justify-between font-bold transition-all
                        ${showScenarioAnalysis ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                  >
                      <span className="flex items-center gap-2"><Search size={20}/> ดูตัวอย่างการวิเคราะห์</span>
                      {showScenarioAnalysis ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>

                  {showScenarioAnalysis && (
                      <div ref={analysisRef} className="space-y-4 animate-slide-up bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border-l-4 border-red-400 shadow-sm">
                                  <h5 className="font-bold text-red-600 mb-1 flex items-center gap-2"><Scissors size={16}/> 1. Decomposition</h5>
                                  <p className="text-sm text-slate-600">แยกส่วนดูทีละจุด: ล้อ (ยางแบน?), โซ่ (หลุด?), เบรก (ติด?)</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border-l-4 border-green-400 shadow-sm">
                                  <h5 className="font-bold text-green-600 mb-1 flex items-center gap-2"><Grid size={16}/> 2. Pattern Recognition</h5>
                                  <p className="text-sm text-slate-600">เทียบกับอดีต: &quot;อาการนี้หนักๆ เหมือนตอนยางแบนคราวที่แล้ว&quot;</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
                                  <h5 className="font-bold text-blue-600 mb-1 flex items-center gap-2"><Layers size={16}/> 3. Abstraction</h5>
                                  <p className="text-sm text-slate-600">ตัดสิ่งไม่จำเป็น: สีรถ, ยี่ห้อ, ความเก่า (ไม่เกี่ยวกับการซ่อม)</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border-l-4 border-purple-400 shadow-sm">
                                  <h5 className="font-bold text-purple-600 mb-1 flex items-center gap-2"><ListOrdered size={16}/> 4. Algorithm Design</h5>
                                  <p className="text-sm text-slate-600">ลำดับการซ่อม: ถอดล้อ -&gt; งัดยาง -&gt; ปะยาง -&gt; สูบลม</p>
                              </div>
                          </div>
                      </div>
                  )}
                </div>
              </div>
            </section>

            {/* 4 Pillars Carousel */}
            <section>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-700 pl-2 font-cute">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                4 องค์ประกอบหลัก (คลิก &apos;ลองทำดู&apos; เพื่อฝึกฝน)
              </h3>
              <div className="relative group">
                <div key={activeSkillIndex} className={`glass-card p-6 md:p-8 rounded-[30px] overflow-hidden border animate-fade-in min-h-[450px]`}>
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => toggleInteractive(currentSkill.engTitle)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm ${interactiveMode[currentSkill.engTitle] ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'}`}
                    >
                      {interactiveMode[currentSkill.engTitle] ? <BookOpen size={14}/> : <Play size={14}/>}
                      {interactiveMode[currentSkill.engTitle] ? 'กลับไปอ่านเนื้อหา' : 'ลองทำดู'}
                    </button>
                  </div>

                  {!interactiveMode[currentSkill.engTitle] ? (
                    <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in">
                      <div className="flex items-center gap-4 md:flex-col md:w-56 text-center shrink-0">
                        <div className={`p-4 rounded-3xl ${currentSkill.color}`}>{iconMap[currentSkill.icon]}</div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-800 font-cute">{currentSkill.title}</h4>
                          <p className="text-sm font-bold opacity-60 uppercase tracking-wider">{currentSkill.engTitle}</p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-gray-700 leading-relaxed font-medium">{currentSkill.description}</p>
                        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                          <h5 className="font-bold text-gray-600 text-sm mb-3 flex items-center gap-2"><BookOpen size={16} /> ตัวอย่างเพิ่มเติม:</h5>
                          <ul className="space-y-2">
                            {currentSkill.additionalExamples.map((ex, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>{ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fade-in bg-slate-50 p-6 rounded-2xl border border-slate-200 noselect">
                      <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">{iconMap[currentSkill.icon]} ฝึกฝน: {currentSkill.engTitle}</h4>
                      {currentSkill.engTitle === 'Decomposition' && (
                        <div className="space-y-4">
                           <p className="text-sm text-slate-600">ปัญหา: &quot;จะจัดกระเป๋าไปเที่ยวทะเล ต้องเตรียมอะไรบ้าง?&quot; (ลองแยกส่วนประกอบ)</p>
                           <div className="grid grid-cols-3 gap-2">
                              {['เสื้อผ้า', 'ของใช้', 'ยา'].map((item, i) => (
                                 <button key={item} onClick={() => { const n = [...decompItems]; n[i] = !n[i]; setDecompItems(n); }} className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${decompItems[i] ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    {decompItems[i] ? <CheckSquare size={16} className="inline mr-1"/> : <span className="inline-block w-4 h-4 border border-slate-300 mr-1 rounded-sm"></span>} {item}
                                 </button>
                              ))}
                           </div>
                           {decompItems.every(x => x) && <p className="text-green-600 text-sm font-bold animate-bounce">เยี่ยม! คุณแยกส่วนประกอบครบแล้ว</p>}
                        </div>
                      )}
                      {currentSkill.engTitle === 'Pattern Recognition' && (
                         <div className="space-y-4">{gameCompleted ? (<div className="text-center p-8 bg-green-50 rounded-xl border border-green-200"><Trophy size={40} className="mx-auto text-yellow-500 mb-4"/><h5 className="font-bold text-lg text-green-800">สุดยอด!</h5><p className="text-sm text-green-700 mb-4">คุณผ่านเกมจับรูปแบบทั้งหมดแล้ว!</p><button onClick={resetPatternGame} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg flex items-center gap-2 mx-auto"><RefreshCw size={16}/> เล่นอีกครั้ง</button></div>) : (<><p className="text-sm text-slate-600"><strong>ด่านที่ {patternLevel + 1}:</strong> จากรูปแบบที่กำหนดให้ ตัวต่อไปคืออะไร?</p><div className="flex items-center justify-center gap-3 bg-white p-4 rounded-xl shadow-inner border border-slate-200">{currentPattern.sequence.map((item, i) => (<div key={i} className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-xl text-slate-700">{item}</div>))}<div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-2xl text-white">?</div></div><div className="grid grid-cols-4 gap-3 pt-2">{currentPattern.options.map((option, i) => {let buttonClass = 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-700'; if (selectedPattern !== null) {if (option === currentPattern.correct) {buttonClass = 'bg-green-500 border-green-600 text-white scale-105';} else if (option === selectedPattern) {buttonClass = 'bg-red-500 border-red-600 text-white';} else {buttonClass = 'bg-slate-100 border-slate-200 text-slate-400 opacity-70';}} return (<button key={i} onClick={() => handlePatternSelect(option)} disabled={selectedPattern !== null} className={`w-full h-16 rounded-lg border-2 text-2xl font-bold flex items-center justify-center transition-all ${buttonClass}`}>{option}</button>);})}</div>{selectedPattern !== null && (<div className={`p-4 rounded-lg mt-4 animate-fade-in flex items-center justify-between ${isPatternCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}><div className="flex items-center gap-2">{isPatternCorrect ? <CheckCircle size={20}/> : <XCircle size={20}/>}<p className="text-sm font-bold">{isPatternCorrect ? 'ถูกต้อง!' : `ผิดนะ! คำใบ้: ${currentPattern.hint}`}</p></div>{isPatternCorrect ? (<button onClick={nextPattern} className="px-3 py-1 bg-white text-green-700 font-bold text-xs rounded-md border border-green-200">ข้อต่อไป &gt;</button>) : (<button onClick={tryAgainPattern} className="px-3 py-1 bg-white text-red-700 font-bold text-xs rounded-md border border-red-200">ลองใหม่</button>)}</div>)}</>)}</div>
                      )}
                      {currentSkill.engTitle === 'Abstraction' && (
                        <div className="space-y-4">
                           <div className="flex justify-between items-center"><p className="text-sm text-slate-600">ลองเปลี่ยนมุมมอง: ภาพจริง vs แผนที่ (ตัดรายละเอียด)</p><button onClick={() => setShowMap(!showMap)} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold">สลับมุมมอง</button></div>
                           <div className="h-32 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">{showMap ? (<div className="w-full h-full bg-white flex items-center justify-center gap-4"><div className="w-4 h-4 bg-red-500 rounded-full"></div><div className="w-32 h-1 bg-slate-800"></div><div className="w-4 h-4 bg-blue-500 rounded-full"></div><span className="absolute bottom-2 text-xs text-slate-400">แผนที่ (Abstract)</span></div>) : (<div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1577086664693-894553052526?q=80&w=1000&auto=format&fit=crop)'}}><div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold text-xs">ภาพถ่ายจริง (Detailed)</div></div>)}</div>
                        </div>
                      )}
                      {currentSkill.engTitle === 'Algorithm Design' && (<div className="text-center py-4"><p className="text-slate-500">ดูตัวอย่างเกมเรียงลำดับและสัญลักษณ์ผังงานที่ด้านล่างได้เลยครับ 👇</p></div>)}
                    </div>
                  )}
                </div>
                
                {/* Navigation Buttons */}
                <button 
                  onClick={() => setActiveSkillIndex(prev => (prev - 1 + CT_SKILLS.length) % CT_SKILLS.length)}
                  className="absolute top-1/2 -translate-y-1/2 -left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 text-slate-500 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft size={24}/>
                </button>
                <button 
                  onClick={() => setActiveSkillIndex(prev => (prev + 1) % CT_SKILLS.length)}
                  className="absolute top-1/2 -translate-y-1/2 -right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 text-slate-500 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight size={24}/>
                </button>
              </div>

              {/* Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {CT_SKILLS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSkillIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSkillIndex === index ? 'w-6 bg-blue-500' : 'bg-slate-200 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[30px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10 font-cute">
                    <ListOrdered className="text-yellow-300"/> พื้นฐานอัลกอริทึม & ผังงาน (Flowchart)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 noselect">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><MousePointer2 size={18}/> ลองเรียงลำดับ: การทอดไข่เจียว</h4>
                        <div className="flex gap-2 flex-wrap mb-4">{algoSteps.map(step => (<button key={step} onClick={() => handleAlgoClick(step)} disabled={algoOrder.includes(step)} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${algoOrder.includes(step) ? 'bg-white/20 text-white/50 border-transparent cursor-not-allowed' : 'bg-white text-indigo-700 hover:bg-indigo-50 border-white'}`}>{step}</button>))}</div>
                        <div className="bg-black/20 p-3 rounded-xl min-h-[50px] flex items-center gap-2 text-sm mb-2 overflow-x-auto">{algoOrder.length === 0 && <span className="text-white/40 italic">คลิกปุ่มด้านบนเพื่อเรียงลำดับ...</span>}{algoOrder.map((s, i) => <span key={i} className="bg-white/90 text-indigo-900 px-3 py-1 rounded-lg shadow-sm font-bold flex items-center gap-1"><span className="text-[10px] bg-indigo-200 px-1 rounded text-indigo-800">{i+1}</span> {s}</span>)}</div>
                        <div className="flex justify-between items-center h-6"><button onClick={() => setAlgoOrder([])} className="text-xs text-white/70 hover:text-white flex items-center gap-1 hover:underline"><RefreshCw size={12}/> รีเซ็ตใหม่</button>{JSON.stringify(algoOrder) === JSON.stringify(algoSteps) && <span className="text-green-300 text-sm font-bold animate-pulse">ถูกต้อง! เก่งมาก 🍳</span>}</div>
                    </div>
                    <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-lg">
                        <h4 className="font-bold text-lg mb-4 text-indigo-900 flex items-center gap-2"><GitCommit size={18}/> สัญลักษณ์ผังงานที่ต้องรู้</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4"><div className="w-12 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold bg-green-100 shrink-0">Start/End</div><div><div className="text-sm font-bold">Terminator (เริ่มต้น/สิ้นสุด)</div><div className="text-xs text-slate-500">จุดเริ่มต้นและจุดสิ้นสุดของผังงาน</div></div></div>
                            <div className="flex items-center gap-4"><div className="w-12 h-8 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold bg-blue-100 transform -skew-x-12 shrink-0">Input/Output</div><div><div className="text-sm font-bold">Input/Output (รับ/แสดงข้อมูล)</div><div className="text-xs text-slate-500">รับค่าทางแป้นพิมพ์ หรือแสดงผลทางจอภาพ</div></div></div>
                            <div className="flex items-center gap-4"><div className="w-12 h-8 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold bg-yellow-100 shrink-0">Process</div><div><div className="text-sm font-bold">Process (ประมวลผล)</div><div className="text-xs text-slate-500">การคำนวณ หรือกำหนดค่าต่างๆ</div></div></div>
                            <div className="flex items-center gap-4"><div className="w-8 h-8 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold bg-purple-100 transform rotate-45 shrink-0 ml-2 mr-2">Decision</div><div><div className="text-sm font-bold">Decision (การตัดสินใจ)</div><div className="text-xs text-slate-500">จุดตรวจสอบเงื่อนไข (จริง/เท็จ)</div></div></div>
                        </div>
                    </div>
                </div>
            </section>
          </div>
        )}

        {activeTopic === 1 && (
           <div className="animate-fade-in space-y-8">
             <div className="text-center mb-8"><h3 className="text-2xl sm:text-3xl font-bold text-gray-800 font-cute">วงจรการพัฒนาระบบ (SDLC)</h3><p className="text-gray-500">System Development Life Cycle</p></div>
             <div className="relative"><div className="absolute left-[28px] top-4 bottom-4 w-0.5 bg-gray-200 hidden md:block"></div><div className="space-y-6">{SDLC_STEPS.map((step, idx) => (<div key={idx} className="relative md:pl-16 group"><div className="hidden md:flex absolute left-0 top-0 w-14 h-14 rounded-full bg-white border-4 border-indigo-100 text-indigo-500 items-center justify-center font-bold text-xl shadow-sm z-10 group-hover:bg-indigo-500 group-hover:text-white transition-colors">{step.step}</div><div className="bg-white p-6 rounded-[25px] transition-all border border-slate-100 shadow-sm hover:shadow-md"><div className="flex items-start gap-4 mb-4"><div className="md:hidden w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shrink-0">{step.step}</div><div><h4 className="text-xl font-bold text-gray-800 font-cute">{step.title}</h4><p className="text-sm text-gray-500 font-bold uppercase">{step.engTitle}</p><p className="text-gray-600 mt-2">{step.description}</p></div></div><div className="grid md:grid-cols-2 gap-4"><div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><h5 className="font-bold text-blue-800 text-sm mb-2">กระบวนการทำงาน (Process)</h5><ul className="space-y-2">{step.process.map((p, i) => (<li key={i} className="text-xs text-blue-700 flex gap-2"><span>•</span> {p}</li>))}</ul></div><div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col justify-center"><h5 className="font-bold text-green-800 text-sm mb-2">ผลลัพธ์ (Outcome)</h5><p className="text-xs text-green-700 font-medium">{step.outcome}</p></div></div></div>{idx !== SDLC_STEPS.length - 1 && (<div className="flex justify-center md:hidden py-2 text-gray-300"><ArrowDown /></div>)}</div>))}</div></div>
           </div>
        )}

        {activeTopic === 2 && (
          <div className="animate-fade-in space-y-8">
             <div className="text-center mb-8"><h3 className="text-2xl sm:text-3xl font-bold text-gray-800 font-cute">การเขียนรายงานโครงงาน</h3><p className="text-gray-500">ส่วนประกอบสำคัญ 3 ส่วน</p></div>
             <div className="grid md:grid-cols-3 gap-6">{REPORT_STRUCTURE.map((part, idx) => (<div key={idx} className={`rounded-[30px] p-6 border-2 ${part.color} hover:scale-105 transition-transform duration-300 flex flex-col bg-white shadow-sm`}><div className="mb-4"><span className="text-xs font-bold uppercase tracking-widest opacity-60">{part.part}</span><h4 className="text-xl font-bold mt-1 font-cute">{part.title}</h4><p className="text-xs mt-2 opacity-80">{part.description}</p></div><div className="flex-1 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">{part.items.map((item, i) => (<div key={i} className="border-b border-slate-200 pb-2 last:border-0 last:pb-0"><h5 className="font-bold text-sm text-gray-800">{item.name}</h5><p className="text-[10px] text-gray-600 leading-tight mt-0.5">{item.detail}</p></div>))}</div></div>))}</div>
             <div className="bg-white p-6 rounded-[25px] flex items-center gap-4 border border-yellow-200 shadow-sm"><div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shrink-0"><FileText size={24} /></div><div><h4 className="font-bold text-gray-800">ข้อควรจำ</h4><p className="text-sm text-gray-600">การเขียนรายงานควรใช้ภาษาที่เป็นทางการ กระชับ และมีการอ้างอิงแหล่งข้อมูลที่น่าเชื่อถือเสมอ</p></div></div>
          </div>
        )}

        {activeTopic === 3 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 font-cute">การเขียนโปรแกรมเบื้องต้น</h3>
              <p className="text-gray-500">พื้นฐานการเขียนโค้ดและการแก้ปัญหาด้วยโปรแกรม</p>
            </div>

            <section className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-bold text-gray-800 mb-4 font-cute">ภาษาโปรแกรมพื้นฐาน</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                  <h5 className="font-bold text-blue-800 mb-2">Python</h5>
                  <p className="text-sm text-blue-700">ภาษาที่ง่ายต่อการเรียนรู้ เหมาะสำหรับผู้เริ่มต้น</p>
                  <div className="mt-4 bg-white p-3 rounded-lg font-mono text-xs">
                    print(&quot;Hello, World!&quot;)
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                  <h5 className="font-bold text-green-800 mb-2">JavaScript</h5>
                  <p className="text-sm text-green-700">ภาษาสำหรับเว็บไซต์และแอปพลิเคชัน</p>
                  <div className="mt-4 bg-white p-3 rounded-lg font-mono text-xs">
                    console.log(&quot;Hello, World!&quot;);
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
                  <h5 className="font-bold text-purple-800 mb-2">Java</h5>
                  <p className="text-sm text-purple-700">ภาษาที่แข็งแกร่งสำหรับแอปพลิเคชันขนาดใหญ่</p>
                  <div className="mt-4 bg-white p-3 rounded-lg font-mono text-xs">
                    System.out.println(&quot;Hello, World!&quot;);
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-600 to-teal-700 p-8 rounded-[30px] text-white shadow-2xl">
              <h4 className="text-xl font-bold mb-6 font-cute">โครงสร้างควบคุมเบื้องต้น</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <h5 className="font-bold text-lg mb-4">การตัดสินใจ (If-Else)</h5>
                  <div className="bg-black/20 p-4 rounded-lg font-mono text-sm">
                    <div>if (เงื่อนไข) &#123;</div>
                    <div className="ml-4">{/* ทำเมื่อเงื่อนไขจริง */}</div>
                    <div>&#125; else &#123;</div>
                    <div className="ml-4">{/* ทำเมื่อเงื่อนไขเท็จ */}</div>
                    <div>&#125;</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <h5 className="font-bold text-lg mb-4">การวนซ้ำ (Loop)</h5>
                  <div className="bg-black/20 p-4 rounded-lg font-mono text-sm">
                    <div>for (int i = 0; i &lt; 5; i++) &#123;</div>
                    <div className="ml-4">{/* ทำซ้ำ 5 ครั้ง */}</div>
                    <div>&#125;</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-bold text-gray-800 mb-4 font-cute">ตัวอย่างโปรแกรมง่ายๆ</h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h5 className="font-bold text-slate-800 mb-3">โปรแกรมคำนวณเกรดเฉลี่ย</h5>
                <div className="bg-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  {/* Python */}
                  <div>scores = [85, 92, 78, 96, 88]</div>
                  <div>average = sum(scores) / len(scores)</div>
                  <div>print(f&quot;Average score: &#123;average:.2f&#125;&quot;)</div>
                </div>
                <p className="text-sm text-slate-600 mt-3">โปรแกรมนี้จะคำนวณคะแนนเฉลี่ยจากรายการคะแนนที่กำหนด</p>
              </div>
            </section>
          </div>
        )}
        
      {/* Indicators */}
              <div className="flex justify-center gap-2 mt-10">
              </div>

        {/* Self-Assessment Section for UnitOne */}
        <SelfAssessment
          title={"🧠 ประเมินความเข้าใจแนวคิดเชิงคำนวณ"}
          levels={[
            { heading: '✓ พื้นฐาน', colorClass: 'text-cyan-600', items: ['บอกความหมาย Decomposition', 'ยกตัวอย่าง Pattern Recognition', 'อธิบาย Abstraction ได้'] },
            { heading: '✓ ระดับกลาง', colorClass: 'text-blue-600', items: ['แยกส่วนปัญหาจริง', 'หารูปแบบของข้อมูล', 'เขียน Algorithm เล็กน้อย'] },
            { heading: '⭐ ระดับสูง', colorClass: 'text-pink-600', items: ['ใช้ 4 เสาหลัก CT ได้ลึก', 'ออกแบบอัลกอริทึมซับซ้อน', 'สร้างโปรแกรมง่าย ๆ'] }
          ]}
          note={<p className="text-sm text-slate-600 mb-3">💡 <span className="font-bold">ความท้าทาย:</span> ใช้แนวคิดเชิงคำนวณแก้ปัญหากรรมการที่ซับซ้อนจริง</p>}
        />

        {/* Exercises section removed per request */}

      </div>
    </div>
  );
};

export default UnitOne;
