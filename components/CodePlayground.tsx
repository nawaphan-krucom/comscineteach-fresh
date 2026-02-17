import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Code, Terminal } from './icons/EmojiIcons';

const CodePlayground: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [language, setLanguage] = useState<'python' | 'html'>('python');
  
  const defaultPython = `print("Hello, World!")\n\n# ลองเขียนโปรแกรมคำนวณเกรด\nscore = 80\nif score >= 80:\n    print("Grade A")\nelse:\n    print("Grade B")`;
  const defaultHtml = `<h1>Hello World</h1>\n<p>This is my first web page.</p>\n<style>\n  h1 { color: blue; }\n</style>`;
  
  const [code, setCode] = useState(defaultPython);
  const [output, setOutput] = useState('');

  // Auto-load draft on mount or language change
  useEffect(() => {
    const draft = localStorage.getItem(`playground_draft_${language}`);
    if (draft !== null) {
      setCode(draft);
    } else {
      setCode(language === 'python' ? defaultPython : defaultHtml);
    }
  }, [language]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(`playground_draft_${language}`, code);
    }, 1000); // Save 1 second after user stops typing
    return () => clearTimeout(handler);
  }, [code, language]);

  const handleRun = () => {
    setOutput("กำลังประมวลผล...");
    
    setTimeout(() => {
        if (language === 'python') {
            // Mock Python Output
            if (code.includes('print')) {
                let mockOutput = "";
                const lines = code.split('\n');
                lines.forEach(line => {
                    if (line.trim().startsWith('print')) {
                        const match = line.match(/print\((["'])(.*?)\1\)/);
                        if (match) mockOutput += match[2] + "\n";
                    }
                });
                // Simple logic simulation for the default code
                if (code.includes('score = 80') && code.includes('if score >= 80')) {
                    mockOutput = "Hello, World!\nGrade A";
                }
                
                setOutput(mockOutput || "Program executed successfully. (Output simulation limited)");
            } else {
                setOutput("Program executed successfully.");
            }
        } else {
            // HTML Preview
            setOutput("HTML Preview Updated Below");
        }
    }, 800);
  };

  const handleReset = () => {
      const defaultCode = language === 'python' ? defaultPython : defaultHtml;
      setCode(defaultCode);
      localStorage.removeItem(`playground_draft_${language}`);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
        <header className="flex items-center justify-between mb-4 shrink-0">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
                    <Code className="text-purple-500" size={32}/> ห้องทดลองเขียนโค้ด (Coding Lab)
                </h1>
                <p className="text-slate-500 text-sm">ฝึกเขียนโปรแกรมและดูผลลัพธ์ทันที (บันทึกอัตโนมัติ)</p>
            </div>
            {onBack && (
                <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 underline">
                    กลับหน้าหลัก
                </button>
            )}
        </header>

        <div className="flex gap-4 mb-4">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                <button 
                    onClick={() => { setLanguage('python'); }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === 'python' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Python 🐍
                </button>
                <button 
                    onClick={() => { setLanguage('html'); }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === 'html' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    HTML/CSS 🌐
                </button>
            </div>
            <button onClick={handleRun} className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-md flex items-center gap-2 transition-all active:scale-95">
                <Play size={18}/> รันโค้ด (Run)
            </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Editor */}
            <div className="flex-1 bg-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg border border-slate-700">
                <div className="bg-slate-900 px-4 py-2 text-slate-400 text-xs font-mono flex justify-between items-center">
                    <span>main.{language === 'python' ? 'py' : 'html'}</span>
                    <button 
                        title="Reset Code" 
                        className="cursor-pointer hover:text-white bg-transparent border-none p-0 text-inherit flex items-center"
                        onClick={handleReset}
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
                <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 w-full bg-slate-800 text-slate-100 p-4 font-mono text-sm outline-none resize-none custom-scrollbar leading-6"
                    spellCheck={false}
                ></textarea>
            </div>

            {/* Output */}
            <div className="flex-1 flex flex-col gap-4 min-h-[200px]">
                <div className="bg-black rounded-2xl flex-1 overflow-hidden flex flex-col shadow-lg border border-slate-800">
                    <div className="bg-slate-900 px-4 py-2 text-slate-400 text-xs font-mono flex items-center gap-2">
                        <Terminal size={14}/> Console Output
                    </div>
                    <div className="flex-1 p-4 font-mono text-green-400 text-sm whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                        {language === 'python' ? output : '> HTML Rendered Below...'}
                    </div>
                </div>
                
                {language === 'html' && (
                    <div className="bg-white rounded-2xl flex-1 border-2 border-slate-200 overflow-hidden shadow-sm relative">
                        <div className="absolute top-0 left-0 bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 rounded-br-lg border-r border-b border-slate-200 z-10">
                            Browser Preview
                        </div>
                        <iframe 
                            srcDoc={code} 
                            title="preview" 
                            className="w-full h-full border-none"
                            sandbox="allow-scripts"
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CodePlayground;