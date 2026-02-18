
import React from 'react';
import { X, Printer, BookOpen } from './icons/EmojiIcons';

interface KnowledgeSheetViewProps {
  title: string;
  content: string; // HTML string
  onClose: () => void;
}

const KnowledgeSheetView: React.FC<KnowledgeSheetViewProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={24}/>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{title}</h3>
              <p className="text-xs text-slate-500">ใบความรู้ประกอบการเรียน (Knowledge Sheet)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => window.print()}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="พิมพ์"
            >
                <Printer size={20}/>
            </button>
            <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <X size={20}/>
            </button>
          </div>
        </div>

        {/* Content - Paper Style */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-8 custom-scrollbar">
            <div className="max-w-[210mm] mx-auto bg-white min-h-full shadow-lg p-[20mm] text-slate-800 print:shadow-none print:w-full">
                <div 
                    className="prose prose-slate max-w-none prose-headings:font-cute prose-headings:text-indigo-900 prose-p:leading-relaxed prose-li:marker:text-indigo-500"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                
                <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                    เอกสารประกอบการเรียนรายวิชาวิทยาการคำนวณและการออกแบบเทคโนโลยี<br/>
                    © {new Date().getFullYear()} School Learning Platform
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default KnowledgeSheetView;
