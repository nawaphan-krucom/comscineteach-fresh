import React from 'react';

type Level = {
  heading: string;
  colorClass?: string;
  items: string[];
  prefix?: React.ReactNode;
};

interface SelfAssessmentProps {
  title: string;
  levels: Level[];
  note?: React.ReactNode;
  className?: string;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ title, levels, note, className = '' }) => {
  return (
    <section className={`bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm ${className}`}>
      <h3 className="text-2xl sm:text-3xl font-bold font-cute mb-8 text-center text-slate-900">{title}</h3>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((lvl, idx) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:opacity-100 transition-colors">
            <div className={`font-bold text-lg mb-3 flex items-center gap-2 ${lvl.colorClass ?? 'text-slate-700'}`}>
              {lvl.prefix}
              <span>{lvl.heading}</span>
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
              {lvl.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {note && (
        <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
          {note}
        </div>
      )}
    </section>
  );
};

export default SelfAssessment;
