import ExcelJS from 'exceljs';

export type UnitSummary = {
  unit: { id: string; title?: string; order?: number };
  assessments: Array<{ id: string; maxScore?: number; title?: string; type?: string }>;
  totalMaxScore: number;
};

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function getUnitScoreForStudent(studentId: string, unit: UnitSummary, allProgress: Record<string, any>): { score: number; max: number } {
  const p = allProgress?.[studentId] || {};
  let total = 0;
  for (const a of unit.assessments) {
    let score = 0;
    if (String(a.id).startsWith('notebook_')) {
      const uid = String(a.id).replace('notebook_', '');
      score = p.notebookScores?.[uid] || 0;
    } else if (a.type === 'quiz') {
      score = p.quizzes?.[String(a.id)]?.score || 0;
    } else if (a.type === 'activity') {
      score = p.activities?.[String(a.id)]?.score || 0;
    } else if (a.type === 'assignment') {
      score = p.assignments?.[String(a.id)]?.score || 0;
    }
    total += Number(score || 0);
  }
  return { score: total, max: unit.totalMaxScore || 0 };
}

export function buildGradebookCsv(students: any[], unitsSummary: UnitSummary[], allProgress: Record<string, any>): string {
  const headers = ['studentId', 'name', 'class', 'totalScore', 'totalMax', ...unitsSummary.map(u => `${u.unit.id}_score`), ...unitsSummary.map(u => `${u.unit.id}_pct`)];
  const rows: string[] = [];
  rows.push(headers.join(','));

  for (const s of students) {
    const name = s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : s.name || '';
    let totalScore = 0;
    let totalMax = 0;
    const perUnitScores: number[] = [];

    for (const unit of unitsSummary) {
      const { score, max } = getUnitScoreForStudent(s.id, unit, allProgress);
      perUnitScores.push(score);
      totalScore += score;
      totalMax += max || 0;
    }

    const pctCols = perUnitScores.map((sc, i) => {
      const max = unitsSummary[i]?.totalMaxScore || 0;
      return max ? Math.round((sc / max) * 100) : 0;
    });

    const cols = [s.id, name, `${s.classLevel || ''}/${s.room || ''}`, totalScore, totalMax, ...perUnitScores, ...pctCols];
    rows.push(cols.map(csvEscape).join(','));
  }

  return rows.join('\n') + '\n';
}

export function buildModalDetailsCsv(student: any, unitSummary: UnitSummary, allProgress?: Record<string, any>): string {
  const rows: string[] = [];
  rows.push(['assessmentId', 'assessmentTitle', 'score', 'maxScore', 'percentage'].join(','));
  for (const a of unitSummary.assessments) {
    const { score } = getUnitScoreForStudent(student.id, { ...unitSummary, assessments: [a], totalMaxScore: a.maxScore || 0 }, allProgress || {});
    const max = a.maxScore || 0;
    const pct = max ? Math.round((score / max) * 100) : 0;
    rows.push([a.id, a.title || a.id, score, max, pct].map(csvEscape).join(','));
  }
  return rows.join('\n') + '\n';
}

export async function exportModalDetailsToXlsx(student: any, unitSummary: UnitSummary, allProgress?: Record<string, any>): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Details');
  ws.addRow(['Assessment', 'Score', 'Max', 'Percentage']);
  for (const a of unitSummary.assessments) {
    const { score } = getUnitScoreForStudent(student.id, { ...unitSummary, assessments: [a], totalMaxScore: a.maxScore || 0 }, allProgress || {});
    const max = a.maxScore || 0;
    const pct = max ? Math.round((score / max) * 100) : 0;
    ws.addRow([a.title || a.id, score, max, pct]);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gradebook_details_${student.id}_${unitSummary.unit.id}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportGradebookToXlsx(students: any[], unitsSummary: UnitSummary[], allProgress: Record<string, any>): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Gradebook');

  const header = ['studentId', 'name', 'class', 'totalScore', 'totalMax', ...unitsSummary.map(u => `${u.unit.id}_score`), ...unitsSummary.map(u => `${u.unit.id}_pct`)];
  ws.addRow(header);

  for (const s of students) {
    let totalScore = 0;
    let totalMax = 0;
    const perUnitScores: number[] = [];
    for (const unit of unitsSummary) {
      const { score, max } = getUnitScoreForStudent(s.id, unit, allProgress);
      perUnitScores.push(score);
      totalScore += score;
      totalMax += max || 0;
    }
    const pctCols = perUnitScores.map((sc, i) => {
      const max = unitsSummary[i]?.totalMaxScore || 0;
      return max ? Math.round((sc / max) * 100) : 0;
    });
    const name = s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : s.name || '';
    ws.addRow([s.id, name, `${s.classLevel || ''}/${s.room || ''}`, totalScore, totalMax, ...perUnitScores, ...pctCols]);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gradebook_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default {
  buildGradebookCsv,
  buildModalDetailsCsv,
  exportModalDetailsToXlsx,
  exportGradebookToXlsx,
};
