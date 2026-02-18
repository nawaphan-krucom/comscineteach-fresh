import React from 'react';


interface WorkedExampleProps {
  id?: string;
  title: string;
  description: string;
  code?: string;
  explanation?: string;
}

const WorkedExampleCard: React.FC<WorkedExampleProps> = ({ title, description, code, explanation }) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">🔍</div>
        <div className="flex-1">
          <div className="font-semibold text-slate-700">{title}</div>
          <div className="text-sm text-slate-500 mt-1">{description}</div>
        </div>
      </div>
      {code && <pre className="mt-3 text-sm bg-slate-50 p-3 rounded-md overflow-auto"><code>{code}</code></pre>}
      {explanation && <div className="mt-2 text-sm text-slate-600">{explanation}</div>}
    </div>
  );
};

export default WorkedExampleCard;