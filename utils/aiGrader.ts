
import { Assignment, GradingResult, Submission, PlagiarismResult, CourseUnit, RubricItem } from '../types';

/**
 * Calculates Jaccard Similarity between two sets of tokens.
 * Range: 0.0 to 1.0
 */
const calculateJaccardSimilarity = (text1: string, text2: string): number => {
    const tokenize = (text: string) => new Set(text.toLowerCase().replace(/[^a-z0-9ก-๙\s]/g, '').split(/\s+/).filter(t => t.length > 2));
    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);

    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
};

/**
 * Checks for plagiarism by comparing the current submission with all previous submissions.
 */
export const detectPlagiarism = (
    currentSubmission: Submission,
    allSubmissions: Submission[],
    similarityThreshold = 0.75
): PlagiarismResult => {

    const others = allSubmissions.filter(s =>
        s.assignmentId === currentSubmission.assignmentId &&
        s.studentId !== currentSubmission.studentId &&
        s.answerText
    );

    let maxSimilarity = 0;
    let originalSource: Submission | null = null;

    for (const other of others) {
        if (!currentSubmission.answerText || !other.answerText) continue;

        const sim = calculateJaccardSimilarity(currentSubmission.answerText, other.answerText);
        if (sim > maxSimilarity) {
            maxSimilarity = sim;
            originalSource = other;
        }
    }

    let penalty = 0;
    let isPlagiarized = false;

    if (maxSimilarity >= similarityThreshold) {
        isPlagiarized = true;
        if (originalSource && currentSubmission.submittedAt > originalSource.submittedAt) {
            penalty = 50;
        }
    }

    return {
        isPlagiarized,
        originalStudentId: isPlagiarized && originalSource ? originalSource.studentId : undefined,
        similarityPercentage: Math.round(maxSimilarity * 100),
        penalty
    };
};

/**
 * Core generic grading logic using a Rubric.
 */
const gradeWithRubric = (rubric: RubricItem[], content: string): GradingResult => {
    let totalScore = 0;
    let totalRubricScore = 0;
    const breakdown: GradingResult['breakdown'] = [];
    const normalizedAnswer = content.toLowerCase();

    rubric.forEach((item) => {
        let itemScore = 0;
        let comment = '';
        totalRubricScore += item.maxScore;

        if (item.keywords && item.keywords.length > 0) {
            const foundKeywords = item.keywords.filter(k => normalizedAnswer.includes(k.toLowerCase()));
            const ratio = foundKeywords.length / item.keywords.length;

            if (ratio >= 0.8) {
                itemScore = item.maxScore;
                comment = item.feedbackIfPresent || 'Excellent! You covered all key points.';
            } else if (ratio >= 0.5) {
                itemScore = Math.ceil(item.maxScore * 0.8);
                comment = 'Good job, but you might be missing some specific details.';
            } else if (ratio > 0) {
                itemScore = Math.ceil(item.maxScore * ratio);
                comment = item.feedbackIfMissing || `Found some concepts, but missing key terms.`;
            } else {
                itemScore = 0;
                comment = item.feedbackIfMissing || 'Try to include keywords related to the topic.';
            }
        } else {
            if (normalizedAnswer.length > 50) {
                itemScore = item.maxScore;
                comment = 'Content length looks good.';
            } else {
                itemScore = Math.ceil(item.maxScore / 2);
                comment = 'Answer seems too short.';
            }
        }

        itemScore = Math.min(itemScore, item.maxScore);
        totalScore += itemScore;
        breakdown.push({
            criteria: item.criteria,
            score: itemScore,
            maxScore: item.maxScore,
            aiComment: comment
        });
    });

    return {
        score: totalScore,
        maxScore: totalRubricScore,
        percentage: totalRubricScore > 0 ? Math.round((totalScore / totalRubricScore) * 100) : 0,
        feedback: breakdown.map(b => `[${b.criteria}]: ${b.aiComment}`),
        breakdown
    };
}

/**
 * Grades an Assignment submission.
 */
export const gradeSubmissionAI = (assignment: Assignment, answerText: string): GradingResult => {
    if (!assignment.rubric || assignment.rubric.length === 0) {
        return { score: 0, maxScore: assignment.maxScore, percentage: 0, feedback: ['No rubric found.'], breakdown: [] };
    }
    if (!answerText || answerText.trim().length === 0) {
        return { score: 0, maxScore: assignment.maxScore, percentage: 0, feedback: ['No content.'], breakdown: [] };
    }
    return gradeWithRubric(assignment.rubric, answerText);
};

/**
 * Grades a Notebook entry based on Unit learning objectives.
 */
export const gradeNotebookAI = (unit: CourseUnit, content: string): GradingResult => {
    if (!unit.notebookRubric || unit.notebookRubric.length === 0) {
        return { score: 0, maxScore: 10, percentage: 0, feedback: ['No notebook rubric found.'], breakdown: [] };
    }
    if (!content || content.trim().length === 0) {
        return { score: 0, maxScore: 10, percentage: 0, feedback: ['Notebook is empty.'], breakdown: [] };
    }
    return gradeWithRubric(unit.notebookRubric, content);
};
