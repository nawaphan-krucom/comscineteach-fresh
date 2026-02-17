export type UnitSummary = {
  unit: { id: string };
  assessments: Array<{ id: string; maxScore?: number; title?: string; type?: string }>;
  totalMaxScore: number;
};

export function buildGradebookCsv(students: any[], unitsSummary: UnitSummary[], allProgress: Record<string, any>): string {
  // Minimal CSV stub for build-time type safety. Real implementation can
  // serialize student rows and unit scores here.
  return 'id,name,score\n';
}

export function buildModalDetailsCsv(student: any, unitSummary: UnitSummary, allProgress?: Record<string, any>): string {
  // Include optional allProgress for more detailed export rows when provided
  return 'field,value\n';
}

export async function exportModalDetailsToXlsx(student: any, unitSummary: UnitSummary, allProgress?: Record<string, any>): Promise<void> {
  // Stub: real implementation can use XLSX or other library.
  return;
}

export async function exportGradebookToXlsx(students: any[], unitsSummary: UnitSummary[], allProgress: Record<string, any>): Promise<void> {
  return;
}

export default {
  buildGradebookCsv,
  buildModalDetailsCsv,
  exportModalDetailsToXlsx,
  exportGradebookToXlsx,
};
