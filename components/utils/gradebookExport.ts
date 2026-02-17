export type UnitSummary = {
  unit: { id: string };
  assessments: Array<{ id: string; maxScore?: number; title?: string; type?: string }>;
  totalMaxScore: number;
};

export function buildGradebookCsv(_students: any[], _unitsSummary: UnitSummary[], _allProgress: Record<string, any>): string {
  // Minimal CSV stub for build-time type safety. Real implementation can
  // serialize student rows and unit scores here.
  void _students; void _unitsSummary; void _allProgress;
  return 'id,name,score\n';
}

export function buildModalDetailsCsv(_student: any, _unitSummary: UnitSummary, _allProgress?: Record<string, any>): string {
  // Include optional allProgress for more detailed export rows when provided
  void _student; void _unitSummary; void _allProgress;
  return 'field,value\n';
}

export async function exportModalDetailsToXlsx(_student: any, _unitSummary: UnitSummary, _allProgress?: Record<string, any>): Promise<void> {
  // Stub: real implementation can use XLSX or other library.
  void _student; void _unitSummary; void _allProgress;
  return;
}

export async function exportGradebookToXlsx(_students: any[], _unitsSummary: UnitSummary[], _allProgress: Record<string, any>): Promise<void> {
  void _students; void _unitsSummary; void _allProgress;
  return;
}

export default {
  buildGradebookCsv,
  buildModalDetailsCsv,
  exportModalDetailsToXlsx,
  exportGradebookToXlsx,
};
