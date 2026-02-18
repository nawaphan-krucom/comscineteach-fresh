import React, { useState } from 'react';
import type { Notification } from '../types';
import { Bell, ChevronRight, Clock, BellOff, ArrowLeft, CheckCircle, MessageSquare, Trophy, FileText, Info } from './icons/EmojiIcons';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNavigate: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onNavigate, onMarkAsRead, onMarkAllAsRead }) => {
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  if (!isOpen) return null;

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      onMarkAsRead(notif.id);
    }
    setViewingNotification(notif);
  };
  
  const handleActionClick = () => {
    if (viewingNotification) {
        onNavigate(viewingNotification);
        onClose(); // Close the whole panel
    }
  };

  const timeSince = (timestamp: number) => {
      const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
      if (seconds < 60) return "เมื่อสักครู่";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
      const days = Math.floor(hours / 24);
      return `${days} วันที่แล้ว`;
  };

  const fullDateTime = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('th-TH', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  const getNotificationIcon = (type: Notification['type'], size = 24) => {
    const props = { size };
    switch (type) {
        case 'announcement': return <Bell {...props} className="text-amber-500" />;
        case 'deadline': return <Clock {...props} className="text-red-500" />;
        case 'grading': return <CheckCircle {...props} className="text-green-500" />;
        case 'qna': return <MessageSquare {...props} className="text-blue-500" />;
        case 'achievement': return <Trophy {...props} className="text-yellow-500" />;
        case 'submission': return <FileText {...props} className="text-indigo-500" />;
        default: return <Info {...props} className="text-slate-500" />;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[69]"
        onClick={onClose}
      />
      <div className="fixed top-[60px] right-2 md:right-4 z-[70] w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="glass-card mac-window p-0 flex flex-col max-h-[540px] h-[540px] overflow-hidden">
          
          {viewingNotification ? (
            // DETAIL VIEW
            <div className="flex flex-col h-full animate-fade-in">
              <header className="p-4 flex items-center gap-2 border-b border-slate-200 shrink-0 bg-slate-50/50">
                <button onClick={() => setViewingNotification(null)} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft size={18}/></button>
                <h3 className="font-bold text-slate-700">รายละเอียดการแจ้งเตือน</h3>
              </header>
              <div className="flex-1 overflow-y-auto p-6 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                  {getNotificationIcon(viewingNotification.type, 32)}
                </div>
                <p className="text-base font-medium text-slate-800 leading-relaxed">{viewingNotification.message}</p>
                <p className="text-xs text-slate-400 mt-4"><Clock size={12} className="inline-block mr-1"/> {fullDateTime(viewingNotification.timestamp)}</p>
              </div>
              {viewingNotification.link && (
                <footer className="p-4 border-t border-slate-100 shrink-0">
                    <button onClick={handleActionClick} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg hover:scale-[1.02] transition-all">
                        ไปยังหน้าที่เกี่ยวข้อง <ChevronRight size={16} />
                    </button>
                </footer>
              )}
            </div>
          ) : (
            // LIST VIEW
            <>
              <header className="p-4 flex justify-between items-center border-b border-slate-200 shrink-0">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Bell size={18}/> การแจ้งเตือน</h3>
                <button onClick={onMarkAllAsRead} className="text-xs font-bold text-indigo-500 hover:text-indigo-700">อ่านทั้งหมด</button>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                    <BellOff size={32} className="opacity-50"/>
                    <p>ไม่มีการแจ้งเตือนใหม่</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 p-3 space-y-2">
                    {notifications.map(notif => (
                      <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`glass-card notification-item p-3 rounded-xl flex items-center gap-3 transition-transform transform hover:-translate-y-0.5 cursor-pointer border ${!notif.isRead ? 'border-indigo-100 bg-indigo-50 shadow' : 'border-transparent bg-white/60 dark:bg-slate-800/60'}`}
                      >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                              {getNotificationIcon(notif.type, 18)}
                          </div>

                          <div className="flex-1">
                              <p className={`text-sm font-medium ${!notif.isRead ? 'text-slate-800' : 'text-slate-500'}`}>{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock size={12}/> {timeSince(notif.timestamp)}</p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {!notif.isRead ? <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500 text-white font-bold">ใหม่</span> : <span className="text-xs text-slate-400">{timeSince(notif.timestamp)}</span>}
                            <ChevronRight size={16} className="text-slate-300"/>
                          </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
