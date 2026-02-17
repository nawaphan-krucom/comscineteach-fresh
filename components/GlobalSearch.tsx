
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Book, PlayCircle, FileText, BookA, ChevronRight, Hash, Command, Layout, BarChart3, UserCircle, MessageSquare, FolderOpen } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { GLOSSARY_TERMS } from '../constants';
import { ViewState } from '../types';

interface SearchResult {
    id: string;
    type: 'unit' | 'resource' | 'glossary' | 'action';
    title: string;
    description: string;
    target: string | ViewState;
    icon?: React.ReactNode;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: ViewState | string) => void;
    onNavigateToResources: (unitId: string) => void;
    onOpenGlossary: (term?: string) => void;
}

const QUICK_ACTIONS = [
    { id: 'action-home', title: 'ไปที่หน้าหลัก', view: ViewState.HOME, icon: <Layout size={20}/> },
    { id: 'action-dash', title: 'ดูผลการเรียน', view: ViewState.DASHBOARD, icon: <BarChart3 size={20}/> },
    { id: 'action-profile', title: 'แก้ไขโปรไฟล์', view: ViewState.PROFILE, icon: <UserCircle size={20}/> },
    { id: 'action-comm', title: 'เปิดคอมมูนิตี้', view: ViewState.COMMUNICATION, icon: <MessageSquare size={20}/> },
    { id: 'action-res', title: 'ดูสื่อการสอนทั้งหมด', view: ViewState.RESOURCES, icon: <FolderOpen size={20}/> },
];

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate, onNavigateToResources, onOpenGlossary }) => {
    const { courseUnits, resources } = useData();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
        }
    }, [isOpen]);

    const results = useMemo(() => {
        const q = query.toLowerCase().trim();

        if (q.length < 1) {
             return QUICK_ACTIONS.map(action => ({
                id: action.id,
                type: 'action' as const,
                title: action.title,
                description: `Navigate to ${action.title}`,
                target: action.view,
                icon: action.icon,
            }));
        }

        const searchResults: SearchResult[] = [];

        // 1. Search Actions
        QUICK_ACTIONS.forEach(action => {
            if (action.title.toLowerCase().includes(q)) {
                 searchResults.push({
                    id: action.id,
                    type: 'action' as const,
                    title: action.title,
                    description: `Navigate to ${action.title}`,
                    target: action.view,
                    icon: action.icon,
                });
            }
        });

        // 2. Search Units
        courseUnits.forEach(unit => {
            if (unit.subtitle.toLowerCase().includes(q) || unit.title.toLowerCase().includes(q) || unit.description.toLowerCase().includes(q)) {
                searchResults.push({
                    id: `unit-${unit.id}`,
                    type: 'unit',
                    title: unit.subtitle,
                    description: unit.description,
                    target: unit.id
                });
            }
        });

        // 3. Search Resources
        resources.forEach(unitRes => {
            // Videos
            unitRes.videos.forEach(v => {
                if (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)) {
                    searchResults.push({
                        id: `res-v-${v.title}`,
                        type: 'resource',
                        title: v.title,
                        description: `วิดีโอใน ${unitRes.unitTitle}`,
                        target: unitRes.unitId
                    });
                }
            });
            // PDFs
            unitRes.pdfs.forEach(p => {
                if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
                    searchResults.push({
                        id: `res-p-${p.title}`,
                        type: 'resource',
                        title: p.title,
                        description: `เอกสารใน ${unitRes.unitTitle}`,
                        target: unitRes.unitId
                    });
                }
            });
        });

        // 4. Search Glossary
        GLOSSARY_TERMS.forEach(item => {
            if (item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q)) {
                searchResults.push({
                    id: `glossary-${item.term}`,
                    type: 'glossary',
                    title: item.term,
                    description: item.def,
                    target: item.term
                });
            }
        });

        return searchResults.slice(0, 10); // Limit results
    }, [query, courseUnits, resources]);

    if (!isOpen) return null;

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'action' || result.type === 'unit') {
            onNavigate(result.target as ViewState | string);
        } else if (result.type === 'resource') {
            onNavigateToResources(result.target as string);
        } else if (result.type === 'glossary') {
            onOpenGlossary(result.target as string);
        }
        onClose();
    };
    
    const getResultIcon = (result: SearchResult) => {
        if (result.icon) return result.icon;
        switch (result.type) {
            case 'unit': return <Book size={20}/>;
            case 'resource': return result.id.includes('-v-') ? <PlayCircle size={20}/> : <FileText size={20}/>;
            case 'glossary': return <BookA size={20}/>;
            default: return <ChevronRight size={20}/>;
        }
    };
    
    const getIconContainerClass = (result: SearchResult) => {
        switch (result.type) {
            case 'action': return 'bg-indigo-100 text-indigo-600';
            case 'unit': return 'bg-blue-100 text-blue-600';
            case 'resource': return 'bg-pink-100 text-pink-600';
            case 'glossary': return 'bg-amber-100 text-amber-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 md:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-white/20 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20}/>
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="ค้นหาบทเรียน, วิดีโอ, หรือคำศัพท์..." 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium text-lg"
                        />
                        <button 
                            onClick={onClose}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 px-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Command size={10}/> Quick Search Enabled
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
                    {query.length > 0 && query.length < 2 && (
                        <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
                            <Hash size={32} className="opacity-20"/>
                            <p className="text-sm font-bold">พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา</p>
                        </div>
                    )}

                    {query.length >= 2 && results.length === 0 && (
                        <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
                            <Search size={32} className="opacity-20"/>
                            <p className="text-sm font-bold">ไม่พบข้อมูลสำหรับ &quot;{query}&quot;</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 px-2">
                               {query.length === 0 ? 'Quick Actions' : `Search Results (${results.length})`}
                            </h4>
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-indigo-50 transition-all group border border-transparent hover:border-indigo-100"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm ${getIconContainerClass(result)}`}>
                                        {getResultIcon(result)}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <h5 className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-700 transition-colors">{result.title}</h5>
                                        {result.type !== 'action' && <p className="text-xs text-slate-400 truncate leading-relaxed">{result.description}</p>}
                                    </div>
                                    <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"/>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Command Palette v2.0</span>
                    <button onClick={onClose} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700">ESC TO CLOSE</button>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;