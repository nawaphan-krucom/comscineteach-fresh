import React, { useState } from 'react';
import { DESIGN_PROJECTS, INTELLECTUAL_PROPERTY_CONCEPTS, CREATIVE_COMMONS_LICENSES } from '../constants';
import { Heart, Lightbulb, CheckSquare, List, Star, Key, CheckCircle2, ChevronDown, ShieldCheck, Scale, Globe, Rocket, Download, Edit3 } from './icons/EmojiIcons';
import SelfAssessment from './SelfAssessment';
import UnitHero from './UnitHero';
import PillTabs from './PillTabs';
 

const UnitFive: React.FC = () => {
  const [activeProject, setActiveProject] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [showEthics, setShowEthics] = useState(false);
  
  // Project Canvas State
  const [canvasData, setCanvasData] = useState({
      name: '',
      problem: '',
      target: '',
      solution: '',
      benefit: ''
  });
  const [showCanvas, setShowCanvas] = useState(false);
  const [showExercisesUnit5, setShowExercisesUnit5] = useState(false);

  const toggleStep = (idx: number) => {
    setExpandedStep(expandedStep === idx ? null : idx);
  };

  const activeProjectData = DESIGN_PROJECTS[activeProject];

  return (
    <div className="space-y-8 animate-fade-in">
      <UnitHero
        unitNumber={5}
        title={<span className="text-brand-rose">ผลงานการออกแบบและเทคโนโลยี</span>}
        subtitle="เรียนรู้จากกรณีศึกษา และการเคารพสิทธิทางปัญญา (Intellectual Property)"
      />

      {/* Inline exam panel for Unit Five */}
      {/* exam removed */}

      {/* Ethics Section - Highlighted */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[30px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-rose/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 font-cute mb-2">
                          <ShieldCheck className="text-green-400"/> จริยธรรมและทรัพย์สินทางปัญญา
                      </h3>
                      <p className="text-slate-300 text-sm max-w-2xl">
                          การเคารพผลงานผู้อื่นและการเลือกใช้สัญญาอนุญาต (Creative Commons) ให้ถูกต้องเป็นสิ่งสำคัญ
                      </p>
                  </div>
                  <button 
                    onClick={() => setShowEthics(!showEthics)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                  >
                      {showEthics ? 'ซ่อนข้อมูล' : 'เรียนรู้เพิ่มเติม'} <ChevronDown className={`transition-transform ${showEthics ? 'rotate-180' : ''}`}/>
                  </button>
              </div>

              {showEthics && (
                  <div className="mt-6 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                          <h4 className="font-bold text-rose-300 flex items-center gap-2"><Scale size={18}/> ประเภทของทรัพย์สินทางปัญญา</h4>
                          {INTELLECTUAL_PROPERTY_CONCEPTS.map(concept => (
                              <div key={concept.type} className="bg-black/20 p-3 rounded-lg">
                                  <div className="font-bold text-sm flex items-center gap-2">{concept.icon} {concept.type}</div>
                                  <p className="text-xs text-slate-300 mt-1">{concept.description}</p>
                              </div>
                          ))}
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                          <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2"><Globe size={18}/> สัญญาอนุญาต Creative Commons</h4>
                          <div className="grid grid-cols-2 gap-2">
                              {CREATIVE_COMMONS_LICENSES.map(lic => (
                                  <div key={lic.code} className="bg-black/20 p-3 rounded-lg" title={lic.description}>
                                      <div className="flex items-center gap-2">
                                          <span className="text-xl">{lic.icon}</span>
                                          <div>
                                              <div className="text-xs font-bold">{lic.code}</div>
                                              <div className="text-[9px] opacity-70">{lic.name}</div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-3">เป็นการอนุญาตให้ผู้อื่นนำผลงานไปใช้ได้ภายใต้เงื่อนไขที่กำหนด</p>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Project Tabs */}
      <PillTabs
        items={DESIGN_PROJECTS.map((p, i) => ({ id: i, icon: p.id === 1 ? <Lightbulb size={24} /> : <Heart size={24} />, label: p.title.split('(')[0] }))}
        active={activeProject}
        onChange={(id) => { setActiveProject(Number(id)); setExpandedStep(0); }}
        outerClassName="flex flex-wrap justify-center gap-4 mb-10"
        activeClassName="bg-gradient-to-r from-brand-rose to-pink-500 text-white border-transparent shadow-lg scale-105"
        inactiveClassName="bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50"
      />

      <div className="min-h-[600px]">
        <div key={activeProjectData.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
          
          <div className="p-10 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight mb-4 font-cute">{activeProjectData.title}</h3>
            <p className="text-slate-500 text-lg font-light max-w-3xl mx-auto">
              {activeProjectData.concept}
            </p>
          </div>

          <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100">
            <div className="max-w-4xl mx-auto">
              <h4 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2 font-cute">
                <List size={28} className="text-brand-rose"/> 6 ขั้นตอนการดำเนินงาน
              </h4>
              <div className="space-y-4">
                {activeProjectData.projectSteps.map((step, idx) => (
                  <div key={idx} className={`bg-white border-2 rounded-2xl transition-all duration-300 overflow-hidden ${expandedStep === idx ? 'border-brand-rose shadow-md' : 'border-slate-200 hover:border-rose-300'}`}>
                    <div 
                      className={`p-5 flex items-center justify-between cursor-pointer ${expandedStep === idx ? 'bg-rose-50/50' : ''}`}
                      onClick={() => toggleStep(idx)}
                    >
                       <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm transition-colors ${expandedStep === idx ? 'bg-brand-rose' : 'bg-slate-400'}`}>
                          {step.stepNumber}
                        </div>
                        <div>
                          <h5 className="font-bold text-lg text-slate-800">{step.stepTitle}</h5>
                          <p className="text-sm text-slate-500">{step.description}</p>
                        </div>
                       </div>
                       <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${expandedStep === idx ? 'rotate-180 text-rose-500' : ''}`}/>
                    </div>

                    {expandedStep === idx && (
                      <div className="p-6 bg-white border-t border-slate-100 animate-fade-in space-y-6">
                        <div>
                          <h6 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <CheckSquare size={16}/> รายละเอียดการดำเนินงาน:
                          </h6>
                          <ul className="space-y-3">
                              {step.actions.map((action, i) => (
                              <li key={i} className="flex gap-3 text-slate-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></div>
                                  <span className="leading-relaxed">{action}</span>
                              </li>
                              ))}
                          </ul>
                              <h4 className="text-lg font-bold text-emerald-800 flex items-center gap-2 mb-2">
                                  <CheckCircle2 size={20}/> ผลการทดสอบ
                              </h4>
                              <p className="text-emerald-900 text-sm font-medium leading-relaxed">{step.testResults}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {activeProjectData.keyTakeaways && (
              <div className="mt-12 max-w-4xl mx-auto">
                 <h4 className="text-xl font-bold text-orange-800 mb-6 flex items-center gap-2 font-cute">
                    <Key size={24} className="text-orange-500"/> ประเด็นสำคัญที่ได้เรียนรู้
                 </h4>
                 <div className="grid md:grid-cols-3 gap-6">
                    {activeProjectData.keyTakeaways.map((takeaway, idx) => (
                       <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                             <Star size={20} fill="currentColor"/>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{takeaway}</p>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Canvas Wizard */}
      <section className="py-12 border-t border-slate-200/50">
          <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 font-cute">พร้อมสร้างโครงงานของตัวเองหรือยัง?</h3>
              <p className="text-slate-500 mb-8">ลองใช้เครื่องมือร่างเค้าโครงโครงงาน (Project Canvas) เพื่อจัดระเบียบไอเดียของคุณ</p>
              
              {!showCanvas ? (
                  <button 
                    onClick={() => setShowCanvas(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto animate-pulse"
                  >
                      <Rocket size={24}/> เริ่มร่างโครงงาน (Project Workshop)
                  </button>
              ) : (
                  <div className="bg-white rounded-[30px] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in text-left">
                      <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                          <h4 className="font-bold text-xl flex items-center gap-2"><Edit3/> Project Canvas Wizard</h4>
                          <button onClick={() => setShowCanvas(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><ChevronDown/></button>
                      </div>
                      
                      <div className="p-8 grid md:grid-cols-2 gap-8">
                          {/* Inputs */}
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ชื่อโครงงาน (Project Name)</label>
                                  <input type="text" value={canvasData.name} onChange={e => setCanvasData({...canvasData, name: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 ring-indigo-300 outline-none" placeholder="ตั้งชื่อเท่ๆ ให้โครงงาน..."/>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ปัญหาที่พบ (Pain Point)</label>
                                  <textarea value={canvasData.problem} onChange={e => setCanvasData({...canvasData, problem: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 ring-indigo-300 outline-none h-24" placeholder="ปัญหาคืออะไร? เกิดกับใคร?"/>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">กลุ่มเป้าหมาย (Target User)</label>
                                  <input type="text" value={canvasData.target} onChange={e => setCanvasData({...canvasData, target: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 ring-indigo-300 outline-none" placeholder="ใครคือผู้ใช้งานหลัก?"/>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">แนวทางแก้ไข (Solution)</label>
                                  <textarea value={canvasData.solution} onChange={e => setCanvasData({...canvasData, solution: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 ring-indigo-300 outline-none h-24" placeholder="จะสร้างอะไรเพื่อแก้ปัญหา?"/>
                              </div>
                          </div>

                          {/* Preview Card */}
                          <div className="flex flex-col">
                              <div className="bg-gradient-to-br from-slate-100 to-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col relative print:border-black">
                                  <div className="absolute top-4 right-4 text-slate-300"><Rocket size={48} className="opacity-20"/></div>
                                  <div className="text-xs font-bold text-brand-indigo uppercase tracking-widest mb-1">Project Concept Card</div>
                                  <h2 className="text-2xl font-bold text-slate-800 mb-6 font-cute break-words">{canvasData.name || 'ชื่อโครงงาน...'}</h2>
                                  
                                  <div className="space-y-4 flex-1">
                                      <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                                          <div className="text-[10px] font-bold text-red-500 uppercase">Problem</div>
                                          <p className="text-sm text-slate-700">{canvasData.problem || '-'}</p>
                                      </div>
                                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                          <div className="text-[10px] font-bold text-brand-blue uppercase">Target User</div>
                                          <p className="text-sm text-slate-700">{canvasData.target || '-'}</p>
                                      </div>
                                      <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                          <div className="text-[10px] font-bold text-green-500 uppercase">Solution</div>
                                          <p className="text-sm text-slate-700">{canvasData.solution || '-'}</p>
                                      </div>
                                  </div>
                                  
                                  <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-end">
                                      <div className="text-[10px] text-slate-400">Created with CS Learning Platform</div>
                                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-bold text-xs border-2 border-indigo-200 rotate-12">
                                          Draft
                                      </div>
                                  </div>
                              </div>
                              <button onClick={() => window.print()} className="mt-4 w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                                  <Download size={18}/> พิมพ์/บันทึกการ์ด (Print PDF)
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </section>

      {/* Future of Design and Technology */}
      <section className="bg-gradient-to-br from-brand-cyan to-brand-blue p-8 rounded-[30px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold font-cute">อนาคตของการออกแบบและเทคโนโลยี</h3>
            <p className="text-cyan-100 text-sm">การเตรียมพร้อมสำหรับโลกที่เปลี่ยนแปลง</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Rocket size={20} className="text-yellow-300"/> เทรนด์สำคัญในอนาคต
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2"></div>
                  <div>
                    <div className="font-bold text-sm">Sustainable Design</div>
                    <div className="text-xs opacity-90">การออกแบบที่คำนึงถึงสิ่งแวดล้อม</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2"></div>
                  <div>
                    <div className="font-bold text-sm">Human-Centered AI</div>
                    <div className="text-xs opacity-90">AI ที่ช่วยเหลือมนุษย์อย่างแท้จริง</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2"></div>
                  <div>
                    <div className="font-bold text-sm">Metaverse Integration</div>
                    <div className="text-xs opacity-90">การผสมผสานโลกจริงกับโลกเสมือน</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star size={20} className="text-pink-300"/> ทักษะที่ต้องพัฒนา
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-300 rounded-full mt-2"></div>
                  <div>
                    <div className="font-bold text-sm">Systems Thinking</div>
                    <div className="text-xs opacity-90">การคิดเชิงระบบและการแก้ปัญหาที่ซับซ้อน</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-300 rounded-full mt-2"></div>
                  <div>
                    <div className="font-bold text-sm">Digital Literacy</div>
                    <div className="text-xs opacity-90">ความรู้ด้านดิจิทัลและเทคโนโลยี</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-300 rounded-full mt-2"></div>
                  <div>
                    <div className="font-bold text-sm">Creative Problem Solving</div>
                    <div className="text-xs opacity-90">การแก้ปัญหาอย่างสร้างสรรค์</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Assessment Section */}
      <SelfAssessment
        title={"📝 ประเมินความเข้าใจ"}
        levels={[
          { heading: 'ข้อมูลพื้นฐาน', colorClass: 'text-green-600', prefix: <CheckCircle2 size={24}/>, items: ['ทำความเข้าใจขั้นตอน 6 ขั้นของการออกแบบวิศวกรรม','บอกได้ว่าทรัพย์สินทางปัญญามีกี่ประเภท','รู้ความแตกต่างระหว่าง Copyright กับ Patent'] },
          { heading: 'ระดับกลาง', colorClass: 'text-blue-600', prefix: <CheckSquare size={24}/>, items: ['วิเคราะห์กรณีศึกษาและหาจุดที่สำคัญได้','เลือกสัญญาอนุญาต Creative Commons ได้อย่างถูกต้อง','จัดทำแผนโครงงานได้ตามกระบวนการ'] },
          { heading: 'ระดับสูง', colorClass: 'text-purple-600', prefix: <Star size={24}/>, items: ['สร้างโครงงานที่ยึดหลักจริยธรรมและเคารพ IP','นำเสนอผลงานได้อย่างมีประสิทธิภาพ','คิดถึงผลกระทบต่อสังคมและสิ่งแวดล้อม'] }
        ]}
      />

      {/* Reflection & Next Steps */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[30px] border-2 border-amber-200 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
          <Lightbulb size={28}/> สะท้อนความคิด (Reflection)
        </h3>
        
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500">
            <h4 className="font-bold text-amber-900 mb-2">❓ คำถามชี้ชวนสะท้อนความคิด</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li>1. โครงงานแนวไหนที่คุณอยากสร้างขึ้น? อยากแก้ปัญหาอะไร?</li>
              <li>2. คุณจะตรวจสอบให้แน่ใจว่าสิทธิทางปัญญาไม่ถูกละเมิดได้อย่างไร?</li>
              <li>3. ผลกระทบทางสังคม บวก/ลบ ของโครงงานคุณจะเป็นอย่างไร?</li>
              <li>4. ขั้นตอนไหนของ 6 ขั้นการออกแบบ ที่คุณชอบที่สุด? ทำไม?</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
            <h4 className="font-bold text-green-900 mb-2">🚀 ขั้นตอนต่อไป</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>📋 สำหรับนักเรียน: ลองสร้างโครงงานของตัวเองตามขั้นตอน 6 ขั้น</li>
              <li>🔗 ค้นหากรณีศึกษาอื่น ๆ ที่สนใจและวิเคราะห์เชิงลึก</li>
              <li>🎨 นำเสนอโครงงานเป็นรูปแบบโปสเตอร์ พื้นผิว หรือวิดีโอ</li>
              <li>🏆 แข่งขันโครงงาน หรือเสนอให้ผู้อื่นให้ข้อเสนอแนะ</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};

export default UnitFive;
