import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useError } from '../contexts/ErrorContext';
import { ArrowLeft, Users, PlusCircle, Search, X, MessageSquare, BookOpen, Briefcase, Code, Coffee } from './icons/EmojiIcons';
import type { StudyGroup } from '../types';

// FIX: Gamepad2 icon is not available in the current lucide-react version. Using a standard icon instead.
const GamepadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <path d="M17.32 5H6.68a4 4 0 0 0-3.97 3.59c-.2 1.65.83 2.95 2.53 3.25" />
        <path d="M17.32 5H6.68a4 4 0 0 1 3.97 3.59c.2 1.65-.83 2.95-2.53 3.25" />
        <path d="M10 19H8" />
        <path d="M14 19h2" />
        <path d="M12 17v2" />
    </svg>
);


interface StudyGroupsViewProps {
  onBack: () => void;
}

const StudyGroupsView: React.FC<StudyGroupsViewProps> = ({ onBack }) => {
    const { studyGroups, user, allUsers, createStudyGroup, joinStudyGroup } = useData();
    const { logError } = useError();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingGroup, setViewingGroup] = useState<StudyGroup | null>(null);

    // Form state for new group
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    const getGroupTheme = (name: string): { icon: React.ReactNode; color: string } => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('สอบ') || lowerName.includes('ติว') || lowerName.includes('exam')) {
            return { icon: <BookOpen size={24} />, color: 'bg-amber-100 text-amber-600' };
        }
        if (lowerName.includes('โครงงาน') || lowerName.includes('project')) {
            return { icon: <Briefcase size={24} />, color: 'bg-purple-100 text-purple-600' };
        }
        if (lowerName.includes('เกม') || lowerName.includes('game')) {
            return { icon: <GamepadIcon />, color: 'bg-red-100 text-red-600' };
        }
        if (lowerName.includes('โค้ด') || lowerName.includes('code') || lowerName.includes('programming')) {
            return { icon: <Code size={24} />, color: 'bg-blue-100 text-blue-600' };
        }
        if (lowerName.includes('คุยเล่น') || lowerName.includes('general')) {
            return { icon: <Coffee size={24} />, color: 'bg-green-100 text-green-600' };
        }
        return { icon: <Users size={24} />, color: 'bg-slate-100 text-slate-600' };
    };

    const filteredGroups = studyGroups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleCreateGroup = () => {
        if (!newGroupName.trim() || !newGroupDesc.trim() || !user) {
            logError('กรุณากรอกชื่อและคำอธิบายกลุ่ม', 'warning');
            return;
        }

        createStudyGroup({
            name: newGroupName,
            description: newGroupDesc,
            members: [user.id],
            createdBy: user.id
        });
        
        logError('สร้างกลุ่มสำเร็จแล้ว!', 'success');
        setNewGroupName('');
        setNewGroupDesc('');
        setIsCreateModalOpen(false);
    };

    const handleJoinGroup = (groupId: string) => {
        joinStudyGroup(groupId);
        logError('เข้าร่วมกลุ่มสำเร็จ!', 'success');
        // Refresh viewing group data
        setViewingGroup(prev => prev ? { ...studyGroups.find(g => g.id === groupId)! } : null);
    };
    
    const getMemberName = (id: string) => allUsers.find(u => u.id === id)?.name || 'Unknown';

    return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
            <Users className="text-emerald-500" size={32}/> กลุ่มเรียนรู้ (Study Groups)
          </h1>
          <p className="text-slate-500 text-sm">พื้นที่ทำงานร่วมกับเพื่อนและแลกเปลี่ยนความรู้</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
                type="text"
                placeholder="ค้นหากลุ่ม..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 ring-emerald-300 outline-none"
            />
        </div>
        <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all"
        >
            <PlusCircle size={20}/> สร้างกลุ่มใหม่
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
        {filteredGroups.length === 0 ? (
             <div className="text-center py-20 text-slate-400 bg-white/40 rounded-3xl border border-dashed border-slate-300">
                <p>ไม่พบกลุ่มที่ค้นหา หรือยังไม่มีกลุ่มถูกสร้าง</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => {
                    const theme = getGroupTheme(group.name);
                    const isMember = user ? group.members.includes(user.id) : false;
                    return (
                        <div key={group.id} onClick={() => setViewingGroup(group)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.color}`}>
                                    {theme.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">{group.name}</h3>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-grow min-h-[60px]">{group.description}</p>
                            
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                    <Users size={14}/> {group.members.length} Members
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isMember) {
                                            handleJoinGroup(group.id);
                                        }
                                    }}
                                    disabled={isMember} 
                                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${isMember ? 'bg-slate-200 text-slate-500 cursor-default' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                                >
                                    {isMember ? 'เข้าร่วมแล้ว' : 'เข้าร่วม'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4 font-cute">สร้างกลุ่มเรียนรู้ใหม่</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ชื่อกลุ่ม</label>
                        <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="เช่น กลุ่มติวสอบปลายภาค" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium text-slate-800"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">คำอธิบายกลุ่ม</label>
                        <textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="เกี่ยวกับกลุ่มของเรา..." className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium text-slate-800"/>
                    </div>
                </div>
                <div className="flex gap-4 mt-6">
                    <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">ยกเลิก</button>
                    <button onClick={handleCreateGroup} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold">สร้างกลุ่ม</button>
                </div>
              </div>
          </div>
      )}

      {/* View Group Details Modal */}
      {viewingGroup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[80vh]">
                <header className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{viewingGroup.name}</h3>
                        <p className="text-sm text-slate-500">{viewingGroup.description}</p>
                    </div>
                    <button onClick={() => setViewingGroup(null)} className="p-2 rounded-full hover:bg-slate-100"><X/></button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-500 mb-3">สมาชิก ({viewingGroup.members.length})</h4>
                        <div className="flex flex-wrap gap-2">
                            {viewingGroup.members.map(id => (
                                <span key={id} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-slate-700 border border-slate-200">{getMemberName(id)}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl text-center border-2 border-dashed border-blue-200">
                        <MessageSquare className="mx-auto text-blue-300 mb-2" size={32}/>
                        <h4 className="font-bold text-blue-800">Group Chat & Shared Tasks</h4>
                        <p className="text-sm text-blue-600">กำลังจะมาในเร็วๆ นี้!</p>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 border-t border-slate-200">
                    {!viewingGroup.members.includes(user?.id || '') ? (
                        <button onClick={() => handleJoinGroup(viewingGroup.id)} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold">เข้าร่วมกลุ่มนี้</button>
                    ): (
                        <div className="text-center text-sm font-bold text-green-600">คุณเป็นสมาชิกของกลุ่มนี้แล้ว</div>
                    )}
                </footer>
              </div>
          </div>
      )}
    </div>
  );
};

export default StudyGroupsView;
