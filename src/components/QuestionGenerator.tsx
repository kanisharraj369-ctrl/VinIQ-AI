import React, { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  FileSpreadsheet,
} from "lucide-react";
import { ClassLevel, SubjectInfo, GeneratedQuestion } from "../types";
import { generatePracticeQuestions } from "../services/api";
import { LatexRenderer } from "./LatexRenderer";

interface QuestionGeneratorProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
  onSendToEvaluator?: (question: string, marks: number, chapter: string) => void;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  currentClass,
  activeSubject,
  onSendToEvaluator,
}) => {
  const [selectedChapter, setSelectedChapter] = useState(activeSubject.chapters[0] || "");
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [count, setCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selectedMcqOptions, setSelectedMcqOptions] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const levels = [
    { level: 1, name: "Level 1 — Foundation", desc: "Direct NCERT recall, definition, core formula", color: "text-blue-400 border-blue-800 bg-blue-950/40" },
    { level: 2, name: "Level 2 — Understanding", desc: "Explain, interpret, contrast, differentiate", color: "text-cyan-400 border-cyan-800 bg-cyan-950/40" },
    { level: 3, name: "Level 3 — Application", desc: "Apply concept to new scenario / standard numerical", color: "text-emerald-400 border-emerald-800 bg-emerald-950/40" },
    { level: 4, name: "Level 4 — Case-Based", desc: "CBSE-style case study or practical scenario", color: "text-amber-400 border-amber-800 bg-amber-950/40" },
    { level: 5, name: "Level 5 — High Difficulty", desc: "Multi-concept problem, HOTS, tricky application", color: "text-rose-400 border-rose-800 bg-rose-950/40" },
    { level: 6, name: "Level 6 — Board Simulation", desc: "Timed realistic question with official CBSE marks", color: "text-purple-400 border-purple-800 bg-purple-950/40" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await generatePracticeQuestions({
        classLevel: currentClass,
        subject: activeSubject.name,
        chapter: selectedChapter,
        level: selectedLevel,
        count,
      });

      setQuestions(res.questions || []);
      setRevealedSolutions({});
      setSelectedMcqOptions({});
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate practice questions.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">
              CBSE Question Generation Engine
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-mono">
              6-Tier Taxonomy
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Generate authentic CBSE practice questions from Level 1 Foundation recall to Level 6 Timed Board Simulation with complete step-wise marking schemes.
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Chapter Selector */}
          <div className="md:col-span-6">
            <label className="block text-xs text-slate-400 font-semibold mb-1">
              Select NCERT Chapter / Area
            </label>
            <select
              aria-label="Select NCERT Chapter / Area"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              {activeSubject.chapters.map((ch, idx) => (
                <option key={idx} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div className="md:col-span-3">
            <label className="block text-xs text-slate-400 font-semibold mb-1">
              Quantity
            </label>
            <select
              aria-label="Quantity"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>1 Question (In-depth)</option>
              <option value={3}>3 Questions (Standard Set)</option>
              <option value={5}>5 Questions (Comprehensive)</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                loading
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-600/30 hover:opacity-95"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing CBSE Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Practice Set</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Level Selector Badges */}
        <div>
          <label className="block text-xs text-slate-400 font-semibold mb-2">
            Target Difficulty & Competency Tier:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.level;
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => setSelectedLevel(lvl.level)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? `${lvl.color} ring-2 ring-cyan-400/50 shadow-md`
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{lvl.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{lvl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Generated Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Generated CBSE Practice Set ({questions.length} Questions)
            </h3>
            <span className="text-xs text-slate-400">
              NCERT Chapter: <strong className="text-cyan-300">{selectedChapter.split("(")[0].trim()}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isRevealed = !!revealedSolutions[q.id || `q-${idx}`];
              const qId = q.id || `q-${idx}`;

              return (
                <div
                  key={qId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
                >
                  {/* Top Bar: Question Type, Marks, Reference */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-300">{q.type}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                        {q.marks} Mark{q.marks > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{q.ncertReference}</span>
                      <button
                        onClick={() => handleCopy(q.question, qId)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Copy question text"
                      >
                        {copiedId === qId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="text-slate-100 text-sm font-medium leading-relaxed">
                    <LatexRenderer content={q.question} />
                  </div>

                  {/* MCQ Options if present */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedMcqOptions[qId] === optIdx;
                        const isCorrect = q.correctOptionIndex === optIdx;
                        const showFeedback = isRevealed;

                        return (
                          <button
                            key={optIdx}
                            onClick={() =>
                              setSelectedMcqOptions((prev) => ({ ...prev, [qId]: optIdx }))
                            }
                            className={`p-3 rounded-xl text-left text-xs border transition flex items-center gap-2 ${
                              showFeedback
                                ? isCorrect
                                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold"
                                  : isSelected
                                  ? "bg-rose-950/60 border-rose-500 text-rose-200"
                                  : "bg-slate-950 border-slate-800 text-slate-400"
                                : isSelected
                                ? "bg-cyan-950 border-cyan-500 text-cyan-200"
                                : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[11px] flex items-center justify-center font-bold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-questions for Case-based */}
                  {q.subQuestions && q.subQuestions.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                      {q.subQuestions.map((sub, sIdx) => (
                        <div key={sIdx} className="text-xs text-slate-300">
                          <span className="font-bold text-cyan-400">({String.fromCharCode(97 + sIdx)}) </span>
                          <span>{sub.text}</span>
                          <span className="text-amber-300 font-bold ml-1.5">[{sub.marks}M]</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Solution and Step-Wise Rubric Section */}
                  {isRevealed && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 bg-slate-950/70 p-4 rounded-xl">
                      {/* Step-Wise Marking Scheme */}
                      {q.stepWiseMarkingScheme && q.stepWiseMarkingScheme.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                            CBSE Step-Wise Marking Rubric:
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {q.stepWiseMarkingScheme.map((s, sIdx) => (
                              <li key={sIdx} className="flex items-center justify-between p-1.5 bg-slate-900 rounded-lg">
                                <span>{s.step}</span>
                                <span className="font-bold text-amber-400 font-mono">{s.marks} Mark</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Model Answer */}
                      <div>
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                          Official NCERT Model Answer:
                        </span>
                        <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-200">
                          <LatexRenderer content={q.modelAnswer} />
                        </div>
                      </div>

                      {/* Common Student Pitfalls */}
                      {q.commonStudentPitfalls && q.commonStudentPitfalls.length > 0 && (
                        <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg text-xs text-rose-300">
                          <span className="font-bold block mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Frequent CBSE Examiner Pitfall Observations:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {q.commonStudentPitfalls.map((p, pIdx) => (
                              <li key={pIdx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    <button
                      onClick={() => toggleSolution(qId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition flex items-center gap-1.5"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {isRevealed ? "Hide Marking Key" : "Reveal Step-Wise Marking Key"}
                    </button>

                    {onSendToEvaluator && (
                      <button
                        onClick={() => onSendToEvaluator(q.question, q.marks, selectedChapter)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-700/60 font-semibold transition flex items-center gap-1.5"
                      >
                        <span>Solve in Exam Evaluator</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
