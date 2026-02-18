
import React, { useState, useEffect, useMemo } from 'react';
import { Book, PlayCircle, FileText, Youtube, X, Link as LinkIcon, Search, Filter } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import KnowledgeSheetView from './KnowledgeSheetView';
import { Skeleton, ListSkeleton } from './Skeleton';

// Helper to extract YouTube ID
const getYouTubeID = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

interface ResourcesViewProps {
  onBack: () => void;
  initialUnitId?: string | null;
}

const ResourcesView: React.FC<ResourcesViewProps> = ({ onBack, initialUnitId }) => {
  const { resources } = useData();
  const [activeUnit, setActiveUnit] = useState<string>(initialUnitId || '');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf' | 'link'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New State for Reading Internal Content
  const [readingSheet, setReadingSheet] = useState<{title: string, content: string} | null>(null);

  // This effect ensures the view correctly selects a unit when resources load or change.
  useEffect(() => {
    // If an initial unit is specified, prioritize it once resources are loaded.
    if (initialUnitId && resources.some(r => r.unitId === initialUnitId)) {
        setActiveUnit(prev => prev !== initialUnitId ? initialUnitId : prev);
    } 
    // Otherwise, if no unit is active or the current one is invalid, default to the first available one.
    else if (resources.length > 0 && !resources.some(r => r.unitId === activeUnit)) {
        setActiveUnit(resources[0].unitId);
    }
  }, [resources, initialUnitId]);

  const currentUnitResources = resources.find(u => u.unitId === activeUnit);

  const getDomain = (url: string) => {
      try {
          const domain = new URL(url).hostname;
          return domain.replace('www.', '');
      } catch {
          return url;
      }
  };

  const filteredResources = useMemo(() => {
    if (!currentUnitResources) return [];
    
    const all = [
        ...currentUnitResources.videos.map(v => ({ ...v, type: 'video' as const })),
        ...currentUnitResources.pdfs.map(p => ({ ...p, type: 'pdf' as const })),
        ...(currentUnitResources.links || []).map(l => ({ ...l, type: 'link' as const }))
    ];

    return all.filter(res => {
        const matchesType = filterType === 'all' || res.type === filterType;
        const matchesQuery = res.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesQuery;
    });
  }, [currentUnitResources, filterType, searchQuery]);

  const handleResourceClick = (resource: typeof filteredResources[0]) => {
      if (resource.type === 'pdf' && resource.content) {
          setReadingSheet({ title: resource.title, content: resource.content });
      } else {
          window.open(resource.url, '_blank');
      }
  };

  return (
    <div className="animate-fade-in space-y-6 relative h-full flex flex-col">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition md:hidden">
             <X size={20}/>
          </button>
          <div>
            <h1 className="font-cute text-3xl text-gray-700 flex items-center gap-2">
                <Book className="text-pink-500" /> สื่อการเรียนรู้ (Learning Resources)
            </h1>
            <p className="text-gray-500 text-sm mt-1">คลังวิดีโอและเอกสารประกอบการเรียนที่ครบถ้วน</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
                type="text" 
                placeholder="ค้นหาสื่อการสอน..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white focus:ring-2 focus:ring-pink-300 outline-none shadow-sm text-sm"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                    <X size={14}/>
                </button>
            )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Sidebar: Unit Selector */}
        <div className="md:w-64 flex flex-col gap-2 shrink-0 bg-white/50 p-4 rounded-[25px] border border-white h-fit overflow-y-auto custom-scrollbar">
          <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2 pl-2">เลือกหน่วยการเรียนรู้</h3>
          {resources.length === 0 ? (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : (
            resources.map((unit) => (
                <button
                key={unit.unitId}
                onClick={() => setActiveUnit(unit.unitId)}
                className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-between group
                    ${activeUnit === unit.unitId 
                    ? 'bg-white text-pink-600 shadow-md ring-1 ring-pink-100' 
                    : 'text-gray-500 hover:bg-white/60'}`}
                >
                <span>{unit.unitTitle.split(':')[0]}</span>
                <span className={`text-[10px] bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-white transition-colors`}>
                    {(unit.videos.length + unit.pdfs.length + (unit.images?.length || 0) + (unit.links?.length || 0))}
                </span>
                </button>
            ))
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-[30px] border border-white p-6 md:p-8 overflow-y-auto custom-scrollbar shadow-sm">
          {resources.length === 0 ? (
            <ListSkeleton items={4} />
          ) : (
             <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-800 font-cute">
                      {currentUnitResources?.unitTitle || 'เลือกหน่วยเรียนรู้'}
                  </h3>
                  {/* Filters */}
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                      {[
                          { id: 'all', label: 'ทั้งหมด', icon: <Filter size={14}/> },
                          { id: 'video', label: 'วิดีโอ', icon: <PlayCircle size={14}/> },
                          { id: 'pdf', label: 'เอกสาร', icon: <FileText size={14}/> },
                          { id: 'link', label: 'เว็บไซต์', icon: <LinkIcon size={14}/> },
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setFilterType(f.id as 'all' | 'video' | 'pdf' | 'link')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
                                  ${filterType === f.id 
                                      ? 'bg-white text-slate-800 shadow-sm' 
                                      : 'text-slate-500 hover:bg-white/50'}`}
                          >
                              {f.icon} {f.label}
                          </button>
                      ))}
                  </div>
                </div>

                {filteredResources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res, idx) => {
                      const ytId = res.type === 'video' ? getYouTubeID(res.url) : null;
                      
                      const Icon = res.type === 'video' ? PlayCircle : res.type === 'pdf' ? FileText : LinkIcon;
                      const color = res.type === 'video' ? 'red' : res.type === 'pdf' ? 'blue' : 'emerald';

                      return (
                        <div 
                            key={idx} 
                            onClick={() => handleResourceClick(res)}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-slate-100 flex flex-col cursor-pointer hover:-translate-y-1"
                        >
                           <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-10">
                                   <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm">
                                      {ytId ? <Youtube size={24} className="text-red-600"/> : <Icon size={24} className={`text-${color}-600`} />}
                                   </div>
                                </div>
                                {ytId ? (
                                    <img 
                                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Video+Thumbnail'; }}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                        alt="Thumbnail"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center bg-${color}-50 text-${color}-300 flex-col gap-2`}>
                                        <Icon size={48} />
                                    </div>
                                )}
                           </div>
                           <div className="p-4 flex flex-col flex-1">
                               <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors h-10">{res.title}</h4>
                               <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">{res.description}</p>
                               
                               <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                   <span className={`font-bold text-${color}-600 bg-${color}-50 px-2 py-1 rounded-md uppercase`}>
                                       {res.type}
                                   </span>
                                   <span className="text-slate-400 flex items-center gap-1">
                                       <LinkIcon size={10}/> {getDomain(res.url)}
                                   </span>
                               </div>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400 font-bold flex flex-col items-center gap-2">
                      <Search size={48} className="opacity-20"/>
                      <span>ไม่พบสื่อการเรียนรู้ที่ตรงกัน</span>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>

      {/* Internal Knowledge Sheet Viewer */}
      {readingSheet && (
          <KnowledgeSheetView 
            title={readingSheet.title}
            content={readingSheet.content}
            onClose={() => setReadingSheet(null)}
          />
      )}
    </div>
  );
};

export default ResourcesView;
