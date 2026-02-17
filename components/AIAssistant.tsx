import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, BrainCircuit, Bot, User as UserIcon, Loader2 } from './icons/EmojiIcons';
import { useError } from '../contexts/ErrorContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'สวัสดีจ้า! พี่ AI Tutor พร้อมช่วยเหลือน้องๆ แล้วนะ มีคำถามเกี่ยวกับ Computational Thinking, SDLC หรือการออกแบบวิศวกรรม ถามพี่ได้เลย!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { logError } = useError();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      logError('ฟีเจอร์ AI ยังไม่พร้อมใช้งานบนฝั่งไคลเอนต์ โปรดตั้งค่า backend เพื่อใช้งาน', 'error');
      setMessages(prev => [...prev, { role: 'model', text: 'ขณะนี้ฟีเจอร์ AI ยังไม่พร้อมใช้งานในเวอร์ชันเว็บนี้ — โปรดตั้งค่า server-side AI endpoint เพื่อใช้งาน' }]);
    } catch (error: unknown) {
      console.error('AI Fallback Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-16 h-16 mac-action bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-float"
        >
          <Sparkles size={32} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] w-[90vw] md:w-[420px] h-[600px] max-h-[85vh] mac-window glass-card flex flex-col overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight font-cute">พี่ AI Tutor</h3>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Active Now
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 mac-action text-white hover:opacity-95 transition-colors"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={16} />
            </button> 
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-violet-100 text-violet-600 border border-violet-200'}`}>
                  {msg.role === 'user' ? <UserIcon size={16}/> : <Bot size={16}/>}
                </div>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={16}/>
                 </div>
                 <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-violet-100 shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-violet-500"/>
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="มีเรื่องสงสัย ถามพี่มาได้เลย..."
                className="w-full pl-4 pr-12 py-3.5 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 outline-none text-slate-700 text-sm font-medium"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-200"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">
              Powered by Gemini 3.0 Flash
            </p>
          </form>

        </div>
      )}
    </>
  );
};

export default AIAssistant;