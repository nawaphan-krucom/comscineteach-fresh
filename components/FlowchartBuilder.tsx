import React, { useState, useRef, DragEvent } from 'react';
import { ArrowLeft, Download, MousePointer, Trash2, Save } from './icons/EmojiIcons';

interface FlowchartBuilderProps {
  onBack: () => void;
}

interface Shape {
  id: number;
  type: 'terminator' | 'process' | 'decision' | 'io';
  text: string;
  x: number;
  y: number;
}

const SHAPE_STYLES = {
  terminator: {
    label: 'Start/End',
    classes: 'bg-red-100 border-red-300 text-red-700 rounded-full w-24 h-12',
    textClass: '',
  },
  process: {
    label: 'Process',
    classes: 'bg-blue-100 border-blue-300 text-blue-700 w-28 h-16',
    textClass: '',
  },
  decision: {
    label: 'Decision',
    classes: 'bg-yellow-100 border-yellow-300 text-yellow-700 w-20 h-20 transform rotate-45',
    textClass: 'transform -rotate-45',
  },
  io: {
    label: 'Input/Output',
    classes: 'bg-green-100 border-green-300 text-green-700 w-28 h-16 transform -skew-x-12',
    textClass: 'transform skew-x-12',
  },
};

const FlowchartBuilder: React.FC<FlowchartBuilderProps> = ({ onBack }) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleToolbarDragStart = (e: DragEvent<HTMLDivElement>, type: Shape['type']) => {
    e.dataTransfer.setData('shapeType', type);
  };

  const handleShapeDragStart = (e: DragEvent<HTMLDivElement>, shape: Shape) => {
    e.dataTransfer.setData('shapeId', shape.id.toString());
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const shapeId = e.dataTransfer.getData('shapeId');

    if (shapeId) { // Moving an existing shape
      const newX = e.clientX - canvasRect.left - dragOffset.current.x;
      const newY = e.clientY - canvasRect.top - dragOffset.current.y;
      setShapes(prevShapes =>
        prevShapes.map(shape =>
          shape.id === parseInt(shapeId) ? { ...shape, x: newX, y: newY } : shape
        )
      );
    } else { // Adding a new shape
      const type = e.dataTransfer.getData('shapeType') as Shape['type'];
      if (!type) return;

      const newShape: Shape = {
        id: Date.now(),
        type,
        text: SHAPE_STYLES[type].label,
        x: e.clientX - canvasRect.left - 56, // Adjust for half shape width
        y: e.clientY - canvasRect.top - 32,  // Adjust for half shape height
      };
      setShapes([...shapes, newShape]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeShape = (id: number) => {
    setShapes(shapes.filter(s => s.id !== id));
  };

  const updateShapeText = (id: number, newText: string) => {
    setShapes(prevShapes =>
      prevShapes.map(shape =>
        shape.id === id ? { ...shape, text: newText.replace(/\n/g, '') } : shape
      )
    );
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
      <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
                <ArrowLeft size={20}/>
            </button>
            <div>
                <h1 className="text-xl font-bold text-slate-800 font-cute">Flowchart Builder</h1>
                <p className="text-xs text-slate-500">ลากสัญลักษณ์มาวาง | Double-click เพื่อแก้ไข้อความ</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-200">
                <Save size={16}/> Save Draft
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                <Download size={16}/> Export PNG
            </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <aside className="w-40 md:w-48 bg-white p-4 border-r border-slate-200 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">เครื่องมือ</h3>
          {Object.entries(SHAPE_STYLES).map(([type, style]) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleToolbarDragStart(e, type as Shape['type'])}
              className="p-2 border border-dashed border-slate-300 rounded-lg cursor-grab hover:bg-indigo-50"
            >
              <div className={`mx-auto flex items-center justify-center border-2 text-xs font-bold ${style.classes}`}>
                <span className={style.textClass}>{style.label}</span>
              </div>
            </div>
          ))}
          <div className="mt-auto text-center text-xs text-slate-400 bg-slate-50 p-2 rounded-lg">
            ลากสัญลักษณ์ไปวางบนพื้นที่ด้านขวา
          </div>
        </aside>

        {/* Canvas */}
        <main
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex-1 bg-slate-50 relative overflow-auto custom-scrollbar"
          style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {shapes.map(shape => (
            <div
              key={shape.id}
              draggable
              onDragStart={(e) => handleShapeDragStart(e, shape)}
              onDoubleClick={(e) => {
                  const range = document.createRange();
                  range.selectNodeContents(e.currentTarget.querySelector('span')!);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              }}
              className={`absolute flex items-center justify-center border-2 text-xs font-bold cursor-grab active:cursor-grabbing hover:ring-2 ring-indigo-400 ${SHAPE_STYLES[shape.type].classes}`}
              style={{ left: shape.x, top: shape.y }}
            >
              <span 
                contentEditable
                suppressContentEditableWarning={true}
                className={`w-full h-full flex items-center justify-center outline-none ${SHAPE_STYLES[shape.type].textClass}`}
                onBlur={(e) => updateShapeText(shape.id, e.currentTarget.innerText)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).blur();
                    }
                }}
              >
                {shape.text}
              </span>
              <button 
                onClick={() => removeShape(shape.id)} 
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 size={10}/>
              </button>
            </div>
          ))}

          {shapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
              <div className="text-center">
                <MousePointer size={40} className="mx-auto mb-2"/>
                <p className="font-bold">Drop Zone</p>
                <p>ลากสัญลักษณ์มาวางที่นี่</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FlowchartBuilder;
