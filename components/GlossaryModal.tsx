import React, { useState } from 'react';
import { BookA, Search, X } from './icons/EmojiIcons';
import { GLOSSARY_TERMS } from '../constants';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter(item => 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.def.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden relative border border-white/20 animate-scale-in">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <BookA size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-cute">พจนานุกรมคำศัพท์</h3>
                        <p className="text-xs text-slate-400">Glossary of Terms</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>

            {/* Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="ค้นหาคำศัพท์..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                        autoFocus
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-100">
                <div className="space-y-3">
                    {filteredTerms.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                            <h4 className="font-bold text-indigo-700 mb-1">{item.term}</h4>
                            <p className="text-sm text-slate-600 font-medium">{item.def}</p>
                        </div>
                    ))}
                    {filteredTerms.length === 0 && (
                        <div className="text-center py-10 text-slate-400">ไม่พบคำศัพท์ที่ค้นหา</div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default GlossaryModal;