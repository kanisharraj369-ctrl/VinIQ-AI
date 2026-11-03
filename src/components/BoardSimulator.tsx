import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ClassLevel, SubjectInfo, ExamPaper, ExamQuestion, EvaluationResult } from "../types";
import { generateBoardExamPaper, evaluateAnswer } from "../services/api";
import { LatexRenderer } from "./LatexRenderer";

interface BoardSimulatorProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
  onLogEvaluation: (evalResult: EvaluationResult) => void;
}

export const BoardSimulator: React.FC<BoardSimulatorProps> = ({
  currentClass,
  activeSubject,
  onLogEvaluation,
}) => {
  const [examType, setExamType] = useState("Full Syllabus Test");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalMarks, setTotalMarks] = useState(25);
  const [generating, setGenerating] = useState(false);

  // Active exam state
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Question navigation and answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [scratchpad, setScratchpad] = useState("");
  const [isEvaluatingPaper, setIsEvaluatingPaper] = useState(false);
  const [evaluatedResults, setEvaluatedResults] = useState<EvaluationResult[]>([]);

  // Timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (examStarted && !examSubmitted && timeRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examSubmitted, timeRemainingSeconds]);

  const handleGenerateExam = async () => {
    setGenerating(true);
    try {
      const paper = await generateBoardExamPaper({
        classLevel: currentClass,
        subject: activeSubject.name,
        examType,
        durationMinutes,
        totalMarks,
      });

      setActivePaper(paper);
      setTimeRemainingSeconds(paper.durationMinutes * 60);
      setExamStarted(true);
      setExamSubmitted(false);
      setCurrentQuestionIndex(0);
      setStudentAnswers({});
      setEvaluatedResults([]);
    } catch (err: any) {
      alert("Failed to generate simulation paper: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const allQuestions: ExamQuestion[] = activePaper
    ? activePaper.sections.flatMap((s) => s.questions)
    : [];

  const currentQ = allQuestions[currentQuestionIndex];

  const handleAutoSubmit = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!activePaper || isEvaluatingPaper) return;
    setExamSubmitted(true);
    setIsEvaluatingPaper(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const results: EvaluationResult[] = [];

    // Evaluate each question using the AI evaluator
    try {
      for (const q of allQuestions) {
        const studentAns = studentAnswers[q.id] || "No answer submitted by student.";
        try {
          const evalRes = await evaluateAnswer({
            question: q.text,
            maxMarks: q.marks,
            studentAnswer: studentAns,
            subject: activeSubject.name,
            classLevel: currentClass,
            chapter: q.chapter || "Board Simulation",
            markingSchemeContext: q.markingScheme || undefined,
          });
          results.push(evalRes);
          onLogEvaluation(evalRes);
        } catch (e) {
          console.error("Evaluation error on q:", q.id, e);
        }
      }
      setEvaluatedResults(results);

      const totalEarned = results.reduce((acc, r) => acc + r.score, 0);
      const totalMax = results.reduce((acc, r) => acc + r.maxMarks, 0);

      if (totalMax > 0 && totalEarned / totalMax >= 0.75) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error("Paper evaluation failed", err);
    } finally {
      setIsEvaluatingPaper(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {!examStarted ? (
        /* Pre-Exam Setup Screen */
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-100">
              CBSE Board Examination Simulator
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Experience authentic CBSE board examination conditions with timed sections, case-based questions, scratchpad, and strict instant AI evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Target Subject</label>
              <div className="text-cyan-300 font-bold text-sm">{activeSubject.name}</div>
              <span className="text-[11px] text-slate-500">{currentClass}</span>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Duration</label>
              <select
                aria-label="Duration"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value={30}>30 Minutes (Quick Test)</option>
                <option value={45}>45 Minutes (Sectional Test)</option>
                <option value={60}>60 Minutes (Half Mock)</option>
                <option value={90}>90 Minutes (Term Simulation)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Total Marks</label>
              <select
                aria-label="Total Marks"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value={20}>20 Marks (10 Questions)</option>
                <option value={25}>25 Marks (12 Questions)</option>
                <option value={40}>40 Marks (Full Blueprint)</option>
              </select>
            </div>
          </div>

          {/* Instructions checklist */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-slate-200 uppercase tracking-wider block text-[11px]">
              CBSE Exam Hall Guidelines:
            </span>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
              <li>Section A: 1-mark objective/MCQ questions.</li>
              <li>Section B & C: 2-mark & 3-mark short conceptual/numerical questions.</li>
              <li>Section D: 5-mark long comprehensive questions requiring detailed steps.</li>
              <li>Section E: 4-mark case-based/source-based questions with internal sub-parts.</li>
              <li>Use the scratchpad tab on the right for rough working notes.</li>
            </ul>
          </div>

          <button
            onClick={handleGenerateExam}
            disabled={generating}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl ${
              generating
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-cyan-600/30 hover:opacity-95"
            }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Assembling Official Blueprint Paper...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Begin Timed Board Examination</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Live Exam or Evaluation Results */
        <div className="space-y-4">
          {/* Top Bar: Timer, Title, Submit */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{activePaper?.title}</h3>
              <p className="text-xs text-slate-400">
                {activeSubject.name} • {currentClass} • Total Marks: {activePaper?.totalMarks}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {!examSubmitted && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                    timeRemainingSeconds < 300
                      ? "bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse"
                      : "bg-slate-950 border-slate-700 text-cyan-300"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>
              )}

              {!examSubmitted ? (
                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95"
                >
                  Submit Paper
                </button>
              ) : (
                <button
                  onClick={() => setExamStarted(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Simulation Test
                </button>
              )}
            </div>
          </div>

          {!examSubmitted ? (
            /* Active Question Solving Interface */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Question & Answer Input */}
              <div className="lg:col-span-8 space-y-4">
                {currentQ && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold flex items-center justify-center text-xs">
                          {currentQuestionIndex + 1}
                        </span>
                        <span className="font-bold text-slate-200">Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                          {currentQ.marks} Mark{currentQ.marks > 1 ? "s" : ""}
                        </span>
                      </div>

                      <span className="text-slate-400 font-medium">{currentQ.chapter || activeSubject.name}</span>
                    </div>

                    {/* Question Text with LaTeX */}
                    <div className="text-slate-100 text-sm font-medium leading-relaxed">
                      <LatexRenderer content={currentQ.text} />
                    </div>

                    {/* MCQ Options if applicable */}
                    {currentQ.options && currentQ.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {currentQ.options.map((opt, optIdx) => {
                          const isSelected = studentAnswers[currentQ.id] === opt;
                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))
                              }
                              className={`p-3 rounded-xl text-left text-xs border transition flex items-center gap-2 ${
                                isSelected
                                  ? "bg-cyan-950 border-cyan-500 text-cyan-200 font-bold"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[11px] flex items-center justify-center">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Written Solution Input */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Your Written Answer / Steps / Journal Entries / Proof:
                      </label>
                      <textarea
                        value={studentAnswers[currentQ.id] || ""}
                        onChange={(e) =>
                          setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                        }
                        rows={7}
                        placeholder="Write your complete CBSE step-wise solution..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Prev / Next Question Navigation */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous Question
                      </button>

                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(allQuestions.length - 1, prev + 1)
                          )
                        }
                        disabled={currentQuestionIndex === allQuestions.length - 1}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
                      >
                        Next Question
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Question Palette & Scratchpad */}
              <div className="lg:col-span-4 space-y-4">
                {/* Question Palette */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Question Palette ({allQuestions.length})
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {allQuestions.map((q, idx) => {
                      const isAnswered = !!studentAnswers[q.id]?.trim();
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                            isCurrent
                              ? "bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30 ring-2 ring-cyan-400/50"
                              : isAnswered
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Attempted
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" /> Unattempted
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" /> Current
                    </span>
                  </div>
                </div>

                {/* Scratchpad */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Rough Working Scratchpad
                  </h4>
                  <textarea
                    value={scratchpad}
                    onChange={(e) => setScratchpad(e.target.value)}
                    rows={6}
                    placeholder="Use this space for rough calculations, formula derivations, ratio workings..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Post-Exam Detailed CBSE Assessment Report */
            <div className="space-y-6">
              {isEvaluatingPaper ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                  <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-slate-100">
                    Vyniq Chief Evaluator is Marking Your Paper...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Evaluating each question strictly against official CBSE marking schemes, identifying mark loss reasons, and compiling your board readiness score.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Score Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Examination Score Summary
                      </span>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-300 to-amber-300 bg-clip-text">
                          {evaluatedResults.reduce((acc, r) => acc + r.score, 0)} / {evaluatedResults.reduce((acc, r) => acc + r.maxMarks, 0)}
                        </span>
                        <span className="text-sm font-semibold text-slate-400">
                          (
                          {Math.round(
                            (evaluatedResults.reduce((acc, r) => acc + r.score, 0) /
                              Math.max(1, evaluatedResults.reduce((acc, r) => acc + r.maxMarks, 0))) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-bold text-xs">
                        {allQuestions.length} Questions Evaluated
                      </span>
                    </div>
                  </div>

                  {/* Individual Question Evaluations */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-200">
                      Step-by-Step Question Breakdown
                    </h4>

                    {evaluatedResults.map((res, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-slate-200">
                            Q{idx + 1}: {res.question.slice(0, 80)}...
                          </span>
                          <span className="font-mono font-bold text-cyan-300 text-sm">
                            {res.score} / {res.maxMarks} ({res.examinerVerdict})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-slate-500 font-semibold block mb-1">Your Submitted Answer:</span>
                            <p className="text-slate-300 whitespace-pre-wrap">{res.studentAnswer}</p>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-cyan-400 font-semibold block mb-1">Model Board Solution:</span>
                            <LatexRenderer content={res.modelAnswer} />
                          </div>
                        </div>

                        {res.whatCostYouMarks && res.whatCostYouMarks.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300">
                            <strong>Mark Loss Factors: </strong>
                            {res.whatCostYouMarks.join("; ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
