
import React, { useState } from 'react';
import { ENGINEERING_STEPS, ENGINEERING_DEFINITION, ENGINEERING_COMPARISON, MATERIAL_PROPERTIES, MATERIAL_TYPES, MECHANISM_TYPES, ELECTRONICS_INFO, TOOL_CATEGORIES } from '../constants';
import { Wrench, Hammer, Zap, Box, CheckCircle, MonitorPlay, Settings, CheckCircle2, BookOpen, GitCompare, ChevronDown, Lightbulb, ChevronLeft, ChevronRight, Power, MousePointerClick } from './icons/EmojiIcons';
import SelfAssessment from './SelfAssessment';
 
import type { MaterialType } from '../types';

// --- Internal Helper Components ---

const CarouselNavButtons: React.FC<{ onPrev: (e: React.MouseEvent<HTMLButtonElement>) => void, onNext: (e: React.MouseEvent<HTMLButtonElement>) => void, color?: string }> = ({ onPrev, onNext, color = 'text-slate-400' }) => (
  <>
    <button 
        onClick={onPrev}
        className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white ${color} shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm`}
    >
        <ChevronLeft size={20}/>
    </button>
    <button 
        onClick={onNext}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white ${color} shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm`}
    >
        <ChevronRight size={20}/>
    </button>
  </>
);

