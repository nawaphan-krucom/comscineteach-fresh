
import React from 'react';
import type { User } from '../types';
import { Award, FileSignature, ArrowLeft, Printer } from './icons/EmojiIcons';

interface CertificateViewProps {
  user: User;
  onBack: () => void;
}

const CertificateView: React.FC<CertificateViewProps> = ({ user, onBack }) => {
  const date = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center text-white print:hidden">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
              <ArrowLeft size={20}/> กลับหน้าหลัก
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-bold">
              <Printer size={20}/> พิมพ์เกียรติบัตร
          </button>
      </div>

      <div className="bg-white p-2 w-full max-w-[297mm] aspect-[297/210] shadow-2xl relative overflow-hidden print:shadow-none print:w-[297mm] print:h-[210mm] print:absolute print:top-0 print:left-0">
         <div className="w-full h-full border-[20px] border-double border-indigo-900 p-10 flex flex-col items-center justify-between text-center relative bg-[#fffdf0] print:border-indigo-900">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-200 rounded-full blur-[100px] opacity-50 print:hidden"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200 rounded-full blur-[100px] opacity-50 print:hidden"></div>

            {/* Header */}
            <div className="mt-8">
               <div className="flex justify-center mb-6">
                   <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg print:shadow-none print:text-black">
                       <Award size={64} className="text-white print:text-indigo-900"/>
                   </div>
               </div>
               <h1 className="text-5xl font-bold text-indigo-900 font-cute tracking-wide uppercase">เกียรติบัตรจบหลักสูตร</h1>
               <p className="text-xl text-indigo-600 mt-2 font-medium">Certificate of Completion</p>
            </div>

            {/* Content */}
            <div className="space-y-6 my-auto w-full">
               <p className="text-lg text-slate-600">ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า</p>
               <h2 className="text-4xl font-bold text-slate-800 border-b-2 border-slate-300 pb-2 inline-block px-12 min-w-[50%]">
                   {user.name}
               </h2>
               <p className="text-lg text-slate-600 mt-4">
                   ได้ผ่านการเรียนรู้และทดสอบในรายวิชา
               </p>
               <h3 className="text-3xl font-bold text-indigo-800 mt-2">
                   วิทยาการคำนวณและการออกแบบเทคโนโลยี
               </h3>
               <p className="text-lg text-indigo-600 font-medium">
                   (Computer Science & Design Technology)
               </p>
               <p className="text-slate-600 mt-2">
                   ด้วยความมุ่งมั่น ตั้งใจ และมีผลการเรียนรู้ผ่านเกณฑ์ที่กำหนด
               </p>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-between items-end px-16 mb-12">
               <div className="text-center">
                   <div className="text-lg font-bold text-slate-700">{date}</div>
                   <div className="border-t border-slate-400 w-40 mt-1"></div>
                   <p className="text-sm text-slate-500 mt-1">วันที่สำเร็จการศึกษา</p>
               </div>

               <div className="flex flex-col items-center">
                   <div className="w-24 h-24 mb-2 relative">
                        {/* Fake Seal */}
                        <div className="absolute inset-0 border-4 border-amber-500 rounded-full flex items-center justify-center opacity-80 rotate-12 print:border-amber-600">
                            <div className="w-full text-[8px] text-amber-600 font-bold text-center uppercase tracking-widest absolute top-2">Official Verified</div>
                            <Award size={40} className="text-amber-500 print:text-amber-600"/>
                            <div className="w-full text-[8px] text-amber-600 font-bold text-center uppercase tracking-widest absolute bottom-2">Excellent</div>
                        </div>
                   </div>
               </div>

               <div className="text-center">
                   <div className="h-10 flex items-end justify-center relative">
                        <FileSignature className="text-indigo-800 opacity-80 absolute bottom-0" size={48}/>
                   </div>
                   <div className="text-lg font-bold text-slate-700 mt-1">( ครูผู้สอนวิชาเทคโนโลยี )</div>
                   <div className="border-t border-slate-400 w-48 mt-1"></div>
                   <p className="text-sm text-slate-500 mt-1">ลายมือชื่อผู้สอน</p>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default CertificateView;