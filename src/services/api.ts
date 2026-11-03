import {
  ChatMessage,
  EvaluationResult,
  GeneratedQuestion,
  ExamPaper,
  AccountancyProtocolResult,
  BstCaseStudyResult,
  SyllabusStatusResult,
  TutorMode,
} from "../types";

export async function askNeuroTutor(params: {
  messages: { role: string; content: string; image?: string; imageMime?: string }[];
  classLevel: string;
  subject: string;
  mode?: TutorMode;
  currentConcept?: string;
}): Promise<string> {
  const response = await fetch("/api/tutor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to communicate with Vyniq AI" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

export async function evaluateAnswer(params: {
  question: string;
  maxMarks: number;
  studentAnswer: string;
  subject: string;
  classLevel: string;
  chapter?: string;
  markingSchemeContext?: string;
}): Promise<EvaluationResult> {
  const response = await fetch("/api/evaluator/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to evaluate answer" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function generatePracticeQuestions(params: {
  classLevel: string;
  subject: string;
  chapter: string;
  level: number;
  count?: number;
  questionType?: string;
}): Promise<{
  chapter: string;
  subject: string;
  level: number;
  levelTitle: string;
  questions: GeneratedQuestion[];
}> {
  const response = await fetch("/api/generator/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to generate questions" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function generateBoardExamPaper(params: {
  classLevel: string;
  subject: string;
  examType?: string;
  durationMinutes?: number;
  totalMarks?: number;
}): Promise<ExamPaper> {
  const response = await fetch("/api/generator/exam-paper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to generate exam paper" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function verifySyllabusTopic(params: {
  classLevel: string;
  subject: string;
  topicOrChapter: string;
}): Promise<SyllabusStatusResult> {
  const response = await fetch("/api/curriculum/verify-topic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to verify topic status" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function generateAccountancyProtocol(params: {
  topic: string;
  numericalProblem?: string;
}): Promise<AccountancyProtocolResult> {
  const response = await fetch("/api/accountancy/protocol", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to run Accountancy protocol" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function analyzeBstCaseStudy(params: {
  caseText: string;
  questionAsked: string;
}): Promise<BstCaseStudyResult> {
  const response = await fetch("/api/bst/case-study", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to analyze BST case study" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

// Adaptive Difficulty Engine Client Functions
export async function startAdaptiveSession(params: {
  classLevel: string;
  subject: string;
  chapter: string;
  concept?: string;
  startLevel?: number;
}): Promise<import("../types").AdaptiveSessionStartResult> {
  const response = await fetch("/api/adaptive/start-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to initialize adaptive session" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function evaluateAndAdaptDifficulty(params: {
  classLevel: string;
  subject: string;
  chapter: string;
  concept: string;
  currentLevel: number;
  questionText: string;
  questionMarks?: number;
  questionType?: string;
  studentAnswer: string;
  modelAnswer?: string;
  sessionHistory?: any[];
}): Promise<import("../types").AdaptiveStepEvaluationResult> {
  const response = await fetch("/api/adaptive/evaluate-and-adapt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to evaluate adaptive response" }));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

