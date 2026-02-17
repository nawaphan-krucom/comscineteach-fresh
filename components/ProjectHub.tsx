import React, { useState, DragEvent } from 'react';
import { useData } from '../contexts/DataContext';
import type { Project, ProjectTask } from '../types';
import { ArrowLeft, PlusCircle, Trash2, BrainCircuit, Briefcase, CheckCircle2, Circle, Edit2, X, Save } from './icons/EmojiIcons';
import { SDLC_STEPS } from '../constants';
import ProjectIdeaGenerator from './ProjectIdeaGenerator';
import ConfirmationDialog from './ConfirmationDialog';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  updateProject: (project: Project) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack, updateProject }) => {
  const [tasks, setTasks] = useState(project.tasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: ProjectTask['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(newTasks);
    updateProject({ ...project, tasks: newTasks });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleToggleTask = (taskId: string) => {
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: task.status === 'done' ? ('todo' as const) : ('done' as const) } : task
    );
    setTasks(newTasks);
    updateProject({ ...project, tasks: newTasks });
  };

  const handleEditTask = (taskId: string, content: string) => {
    setEditingTaskId(taskId);
    setEditingContent(content);
  };

  const handleSaveEdit = (taskId: string) => {
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...task, content: editingContent } : task
    );
    setTasks(newTasks);
    updateProject({ ...project, tasks: newTasks });
    setEditingTaskId(null);
    setEditingContent('');
  };

  const handleAddTask = () => {
    if (!newTaskContent.trim()) return;
    const newTask: ProjectTask = {
      id: `task_${Date.now()}`,
      content: newTaskContent,
      status: 'todo' as const
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    updateProject({ ...project, tasks: newTasks });
    setNewTaskContent('');
  };

  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    updateProject({ ...project, tasks: newTasks });
    setTaskToDelete(null);
  };

  const columns: { status: ProjectTask['status']; title: string; color: string }[] = [
    { status: 'todo', title: 'To Do', color: 'bg-slate-100' },
    { status: 'inprogress', title: 'In Progress', color: 'bg-blue-100' },
    { status: 'done', title: 'Done', color: 'bg-green-100' },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <ConfirmationDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete)}
        title="ลบ Task นี้?"
        message="คุณแน่ใจหรือว่าต้องการลบ Task นี้ออกจากโครงงาน?"
        confirmText="ลบ"
        variant="danger"
      />
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute">{project.title}</h1>
          <p className="text-slate-500 text-sm">{project.description}</p>
        </div>
      </header>

      {/* Add New Task */}
      <div className="flex gap-2 mb-6 shrink-0">
        <input
          type="text"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="พิมพ์ Task ใหม่..."
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-700 text-sm"
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskContent.trim()}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <PlusCircle size={18}/>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-hidden md:overflow-y-hidden custom-scrollbar pb-4 -mb-4">
        {columns.map(col => (
          <div
            key={col.status}
            onDrop={(e) => handleDrop(e, col.status)}
            onDragOver={handleDragOver}
            className={`p-4 rounded-2xl ${col.color} flex flex-col w-72 md:w-auto shrink-0 min-h-[300px]`}
          >
            <h3 className="font-bold text-slate-600 mb-4 px-2 shrink-0">{col.title} ({tasks.filter(t => t.status === col.status).length})</h3>
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 -mr-1">
              {tasks.filter(t => t.status === col.status).map(task => (
                <div key={task.id} className="space-y-2">
                  {editingTaskId === task.id ? (
                    <div className="flex gap-2 bg-white p-2 rounded-lg">
                      <input
                        autoFocus
                        type="text"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(task.id);
                          if (e.key === 'Escape') setEditingTaskId(null);
                        }}
                        className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <button onClick={() => handleSaveEdit(task.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Save size={14}/>
                      </button>
                      <button onClick={() => setEditingTaskId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <X size={14}/>
                      </button>
                    </div>
                  ) : (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing group flex items-start gap-2 hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="shrink-0 mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.status === 'done' ? (
                          <CheckCircle2 size={18} className="text-green-600"/>
                        ) : (
                          <Circle size={18}/>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium break-words ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {task.content}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditTask(task.id, task.content)}
                        className="p-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit task"
                      >
                        <Edit2 size={14}/>
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task.id)}
                        className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete task"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectHubProps {
  onBack: () => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({ onBack }) => {
  const { userProgress, updateProject, deleteProject } = useData();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdeaGenOpen, setIsIdeaGenOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreateProject = () => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title,
      description,
      status: 'active',
      isPublic: false,
      createdAt: new Date().toISOString(),
      tasks: SDLC_STEPS.map(step => ({
        id: `task_${step.step}`,
        content: `${step.step}. ${step.title}`,
        status: 'todo'
      }))
    };
    updateProject(newProject);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); 
    setProjectToDelete(projectId);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      if (activeProject?.id === projectToDelete) {
        setActiveProject(null);
      }
      setProjectToDelete(null);
    }
  };

  if (isIdeaGenOpen) {
    return <ProjectIdeaGenerator onBack={() => setIsIdeaGenOpen(false)} />;
  }
  
  if (activeProject) {
    return <ProjectDetailView project={activeProject} onBack={() => setActiveProject(null)} updateProject={updateProject} />;
  }

  const projects = userProgress?.projects || [];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        title="ยืนยันการลบโครงงาน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโครงงานนี้? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบอย่างถาวร"
        confirmText="ลบ"
        variant="danger"
      />
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute">ศูนย์รวมโครงงาน (Project Hub)</h1>
          <p className="text-slate-500 text-sm">จัดการและติดตามความคืบหน้าโครงงานของคุณ</p>
        </div>
      </header>

      <div className="flex justify-end gap-4 mb-6">
        <button onClick={() => setIsIdeaGenOpen(true)} className="px-5 py-2.5 bg-yellow-400 text-yellow-900 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-yellow-500 transition-all">
            <BrainCircuit size={18}/> AI ช่วยคิดไอเดีย
        </button>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            <PlusCircle size={18}/> สร้างโครงงานใหม่
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 h-full bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <Briefcase size={48} className="opacity-50 mb-4"/>
                <p className="font-bold text-slate-500">ยังไม่มีโครงงาน</p>
                <p className="text-sm">เริ่มสร้างโครงงานแรกของคุณได้เลย!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => {
              const doneTasks = proj.tasks.filter(t => t.status === 'done').length;
              const totalTasks = proj.tasks.length;
              const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

              return (
                <div key={proj.id} onClick={() => setActiveProject(proj)} className="glass-card p-6 rounded-3xl flex flex-col group cursor-pointer">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight pr-4">{proj.title}</h3>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${proj.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${proj.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        {proj.status}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 h-10">{proj.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">ความคืบหน้า</span>
                        <span className="text-indigo-600">{doneTasks}/{totalTasks} Tasks</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-2 rounded-full">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                      เปิด Kanban Board
                    </button>
                    <button onClick={(e) => handleDeleteProject(e, proj.id)} className="p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4 font-cute">สร้างโครงงานใหม่</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ชื่อโครงงาน</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ชื่อโครงงาน" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-800"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">คำอธิบายสั้นๆ</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="คำอธิบายสั้นๆ" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 h-24 focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-800"/>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">✨ ระบบจะสร้าง Task เริ่มต้นตามหลัก SDLC 5 ขั้นตอนให้โดยอัตโนมัติ</p>
                <div className="flex gap-4 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">ยกเลิก</button>
                    <button onClick={handleCreateProject} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">สร้าง</button>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProjectHub;
