// components/utils/gradebookExport.ts
function buildGradebookCsv(students, unitsSummary, allProgress) {
  return "id,name,score\n";
}
function buildModalDetailsCsv(student, unitSummary, allProgress) {
  return "field,value\n";
}
async function exportModalDetailsToXlsx(student, unitSummary, allProgress) {
  return;
}
async function exportGradebookToXlsx(students, unitsSummary, allProgress) {
  return;
}
var gradebookExport_default = {
  buildGradebookCsv,
  buildModalDetailsCsv,
  exportModalDetailsToXlsx,
  exportGradebookToXlsx
};
export {
  buildGradebookCsv,
  buildModalDetailsCsv,
  gradebookExport_default as default,
  exportGradebookToXlsx,
  exportModalDetailsToXlsx
};
