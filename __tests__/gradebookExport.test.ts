import { buildGradebookCsv, buildModalDetailsCsv, exportGradebookToXlsx, exportModalDetailsToXlsx } from '../components/utils/gradebookExport';

jest.mock('exceljs', () => ({
  Workbook: jest.fn(() => ({
    addWorksheet: jest.fn(() => ({ addRow: jest.fn() })),
    xlsx: { writeBuffer: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))) }
  }))
}));

describe('gradebookExport', () => {
  const students = [
    { id: 's1', firstName: 'Alice', lastName: 'A', classLevel: '3', room: '1', name: 'Alice A' },
    { id: 's2', name: 'Bob', classLevel: '3', room: '1' }
  ];

  const unitsSummary = [
    {
      unit: { id: 'unit_1' },
      assessments: [
        { id: 'notebook_unit_1', maxScore: 10, title: 'Notebook', type: 'notebook' },
        { id: 'quiz_1', maxScore: 10, title: 'Quiz 1', type: 'quiz' }
      ],
      totalMaxScore: 20
    }
  ];

  const allProgress = {
    s1: { notebookScores: { unit_1: 9 }, quizzes: { quiz_1: { score: 8 } }, assignments: {}, activities: {} },
    s2: { notebookScores: {}, quizzes: {}, assignments: {}, activities: {} }
  };

  test('buildGradebookCsv returns CSV with header and rows', () => {
    const csv = buildGradebookCsv(students, unitsSummary, allProgress);
    expect(csv).toContain('studentId');
    expect(csv).toContain('s1');
    expect(csv).toContain('17'); // Alice total 9+8
    expect(csv).toContain('0'); // Bob has zero scores
  });

  test('buildModalDetailsCsv returns assessment rows for a student/unit', () => {
    const csv = buildModalDetailsCsv(students[0], unitsSummary[0], allProgress);
    expect(csv).toContain('Notebook');
    expect(csv).toContain('9');
    expect(csv).toContain('Quiz 1');
    expect(csv).toContain('8');
  });

  test('export functions run without throwing', async () => {
    // mock URL.createObjectURL and anchor click
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob://fake');
    URL.revokeObjectURL = jest.fn();
    const spyCreateElem = jest.spyOn(document, 'createElement');
    const realAnchor = document.createElement('a');
    realAnchor.click = jest.fn();
    spyCreateElem.mockReturnValue(realAnchor);

    await expect(exportGradebookToXlsx(students, unitsSummary, allProgress)).resolves.not.toThrow();
    await expect(exportModalDetailsToXlsx(students[0], unitsSummary[0], allProgress)).resolves.not.toThrow();

    spyCreateElem.mockRestore();
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });
});