const CarouselIndicators: React.FC<{ total: number, current: number, color?: string }> = ({ total, current, color = 'bg-slate-300' }) => (
    <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? `w-6 ${color}` : 'w-1.5 bg-slate-200'}`}></div>
        ))}
    </div>
);

// --- Section Components ---

const MaterialCard: React.FC<{ mat: MaterialType }> = ({ mat }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mat.subTypes) setActiveIndex((prev) => (prev + 1) % mat.subTypes!.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mat.subTypes) setActiveIndex((prev) => (prev - 1 + mat.subTypes!.length) % mat.subTypes!.length);
  };

  const hasSubTypes = mat.subTypes && mat.subTypes.length > 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden h-full flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
        
        <h5 className="text-xl font-bold text-slate-800 mb-2 relative z-10 flex items-center gap-2">
            <Box size={20} className="text-orange-500"/> {mat.name}
        </h5>
        <p className="text-slate-600 text-sm mb-6 relative z-10">{mat.description}</p>
        
        {hasSubTypes ? (
           <div className="relative z-10 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex-grow flex flex-col justify-center min-h-[160px] group/inner">
              <div key={activeIndex} className="animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-orange-700 text-lg">
                          {mat.subTypes![activeIndex].name}
                      </span>
                      {mat.subTypes!.length > 1 && (
                        <span className="text-[10px] bg-white text-slate-400 px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                            {activeIndex + 1}/{mat.subTypes!.length}
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">
                      {mat.subTypes![activeIndex].detail}
                  </p>
              </div>

              {mat.subTypes!.length > 1 && (
                  <>
                    <CarouselNavButtons onPrev={prev} onNext={next} color="text-orange-500" />
                    <div className="absolute bottom-3 left-0 right-0">
                        <CarouselIndicators total={mat.subTypes!.length} current={activeIndex} color="bg-orange-400" />
                    </div>
                  </>
              )}
           </div>
        ) : (
            <div className="flex-grow bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                <span className="text-slate-400 text-xs">ไม่มีหมวดย่อย</span>
            </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 relative z-10">
          <span className="font-bold text-slate-700">ตัวอย่าง:</span> {mat.examples}
        </div>
    </div>
  );
};

const PropertyCarousel: React.FC = () => {
    const [index, setIndex] = useState(0);
    const current = MATERIAL_PROPERTIES[index];

    const next = () => setIndex((prev) => (prev + 1) % MATERIAL_PROPERTIES.length);
    const prev = () => setIndex((prev) => (prev - 1 + MATERIAL_PROPERTIES.length) % MATERIAL_PROPERTIES.length);

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-slate-800">สมบัติของวัสดุ (Material Properties)</h4>
                <div className="flex gap-2">
                    <button onClick={prev} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"><ChevronLeft/></button>
                    <button onClick={next} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"><ChevronRight/></button>
                </div>
            </div>

            <div key={index} className="animate-fade-in grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-blue-50 p-8 rounded-[30px] flex flex-col justify-center items-center text-center h-full min-h-[200px] border border-blue-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-md mb-4 text-3xl font-bold">
                        {index + 1}
                    </div>
                    <h5 className="text-2xl font-bold text-blue-800 mb-1">{current.type}</h5>
                    <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">{current.engType}</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <h6 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><BookOpen size={18}/> คำอธิบาย</h6>
                        <p className="text-lg text-slate-600 leading-relaxed">{current.description}</p>
                    </div>
                    <div>
                        <h6 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Lightbulb size={18}/> ตัวอย่าง</h6>
                        <div className="flex flex-wrap gap-2">
                            {current.examples.map((ex, i) => (
                                <span key={i} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium border border-slate-200">
                                    {ex}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center mt-8">
                {MATERIAL_PROPERTIES.map((_, i) => (
                    <button key={i} onClick={() => setIndex(i)} className={`h-2 mx-1 rounded-full transition-all ${i === index ? 'w-8 bg-blue-500' : 'w-2 bg-slate-200'}`}></button>
                ))}
            </div>
        </div>
    );
};

const MechanismCarousel: React.FC = () => {
    const [index, setIndex] = useState(0);
    const current = MECHANISM_TYPES[index];

    const next = () => setIndex((prev) => (prev + 1) % MECHANISM_TYPES.length);
    const prev = () => setIndex((prev) => (prev - 1 + MECHANISM_TYPES.length) % MECHANISM_TYPES.length);

    return (
        <div className="relative group">
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-lg relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                
                <div key={index} className="animate-fade-in relative z-10 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-6">
                        <Settings size={16} className="animate-spin-slow"/> กลไกที่ {index + 1} จาก {MECHANISM_TYPES.length}
                    </div>
                    <h4 className="text-3xl font-black text-slate-800 mb-4">{current.name}</h4>
                    <p className="text-xl text-slate-600 mb-8 font-light">{current.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <h6 className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider">หลักการทำงาน</h6>
                            <p className="text-slate-600">{current.workingPrinciple}</p>
                        </div>
                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-200">
                            <h6 className="font-bold text-orange-800 mb-2 text-sm uppercase tracking-wider">ตัวอย่างการใช้งาน</h6>
                            <p className="text-orange-700 font-medium">{current.example}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white shadow-md rounded-full text-slate-400 hover:text-orange-500 hover:scale-110 transition-all z-20 border border-slate-100"><ChevronLeft size={24}/></button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white shadow-md rounded-full text-slate-400 hover:text-orange-500 hover:scale-110 transition-all z-20 border border-slate-100"><ChevronRight size={24}/></button>
            </div>
            
            <div className="flex justify-center mt-6 gap-2">
                {MECHANISM_TYPES.map((m, i) => (
                    <button 
                        key={i} 
                        onClick={() => setIndex(i)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${i === index ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {m.name.split(' ')[0]}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ElectronicsCard: React.FC<{ info: typeof ELECTRONICS_INFO[0], index: number }> = ({ info, index }) => {
    const [subIndex, setSubIndex] = useState(0);
    const [switchOn, setSwitchOn] = useState(false); // For interactive demo
    
    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSubIndex((prev) => (prev + 1) % info.examples.length);
    };
    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSubIndex((prev) => (prev - 1 + info.examples.length) % info.examples.length);
    };

    const isElectrical = index === 0;
    const theme = isElectrical 
        ? { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', light: 'bg-white/20', text: 'text-white' }
        : { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', light: 'bg-white/20', text: 'text-white' };

    return (
        <div className={`rounded-3xl p-8 ${theme.bg} ${theme.text} shadow-lg relative group h-full flex flex-col overflow-hidden`}>
            <div className="mb-6 relative z-10">
                <h5 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {isElectrical ? <Zap size={24}/> : <MonitorPlay size={24}/>} {info.category}
                </h5>
                <p className="opacity-90 text-sm leading-relaxed">{info.description}</p>
            </div>

            {/* Interactive Circuit Demo for Electrical Card */}
            {isElectrical && (
                <div className="mb-6 bg-black/20 rounded-xl p-4 backdrop-blur-sm relative z-10 border border-white/20 shadow-inner">
                    <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MousePointerClick size={10}/> Interactive Circuit
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-12 bg-gray-300 border-2 border-gray-400 rounded-sm flex items-center justify-center text-black font-bold text-xs">BAT</div>
                            <div className="text-[9px] uppercase tracking-wider">Source</div>
                        </div>
                        <div className="h-1 bg-yellow-400 w-8 transition-opacity duration-300" style={{opacity: switchOn ? 1 : 0.3}}></div>
                        <button 
                            onClick={() => setSwitchOn(!switchOn)}
                            className={`p-2 rounded-lg transition-all border-2 transform active:scale-95 ${switchOn ? 'bg-green-500 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 border-red-300'} shadow-sm`}
                            title={switchOn ? 'Turn Off' : 'Turn On'}
                        >
                            <Power size={20} className="text-white"/>
                        </button>
                        <div className="h-1 bg-yellow-400 w-8 transition-opacity duration-300" style={{opacity: switchOn ? 1 : 0.3}}></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-full border-4 border-white/50 transition-all duration-300 flex items-center justify-center ${switchOn ? 'bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.9)] scale-110' : 'bg-gray-400'}`}>
                                <Lightbulb size={20} className={switchOn ? 'text-orange-500' : 'text-gray-600'}/>
                            </div>
                            <div className="text-[9px] uppercase tracking-wider">Load</div>
                        </div>
                    </div>
                    <p className="text-center text-[10px] mt-3 opacity-90 font-bold bg-black/20 py-1 rounded">
                        {switchOn ? 'วงจรปิด (Close Circuit) = ไฟติด 💡' : 'วงจรเปิด (Open Circuit) = ไฟดับ ⚫'}
                    </p>
                </div>
            )}

            <div className="mt-auto relative z-10">
                <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-6 min-h-[140px] flex flex-col justify-center relative overflow-hidden border border-white/10">
                    <div key={subIndex} className="animate-fade-in text-center">
                        <span className="text-[10px] uppercase tracking-widest opacity-70 mb-2 block">ตัวอย่างอุปกรณ์ {subIndex + 1}/{info.examples.length}</span>
                        <h6 className="text-xl font-bold mb-2">{info.examples[subIndex].name}</h6>
                        <p className="text-sm opacity-90">{info.examples[subIndex].usage}</p>
                    </div>

                    {info.examples.length > 1 && (
                        <>
                            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 transition opacity-0 group-hover:opacity-100"><ChevronLeft size={20}/></button>
                            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 transition opacity-0 group-hover:opacity-100"><ChevronRight size={20}/></button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                {info.examples.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all ${i === subIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'}`}></div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ToolCard: React.FC<{ category: typeof TOOL_CATEGORIES[0] }> = ({ category }) => {
    const [subIndex, setSubIndex] = useState(0);

    const next = (e: React.MouseEvent) => { e.stopPropagation(); setSubIndex((p) => (p + 1) % category.tools.length); };
    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setSubIndex((p) => (p - 1 + category.tools.length) % category.tools.length); };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="bg-slate-100 p-4 text-center border-b border-slate-200">
                <h5 className="font-bold text-slate-700">{category.category}</h5>
            </div>
            <div className="p-6 relative min-h-[180px] flex flex-col justify-center items-center">
                <div key={subIndex} className="animate-fade-in text-center w-full">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Wrench size={32}/>
                    </div>
                    <h6 className="text-lg font-bold text-slate-800 mb-1">{category.tools[subIndex].name}</h6>
                    <p className="text-sm text-slate-500">{category.tools[subIndex].usage}</p>
                </div>

                <CarouselNavButtons onPrev={prev} onNext={next} color="text-indigo-500"/>
                
                <div className="absolute bottom-4 left-0 right-0">
                    <CarouselIndicators total={category.tools.length} current={subIndex} color="bg-indigo-400"/>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const UnitFour: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [materialSubTab, setMaterialSubTab] = useState(0);
  const [showExercisesUnit4, setShowExercisesUnit4] = useState(false);

  const topics = [
    { title: "ความหมาย", icon: <BookOpen size={18} /> },
    { title: "6 ขั้นตอน", icon: <Settings size={18} /> },
    { title: "วัสดุและเครื่องมือ", icon: <Wrench size={18} /> },
    { title: "การทดสอบและประเมินผล", icon: <CheckCircle size={18} /> },
  ];

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 font-cute">
          หน่วยการเรียนรู้ที่ 4 <br/>
          <span className="text-orange-500">กระบวนการออกแบบเชิงวิศวกรรม</span>
        </h2>
        <p className="text-slate-600">Engineering Design Process: กระบวนการแก้ปัญหาอย่างเป็นขั้นตอน</p>
      </section>

      <div className="flex justify-center bg-slate-100 p-1.5 rounded-xl w-full md:w-fit mx-auto mb-10 overflow-x-auto scrollbar-hide">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => setActiveTopic(index)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 whitespace-nowrap
              ${activeTopic === index 
                ? 'bg-white text-orange-600 shadow-md' 
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {topic.icon}
            <span>{topic.title}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {/* Topic 1: Definition & Comparison */}
        {activeTopic === 0 && (
          <div className="animate-fade-in space-y-10">
            {/* Definition Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
               <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Settings size={28} className="text-orange-500"/> ความหมาย
               </h3>
               <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                 {ENGINEERING_DEFINITION.definition}
               </p>
               <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex items-start gap-3">
                 <Lightbulb className="text-orange-600 shrink-0 mt-1" size={24} />
                 <div>
                   <span className="font-bold text-orange-800 block mb-1">จุดเน้นสำคัญ:</span>
                   <p className="text-orange-800/80">{ENGINEERING_DEFINITION.keyPoint}</p>
                 </div>
               </div>
            </div>

            {/* Quick Link to Circuit Sim */}
            <div 
                onClick={() => { setActiveTopic(2); setMaterialSubTab(3); }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-between group"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <Zap size={24}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">อยากลองต่อวงจรไฟฟ้าไหม?</h4>
                        <p className="text-sm text-blue-100">คลิกที่นี่เพื่อไปที่ห้องทดลองเสมือนจริง (Interactive Circuit)</p>
                    </div>
                </div>
                <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0"/>
            </div>

            {/* Comparison Table */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
               <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <GitCompare size={28} className="text-blue-500"/> วิทยาศาสตร์ vs วิศวกรรมศาสตร์
               </h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-100 text-slate-700">
                       <th className="p-4 rounded-tl-xl">ประเด็นเปรียบเทียบ</th>
                       <th className="p-4 text-blue-700">วิทยาศาสตร์</th>
                       <th className="p-4 text-orange-700 rounded-tr-xl">วิศวกรรมศาสตร์</th>
                     </tr>
                   </thead>
                   <tbody>
                     {ENGINEERING_COMPARISON.map((item, idx) => (
                       <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                         <td className="p-4 font-bold text-slate-600">{item.aspect}</td>
                         <td className="p-4 text-slate-700">{item.science}</td>
                         <td className="p-4 text-slate-700">{item.engineering}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* Topic 2: 6 Steps Detailed */}
        {activeTopic === 1 && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center text-slate-800 font-cute">
              รายละเอียด 6 ขั้นตอนการทำงาน
            </h3>
            <div className="space-y-4">
              {ENGINEERING_STEPS.map((step, index) => (
                <div key={step.step} className={`bg-white border-2 rounded-2xl transition-all duration-300 overflow-hidden ${expandedStep === index ? 'border-orange-500 shadow-md' : 'border-slate-200 hover:border-orange-300'}`}>
                  
                  <div 
                    onClick={() => toggleStep(index)}
                    className={`p-5 flex items-center justify-between cursor-pointer ${expandedStep === index ? 'bg-orange-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm transition-colors ${expandedStep === index ? 'bg-orange-500' : 'bg-slate-400'}`}>
                        {step.step}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{step.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{step.engTitle}</p>
                      </div>
                    </div>
                    <div className={`text-slate-400 transition-transform duration-300 ${expandedStep === index ? 'rotate-180 text-orange-500' : ''}`}>
                      <ChevronDown size={24} />
                    </div>
                  </div>

                  {expandedStep === index && (
                    <div className="p-6 bg-white border-t border-slate-100 animate-fade-in cursor-default space-y-6">
                       <p className="text-slate-700 text-lg leading-relaxed font-medium">{step.description}</p>
                       <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                           <h5 className="font-bold text-blue-800 mb-4 text-lg">รายละเอียดขั้นตอน</h5>
                           <ul className="space-y-3">
                             {step.details.map((detail, i) => (
                               <li key={i} className="text-sm text-slate-700 flex items-start gap-3"><CheckCircle2 size={18} className="mt-0.5 text-blue-500 shrink-0"/><span>{detail}</span></li>
                             ))}
                          </ul>
                           <ul className="space-y-3">
                            {step.exampleCases.map((ex, i) => (
                              <li key={i} className="text-sm text-orange-900 bg-white/80 p-3 rounded-lg border border-orange-200/50 flex gap-3 shadow-sm items-start">
                                <span className="font-bold text-orange-500 shrink-0 mt-0.5">{i+1}.</span>
                                <span>{ex}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic 3: Materials & Tools */}
        {activeTopic === 2 && (
          <div className="animate-fade-in space-y-8">
            <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-2 rounded-xl">
              {[
                { label: 'สมบัติวัสดุ', icon: <BookOpen size={18}/> },
                { label: 'ประเภทวัสดุ', icon: <Box size={18}/> },
                { label: 'กลไก', icon: <Settings size={18}/> },
                { label: '⚡ ทดลองต่อวงจร (Circuit)', icon: <Zap size={18}/> },
                { label: 'เครื่องมือช่าง', icon: <Hammer size={18}/> }
              ].map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setMaterialSubTab(idx)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                    materialSubTab === idx
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white/50 p-4 md:p-8 rounded-[35px] border border-white shadow-xl min-h-[400px]">
              
              {/* 1. Material Properties */}
              {materialSubTab === 0 && (
                <div className="animate-fade-in">
                    <PropertyCarousel />
                </div>
              )}

              {/* 2. Material Types */}
              {materialSubTab === 1 && (
                <div className="animate-fade-in">
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 pl-4 border-l-4 border-orange-500 font-cute">ประเภทของวัสดุ (Material Types)</h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    {MATERIAL_TYPES.map((mat, idx) => (
                      <MaterialCard key={idx} mat={mat} />
                    ))}
                  </div>
                </div>
              )}
              
               {/* 3. Mechanisms */}
               {materialSubTab === 2 && (
                <div className="animate-fade-in">
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 pl-4 border-l-4 border-orange-500 font-cute">กลไก (Mechanisms)</h4>
                  <MechanismCarousel />
                </div>
              )}

              {/* 4. Electronics & Simulation */}
              {materialSubTab === 3 && (
                <div className="animate-fade-in">
                   <h4 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 pl-4 border-l-4 border-blue-500 font-cute">ไฟฟ้าและอิเล็กทรอนิกส์</h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    {ELECTRONICS_INFO.map((info, idx) => (
                        <ElectronicsCard key={idx} info={info} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Tools */}
              {materialSubTab === 4 && (
                <div className="animate-fade-in">
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 pl-4 border-l-4 border-indigo-500 font-cute">เครื่องมือช่างพื้นฐาน</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TOOL_CATEGORIES.map((cat, idx) => (
                        <ToolCard key={idx} category={cat} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTopic === 3 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 font-cute">การทดสอบและประเมินผล</h3>
              <p className="text-slate-500">การตรวจสอบคุณภาพและประสิทธิภาพของโครงงาน</p>
            </div>

            <section className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-6 font-cute">ประเภทการทดสอบ</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                  <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle size={20}/> การทดสอบฟังก์ชัน
                  </h5>
                  <p className="text-sm text-green-700 mb-4">ตรวจสอบว่าฟีเจอร์ทำงานตามที่ออกแบบ</p>
                  <div className="text-xs text-green-600">
                    • Unit Testing<br/>
                    • Integration Testing<br/>
                    • System Testing
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                  <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Settings size={20}/> การทดสอบประสิทธิภาพ
                  </h5>
                  <p className="text-sm text-blue-700 mb-4">ตรวจสอบความเร็วและความเสถียร</p>
                  <div className="text-xs text-blue-600">
                    • Load Testing<br/>
                    • Stress Testing<br/>
                    • Performance Testing
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-[30px] text-white shadow-2xl">
              <h4 className="text-xl font-bold mb-6 font-cute">เกณฑ์การประเมิน</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <h5 className="font-bold text-lg mb-4">ฟังก์ชัน (40%)</h5>
                  <div className="space-y-2 text-sm">
                    <div>• ทำงานได้ครบถ้วน</div>
                    <div>• ไม่มีข้อผิดพลาด</div>
                    <div>• ใช้งานง่าย</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <h5 className="font-bold text-lg mb-4">การออกแบบ (30%)</h5>
                  <div className="space-y-2 text-sm">
                    <div>• อินเทอร์เฟซสวยงาม</div>
                    <div>• จัดวางที่ดี</div>
                    <div>• ใช้งานได้สะดวก</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <h5 className="font-bold text-lg mb-4">นวัตกรรม (30%)</h5>
                  <div className="space-y-2 text-sm">
                    <div>• ความคิดสร้างสรรค์</div>
                    <div>• การแก้ปัญหา</div>
                    <div>• ความทันสมัย</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-bold text-slate-800 mb-6 font-cute">เครื่องมือการทดสอบ</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-3">สำหรับซอฟต์แวร์</h5>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div>• Jest / Mocha (Unit Testing)</div>
                    <div>• Selenium (UI Testing)</div>
                    <div>• Postman (API Testing)</div>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-3">สำหรับฮาร์ดแวร์</h5>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div>• Multimeter (วัดแรงดัน)</div>
                    <div>• Oscilloscope (วิเคราะห์สัญญาณ)</div>
                    <div>• Logic Analyzer (วิเคราะห์ดิจิทัล)</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        
      {/* Indicators */}
              <div className="flex justify-center gap-2 mt-10">
              </div>

        {/* Self-Assessment Section for UnitFour */}
        <SelfAssessment
          title={"📋 ประเมินความเข้าใจเกี่ยวกับการออกแบบวิศวกรรม"}
          levels={[
            { heading: '✓ พื้นฐาน', colorClass: 'text-green-600', items: ['บอกสมบัติของวัสดุได้', 'ระบุเครื่องมือช่างพื้นฐาน', 'อธิบายกลไกอย่างง่าย'] },
            { heading: '✓ ระดับกลาง', colorClass: 'text-blue-600', items: ['เลือกวัสดุที่เหมาะสม', 'สร้างต้นแบบอย่างง่าย', 'ทำแบบร่าง (sketch) ได้'] },
            { heading: '⭐ ระดับสูง', colorClass: 'text-orange-600', items: ['ปฏิบัติตามขั้นตอน 6 ขั้น', 'ทำสิ่งประดิษฐ์จริงได้', 'ทดสอบและปรับปรุง'] }
          ]}
          note={<p className="text-sm text-slate-600 mb-3">🔧 <span className="font-bold">ความท้าทาย:</span> ออกแบบและสร้างของใช้ที่แก้ปัญหาในชีวิตประจำวัน</p>}
        />

        {/* Inline exam panel for Unit Four */}
        {/* exam removed */}

        {/* Exercises + Answers */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-8">
          <h3 className="text-xl font-bold mb-3">แบบฝึกหัด — การออกแบบเชิงวิศวกรรม</h3>
          <div className="text-sm text-slate-700 space-y-3">
            <ol className="list-decimal pl-5 space-y-2">
              <li>เลือกวัสดุที่เหมาะสมสำหรับชิ้นงานเล็ก ๆ และอธิบายเหตุผล</li>
              <li>ออกแบบการทดสอบเล็กน้อยเพื่อประเมินความแข็งแรงของชิ้นงาน</li>
              <li>ร่างแผนการ SDLC สั้น ๆ สำหรับโครงงานที่คิดขึ้น</li>
            </ol>
            <div>
              <button onClick={() => setShowExercisesUnit4(prev => !prev)} className="text-sm font-bold text-blue-600">แสดง/ซ่อน เฉลย</button>
              {showExercisesUnit4 && (
                <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                  <p className="font-bold">เฉลย (ตัวอย่าง)</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>วัสดุ: พลาสติกแข็งสำหรับชิ้นที่น้ำหนักเบา, เหล็กสำหรับรับแรงสูง</li>
                    <li>การทดสอบ: ทดสอบรับน้ำหนักค่อย ๆ เพิ่มเพื่อตรวจจุดวางรับแรง</li>
                    <li>SDLC: Plan → Design → Prototype → Test → Revise → Deliver</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default UnitFour;
