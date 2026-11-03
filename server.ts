import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient Gemini Generator with Multi-Model Fallbacks, 12s Per-Attempt Timeout, and Zero-Latency Configuration
async function generateContentWithRetryAndFallback(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
  fallbackModels?: string[];
  perAttemptTimeoutMs?: number;
}) {
  const defaultFallbacks = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"];
  const models = [
    options.preferredModel || "gemini-2.0-flash",
    ...(options.fallbackModels || defaultFallbacks),
  ];

  const uniqueModels = Array.from(new Set(models));
  let lastError: any = null;
  const timeoutMs = options.perAttemptTimeoutMs || 12000; // 12-second attempt ceiling

  for (const model of uniqueModels) {
    let attempts = 0;
    const maxAttemptsForModel = 1; // Quick single-attempt then immediate fallback for speed

    while (attempts < maxAttemptsForModel) {
      try {
        const ai = getGeminiClient();

        // Build low-latency config
        const effectiveConfig: any = {
          ...options.config,
        };

        // If using gemini-3.7-flash, disable thinking latency to achieve instant answers in < 3s
        if (model.includes("3.7-flash") && !effectiveConfig.thinkingConfig) {
          effectiveConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        // 12-second race timeout to guarantee total turn < 20s
        const generatePromise = ai.models.generateContent({
          model,
          contents: options.contents,
          config: effectiveConfig,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: Model ${model} took longer than ${timeoutMs / 1000}s`)), timeoutMs)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        if (response && (response.text || (response.candidates && response.candidates.length > 0))) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || err?.toString() || "";
        console.warn(`[Gemini Fast Engine] Failover on model ${model}:`, errMsg);
        // Immediately shift to next fallback model
        break;
      }
    }
  }

  throw lastError || new Error("All AI models are currently experiencing high demand. Please try again.");
}

// Utility to clean and parse JSON securely even with markdown wrappers
function cleanAndParseJson(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSub = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSub);
    }
    throw e;
  }
}

const VYNIQ_SYSTEM_INSTRUCTION = `You are Vyniq AI, the Chief Academic Evaluator, Master AI Neuro-Tutor, Exam Strategist, and Academic Intelligence Engine for Vyniq Education, the EdTech division of Vyniq Technologies.
Brand: Vyniq Education
Parent Company: Vyniq Technologies
Tagline: “Unlock what’s next.”

Mission: “Turn CBSE students into exam-ready, conceptually strong, high-scoring students through accurate NCERT-grounded teaching, intelligent practice, rigorous evaluation, and personalized learning.”

Target: Indian CBSE students in Classes 10 and 12.

CORE SUBJECTS:
- Class 10: Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Political Science, Economics).
- Class 12: Accountancy (Partnership, Company Accounts, Financial Statement Analysis/AS-3), Business Studies (Principles & Functions of Management, Business Finance & Marketing), Economics (Introductory Macroeconomics, Indian Economic Development).

SOURCE-OF-TRUTH HIERARCHY:
1. Official CBSE curriculum/syllabus for 2026–27 session
2. Official CBSE sample papers, marking schemes, question banks
3. Official NCERT textbooks and rationalised content
4. Previous CBSE board examination papers/PYQs
5. Reputable supplementary academic resources

RULES & PROTOCOLS:
1. Never fabricate citations, page numbers, exercises, marking schemes, or syllabus inclusions.
2. If uncertain about 2026-27 syllabus: State "I cannot verify this against current official CBSE 2026-27 documents, so I will not present it as an official CBSE requirement."
3. Accountancy Protocol: When teaching Accountancy, always follow the 10-step protocol: Concept -> Why -> Legal Basis (Partnership Act 1932/Companies Act 2013/AS-3) -> Identification -> Formula -> Calculation -> Journal Entry table (| Date | Particulars | L.F. | Debit (₹) | Credit (₹) | with Narration) -> Ledger/Account format -> Numerical -> Mistake Analysis.
4. Business Studies Protocol: Grounded in NCERT headings, comparison tables, and 5-step case study format (Identify -> Quote clue -> Concept -> Explanation -> Conclusion).
5. Math / Science: Precision step-by-step with LaTeX ($...$ and $$...$$): Given -> Required -> Formula -> Substitution -> Calculation -> Final Answer -> Unit.
6. Mandatory Structure for standard explanations (unless user asks for Quick/Short, Quiz, etc.):
   📌 1. Core Concept & NCERT Definition
   📝 2. CBSE Step-Wise Marking Rubric (Distinguish official marking requirement from Vyniq recommended rubric)
   📖 3. NCERT / CBSE Reference (Class, Subject, Chapter, NCERT topic)
   ⚡ 4. Active Recall Challenge (1 high-yield question, prompt student before revealing)
7. Exam-Eve Mode: If student asks for exam-eve or quick revision, prioritize highest-yield concepts, formulas, PYQs, and rapid active recall.
8. Anti-Hallucination: Never promise a question "will definitely come" or claim false certainty. Use labels: Verified / Highly likely / Reasonable inference / Uncertain.`;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", brand: "Vyniq Education", version: "1.0.0" });
});

// Neuro-Tutor Chat Endpoint
app.post("/api/tutor/chat", async (req, res) => {
  try {
    const { messages, classLevel, subject, mode, currentConcept } = req.body;

    let modeInstruction = "";
    if (mode === "quick") {
      modeInstruction = "QUICK MODE ACTIVATED: Deliver a super-concise, high-yield, 1-minute revision response without the 4-section layout.";
    } else if (mode === "exam-eve") {
      modeInstruction = "🚨 EXAM-EVE MODE ACTIVATED: Focus strictly on highest-weightage concepts, frequently tested PYQ patterns, must-know formulas/definitions, and common pitfalls.";
    } else if (mode === "diagnostic") {
      modeInstruction = "DIAGNOSTIC MODE ACTIVATED: Probe the student's mastery level from Level 0 (Unknown) to Level 5 (Advanced Mastery). Ask targeted diagnostic questions to identify conceptual gaps.";
    } else if (mode === "accountancy-10step") {
      modeInstruction = "ACCOUNTANCY 10-STEP PROTOCOL ACTIVATED: Strictly execute the 10-step sequence with full Journal Entry table and legal provisions.";
    } else if (mode === "bst-precision") {
      modeInstruction = "BUSINESS STUDIES NCERT PRECISION ENGINE ACTIVATED: Use exact NCERT headings, comparison tables, and 5-step case study deduction format.";
    } else if (mode === "adaptive") {
      modeInstruction = `🧠 ADAPTIVE DIFFICULTY ENGINE ACTIVATED:
Assess the student's current understanding in real-time.
- Calibrate your explanations dynamically across the 6 levels: Level 1 (Foundation) -> Level 2 (Understanding) -> Level 3 (Application) -> Level 4 (Case-Based) -> Level 5 (HOTS) -> Level 6 (Board Simulation).
- If the student shows foundational confusion, simplify into intuitive NCERT analogies and core definitions.
- If the student shows high competence, elevate to multi-concept synthesis, edge cases, and board-marking rubrics.
- End your response with:
  1. 📊 [Current Assessed Level: Level X - Name]
  2. 🎯 [Adaptive Next Challenge Question: specifically calibrated to either promote them to the next level or reinforce current level gaps].`;
    }

    const systemInstruction = `${VYNIQ_SYSTEM_INSTRUCTION}
Current Context:
Class: ${classLevel || "Class 10 or 12"}
Subject: ${subject || "General CBSE"}
Active Mode: ${mode || "standard"}
${currentConcept ? `Current Concept/Topic: ${currentConcept}` : ""}
${modeInstruction}

Respond in clean, well-formatted Markdown with LaTeX for all mathematical/scientific formulas.`;

    const formattedContents = (messages || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [
        ...(msg.image
          ? [
              {
                inlineData: {
                  mimeType: msg.imageMime || "image/jpeg",
                  data: msg.image,
                },
              },
            ]
          : []),
        { text: msg.content || "" },
      ],
    }));

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ text: response.text || "No response generated." });
  } catch (error: any) {
    console.error("Error in /api/tutor/chat:", error);
    res.status(500).json({ error: error.message || "Failed to process tutor query." });
  }
});

// ==========================================
// ADAPTIVE DIFFICULTY ENGINE ENDPOINTS
// Levels:
// 1: Foundation (Direct NCERT recall, definition, core formula)
// 2: Understanding (Explain, contrast, interpret, differentiate)
// 3: Application (Standard numericals, direct scenario application)
// 4: Case-Based (CBSE-style case study or practical scenario)
// 5: High Difficulty / HOTS (Multi-concept synthesis, tricky edge cases)
// 6: Board Simulation (Strict timed CBSE exam paper question with full rubric)
// ==========================================

// 1. Start Adaptive Session
app.post("/api/adaptive/start-session", async (req, res) => {
  try {
    const { classLevel, subject, chapter, concept, startLevel = 1 } = req.body;

    const levelTitles: Record<number, string> = {
      1: "Level 1 — Foundation (Core NCERT Recall & Definitions)",
      2: "Level 2 — Understanding (Conceptual Explanations & Contrasting)",
      3: "Level 3 — Application (Scenario & Standard Numericals)",
      4: "Level 4 — Case-Based (CBSE Source Analysis & Multi-Part Deductions)",
      5: "Level 5 — High Difficulty / HOTS (Multi-Concept Synthesis & Traps)",
      6: "Level 6 — Board Simulation (Strict CBSE Examination Rigor)",
    };

    const initialLevel = Math.max(1, Math.min(6, Number(startLevel)));
    const targetTitle = levelTitles[initialLevel];

    const prompt = `You are the Vyniq AI Adaptive Difficulty Engine for CBSE ${classLevel} ${subject}.
Generate the initial question and foundational guidance for an Adaptive Learning Session.

Subject: ${subject}
Class: ${classLevel}
Chapter: ${chapter}
Target Concept: "${concept || chapter}"
Initial Difficulty Level: Level ${initialLevel} (${targetTitle})

Return JSON strictly adhering to schema:
{
  "concept": "${concept || chapter}",
  "chapter": "${chapter}",
  "subject": "${subject}",
  "classLevel": "${classLevel}",
  "currentLevel": ${initialLevel},
  "currentLevelTitle": "${targetTitle}",
  "conceptOverview": string, // 2-3 sentence NCERT-grounded introductory primer tailored to Level ${initialLevel}
  "learningMilestones": [string], // 3 clear milestones to reach Board Simulation mastery
  "initialQuestion": {
    "id": "aq-init-1",
    "question": string,
    "marks": number,
    "type": string, // "MCQ" | "Short Answer" | "Numerical" | "Case-Based"
    "options": string[] | null, // 4 choices if MCQ, otherwise null
    "correctOptionIndex": number | null, // 0-3 if MCQ, otherwise null
    "ncertReference": string,
    "conceptTested": string,
    "hint": string, // Helpful progressive clue if student gets stuck
    "modelAnswer": string
  }
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/adaptive/start-session:", error);
    res.status(500).json({ error: error.message || "Failed to start adaptive session." });
  }
});

// 2. Assess Student Understanding & Adapt Difficulty
app.post("/api/adaptive/evaluate-and-adapt", async (req, res) => {
  try {
    const {
      classLevel,
      subject,
      chapter,
      concept,
      currentLevel,
      questionText,
      questionMarks = 3,
      questionType,
      studentAnswer,
      modelAnswer,
      sessionHistory = [],
    } = req.body;

    const currLvl = Math.max(1, Math.min(6, Number(currentLevel) || 1));

    const levelDescriptions: Record<number, string> = {
      1: "Level 1 — Foundation (Direct NCERT recall, definition, core formula)",
      2: "Level 2 — Understanding (Explain, contrast, interpret, differentiate)",
      3: "Level 3 — Application (Scenario application, standard numericals, journal entries)",
      4: "Level 4 — Case-Based (CBSE-style case study, source clues extraction)",
      5: "Level 5 — High Difficulty / HOTS (Multi-concept problem, tricky application, edge cases)",
      6: "Level 6 — Board Simulation (Strict CBSE timed examination standard with exact marking scheme)",
    };

    const prompt = `You are the Vyniq AI Adaptive Difficulty Engine & Chief Academic Evaluator for CBSE.
Assess the student's submitted response to the following question, evaluate their conceptual depth, diagnose any gaps, and dynamically adapt the difficulty level for the next question.

SUBJECT: ${subject} (${classLevel})
CHAPTER: ${chapter}
TARGET CONCEPT: ${concept || chapter}
CURRENT LEVEL: Level ${currLvl} (${levelDescriptions[currLvl]})

PREVIOUS QUESTION:
"${questionText}"
Marks: ${questionMarks} | Type: ${questionType || "Standard"}
${modelAnswer ? `Reference Model Answer: ${modelAnswer}` : ""}

STUDENT'S SUBMITTED ANSWER:
"${studentAnswer}"

ADAPTATION LOGIC RULES:
1. Score the answer out of ${questionMarks} marks based on strict NCERT & CBSE criteria.
2. Compute "understandingScore" from 0 to 100%.
3. Difficulty Adjustment Rule:
   - If understandingScore >= 75%: Action = "PROMOTE" -> newLevel = min(6, ${currLvl} + 1). (If already 6, newLevel = 6 with Board Simulation mastery).
   - If understandingScore >= 50% and < 75%: Action = "MAINTAIN" -> newLevel = ${currLvl}. Reinforce the current level with a variation question addressing specific weak spots.
   - If understandingScore < 50%: Action = "DEMOTE" (Scaffold Down) -> newLevel = max(1, ${currLvl} - 1). Provide foundational repair and step-by-step NCERT intuition.
4. Synthesize an Adaptive Explanation:
   - If demoted/maintained: Explain the core foundational concepts in simple terms with NCERT analogies.
   - If promoted: Provide high-level insight, board marking pitfalls, and prepare the student for the higher complexity tier.
5. Generate the NEXT ADAPTIVE QUESTION specifically calibrated for the calculated "newLevel" (${levelDescriptions[currLvl]}).

Return JSON with exact schema:
{
  "scoreAwarded": number,
  "maxMarks": ${questionMarks},
  "scoreDisplay": string, // e.g. "2.5 / 3"
  "understandingScore": number, // 0 - 100 percentage
  "comprehensionStatus": string, // "Flawless Board Mastery" | "Strong Conceptual Grasp" | "Developing with Gaps" | "Foundation Repair Needed"
  "levelAction": "PROMOTE" | "MAINTAIN" | "DEMOTE",
  "actionMessage": string, // Inspiring 1-sentence announcement of level shift (e.g. "Promoted to Level 4: Case-Based Analysis! 🚀")
  "currentLevel": ${currLvl},
  "newLevel": number, // 1 to 6
  "newLevelTitle": string, // Title matching levelDescriptions
  "strengthsIdentified": [string], // 2-3 specific points done right
  "gapsIdentified": [string], // Specific NCERT keywords, formulas, or steps missed
  "adaptiveExplanation": string, // Rich markdown explanation with LaTeX and NCERT highlights tailored to student's level
  "topperTip": string, // High-yield CBSE examiner advice for this level
  "nextQuestion": {
    "id": string,
    "level": number,
    "levelTitle": string,
    "question": string,
    "marks": number,
    "type": string, // "MCQ" | "Short Answer" | "Numerical" | "Case-Based"
    "options": string[] | null, // 4 choices if MCQ
    "correctOptionIndex": number | null,
    "ncertReference": string,
    "conceptTested": string,
    "hint": string,
    "modelAnswer": string
  },
  "activeRecallPrompt": string // A quick 1-line mental check question to cement the lesson
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/adaptive/evaluate-and-adapt:", error);
    res.status(500).json({ error: error.message || "Failed to process adaptive evaluation." });
  }
});

// Strict CBSE Exam Evaluation Engine
app.post("/api/evaluator/evaluate", async (req, res) => {
  try {
    const { question, maxMarks, studentAnswer, subject, classLevel, chapter, markingSchemeContext } = req.body;

    const prompt = `Act as a Chief CBSE Academic Evaluator evaluating a student's answer according to official NCERT & CBSE Marking Criteria.

Subject: ${subject || "CBSE Subject"}
Class: ${classLevel || "10 / 12"}
Chapter: ${chapter || "General"}
Question: ${question}
Maximum Marks: ${maxMarks || 3}
${markingSchemeContext ? `Reference Official/Expected Marking Scheme: ${markingSchemeContext}` : ""}

Student's Submitted Answer:
"${studentAnswer}"

Evaluate strictly as a CBSE board examiner. Return JSON adhering to this exact schema:
{
  "score": number, // e.g. 2.5
  "maxMarks": number, // e.g. 3
  "scoreDisplay": string, // "2.5 / 3"
  "examinerVerdict": string, // One of: "✅ Board-ready", "🟢 Strong", "🟡 Needs improvement", "🔴 Major conceptual gap"
  "answerQuality": string, // One of: "Topper-Level", "Board-Ready", "Almost Board-Ready", "Partially Correct", "Incorrect"
  "markingBreakdown": [
    {
      "criterion": string, // e.g. "Concept definition / Principle", "Required NCERT keyword / Step", "Explanation / Working", "Presentation / Format / Units"
      "marksAwarded": number,
      "maxMarks": number,
      "remarks": string
    }
  ],
  "whatYouDidRight": [string], // 2-3 specific strengths
  "whatCostYouMarks": [string], // Specific reasons for mark deduction
  "modelAnswer": string, // Exemplary, board-appropriate model answer with NCERT headings/keywords/LaTeX
  "errorClassification": {
    "category": string, // One of: "🧠 Conceptual Error", "📖 Recall Error", "🧮 Calculation Error", "🔍 Question Interpretation Error", "✍️ Presentation Error", "⏱️ Time Management Error", "⚠️ Careless Error", "None"
    "mistake": string,
    "cause": string,
    "correction": string,
    "prevention": string
  },
  "rubricDisclaimer": string, // Clarify whether official or Vyniq estimated rubric
  "suggestedNextTopic": string,
  "confidenceLabel": string // "Verified" | "Highly likely" | "Reasonable inference"
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/evaluator/evaluate:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate answer." });
  }
});

// Question Generation Engine (Levels 1 to 6)
app.post("/api/generator/questions", async (req, res) => {
  try {
    const { classLevel, subject, chapter, level, count = 3, questionType } = req.body;

    const levelDescriptions: Record<number, string> = {
      1: "LEVEL 1 — FOUNDATION: Direct NCERT recall, definition, core formula.",
      2: "LEVEL 2 — UNDERSTANDING: Explain, interpret, contrast, differentiate.",
      3: "LEVEL 3 — APPLICATION: Apply concept to a new scenario or standard numerical.",
      4: "LEVEL 4 — CASE-BASED: CBSE-style case study or practical context with sub-questions.",
      5: "LEVEL 5 — HIGH DIFFICULTY: Multi-concept problem, tricky application, higher-order thinking (HOTS).",
      6: "LEVEL 6 — BOARD SIMULATION: Timed realistic question with official CBSE mark distribution.",
    };

    const targetLevelDesc = levelDescriptions[Number(level)] || levelDescriptions[3];

    const prompt = `Generate ${count} high-quality CBSE examination practice questions for:
Class: ${classLevel}
Subject: ${subject}
Chapter: ${chapter}
Target Level: Level ${level} (${targetLevelDesc})
${questionType ? `Preferred Type: ${questionType}` : ""}

Return JSON format:
{
  "chapter": "${chapter}",
  "subject": "${subject}",
  "level": ${level},
  "levelTitle": "${targetLevelDesc}",
  "questions": [
    {
      "id": string,
      "question": string,
      "marks": number,
      "type": string, // "MCQ" | "Short Answer (2M)" | "Short Answer (3M)" | "Long Answer (5M)" | "Case-Based (4M)"
      "options": string[] | null, // If MCQ, provide 4 options
      "correctOptionIndex": number | null, // If MCQ (0-3)
      "subQuestions": [ // Optional for case-based
        { "id": string, "text": string, "marks": number }
      ],
      "ncertReference": string, // e.g. "Class 12 BST Ch-3 Management and Business Environment"
      "conceptTested": string,
      "stepWiseMarkingScheme": [
        { "step": string, "marks": number }
      ],
      "modelAnswer": string,
      "commonStudentPitfalls": [string]
    }
  ]
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/generator/questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions." });
  }
});

// Board Exam Simulation Paper Generator
app.post("/api/generator/exam-paper", async (req, res) => {
  try {
    const { classLevel, subject, examType = "Full Syllabus", durationMinutes = 90, totalMarks = 40 } = req.body;

    const prompt = `Create a realistic, authentic CBSE Board Simulation Examination Paper.
Class: ${classLevel}
Subject: ${subject}
Paper Scope: ${examType}
Total Marks: ${totalMarks}
Duration: ${durationMinutes} minutes

Follow official CBSE blueprint structure:
Section A: 1-mark objective / MCQs
Section B: 2-mark very short answer
Section C: 3-mark short answer
Section D: 5-mark long answer
Section E: 4-mark case-based / source-based questions

Return JSON adhering to schema:
{
  "title": "CBSE Board Simulation Paper - ${subject} (${classLevel})",
  "subject": "${subject}",
  "classLevel": "${classLevel}",
  "totalMarks": ${totalMarks},
  "durationMinutes": ${durationMinutes},
  "generalInstructions": [string],
  "sections": [
    {
      "sectionId": "A",
      "name": "Section A (1 Mark Each)",
      "questions": [
        {
          "id": "Q1",
          "questionNumber": 1,
          "text": string,
          "marks": 1,
          "type": "MCQ" | "Short",
          "options": string[] | null,
          "correctAnswer": string,
          "markingScheme": string,
          "chapter": string
        }
      ]
    },
    {
      "sectionId": "B",
      "name": "Section B (2 Marks Each)",
      "questions": [ ... ]
    },
    {
      "sectionId": "C",
      "name": "Section C (3 Marks Each)",
      "questions": [ ... ]
    },
    {
      "sectionId": "D",
      "name": "Section D (5 Marks Each)",
      "questions": [ ... ]
    },
    {
      "sectionId": "E",
      "name": "Section E (Case-Based 4 Marks)",
      "questions": [ ... ]
    }
  ]
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/generator/exam-paper:", error);
    res.status(500).json({ error: error.message || "Failed to generate exam paper." });
  }
});

// Syllabus Status & Rationalization Guardrail Checker
app.post("/api/curriculum/verify-topic", async (req, res) => {
  try {
    const { classLevel, subject, topicOrChapter } = req.body;

    const prompt = `Verify the CBSE 2026-27 syllabus and NCERT rationalisation status for:
Class: ${classLevel}
Subject: ${subject}
Topic/Chapter: "${topicOrChapter}"

Evaluate whether it is:
1. "OFFICIALLY_INCLUDED": Fully in the 2026-27 CBSE examination syllabus.
2. "OFFICIALLY_DELETED": Rationalised / deleted from NCERT or excluded by CBSE.
3. "UNCERTAIN_NEEDS_VERIFICATION": Cannot verify against official 2026-27 circulars.

Return JSON:
{
  "status": "OFFICIALLY_INCLUDED" | "OFFICIALLY_DELETED" | "UNCERTAIN_NEEDS_VERIFICATION",
  "statusBadge": string, // "✅ Officially Included" | "⚠️ Rationalized / Deleted" | "🔎 Verification Needed"
  "explanation": string,
  "ncertChapterDetails": string,
  "examWeightageGuidance": string,
  "backgroundKnowledgeUtility": string,
  "officialWarningMessage": string | null
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/curriculum/verify-topic:", error);
    res.status(500).json({ error: error.message || "Failed to verify topic syllabus." });
  }
});

// 10-Step Accountancy Protocol Generator
app.post("/api/accountancy/protocol", async (req, res) => {
  try {
    const { topic, numericalProblem } = req.body;

    const prompt = `Execute the mandatory Vyniq 10-Step Strict Accountancy Teaching Protocol for:
Topic: ${topic}
${numericalProblem ? `Problem Scenario: ${numericalProblem}` : "Create an exemplary CBSE Board level illustration."}

Strictly follow all 10 steps:
Step 1 - Concept (NCERT terminology)
Step 2 - WHY (accounting rationale)
Step 3 - RULE / LEGAL BASIS (Indian Partnership Act 1932 / Companies Act 2013 / AS-3)
Step 4 - IDENTIFICATION (clues in question wording)
Step 5 - FORMULA
Step 6 - CALCULATION (working notes)
Step 7 - JOURNAL ENTRY (Standard table with Date, Particulars, L.F., Debit ₹, Credit ₹, and proper narration)
Step 8 - LEDGER / ACCOUNT (T-shape format)
Step 9 - NUMERICAL (complete start-to-end solution)
Step 10 - MISTAKE ANALYSIS (Common mistake, why wrong, correct treatment, potential mark loss)

Return JSON adhering to schema:
{
  "topic": "${topic}",
  "step1Concept": { "title": "Step 1 — Concept", "content": string, "ncertTerms": [string] },
  "step2Why": { "title": "Step 2 — Why It Exists", "content": string },
  "step3LegalBasis": { "title": "Step 3 — Legal Basis & Accounting Standards", "act": string, "rule": string },
  "step4Identification": { "title": "Step 4 — Question Clue Identification", "clues": [string] },
  "step5Formula": { "title": "Step 5 — Formula & Logic", "formulaLatex": string, "notes": string },
  "step6Calculation": { "title": "Step 6 — Step-by-Step Working Notes", "calculations": [string] },
  "step7JournalEntry": {
    "title": "Step 7 — Standard Journal Entry",
    "entries": [
      { "date": string, "particulars": string, "lf": string, "debit": string, "credit": string, "narration": string }
    ]
  },
  "step8Ledger": { "title": "Step 8 — Ledger / Account Format", "accountName": string, "debitSide": [string], "creditSide": [string] },
  "step9Numerical": { "title": "Step 9 — Comprehensive Solved Example", "problem": string, "solutionSteps": [string] },
  "step10MistakeAnalysis": {
    "title": "Step 10 — Mistake Analysis",
    "commonMistake": string,
    "whyWrong": string,
    "correctTreatment": string,
    "potentialMarkLoss": string
  }
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/accountancy/protocol:", error);
    res.status(500).json({ error: error.message || "Failed to generate Accountancy protocol." });
  }
});

// Business Studies Case Study Deduction Engine
app.post("/api/bst/case-study", async (req, res) => {
  try {
    const { caseText, questionAsked } = req.body;

    const prompt = `Solve this Business Studies Case Study using the strict Vyniq 5-Step NCERT Precision Protocol:
1. Identify the management concept/principle/function.
2. Quote / Extract the exact sentence clue from the case.
3. Textbook concept definition (NCERT-grounded).
4. Detailed Explanation connecting the extracted clue with the concept.
5. Concluding Remark & Board Marking Tip.

Case Study Text:
"${caseText}"

Question:
"${questionAsked}"

Return JSON:
{
  "identifiedConcept": string,
  "ncertChapter": string,
  "extractedClue": string,
  "ncertHeading": string,
  "conceptDefinition": string,
  "explanation": string,
  "stepWiseMarks": [
    { "step": string, "marks": number }
  ],
  "commonMistakes": string,
  "modelBoardAnswer": string
}`;

    const response = await generateContentWithRetryAndFallback({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VYNIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJson(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/bst/case-study:", error);
    res.status(500).json({ error: error.message || "Failed to analyze BST case study." });
  }
});

// Vite middleware / static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vyniq Education Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
