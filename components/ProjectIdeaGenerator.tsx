import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Sparkles, Loader2, BrainCircuit } from './icons/EmojiIcons';
import { useError } from '../contexts/ErrorContext';

interface Idea {
    title: string;
    description: string;
}

interface ProjectIdeaGeneratorProps {
  onBack: () => void;
}

const ProjectIdeaGenerator: React.FC<ProjectIdeaGeneratorProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('สิ่งแวดล้อม');
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const { logError } = useError();

  const handleGenerate = async () => {
    setIsLoading(true);
    setIdeas([]);

    try {
      logError('ฟีเจอร์ AI ยังไม่พร้อมใช้งานบนฝั่งไคลเอนต์ โปรดตั้งค่า backend เพื่อใช้งาน', 'error');
    } catch (e) {
      console.error('AI Idea Gen Fallback Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const TOPICS = ['สิ่งแวดล้อม', 'การเรียน', 'สุขภาพ', 'ความปลอดภัย', 'เกม', 'ดนตรีและศิลปะ'];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={32}/> เครื่องมือสร้างไอเดียโครงงาน
          </h1>
          <p className="text-slate-500 text-sm">ใช้ AI ช่วยคิดหัวข้อโครงงานที่คุณสนใจ</p>
        </div>
      </header>

      <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-lg flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">1. เลือกหมวดหมู่ที่สนใจ</label>
            <select 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none font-medium text-slate-800"
            >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
            {isLoading ? <Loader2 size={24} className="animate-spin"/> : <Sparkles size={24}/>}
            {isLoading ? 'AI กำลังคิด...' : 'สร้างไอเดีย!'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {ideas.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 h-full">
                <BrainCircuit size={48} className="opacity-20 mb-4"/>
                <p className="font-bold">ไอเดียของคุณจะปรากฏที่นี่</p>
                <p className="text-sm">เลือกหมวดหมู่แล้วกด &quot;สร้างไอเดีย&quot; ได้เลย</p>
            </div>
        )}

        {isLoading && (
             <div className="flex flex-col items-center justify-center text-center text-slate-400 h-full">
                <Loader2 size={48} className="opacity-50 mb-4 animate-spin"/>
                <p className="font-bold">AI กำลังระดมสมอง...</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                            <Lightbulb size={18}/>
                        </div>
                        <h3 className="font-bold text-slate-800">{idea.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{idea.description}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectIdeaGenerator;
