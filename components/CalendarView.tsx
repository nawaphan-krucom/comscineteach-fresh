
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle } from './icons/EmojiIcons';
import { UNIT_ASSIGNMENTS } from '../constants';
import { useData } from '../contexts/DataContext';

interface CalendarViewProps {
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const { userProgress } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getAssignmentsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return UNIT_ASSIGNMENTS.filter(a => new Date(a.deadline).toDateString() === dateStr);
  };

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ChevronLeft size={20}/>
        </button>
        <div>
            <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
                <CalendarIcon className="text-indigo-500" size={32}/> ปฏิทินการศึกษา
            </h1>
            <p className="text-slate-500 text-sm">ติดตามกำหนดการส่งงานและกิจกรรมสำคัญ</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-[30px] shadow-lg border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronLeft/></button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronRight/></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
                    <div key={day} className="text-slate-400 font-bold text-sm py-2">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const assignments = getAssignmentsForDate(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();

                    return (
                        <div 
                            key={day} 
                            onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                            className={`p-2 rounded-xl border min-h-[80px] relative cursor-pointer transition-all hover:shadow-md flex flex-col items-start gap-1
                                ${isSelected ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-white'}
                                ${isToday ? 'bg-blue-50/50' : ''}
                            `}
                        >
                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-slate-600'}`}>
                                {day}
                            </span>
                            
                            <div className="flex flex-col gap-1 w-full">
                                {assignments.map((a, idx) => (
                                    <div key={idx} className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded truncate w-full font-bold">
                                        ส่ง: {a.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Details Sidebar */}
        <div className="lg:w-80 bg-white/50 backdrop-blur-sm rounded-[30px] border border-white p-6 shadow-sm flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-700 mb-2 font-cute border-b border-slate-200 pb-2">
                {selectedDate ? `งานวันที่ ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}` : 'งานในเดือนนี้'}
            </h3>

            {selectedDate ? (
                // Show selected date assignments
                getAssignmentsForDate(selectedDate.getDate()).length > 0 ? (
                    getAssignmentsForDate(selectedDate.getDate()).map(assign => {
                        const isSubmitted = userProgress?.assignments?.[assign.id];
                        return (
                            <div key={assign.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded uppercase">{assign.unitId}</span>
                                    {isSubmitted ? <CheckCircle size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-500"/>}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{assign.title}</h4>
                                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{assign.description}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock size={12}/> กำหนดส่ง: {new Date(assign.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 text-slate-400">ไม่มีงานที่ต้องส่งในวันนี้</div>
                )
            ) : (
                // Show upcoming assignments for the month
                UNIT_ASSIGNMENTS.filter(a => new Date(a.deadline).getMonth() === currentDate.getMonth()).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).map(assign => (
                    <div key={assign.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <span className="text-xs font-bold text-red-500">{new Date(assign.deadline).getDate()} {monthNames[new Date(assign.deadline).getMonth()]}</span>
                        </div>
                        <h4 className="font-bold text-slate-700 text-sm">{assign.title}</h4>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
