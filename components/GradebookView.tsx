import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { User, UserProgress } from '../types';
import { DEFAULT_COURSE_UNITS, NOTEBOOK_MAX_SCORE, UNIT_QUIZZES, UNIT_ACTIVITIES, UNIT_ASSIGNMENTS, MIDTERM_EXAM, FINAL_EXAM } from '../constants';
import { FileSpreadsheet, Download, AlertCircle, List, LayoutGrid, Eye, Search, BarChart3, FileText, CheckSquare, Square, Zap, Bell } from './icons/EmojiIcons';
import { buildGradebookCsv, buildModalDetailsCsv, exportModalDetailsToXlsx, exportGradebookToXlsx, type UnitSummary } from './utils/gradebookExport';
import { startModalFocusTrap } from './utils/modalFocusTrap';
import { useTheme } from '../contexts/ThemeContext';

interface GradebookViewProps {
  students: User[];
  allProgress: Record<string, UserProgress>;
}

const GradebookView: React.FC<GradebookViewProps> = ({ students, allProgress }) => {
  const { theme } = useTheme();
  const { unitsSummary } = useMemo(() => {
    const unitsSummary = DEFAULT_COURSE_UNITS.map(unit => {
      const assessments = [
        { id: `notebook_${unit.id}`, maxScore: NOTEBOOK_MAX_SCORE, title: 'Notebook', type: 'notebook' },
        // Add quiz for this unit
        ...UNIT_QUIZZES.filter(q => q.id === `unit_${unit.id.split('_')[1]}`).map(q => ({
          id: q.id,
          maxScore: q.maxScore,
          title: q.title,
          type: 'quiz' as const
        })),
        // Add activity for this unit
        ...UNIT_ACTIVITIES.filter(a => a.unitId === unit.id).map(a => ({
          id: a.id,
          maxScore: a.maxScore,
          title: a.title,
          type: 'activity' as const
        })),
        // Add assignment for this unit
        ...UNIT_ASSIGNMENTS.filter(ass => ass.unitId === unit.id).map(ass => ({
          id: ass.id,
          maxScore: ass.maxScore,
          title: ass.title,
          type: 'assignment' as const
        }))
      ];
      const totalMaxScore = assessments.reduce((s, a) => s + (a.maxScore || 0), 0);
      return { unit, assessments, totalMaxScore };
    });
    return { unitsSummary };
  }, []);

  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToPage, setGoToPage] = useState<number>(1);
  const [detailModal, setDetailModal] = useState<{ open: boolean; studentId?: string; unitId?: string }>({ open: false });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(searchQuery);
  const [showCharts, setShowCharts] = useState<boolean>(false);

  // Debounce search input to avoid rapid re-filtering for large datasets
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const [pageTransitionKey, setPageTransitionKey] = useState<number>(0);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([]);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!detailModal.open) return;
    const cleanup = startModalFocusTrap(modalRef.current, () => setDetailModal({ open: false }));
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailModal({ open: false });
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailModal.open]);

  // Focus search input on Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered students (supports search by id/name plus class and unit dropdowns)
  const filteredStudents = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let filtered = students.filter(s => {
      // search by id or name only
      if (q) {
        const idMatch = String(s.id || '').toLowerCase().includes(q);
        const name = (s.firstName && s.lastName) ? `${s.firstName} ${s.lastName}` : s.name || '';
        const nameMatch = name.toLowerCase().includes(q);
        if (!(idMatch || nameMatch)) return false;
      }

      // class filter (compare combined "class/room")
      if (classFilter !== 'all') {
        const clsRoom = `${s.classLevel}/${s.room}`;
        if (clsRoom !== classFilter) return false;
      }

      // unit filter: include only students who have a recorded score (>0) in that unit's assessments
      if (unitFilter !== 'all') {
        const unit = unitsSummary.find(u => u.unit.id === unitFilter);
        const p = allProgress[s.id];
        if (!unit || !p) return false;
        const hasScore = unit.assessments.some(a => {
          if (String(a.id).startsWith('notebook_')) {
            const uid = String(a.id).replace('notebook_', '');
            return (p.notebookScores?.[uid] || 0) > 0;
          }
          if (a.type === 'quiz') return (p.quizzes?.[String(a.id)]?.score || 0) > 0;
          if (a.type === 'activity') return (p?.activities?.[String(a.id)]?.score || 0) > 0;
          if (a.type === 'assignment') return (p.assignments?.[String(a.id)]?.score || 0) > 0;
          return false;
        });
        if (!hasScore) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const aName = (a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.name || '').toLowerCase();
      const bName = (b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : b.name || '').toLowerCase();
      return aName.localeCompare(bName);
    });
    return filtered;
  }, [students, searchQuery, classFilter, unitFilter, unitsSummary, allProgress]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getUnitScore = (studentId: string, unitId: string) => {
    const p = allProgress[studentId];
    if (!p) return { score: 0, maxScore: 0, percentage: 0 };

    const unit = unitsSummary.find(u => u.unit.id === unitId);
    if (!unit) return { score: 0, maxScore: 0, percentage: 0 };

    let totalScore = 0;
    for (const assessment of unit.assessments) {
      let score = 0;
      if (assessment.type === 'notebook') {
        score = p.notebookScores?.[unitId] || 0;
      } else if (assessment.type === 'quiz') {
        score = p.quizzes?.[assessment.id]?.score || 0;
      } else if (assessment.type === 'activity') {
        score = p?.activities?.[assessment.id]?.score || 0;
      } else if (assessment.type === 'assignment') {
        score = p.assignments?.[assessment.id]?.score || 0;
      }
      totalScore += score;
    }

    const max = unit.totalMaxScore;
    const pct = max ? Math.round((totalScore / max) * 100) : 0;
    return { score: totalScore, maxScore: max, percentage: pct };
  };

  // Compute per-unit max width (in ch) based on longest numeric score among visible students
  const unitDisplayWidthMap = useMemo(() => {
    const map: Record<string, number> = {};
    unitsSummary.slice(0, 5).forEach(({ unit, totalMaxScore }) => {
      const lens = paginatedStudents.map(s => String(getUnitScore(s.id, unit.id).score).length);
      const maxLen = Math.max(...lens, String(totalMaxScore).length, 1);
      map[unit.id] = Math.min(Math.max(maxLen, 2), 6); // clamp between 2 and 6 ch
    });
    return map;
  }, [unitsSummary, paginatedStudents]);

  const openDetailModal = (studentId: string, unitId: string) => setDetailModal({ open: true, studentId, unitId });

  const closeDetailModal = () => setDetailModal({ open: false });
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPageTransitionKey(prev => prev + 1);
  };

  const handleExportGradebookCsv = () => {
    const csv = buildGradebookCsv(students, unitsSummary as UnitSummary[], allProgress);
    const uri = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    const a = document.createElement('a'); a.href = uri; a.download = `gradebook_${new Date().toISOString().split('T')[0]}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };
  const handleExportGradebookXlsx = async () => { await exportGradebookToXlsx(students, unitsSummary as UnitSummary[], allProgress); };

  const handleExportGradebookPdf = () => {
    // Simple PDF export using print
    window.print();
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedStudents.size === paginatedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(paginatedStudents.map(s => s.id)));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkExportCsv = () => {
    const selectedStudentData = students.filter(s => selectedStudents.has(s.id));
    const csv = buildGradebookCsv(selectedStudentData, unitsSummary as UnitSummary[], allProgress);
    const uri = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    const a = document.createElement('a'); 
    a.href = uri; 
    a.download = `gradebook_selected_${new Date().toISOString().split('T')[0]}.csv`; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
    addNotification('ส่งออก CSV สำเร็จ', 'success');
  };

  const handleBulkExportXlsx = async () => {
    const selectedStudentData = students.filter(s => selectedStudents.has(s.id));
    await exportGradebookToXlsx(selectedStudentData, unitsSummary as UnitSummary[], allProgress);
    addNotification('ส่งออก XLSX สำเร็จ', 'success');
  };

  // Notifications
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };



  const handleExportModalCsv = () => {
    if (!detailModal.studentId || !detailModal.unitId) return;
    const student = students.find(s => s.id === detailModal.studentId);
    const unit = unitsSummary.find(u => u.unit.id === detailModal.unitId);
    if (!student || !unit) return;
    const csv = buildModalDetailsCsv(student as User, unit as UnitSummary, allProgress);
    const uri = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    const a = document.createElement('a'); a.href = uri; a.download = `gradebook_details_${student.id}_${unit.unit.id}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };
  const handleExportModalXlsx = async () => {
    if (!detailModal.studentId || !detailModal.unitId) return;
    const student = students.find(s => s.id === detailModal.studentId);
    const unit = unitsSummary.find(u => u.unit.id === detailModal.unitId);
    if (!student || !unit) return;
    await exportModalDetailsToXlsx(student as User, unit as UnitSummary, allProgress);
  };

  if (students.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-2xl p-8 text-center text-slate-400 ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : ''}`}>
        <AlertCircle size={32} className="mx-auto mb-2" />
        ไม่มีข้อมูลนักเรียนสำหรับแสดงผลในสมุดพก
      </div>
    );
  }

  return (
    <div>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border transition-all duration-300 ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`bg-slate-50 rounded-2xl p-4 md:p-8 animate-fade-in shadow-sm border border-slate-100 ${theme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute">สมุดพก (Gradebook)</h1>
          <div className="text-slate-500">จัดการและดูคะแนนนักเรียนทั้งหมด</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`p-2 rounded-xl transition-all duration-200 ${showCharts ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'} hover:bg-indigo-50 hover:text-indigo-600 ${theme === 'dark' ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : ''}`}
            aria-label="Toggle performance charts"
          >
            <BarChart3 size={18} />
          </button>

          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`p-2 rounded-xl transition-all duration-200 ${showQuickActions ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'} hover:bg-purple-50 hover:text-purple-600 ${theme === 'dark' ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : ''}`}
            aria-label="Toggle quick actions"
          >
            <Zap size={18} />
          </button>

          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><List size={18}/></button>
            <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><LayoutGrid size={18}/></button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleExportGradebookCsv} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"><Download size={16}/> CSV</button>
            <button onClick={handleExportGradebookXlsx} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2"><FileSpreadsheet size={16}/> XLSX</button>
            <button onClick={handleExportGradebookPdf} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"><FileText size={16}/> PDF</button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-800">
                เลือก {selectedStudents.size} นักเรียน
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExportCsv}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-600 transition-colors"
              >
                <Download size={16} />
                ส่งออก CSV
              </button>
              <button
                onClick={handleBulkExportXlsx}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <FileSpreadsheet size={16} />
                ส่งออก XLSX
              </button>
              <button
                onClick={() => setSelectedStudents(new Set())}
                className="px-3 py-2 bg-slate-500 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="ค้นหาโดย รหัส หรือ ชื่อ-นามสกุล"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
              aria-label="Search students by id or name"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-lg border border-slate-200 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
              aria-label="Filter by class"
            >
              <option value="all">ทุกห้อง</option>
              {[...new Set(students.map(s => {
                if (!s.classLevel && !s.room) return '';
                return `${s.classLevel}/${s.room}`;
              }))].filter(Boolean).sort().map(clsRoom => (
                <option key={clsRoom} value={clsRoom}>ชั้น {clsRoom}</option>
              ))}
            </select>

            <select
              value={unitFilter}
              onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-lg border border-slate-200 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
              aria-label="Filter by unit"
            >
              <option value="all">ทุกหน่วย</option>
              {DEFAULT_COURSE_UNITS.map(u => (
                <option key={u.id} value={u.id}>หน่วย {u.order}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      {showCharts && (
        <div className={`mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : ''}`}>
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            สถิติโดยรวม
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : ''}`}>
              <div className="text-2xl font-bold text-indigo-600">{filteredStudents.length}</div>
              <div className="text-sm text-slate-500">นักเรียนทั้งหมด</div>
            </div>
            <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : ''}`}>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(filteredStudents.filter(s => {
                  const totalScore = unitsSummary.reduce((acc, u) => acc + getUnitScore(s.id, u.unit.id).score, 0);
                  const totalMax = unitsSummary.reduce((acc, u) => acc + u.totalMaxScore, 0);
                  return totalMax ? (totalScore / totalMax) >= 0.8 : false;
                }).length / filteredStudents.length * 100)}%
              </div>
              <div className="text-sm text-slate-500">ดีเยี่ยม (≥80%)</div>
            </div>
            <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : ''}`}>
              <div className="text-2xl font-bold text-blue-600">
                {filteredStudents.reduce((acc, s) => {
                  const totalScore = unitsSummary.reduce((sum, u) => sum + getUnitScore(s.id, u.unit.id).score, 0);
                  const totalMax = unitsSummary.reduce((sum, u) => sum + u.totalMaxScore, 0);
                  return acc + (totalMax ? totalScore / totalMax : 0);
                }, 0) / filteredStudents.length * 100 | 0}%
              </div>
              <div className="text-sm text-slate-500">คะแนนเฉลี่ย</div>
            </div>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 ? (
        <div className={`bg-white rounded-[30px] p-8 text-center text-slate-400 ${theme === 'dark' ? 'bg-slate-800' : ''}`}>
          <AlertCircle size={32} className="mx-auto mb-2" />
          ไม่พบนักเรียน
        </div>
      ) : viewMode === 'table' ? (
        <div>
          {/* Desktop Table */}
          <div key={`table-${pageTransitionKey}`} className="hidden md:block overflow-x-auto custom-scrollbar bg-white rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-b-2 border-indigo-200">
                <tr>
                  <th className="p-3 font-bold text-slate-800 text-left sticky left-0 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                        aria-label={selectedStudents.size === paginatedStudents.length ? "Deselect all" : "Select all"}
                      >
                        {selectedStudents.size === paginatedStudents.length && paginatedStudents.length > 0 ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                      </button>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      ชื่อ-นามสกุล
                    </div>
                  </th>
                  <th className="p-3 font-bold text-slate-800 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      ห้อง
                    </div>
                  </th>
                  {unitsSummary.slice(0,5).map(({ unit, totalMaxScore }) => (
                    <th key={unit.id} className="p-3 font-bold text-slate-800 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex flex-col">
                          <span>หน่วย {unit.order}</span>
                          <span className="text-xs text-slate-500">(คะแนนเต็ม {totalMaxScore})</span>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 font-bold text-slate-800 text-center" data-testid="gradebook-col-midterm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex flex-col">
                        <span>สอบกลางภาค</span>
                        <span className="text-xs text-slate-500">(คะแนนเต็ม {MIDTERM_EXAM.maxScore})</span>
                      </div>
                    </div>
                  </th>
                  <th className="p-3 font-bold text-slate-800 text-center" data-testid="gradebook-col-final">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex flex-col">
                        <span>สอบปลายภาค</span>
                        <span className="text-xs text-slate-500">(คะแนนเต็ม {FINAL_EXAM.maxScore})</span>
                      </div>
                    </div>
                  </th>
                  <th className="p-3 font-bold text-slate-800 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      คะแนนรวม
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => {
                  // Use notebook-only totals for aggregate to match expectations (units notebooks + midterm + final)
                  const unitNotebookScore = DEFAULT_COURSE_UNITS.reduce((acc, u) => acc + (allProgress[student.id]?.notebookScores?.[u.id] || 0), 0);
                  const unitNotebookMax = DEFAULT_COURSE_UNITS.length * NOTEBOOK_MAX_SCORE;
                  // midterm and final scores (quizzes stored outside units)
                  const midtermScore = allProgress[student.id]?.quizzes?.[String(MIDTERM_EXAM.id)]?.score || 0;
                  const finalScore = allProgress[student.id]?.quizzes?.[String(FINAL_EXAM.id)]?.score || 0;
                  const totalScore = unitNotebookScore + midtermScore + finalScore;
                  const totalMax = unitNotebookMax + (MIDTERM_EXAM.maxScore || 0) + (FINAL_EXAM.maxScore || 0);
                  return (
                      <tr key={student.id} className={`hover:bg-slate-50 transition-all duration-150 border-b border-slate-100 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                      <td className="p-3 font-medium text-slate-800 sticky left-0 bg-white/90 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSelectStudent(student.id)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            aria-label={`Select ${student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.name}`}
                          >
                            {selectedStudents.has(student.id) ? (
                              <CheckSquare size={16} className="text-indigo-600" />
                            ) : (
                              <Square size={16} className="text-slate-400" />
                            )}
                          </button>
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold text-sm">
                            {student.firstName?.charAt(0) || student.name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">
                              {student.firstName && student.lastName
                                ? `${student.firstName} ${student.lastName}`.trim()
                                : student.name
                              }
                            </div>
                            <div className="text-xs text-slate-400 font-mono truncate">{student.username} • {student.classLevel}/{student.room}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-slate-100 rounded px-3 py-1 font-medium text-blue-800 text-sm border border-slate-200">
                          {student.classLevel}/{student.room}
                        </span>
                      </td>
                      {unitsSummary.slice(0, 5).map(({ unit }) => {
                        const { score: totalUnitScore, maxScore } = getUnitScore(student.id, unit.id);
                        const percentage = maxScore > 0 ? Math.round((totalUnitScore / maxScore) * 100) : 0;
                        return (
                          <td key={unit.id} className="p-3 text-center">
                            <button
                              data-testid={`gradebook-unit-${unit.id}-score`}
                              onClick={() => openDetailModal(student.id, unit.id)}
                              title={`คะแนนหน่วย ${unit.order}: ${totalUnitScore}/${maxScore} (${percentage}%) - คลิกเพื่อดูรายละเอียด`}
                              className={`inline-flex items-center justify-center rounded px-2 py-1 font-medium text-sm border border-slate-200 bg-slate-50 transition-colors`}
                              style={{ minWidth: `${unitDisplayWidthMap[unit.id] || 3}ch` }}
                            >
                              {String(totalUnitScore)}
                            </button>
                          </td>
                        );
                      })}

                      {/* Midterm column */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => addNotification('เปิดรายละเอียดสอบกลางภาค', 'info')}
                          title={`คะแนนสอบกลางภาค: ${midtermScore}/${MIDTERM_EXAM.maxScore}`}
                          data-testid="gradebook-midterm-score"
                          className={`relative rounded-xl px-4 py-2 font-medium font-bold text-sm shadow-sm border transition-all duration-200`}
                        >
                          {midtermScore}
                        </button>
                      </td>

                      {/* Final column */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => addNotification('เปิดรายละเอียดสอบปลายภาค', 'info')}
                          title={`คะแนนสอบปลายภาค: ${finalScore}/${FINAL_EXAM.maxScore}`}
                          data-testid="gradebook-final-score"
                          className={`relative rounded-xl px-4 py-2 font-medium font-bold text-sm shadow-sm border transition-all duration-200`}
                        >
                          {finalScore}
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <div className="bg-purple-50 rounded px-3 py-2 font-medium text-purple-800 text-sm border border-purple-100">
                          <div className="text-sm" data-testid="gradebook-aggregate-score">{totalScore}/{totalMax}</div>
                          {showQuickActions && (
                            <div className="mt-2 flex gap-1 justify-center">
                              <button
                                onClick={() => openDetailModal(student.id, unitsSummary[0]?.unit.id)}
                                className="p-1 bg-purple-200 hover:bg-purple-300 rounded text-purple-700 transition-colors"
                                title="ดูรายละเอียดหน่วย 1"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => addNotification(`ส่งออกข้อมูลของ ${student.firstName || student.name}`, 'info')}
                                className="p-1 bg-purple-200 hover:bg-purple-300 rounded text-purple-700 transition-colors"
                                title="ส่งออกข้อมูลนักเรียน"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          )}                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Table */}
          <div key={`mobile-${pageTransitionKey}`} className="md:hidden space-y-4 mt-4 animate-fade-in">
            {paginatedStudents.map(student => {
              const totalScore = unitsSummary.reduce((acc, u) => acc + getUnitScore(student.id, u.unit.id).score, 0);
              const totalMax = unitsSummary.reduce((acc, u) => acc + u.totalMaxScore, 0);
              return (
                <div key={student.id} className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 shadow-lg border border-slate-200 transition-all hover:shadow-xl hover:border-indigo-200 hover:scale-[1.02]">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {student.firstName?.charAt(0) || student.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-lg">
                          {student.firstName && student.lastName
                            ? `${student.firstName} ${student.lastName}`.trim()
                            : student.name
                          }
                        </div>
                      </div>
                    </div>
                      <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl px-3 py-2 font-medium font-bold text-blue-800 text-sm shadow-sm border border-blue-200">
                      {student.classLevel}/{student.room}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {unitsSummary.slice(0, 5).map(({ unit }) => {
                      const { score, maxScore } = getUnitScore(student.id, unit.id);
                      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                      return (
                        <div key={unit.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
                          <div className="text-xs text-slate-500 font-semibold mb-3 uppercase tracking-wide">หน่วย {unit.order}</div>
                          <button
                            onClick={() => openDetailModal(student.id, unit.id)}
                            title={`คะแนนหน่วย ${unit.order}: ${score}/${maxScore} (${percentage}%) - คลิกเพื่อดูรายละเอียด`}
                            data-testid={`gradebook-unit-${unit.id}-score`}
                            className={`relative w-full rounded-lg px-3 py-2 font-medium font-bold text-sm shadow-sm border transition-all duration-200`}
                            style={{ minWidth: `${unitDisplayWidthMap[unit.id] || 3}ch` }}
                          >
                            {String(score)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-500 font-semibold mb-3 uppercase tracking-wide">คะแนนรวม</div>
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-200 rounded-2xl px-6 py-4 font-medium font-bold text-purple-800 shadow-lg border border-purple-300 inline-block">
                      <div className="text-2xl">{totalScore}/{totalMax}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Cards View */
        <div key={`cards-${pageTransitionKey}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {paginatedStudents.map(student => {
            const totalScore = unitsSummary.reduce((acc, u) => acc + getUnitScore(student.id, u.unit.id).score, 0);
            const totalMax = unitsSummary.reduce((acc, u) => acc + u.totalMaxScore, 0);

            return (
              <div key={student.id} className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border-2 border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col gap-6 relative group hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {student.firstName?.charAt(0) || student.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-800 text-lg truncate">
                      {student.firstName && student.lastName
                        ? `${student.firstName} ${student.lastName}`.trim()
                        : student.name
                      }
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg px-3 py-1 font-medium font-bold text-blue-800 text-sm inline-block mt-1">
                      {student.classLevel}/{student.room}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {unitsSummary.slice(0, 5).map(({ unit }) => {
                    const { score, maxScore } = getUnitScore(student.id, unit.id);
                    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                    return (
                      <div key={unit.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
                        <div className="text-xs text-slate-500 font-semibold mb-3 uppercase tracking-wide">หน่วย {unit.order}</div>
                        <button
                          onClick={() => openDetailModal(student.id, unit.id)}
                          title={`คะแนนหน่วย ${unit.order}: ${score}/${maxScore} (${percentage}%) - คลิกเพื่อดูรายละเอียด`}
                          className={`relative w-full rounded-lg px-3 py-2 font-medium font-bold text-sm shadow-sm border transition-all duration-200`}
                        >
                          {String(score)}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-100 p-5 rounded-2xl mt-auto border border-purple-200">
                  <div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">คะแนนรวม</div>
                    <div className="font-black text-2xl text-indigo-600">{totalScore}</div>
                    <div className="text-sm text-slate-500">/ {totalMax} คะแนน</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div>

      {/* Footer */}
      <div className={`mt-8 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 shadow-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-sm font-semibold text-slate-600">
            หน้า <span className="text-indigo-600 font-bold">{currentPage}</span> / <span className="text-slate-800 font-bold">{totalPages}</span>
          </span>
        
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">ไปหน้า</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(Math.max(1, Math.min(totalPages, Number(e.target.value) || 1)))}
              onKeyDown={(e) => e.key === 'Enter' && handlePageChange(goToPage)}
              className={`w-16 px-2 py-1 text-center rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`}
              aria-label="Go to page"
            />
            <button
              onClick={() => handlePageChange(goToPage)}
              className="px-2 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors"
            >
              ไป
            </button>
          </div>

          <button
            onClick={() => handlePageChange(Math.max(1,currentPage-1))}
            disabled={currentPage===1}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
              currentPage===1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:scale-105'
            }`}
            aria-label="Previous page"
          >
            ← ก่อนหน้า
          </button>
          <button
            onClick={() => handlePageChange(Math.min(totalPages,currentPage+1))}
            disabled={currentPage===totalPages}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
              currentPage===totalPages
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:scale-105'
            }`}
            aria-label="Next page"
          >
            ถัดไป →
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {detailModal.open && (
        <div role="dialog" aria-modal="true" aria-labelledby="gradebook-modal-title" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetailModal}></div>
          <div ref={modalRef} tabIndex={-1} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 z-10 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h4 id="gradebook-modal-title" className="text-xl font-bold text-slate-800">
                รายละเอียดหน่วยที่ {unitsSummary.find(u => u.unit.id === detailModal.unitId)?.unit.order || ''}
              </h4>
              <div className="flex items-center gap-2">
                <button onClick={handleExportModalCsv} aria-label="Export details as CSV" className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2 font-medium"><Download size={16}/> CSV</button>
                <button onClick={handleExportModalXlsx} aria-label="Export details as XLSX" className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2 font-medium"><FileSpreadsheet size={16}/> XLSX</button>
                <button onClick={closeDetailModal} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200 font-medium">ปิด</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailModal.studentId && detailModal.unitId && (unitsSummary.find(u => u.unit.id === detailModal.unitId)?.assessments)?.map(a => {
                let score: number | undefined = undefined;
                const sid = detailModal.studentId!;
                if (String(a.id).startsWith('notebook_')) {
                  const uid = String(a.id).replace('notebook_', '');
                  score = allProgress[sid]?.notebookScores?.[uid];
                } else {
                  score = (allProgress[sid]?.quizzes?.[String(a.id)]?.score) || (allProgress[sid]?.assignments?.[String(a.id)]?.score) || (allProgress[sid]?.activities?.[String(a.id)]?.score) || 0;
                }
                return (
                  <div key={String(a.id)} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="font-medium text-slate-800 mb-2">{a.title || String(a.id)}</div>
                    <div className="bg-slate-100 rounded-md px-3 py-2 font-medium font-bold text-slate-700 text-center">{(score ?? '-')}/{a.maxScore}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradebookView;
