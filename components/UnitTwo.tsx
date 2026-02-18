
import React, { useState } from 'react';
import { CASE_STUDIES } from '../constants';
import { BookOpen, Smartphone, Activity, Brain, Settings, CheckCircle2, PlayCircle, BarChart3, Database, PieChart, Search, Layers, Grid, ListOrdered, Calendar, Code, ShieldCheck, Trophy } from './icons/EmojiIcons';
 

 

const UnitTwo: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [subTab, setSubTab] = useState<'ct' | 'sdlc' | 'data' | 'ai'>('ct');
  const [showExercisesUnit2, setShowExercisesUnit2] = useState(false);
  
  // Data Science Playground State
  const [chartData, setChartData] = useState([
      { label: 'A', value: 30, color: 'bg-blue-500' },
      { label: 'B', value: 50, color: 'bg-green-500' },
      { label: 'C', value: 20, color: 'bg-red-500' },
      { label: 'D', value: 40, color: 'bg-yellow-500' }
  ]);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const activeCase = CASE_STUDIES.find(c => c.id === activeTab) || CASE_STUDIES[0];

  const handleDataChange = (index: number, val: string) => {
      const newVal = parseInt(val) || 0;
      const newData = [...chartData];
      newData[index].value = Math.min(100, Math.max(0, newVal)); // Clamp 0-100
      setChartData(newData);
  };

  const getCtIcon = (concept: string) => {
      switch(concept) {
          case 'Decomposition': return <Layers size={20}/>;
          case 'Pattern Recognition': return <Grid size={20}/>;
          case 'Abstraction': return <Search size={20}/>;
          case 'Algorithm': return <ListOrdered size={20}/>;
          default: return <Brain size={20}/>;
      }
  };

  const getSdlcIcon = (phase: string) => {
      switch(phase) {
          case 'Planning': return <Calendar size={20}/>;
          case 'Analysis': return <Search size={20}/>;
          case 'Design': return <Layers size={20}/>;
          case 'Implementation': return <Code size={20}/>;
          case 'Testing': return <ShieldCheck size={20}/>;
          default: return <Settings size={20}/>;
      }
  };

  return (
    <div className="space-y-20 pb-16 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-[45px] p-8 md:p-20 text-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-36 -mb-36 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="inline-block bg-white/20 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest border border-white/30 mb-6 backdrop-blur-md">
             Unit 2: Application Blend
          </div>
          <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight font-cute bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-100">
            การประยุกต์แนวคิดเชิงคำนวณเพื่อพัฒนาโครงงาน
          </h2>
          <p className="text-lg sm:text-xl text-blue-50 font-medium leading-relaxed max-w-3xl">
            นำทฤษฎี CT มาวิเคราะห์ปัญหาจริง พร้อมเรียนรู้ขั้นตอนการพัฒนาโครงงานแบบมืออาชีพ (SDLC) และกระบวนการวิทยาการข้อมูลเบื้องต้น
          </p>
        </div>
      </section>

      {/* Main Tabs - Case Study Selection */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {CASE_STUDIES.map(cs => (
            <button
                key={cs.id}
                onClick={() => { setActiveTab(cs.id); setSubTab('ct'); }}
                className={`flex items-center gap-4 px-8 py-4 rounded-[30px] font-bold transition-all duration-300 border-2 shadow-lg hover:shadow-xl ${
                    activeTab === cs.id 
                    ? cs.id === 1
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white ring-4 ring-blue-200 scale-105'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white ring-4 ring-purple-200 scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
            >
                {cs.id === 1 ? <BookOpen size={24} /> : <Smartphone size={24} />}
                <div className="text-left">
                    <div className="text-[10px] opacity-70 uppercase font-black tracking-widest">กรณีศึกษาที่ {cs.id}</div>
                    <div className="text-sm font-bold">{cs.title.split('(')[0]}</div>
                </div>
            </button>
        ))}
      </div>

      {/* Project Overview Card */}
      <section className="bg-white rounded-[45px] p-8 md:p-16 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border-2 border-slate-100 relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50 transition-transform group-hover:scale-110 duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-[100px] -ml-32 -mb-32 opacity-40 transition-transform group-hover:scale-105 duration-700"></div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
            <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[40px] flex items-center justify-center shrink-0 shadow-[0_15px_40px_rgba(0,0,0,0.15)] transform transition-all group-hover:rotate-3 group-hover:scale-105 duration-500 ${activeTab === 1 ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white' : 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white'}`}>
              {activeTab === 1 ? <BookOpen size={90} strokeWidth={1.5} /> : <Smartphone size={90} strokeWidth={1.5} />}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-800 mb-8 font-cute leading-tight">{activeCase.title}</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-8 rounded-[35px] border-2 border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h4 className="font-black text-rose-700 mb-4 flex items-center justify-center lg:justify-start gap-3 uppercase tracking-wider text-sm"><Activity size={20} className="flex-shrink-0"/> ปัญหา</h4>
                  <p className="text-slate-700 text-base leading-relaxed font-medium">{activeCase.problem}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-[35px] border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h4 className="font-black text-emerald-700 mb-4 flex items-center justify-center lg:justify-start gap-3 uppercase tracking-wider text-sm"><CheckCircle2 size={20} className="flex-shrink-0"/> ทางออก</h4>
                  <p className="text-slate-700 text-base leading-relaxed font-medium">{activeCase.solution}</p>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Detailed Analysis Tabs */}
      <section className="pt-12">
           <div className="flex flex-wrap bg-slate-100 p-3 rounded-[28px] w-full md:w-fit mx-auto mb-16 shadow-lg border-2 border-slate-200">
              <button 
                onClick={() => setSubTab('ct')}
                className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 ${subTab === 'ct' ? 'bg-gradient-to-r from-purple-500 to-violet-600 shadow-xl text-white scale-105 rounded-[20px]' : 'text-slate-600 hover:text-slate-800 font-semibold'}`}
              >
                 <Brain size={20}/> CT Analysis
              </button>
              <button 
                onClick={() => setSubTab('sdlc')}
                className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 ${subTab === 'sdlc' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-xl text-white scale-105 rounded-[20px]' : 'text-slate-600 hover:text-slate-800 font-semibold'}`}
              >
                 <Settings size={20}/> SDLC Process
              </button>
              <button 
                onClick={() => setSubTab('data')}
                className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 ${subTab === 'data' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-xl text-white scale-105 rounded-[20px]' : 'text-slate-600 hover:text-slate-800 font-semibold'}`}
              >
                 <BarChart3 size={20}/> Data Science
              </button>
              <button 
                onClick={() => setSubTab('ai')}
                className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 ${subTab === 'ai' ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-xl text-white scale-105 rounded-[20px]' : 'text-slate-600 hover:text-slate-800 font-semibold'}`}
              >
                 <Brain size={20}/> AI & ML
              </button>
           </div>

           <div className="min-h-[500px]">
              {/* CT Tab - Enhanced for 4 Pillars */}
              {subTab === 'ct' && (
                <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
                   <div className="text-center mb-10">
                        <h3 className="text-xl sm:text-2xl font-black text-purple-800 font-cute">ศึกษาความเป็นไปได้ด้วยแนวคิดเชิงคำนวณ (Feasibility Study)</h3>
                        <p className="text-slate-500 text-sm mt-1">วิเคราะห์ปัญหาผ่าน 4 องค์ประกอบหลักเพื่อความแม่นยำในการพัฒนา</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activeCase.ctAnalysis?.map((item, idx) => (
                      <div key={idx} className="bg-white p-10 rounded-[40px] border-2 border-purple-100 shadow-lg hover:shadow-2xl hover:border-purple-300 transition-all duration-500 group hover:scale-105">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 rounded-[24px] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 font-bold text-xl">
                                {getCtIcon(item.concept)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-purple-800 mb-3 text-xl font-cute">{item.concept}</h4>
                                <div className="h-1.5 w-16 bg-gradient-to-r from-purple-300 to-violet-300 rounded-full mb-4 shadow-sm"></div>
                                <p className="text-slate-700 leading-relaxed text-base font-medium">{item.application}</p>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SDLC Tab - Enhanced for 5 steps */}
              {subTab === 'sdlc' && (
                <div className="animate-fade-in space-y-16 max-w-5xl mx-auto">
                   <div className="text-center mb-12">
                        <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-cute mb-4">พัฒนาโครงงานตามวงจรพัฒนาระบบ (SDLC 5 Steps)</h3>
                        <p className="text-slate-600 text-base font-semibold">ขั้นตอนมาตรฐานสากลเพื่อการส่งมอบระบบที่มีคุณภาพ</p>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mt-6 shadow-lg"></div>
                   </div>
                   <div className="space-y-8 relative">
                    <div className="absolute left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-200 via-cyan-500 to-blue-200 hidden md:block shadow-lg"></div>
                    
                    {activeCase.sdlcSteps?.map((item, idx) => (
                      <div key={idx} className="relative md:pl-20 group animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
                        <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-[24px] flex items-center justify-center font-black text-xl shadow-lg z-10 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-125 group-hover:shadow-2xl">
                           {idx + 1}
                        </div>
                        
                        <div className="bg-white border-2 border-blue-100 rounded-[40px] p-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-cyan-300 transition-all duration-500 relative overflow-hidden group hover:scale-[1.02]">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-cyan-50/40 pointer-events-none"></div>
                          <div className="flex flex-col md:flex-row gap-10 relative z-10">
                             <div className="md:w-1/3">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-lg">{idx + 1}</div>
                                    <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 rounded-[20px] shadow-md group-hover:shadow-lg transition-all">
                                        {getSdlcIcon(item.phase)}
                                    </div>
                                    <h4 className="font-black text-xl text-blue-900 font-cute">{item.phase}</h4>
                                </div>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-3 opacity-70">วัตถุประสงค์:</p>
                                <p className="text-slate-700 font-bold leading-relaxed text-base">{item.description}</p>
                             </div>

                             <div className="md:w-2/3">
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-[32px] border-2 border-blue-100 shadow-inner h-full hover:border-cyan-200 transition-all">
                                    <h5 className="font-black text-slate-700 text-xs mb-5 flex items-center gap-3 uppercase tracking-widest"><PlayCircle size={16} className="text-blue-600"/> กิจกรรมหลักในขั้นตอนนี้:</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {item.activities.map((act, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-[18px] border-2 border-blue-100 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all duration-300 hover:translate-x-1.5">
                                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cyan-600 font-bold" />
                                            <span className="text-sm font-bold text-slate-800">{act}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Science Tab */}
              {subTab === 'data' && (
                  <div className="animate-fade-in space-y-16 max-w-6xl mx-auto">
                      <div className="text-center mb-12">
                          <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-4 font-cute mb-4">
                              <Database size={40} className="text-emerald-600"/>
                              กระบวนการวิทยาการข้อมูล (Data Science Process)
                          </h3>
                          <p className="text-slate-700 text-base font-semibold max-w-2xl mx-auto">การนำข้อมูลจากระบบมาวิเคราะห์เพื่อพัฒนาศักยภาพโครงงาน</p>
                          <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mt-6 shadow-lg"></div>
                      </div>

                      {/* Process Steps */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                          {[
                              { step: 1, title: 'ตั้งคำถาม', desc: 'Ask Question', icon: '❓', color: 'bg-blue-100 text-blue-600' },
                              { step: 2, title: 'เก็บข้อมูล', desc: 'Collect Data', icon: '📥', color: 'bg-cyan-100 text-cyan-600' },
                              { step: 3, title: 'สำรวจข้อมูล', desc: 'Explore Data', icon: '🔍', color: 'bg-emerald-100 text-emerald-600' },
                              { step: 4, title: 'วิเคราะห์', desc: 'Analyze', icon: '📈', color: 'bg-teal-100 text-teal-600' },
                              { step: 5, title: 'สื่อสารผลลัพธ์', desc: 'Visualize', icon: '📊', color: 'bg-green-100 text-green-600' },
                          ].map(s => (
                              <div key={s.step} className="bg-white p-8 rounded-[35px] border-2 border-emerald-100 text-center shadow-lg hover:shadow-xl hover:border-teal-300 transition-all duration-500 group hover:scale-105 hover:-translate-y-2">
                                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-5 text-3xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 ${s.color}`}>
                                      {s.icon}
                                  </div>
                                  <div className="font-black text-slate-800 text-base mb-2">{s.title}</div>
                                  <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{s.desc}</div>
                              </div>
                          ))}
                      </div>

                      {/* Interactive Visualization Playground */}
                      <div className="bg-white rounded-[45px] p-10 md:p-16 border-2 border-emerald-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row gap-12 relative overflow-hidden hover:border-teal-300 transition-all duration-500">
                          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-500 to-teal-500 shadow-lg"></div>
                          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-emerald-100/40 via-transparent to-teal-100/40 hidden md:block"></div>
                          {/* Controls */}
                          <div className="lg:w-1/3 space-y-8 relative z-10">
                              <div>
                                  <h4 className="font-black text-slate-900 mb-8 flex items-center gap-4 text-xl font-cute">
                                      <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-[20px] shadow-md"><Settings size={24}/></div>
                                      Data Sandbox - Interactive
                                  </h4>
                                  <div className="space-y-5">
                                      {chartData.map((d, i) => (
                                          <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                              <span className={`w-4 h-4 rounded-full ${d.color} shadow-sm`}></span>
                                              <span className="text-xs font-black text-slate-600 w-6">{d.label}</span>
                                              <input 
                                                  type="range" min="0" max="100" 
                                                  value={d.value} 
                                                  onChange={(e) => handleDataChange(i, e.target.value)}
                                                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                              />
                                              <span className="text-xs font-mono font-black text-emerald-600 w-8 text-right">{d.value}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              
                              <div className="pt-4 border-t border-slate-100">
                                  <h4 className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-4">รูปแบบการนำเสนอ</h4>
                                  <div className="flex gap-3">
                                      <button 
                                        onClick={() => setChartType('bar')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${chartType === 'bar' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                      >
                                          <BarChart3 size={18}/> แท่ง
                                      </button>
                                      <button 
                                        onClick={() => setChartType('pie')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${chartType === 'pie' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                      >
                                          <PieChart size={18}/> วงกลม
                                      </button>
                                  </div>
                              </div>
                          </div>

                          {/* Visualization Area */}
                          <div className="lg:w-2/3 bg-slate-900 rounded-[35px] p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px] shadow-inner relative">
                              <div className="absolute top-6 left-8 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LIVE DATA VISUALIZATION</h4>
                              </div>
                              
                              {chartType === 'bar' ? (
                                  <div className="flex items-end gap-6 h-64 w-full max-w-md mx-auto pt-10">
                                      {chartData.map((d, i) => (
                                          <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                              <div className="relative w-full h-full flex items-end">
                                                  <div 
                                                    className={`w-full ${d.color} rounded-t-2xl transition-all duration-700 ease-out hover:brightness-125 shadow-lg shadow-black/40`} 
                                                    style={{ height: `${d.value}%` }}
                                                  ></div>
                                                  <div className="absolute -top-8 w-full text-center text-sm font-black text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                      {d.value}
                                                  </div>
                                              </div>
                                              <span className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">DATA {d.label}</span>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-slate-800 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
                                      <div 
                                        className="absolute inset-0 transition-all duration-1000"
                                        style={{
                                            background: `conic-gradient(
                                                #3b82f6 0% ${chartData[0].value}%, 
                                                #22c55e ${chartData[0].value}% ${chartData[0].value + chartData[1].value}%, 
                                                #ef4444 ${chartData[0].value + chartData[1].value}% ${chartData[0].value + chartData[1].value + chartData[2].value}%, 
                                                #eab308 ${chartData[0].value + chartData[1].value + chartData[2].value}% 100%
                                            )`
                                        }}
                                      ></div>
                                      <div className="absolute inset-0 bg-slate-900 rounded-full scale-[0.6] shadow-inner"></div>
                                      <div className="z-10 text-center">
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                                          <p className="text-3xl font-black text-white">{chartData.reduce((a, b) => a + b.value, 0)}</p>
                                      </div>
                                  </div>
                              )}
                              
                              <div className="mt-12 text-center max-w-sm">
                                  <p className="text-xs text-slate-500 font-medium italic">&quot;ข้อมูลเปรียบเสมือนน้ำมันดิบในยุคดิจิทัล การวิเคราะห์และนำเสนอที่ดีช่วยให้เราสร้างเทคโนโลยีที่ตอบโจทย์มนุษย์ได้แม่นยำขึ้น&quot;</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
           </div>
        </section>

        

        {/* AI & Machine Learning Tab */}
        {subTab === 'ai' && (
          <div className="animate-fade-in space-y-12 max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-xl sm:text-2xl font-black text-purple-800 flex items-center justify-center gap-3 font-cute">
                <Brain size={28}/> ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง
              </h3>
              <p className="text-slate-500 text-sm mt-1">การนำ AI และ Machine Learning มาประยุกต์ในโครงงาน</p>
            </div>

            {/* AI Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { title: 'Machine Learning', desc: 'การเรียนรู้จากข้อมูลเพื่อทำนายผล', icon: '🤖', color: 'bg-blue-100 text-blue-600' },
                { title: 'Deep Learning', desc: 'เครือข่ายประสาทเทียมสำหรับข้อมูลซับซ้อน', icon: '🧠', color: 'bg-purple-100 text-purple-600' },
                { title: 'Natural Language Processing', desc: 'การประมวลผลภาษาธรรมชาติ', icon: '💬', color: 'bg-green-100 text-green-600' },
              ].map(c => (
                <div key={c.title} className="bg-white p-6 rounded-[30px] border-2 border-transparent hover:border-purple-200 text-center shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm ${c.color}`}>
                    {c.icon}
                  </div>
                  <div className="font-black text-slate-800 text-sm mb-1">{c.title}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-tight">{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Application in Projects */}
            <div className="bg-white rounded-[45px] p-8 md:p-12 border border-slate-100 shadow-2xl">
              <h4 className="text-2xl font-bold text-slate-800 mb-8 font-cute text-center">การประยุกต์ AI ในโครงงาน</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-200">
                    <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <Smartphone size={20}/> แอปแนะนำหนังสือ
                    </h5>
                    <p className="text-sm text-blue-700 mb-4">ใช้ Machine Learning แนะนำหนังสือตามความสนใจของผู้ใช้</p>
                    <div className="bg-white p-3 rounded-lg font-mono text-xs">
                      - เก็บข้อมูลการอ่าน<br/>
                      - วิเคราะห์รูปแบบ<br/>
                      - แนะนำหนังสือใหม่
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-200">
                    <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <Activity size={20}/> ระบบตรวจจับอารมณ์
                    </h5>
                    <p className="text-sm text-green-700 mb-4">ใช้ Computer Vision วิเคราะห์ใบหน้าเพื่อตรวจจับอารมณ์</p>
                    <div className="bg-white p-3 rounded-lg font-mono text-xs">
                      - รับภาพจากกล้อง<br/>
                      - ประมวลผลด้วย AI<br/>
                      - แสดงผลอารมณ์
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-center">
                  <h5 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Trophy size={24} className="text-yellow-400"/> เคล็ดลับการเริ่มต้น
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                      <p className="text-sm">เริ่มจากปัญหาง่ายๆ ที่แก้ได้ด้วยข้อมูล</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                      <p className="text-sm">ใช้เครื่องมือสำเร็จรูปก่อนสร้างเอง</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                      <p className="text-sm">ทดสอบและปรับปรุงโมเดลอย่างต่อเนื่อง</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Self-Assessment Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-[30px] text-white shadow-xl mt-8">
          <h3 className="text-2xl sm:text-3xl font-bold font-cute mb-8 text-center">📋 ประเมินความเข้าใจเกี่ยวกับ SDLC & CT</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-blue-400 transition-colors">
              <div className="text-blue-400 font-bold text-lg mb-3">✓ พื้นฐาน</div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• บอกความหมาย SDLC ได้</li>
                <li>• ระบุ 5 ขั้นตอนของ SDLC ได้</li>
                <li>• อธิบายแนวคิด CT ได้อย่างง่าย</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-purple-400 transition-colors">
              <div className="text-purple-400 font-bold text-lg mb-3">✓ ระดับกลาง</div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• วิเคราะห์กรณีศึกษาด้วย SDLC</li>
                <li>• ประยุกต์ CT กับปัญหาจริง</li>
                <li>• เลือก Data Science methods ได้</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-pink-400 transition-colors">
              <div className="text-pink-400 font-bold text-lg mb-3">⭐ ระดับสูง</div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• ออกแบบ AI model ได้</li>
                <li>• ใช้ Data Science แก้ปัญหา</li>
                <li>• เชื่อมโยง CT-SDLC-AI</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
            <p className="text-sm opacity-80 mb-3">🎯 <span className="font-bold">เป้าหมายถัดไป:</span> ลองสร้างโครงงานที่ประยุกต์ใช้ CT + SDLC + Data Analysis เข้าด้วยกัน</p>
          </div>
        </section>

        {/* Exercises section removed per request */}

    </div>
  );

};

export default UnitTwo;
