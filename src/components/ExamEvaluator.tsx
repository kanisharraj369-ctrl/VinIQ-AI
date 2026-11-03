import React, { useState } from "react";
import {
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Brain,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BookOpen,
  Send,
  Upload,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ClassLevel, SubjectInfo, EvaluationResult, ErrorClassification } from "../types";
import { evaluateAnswer } from "../services/api";
import { LatexRenderer } from "./LatexRenderer";
import { VyniqLogoIcon } from "./VyniqLogo";

interface ExamEvaluatorProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
  onLogEvaluation: (evalResult: EvaluationResult) => void;
}

export const ExamEvaluator: React.FC<ExamEvaluatorProps> = ({
  currentClass,
  activeSubject,
  onLogEvaluation,
}) => {
  const [question, setQuestion] = useState("");
  const [maxMarks, setMaxMarks] = useState<number>(3);
  const [selectedChapter, setSelectedChapter] = useState<string>(activeSubject.chapters[0] || "");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [markingSchemeContext, setMarkingSchemeContext] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-configured authentic CBSE Board sample questions by subject
  const sampleQuestions: Record<string, { q: string; marks: number; chapter: string; sampleAns: string }[]> = {
    "c12-accountancy": [
      {
        chapter: "Accounting for Share Capital",
        marks: 4,
        q: "Star Ltd. forfeited 500 equity shares of ₹10 each issued at a premium of ₹2 per share for non-payment of first call of ₹3 per share and final call of ₹2 per share (all money including premium called up). Out of these, 300 shares were reissued to Mohan as fully paid up for ₹8 per share. Pass the necessary journal entries in the books of Star Ltd.",
        sampleAns: "Forfeited shares = 500 * 10 = 5000 called up. Since premium was received on application/allotment, securities premium won't be debited. Entry: Share Capital A/c Dr 5,000 to Calls in Arrears 2,500 to Share Forfeiture 2,500. Reissue entry: Bank A/c Dr 2,400, Share Forfeiture A/c Dr 600 to Share Capital A/c 3,000. Capital Reserve = (2500/500 * 300) - 600 = 1500 - 600 = 900. Share Forfeiture Dr 900 to Capital Reserve 900.",
      },
      {
        chapter: "Accounting for Partnership Firms - Fundamentals",
        marks: 3,
        q: "A and B are partners sharing profits in the ratio of 3:2. Their fixed capitals were ₹4,00,000 and ₹2,00,000. After closing the books, it was discovered that Interest on Capital @ 10% p.a. was omitted. Pass the necessary adjustment entry.",
        sampleAns: "Interest on Capital for A = 40,000, for B = 20,000. Total = 60,000. Since interest is omitted, profit of 60,000 was wrongly distributed in 3:2 (A: 36,000, B: 24,000). A should get 40,000 but got 36,000 (Short by 4,000 credit). B should get 20,000 but got 24,000 (Excess by 4,000 debit). Adjustment Entry: B's Current A/c Dr 4,000 to A's Current A/c 4,000. (Being interest on capital omitted now adjusted through Current A/cs).",
      },
    ],
    "c12-bst": [
      {
        chapter: "Principles of Management",
        marks: 3,
        q: "Rajesh, a factory manager at Delta Tools, observed that workers frequently changed tools and body postures, causing fatigue and wastage of time. He hired an industrial engineer who systematically eliminated unproductive movements, designing standard motion paths. Identify and explain the technique of Scientific Management highlighted here.",
        sampleAns: "The technique of Scientific Management highlighted is Motion Study. Motion study refers to the study of movements like lifting, putting objects, sitting, and changing positions etc., which are undertaken while doing a typical job. Unnecessary movements are sought to be eliminated so that it takes less time for completion of work, thereby enhancing efficiency.",
      },
    ],
    "c12-economics": [
      {
        chapter: "Determination of Income and Employment",
        marks: 4,
        q: "In an economy, the Marginal Propensity to Consume (MPC) is 0.8. If investment increases by ₹500 crores, calculate: (i) Value of Investment Multiplier (k), and (ii) Total increase in National Income (ΔY).",
        sampleAns: "Given: MPC = 0.8, ΔI = ₹500 crores. Formula: k = 1 / (1 - MPC). Substituting values: k = 1 / (1 - 0.8) = 1 / 0.2 = 5. Now, Multiplier k = ΔY / ΔI => 5 = ΔY / 500 => ΔY = 5 * 500 = ₹2,500 crores. Total increase in National Income is ₹2,500 crores.",
      },
    ],
    "c10-maths": [
      {
        chapter: "Real Numbers",
        marks: 3,
        q: "Prove that √5 is an irrational number.",
        sampleAns: "Let us assume to the contrary that √5 is rational. Then √5 = a/b where a and b are co-prime integers and b != 0. Squaring both sides: 5 = a²/b² => 5b² = a². Thus 5 divides a², which implies 5 divides a. Let a = 5c for some integer c. Then 5b² = (5c)² = 25c² => b² = 5c². Thus 5 divides b², so 5 divides b. Therefore a and b have at least 5 as a common factor. This contradicts the fact that a and b are co-prime. Hence √5 is irrational.",
      },
    ],
    "c10-science": [
      {
        chapter: "Acids, Bases and Salts",
        marks: 3,
        q: "Explain the Chlor-alkali process. Write the balanced chemical equation and mention the products formed at the anode and cathode.",
        sampleAns: "When electricity is passed through an aqueous solution of sodium chloride (brine), it decomposes to form sodium hydroxide, chlorine gas, and hydrogen gas. Equation: 2NaCl(aq) + 2H₂O(l) -> 2NaOH(aq) + Cl₂(g) + H₂(g). Products: Chlorine gas (Cl₂) is released at the anode, Hydrogen gas (H₂) is released at the cathode, and Sodium hydroxide (NaOH) is formed near the cathode.",
      },
    ],
  };

  const currentSamples = sampleQuestions[activeSubject.id] || sampleQuestions["c10-maths"] || [];

  const handleLoadSample = (sample: { q: string; marks: number; chapter: string; sampleAns: string }) => {
    setQuestion(sample.q);
    setMaxMarks(sample.marks);
    setSelectedChapter(sample.chapter);
    setStudentAnswer(sample.sampleAns);
    setResult(null);
  };

  const handleEvaluate = async () => {
    if (!question.trim() || !studentAnswer.trim()) {
      setErrorMsg("Please provide both the CBSE question and your written answer.");
      return;
    }

    setErrorMsg(null);
    setEvaluating(true);
    setResult(null);

    try {
      const evalResponse = await evaluateAnswer({
        question,
        maxMarks,
        studentAnswer,
        subject: activeSubject.name,
        classLevel: currentClass,
        chapter: selectedChapter,
        markingSchemeContext,
      });

      setResult(evalResponse);
      onLogEvaluation(evalResponse);

      if (evalResponse.score / evalResponse.maxMarks >= 0.8) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to evaluate answer. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const verdictStyles: Record<string, { bg: string; border: string; text: string }> = {
    "✅ Board-ready": { bg: "bg-emerald-950/60", border: "border-emerald-500", text: "text-emerald-300" },
    "🟢 Strong": { bg: "bg-teal-950/60", border: "border-teal-500", text: "text-teal-300" },
    "🟡 Needs improvement": { bg: "bg-amber-950/60", border: "border-amber-500", text: "text-amber-300" },
    "🔴 Major conceptual gap": { bg: "bg-rose-950/60", border: "border-rose-500", text: "text-rose-300" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="bg-[#0b051e]/90 border border-purple-500/30 backdrop-blur-xl rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-slate-100">
              Chief CBSE Academic Evaluator
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              Strict Step-Wise Rubric
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Submit your handwritten or typed solution. The evaluator applies official CBSE criteria, computes step-wise mark deductions, logs errors, and provides model answers.
          </p>
        </div>

        {/* Sample loader */}
        {currentSamples.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 font-medium">Load CBSE Board Sample:</span>
            {currentSamples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(s)}
                className="px-3 py-1 text-xs rounded-full bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                Sample {idx + 1} ({s.marks}M)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Question Details
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Max Marks:</label>
                <select
                  aria-label="Max Marks"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-bold focus:outline-none"
                >
                  <option value={1}>1 Mark (MCQ/Objective)</option>
                  <option value={2}>2 Marks (VSA)</option>
                  <option value={3}>3 Marks (Short Answer)</option>
                  <option value={4}>4 Marks (Case-Based)</option>
                  <option value={5}>5 Marks (Long Answer)</option>
                  <option value={6}>6 Marks (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Chapter Select */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">NCERT Chapter / Topic</label>
              <select
                aria-label="NCERT Chapter / Topic"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                {activeSubject.chapters.map((ch, idx) => (
                  <option key={idx} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">CBSE Question Text</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Paste the CBSE board question or problem statement..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Student Answer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-400">
                  Your Written Answer / Steps / Working Notes
                </label>
                <span className="text-[10px] text-slate-500">LaTeX equations ($...$) allowed</span>
              </div>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                rows={7}
                placeholder="Write your complete solution here, including formulas, journal entries, headings, and working notes..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Optional Official Marking Scheme hint */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Optional Reference Marking Scheme / Answer Key (if available)
              </label>
              <input
                type="text"
                value={markingSchemeContext}
                onChange={(e) => setMarkingSchemeContext(e.target.value)}
                placeholder="e.g. 1 mark for formula, 1 mark for substitution, 1 mark for unit"
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                evaluating
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-amber-600/30 hover:opacity-95"
              }`}
            >
              {evaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Answer Against CBSE Marking Rubric...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Submit for Strict CBSE Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Evaluation Results */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              {/* Score Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <VyniqLogoIcon size={18} />
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Official CBSE Board Rubric Evaluation
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-cyan-300 to-amber-300 bg-clip-text">
                      {result.scoreDisplay}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({Math.round((result.score / result.maxMarks) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      verdictStyles[result.examinerVerdict]?.bg || "bg-slate-800"
                    } ${verdictStyles[result.examinerVerdict]?.border || "border-slate-700"} ${
                      verdictStyles[result.examinerVerdict]?.text || "text-slate-200"
                    }`}
                  >
                    {result.examinerVerdict}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Quality: <strong className="text-cyan-300">{result.answerQuality}</strong>
                  </span>
                </div>
              </div>

              {/* Step-Wise Marking Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  Step-Wise Marking Breakdown
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Evaluation Criterion</th>
                        <th className="p-2.5 text-center">Marks</th>
                        <th className="p-2.5">Examiner Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {result.markingBreakdown?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{item.criterion}</td>
                          <td className="p-2.5 text-center font-bold text-cyan-300">
                            {item.marksAwarded} / {item.maxMarks}
                          </td>
                          <td className="p-2.5 text-slate-400">{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* What You Did Right & What Cost You Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Strengths */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    What You Did Right
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {result.whatYouDidRight?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deductions */}
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    What Cost You Marks
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {result.whatCostYouMarks?.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Error Classification Card (Mistake -> Cause -> Correction -> Prevention) */}
              {result.errorClassification && result.errorClassification.category !== "None" && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Classified Error: {result.errorClassification.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 font-mono">
                      Logged to Weakness Map
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 font-semibold block">Cause:</span>
                      <p className="text-slate-300">{result.errorClassification.cause}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Correction:</span>
                      <p className="text-emerald-300">{result.errorClassification.correction}</p>
                    </div>
                  </div>
                  <div className="text-xs pt-1 border-t border-amber-900/60">
                    <span className="text-slate-400 font-semibold">Prevention Protocol: </span>
                    <span className="text-slate-200">{result.errorClassification.prevention}</span>
                  </div>
                </div>
              )}

              {/* Model Board Answer */}
              <div>
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Topper Model Answer (Full Marks NCERT Formulation)
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/50 shadow-inner">
                  <LatexRenderer content={result.modelAnswer} />
                </div>
              </div>

              {/* Rubric Disclaimer & Next Step */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-800 pt-3">
                <span>{result.rubricDisclaimer || "Evaluation aligned with CBSE NCERT rubrics."}</span>
                {result.suggestedNextTopic && (
                  <span className="text-cyan-400 font-medium">
                    Recommended next: {result.suggestedNextTopic}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center">
              <Award className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-400 mb-1">
                Awaiting Student Answer Submission
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter your written solution or select one of the CBSE board samples to receive an official-grade marking breakdown, examiner verdict, and error diagnosis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
