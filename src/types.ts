export type ClassLevel = "Class 10" | "Class 12";

export type SubjectId =
  // Class 10
  | "c10-maths"
  | "c10-science"
  | "c10-social"
  // Class 12
  | "c12-accountancy"
  | "c12-bst"
  | "c12-economics";

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  classLevel: ClassLevel;
  code: string;
  iconName: string;
  color: string;
  chapters: string[];
  highYieldTopics: string[];
}

export type TutorMode = "standard" | "quick" | "exam-eve" | "diagnostic" | "adaptive" | "accountancy-10step" | "bst-precision";

export type NeuroLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: number;
  image?: string;
  imageMime?: string;
  mode?: TutorMode;
  activeRecallPrompt?: string;
  activeRecallAnswered?: boolean;
}

export interface EvaluationCriterion {
  criterion: string;
  marksAwarded: number;
  maxMarks: number;
  remarks: string;
}

export interface ErrorClassification {
  category: "🧠 Conceptual Error" | "📖 Recall Error" | "🧮 Calculation Error" | "🔍 Question Interpretation Error" | "✍️ Presentation Error" | "⏱️ Time Management Error" | "⚠️ Careless Error" | "None";
  mistake: string;
  cause: string;
  correction: string;
  prevention: string;
}

export interface EvaluationResult {
  id: string;
  date: string;
  subject: string;
  chapter: string;
  question: string;
  studentAnswer: string;
  score: number;
  maxMarks: number;
  scoreDisplay: string;
  examinerVerdict: "✅ Board-ready" | "🟢 Strong" | "🟡 Needs improvement" | "🔴 Major conceptual gap";
  answerQuality: "Topper-Level" | "Board-Ready" | "Almost Board-Ready" | "Partially Correct" | "Incorrect";
  markingBreakdown: EvaluationCriterion[];
  whatYouDidRight: string[];
  whatCostYouMarks: string[];
  modelAnswer: string;
  errorClassification: ErrorClassification;
  rubricDisclaimer: string;
  suggestedNextTopic: string;
  confidenceLabel: string;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  marks: number;
  type: string;
  options?: string[] | null;
  correctOptionIndex?: number | null;
  subQuestions?: { id: string; text: string; marks: number }[];
  ncertReference: string;
  conceptTested: string;
  stepWiseMarkingScheme: { step: string; marks: number }[];
  modelAnswer: string;
  commonStudentPitfalls: string[];
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  text: string;
  marks: number;
  type: "MCQ" | "Short" | "Long" | "Case";
  options?: string[] | null;
  correctAnswer?: string;
  markingScheme?: string;
  chapter?: string;
}

export interface ExamSection {
  sectionId: string;
  name: string;
  questions: ExamQuestion[];
}

export interface ExamPaper {
  title: string;
  subject: string;
  classLevel: ClassLevel;
  totalMarks: number;
  durationMinutes: number;
  generalInstructions: string[];
  sections: ExamSection[];
}

export interface WeaknessItem {
  id: string;
  subject: string;
  chapter: string;
  subtopic: string;
  severity: "High" | "Medium" | "Low";
  dateIdentified: string;
  mistakeSummary: string;
  status: "Needs Practice" | "In Review" | "Mastered";
  lastTestedScore?: number;
}

export interface SpacedRevisionItem {
  id: string;
  concept: string;
  subject: string;
  chapter: string;
  currentIntervalIndex: number; // 0 (Day 0), 1 (Day 1), 2 (Day 3), 3 (Day 7), 4 (Day 14), 5 (Day 30)
  dueDate: string; // ISO date string
  activeRecallQuestion: string;
  keySummary: string;
  completedHistory: string[];
}

export interface AccountancyProtocolResult {
  topic: string;
  step1Concept: { title: string; content: string; ncertTerms: string[] };
  step2Why: { title: string; content: string };
  step3LegalBasis: { title: string; act: string; rule: string };
  step4Identification: { title: string; clues: string[] };
  step5Formula: { title: string; formulaLatex: string; notes: string };
  step6Calculation: { title: string; calculations: string[] };
  step7JournalEntry: {
    title: string;
    entries: { date: string; particulars: string; lf: string; debit: string; credit: string; narration: string }[];
  };
  step8Ledger: { title: string; accountName: string; debitSide: string[]; creditSide: string[] };
  step9Numerical: { title: string; problem: string; solutionSteps: string[] };
  step10MistakeAnalysis: {
    title: string;
    commonMistake: string;
    whyWrong: string;
    correctTreatment: string;
    potentialMarkLoss: string;
  };
}

export interface BstCaseStudyResult {
  identifiedConcept: string;
  ncertChapter: string;
  extractedClue: string;
  ncertHeading: string;
  conceptDefinition: string;
  explanation: string;
  stepWiseMarks: { step: string; marks: number }[];
  commonMistakes: string;
  modelBoardAnswer: string;
}

export interface SyllabusStatusResult {
  status: "OFFICIALLY_INCLUDED" | "OFFICIALLY_DELETED" | "UNCERTAIN_NEEDS_VERIFICATION";
  statusBadge: string;
  explanation: string;
  ncertChapterDetails: string;
  examWeightageGuidance: string;
  backgroundKnowledgeUtility: string;
  officialWarningMessage: string | null;
}

export type AdaptiveLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface AdaptiveQuestionItem {
  id: string;
  level?: number;
  levelTitle?: string;
  question: string;
  marks: number;
  type: string;
  options?: string[] | null;
  correctOptionIndex?: number | null;
  ncertReference: string;
  conceptTested: string;
  hint?: string;
  modelAnswer?: string;
}

export interface AdaptiveSessionStartResult {
  concept: string;
  chapter: string;
  subject: string;
  classLevel: string;
  currentLevel: number;
  currentLevelTitle: string;
  conceptOverview: string;
  learningMilestones: string[];
  initialQuestion: AdaptiveQuestionItem;
}

export interface AdaptiveStepEvaluationResult {
  scoreAwarded: number;
  maxMarks: number;
  scoreDisplay: string;
  understandingScore: number;
  comprehensionStatus: string;
  levelAction: "PROMOTE" | "MAINTAIN" | "DEMOTE";
  actionMessage: string;
  currentLevel: number;
  newLevel: number;
  newLevelTitle: string;
  strengthsIdentified: string[];
  gapsIdentified: string[];
  adaptiveExplanation: string;
  topperTip: string;
  nextQuestion: AdaptiveQuestionItem;
  activeRecallPrompt?: string;
}

export interface AdaptiveAttemptRecord {
  id: string;
  timestamp: number;
  questionText: string;
  level: number;
  levelTitle: string;
  studentAnswer: string;
  scoreAwarded: number;
  maxMarks: number;
  understandingScore: number;
  levelAction: "PROMOTE" | "MAINTAIN" | "DEMOTE";
  comprehensionStatus: string;
  adaptiveExplanation: string;
  topperTip: string;
}
