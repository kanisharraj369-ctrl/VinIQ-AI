import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  Target,
  Shield,
  Layers,
  Check,
  ChevronRight,
  Flame,
  Clock,
  Compass,
} from "lucide-react";
import {
  ClassLevel,
  SubjectInfo,
  AdaptiveLevel,
  AdaptiveQuestionItem,
  AdaptiveSessionStartResult,
  AdaptiveStepEvaluationResult,
  AdaptiveAttemptRecord,
} from "../types";
import { startAdaptiveSession, evaluateAndAdaptDifficulty } from "../services/api";
import { LatexRenderer } from "./LatexRenderer";

interface AdaptiveDifficultySystemProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
  onSendToEvaluator?: (question: string, marks: number, chapter: string) => void;
  onLogWeakness?: (concept: string, deficit: string) => void;
}

export const AdaptiveDifficultySystem: React.FC<AdaptiveDifficultySystemProps> = ({
  currentClass,
  activeSubject,
  onSendToEvaluator,
  onLogWeakness,
}) => {
  // Session Configuration State
  const [selectedChapter, setSelectedChapter] = useState<string>(activeSubject.chapters[0] || "");
  const [customConcept, setCustomConcept] = useState<string>("");
  const [startLevel, setStartLevel] = useState<AdaptiveLevel>(1);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [initLoading, setInitLoading] = useState<boolean>(false);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Session State
  const [sessionMeta, setSessionMeta] = useState<AdaptiveSessionStartResult | null>(null);
  const [currentLevel, setCurrentLevel] = useState<AdaptiveLevel>(1);
  const [activeQuestion, setActiveQuestion] = useState<AdaptiveQuestionItem | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>("");
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<AdaptiveStepEvaluationResult | null>(null);

  // Analytics & History
  const [attemptHistory, setAttemptHistory] = useState<AdaptiveAttemptRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [highestLevelReached, setHighestLevelReached] = useState<AdaptiveLevel>(1);

  const levelHierarchy: {
    level: AdaptiveLevel;
    name: string;
    shortTitle: string;
    desc: string;
    bgGlow: string;
    border: string;
    textBadge: string;
    badgeBg: string;
    icon: any;
  }[] = [
    {
      level: 1,
      name: "Foundation",
      shortTitle: "L1 Recall",
      desc: "Direct NCERT definitions, fundamental vocabulary, and core formulas.",
      bgGlow: "rgba(59, 130, 246, 0.2)",
      border: "border-blue-500/40",
      textBadge: "text-blue-300",
      badgeBg: "bg-blue-950/80 border-blue-500/40",
      icon: BookOpen,
    },
    {
      level: 2,
      name: "Understanding",
      shortTitle: "L2 Comprehend",
      desc: "Explain reasons, contrast concepts, and interpret NCERT statements.",
      bgGlow: "rgba(6, 182, 212, 0.2)",
      border: "border-cyan-500/40",
      textBadge: "text-cyan-300",
      badgeBg: "bg-cyan-950/80 border-cyan-500/40",
      icon: Compass,
    },
    {
      level: 3,
      name: "Application",
      shortTitle: "L3 Apply",
      desc: "Standard numericals, journal entries, and scenario problem-solving.",
      bgGlow: "rgba(16, 185, 129, 0.2)",
      border: "border-emerald-500/40",
      textBadge: "text-emerald-300",
      badgeBg: "bg-emerald-950/80 border-emerald-500/40",
      icon: Zap,
    },
    {
      level: 4,
      name: "Case-Based",
      shortTitle: "L4 Case Study",
      desc: "CBSE-style case study, source clues extraction, and multi-step deduction.",
      bgGlow: "rgba(245, 158, 11, 0.2)",
      border: "border-amber-500/40",
      textBadge: "text-amber-300",
      badgeBg: "bg-amber-950/80 border-amber-500/40",
      icon: Target,
    },
    {
      level: 5,
      name: "High Difficulty (HOTS)",
      shortTitle: "L5 HOTS",
      desc: "Higher-Order Thinking Skills, multi-concept synthesis, and tricky edge cases.",
      bgGlow: "rgba(244, 63, 94, 0.2)",
      border: "border-rose-500/40",
      textBadge: "text-rose-300",
      badgeBg: "bg-rose-950/80 border-rose-500/40",
      icon: Flame,
    },
    {
      level: 6,
      name: "Board Simulation",
      shortTitle: "L6 Board Rigor",
      desc: "Strict timed examination standard with complete step-wise CBSE marking scheme.",
      bgGlow: "rgba(16, 185, 129, 0.25)",
      border: "border-emerald-500/50",
      textBadge: "text-emerald-300",
      badgeBg: "bg-emerald-950/90 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      icon: Award,
    },
  ];

  // Helper for quick symbol insertion into textarea
  const insertSymbol = (sym: string) => {
    setStudentAnswer((prev) => prev + sym);
  };

  const handleStartSession = async () => {
    setInitLoading(true);
    setErrorMsg(null);
    setLastEvaluation(null);

    const targetConcept = customConcept.trim() || selectedChapter;

    try {
      const res = await startAdaptiveSession({
        classLevel: currentClass,
        subject: activeSubject.name,
        chapter: selectedChapter,
        concept: targetConcept,
        startLevel,
      });

      setSessionMeta(res);
      setCurrentLevel(startLevel);
      setHighestLevelReached(startLevel);
      setActiveQuestion(res.initialQuestion);
      setStudentAnswer("");
      setSelectedMcqOption(null);
      setShowHint(false);
      setIsSessionActive(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start adaptive learning session.");
    } finally {
      setInitLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeQuestion) return;

    let finalSubmission = studentAnswer.trim();
    if (activeQuestion.options && selectedMcqOption !== null) {
      finalSubmission = `Selected Option: ${String.fromCharCode(65 + selectedMcqOption)}. ${activeQuestion.options[selectedMcqOption]}`;
    }

    if (!finalSubmission) {
      setErrorMsg("Please provide an answer or choose an option before submitting.");
      return;
    }

    setEvalLoading(true);
    setErrorMsg(null);

    try {
      const res = await evaluateAndAdaptDifficulty({
        classLevel: currentClass,
        subject: activeSubject.name,
        chapter: selectedChapter,
        concept: customConcept || selectedChapter,
        currentLevel,
        questionText: activeQuestion.question,
        questionMarks: activeQuestion.marks,
        questionType: activeQuestion.type,
        studentAnswer: finalSubmission,
        modelAnswer: activeQuestion.modelAnswer,
      });

      setLastEvaluation(res);

      // Record attempt in history
      const newRecord: AdaptiveAttemptRecord = {
        id: `att-${Date.now()}`,
        timestamp: Date.now(),
        questionText: activeQuestion.question,
        level: currentLevel,
        levelTitle: levelHierarchy.find((l) => l.level === currentLevel)?.name || `Level ${currentLevel}`,
        studentAnswer: finalSubmission,
        scoreAwarded: res.scoreAwarded,
        maxMarks: res.maxMarks,
        understandingScore: res.understandingScore,
        levelAction: res.levelAction,
        comprehensionStatus: res.comprehensionStatus,
        adaptiveExplanation: res.adaptiveExplanation,
        topperTip: res.topperTip,
      };

      setAttemptHistory((prev) => [newRecord, ...prev]);

      // Streak & highest level calculation
      if (res.levelAction === "PROMOTE") {
        setStreak((s) => s + 1);
        setHighestLevelReached((h) => Math.max(h, (res.newLevel as AdaptiveLevel)) as AdaptiveLevel);
      } else if (res.levelAction === "DEMOTE") {
        setStreak(0);
        if (onLogWeakness && res.gapsIdentified.length > 0) {
          onLogWeakness(
            customConcept || selectedChapter,
            `Adaptive Scaffold: ${res.gapsIdentified[0]}`
          );
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to evaluate answer and adapt difficulty.");
    } finally {
      setEvalLoading(false);
    }
  };

  const handleProceedToNext = () => {
    if (!lastEvaluation || !lastEvaluation.nextQuestion) return;

    setCurrentLevel(lastEvaluation.newLevel as AdaptiveLevel);
    setActiveQuestion(lastEvaluation.nextQuestion);
    setStudentAnswer("");
    setSelectedMcqOption(null);
    setShowHint(false);
    setLastEvaluation(null);
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setSessionMeta(null);
    setActiveQuestion(null);
    setLastEvaluation(null);
    setStudentAnswer("");
    setSelectedMcqOption(null);
  };

  const currentLevelInfo = levelHierarchy.find((l) => l.level === currentLevel) || levelHierarchy[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#120732] via-[#1a0c47] to-[#0d0526] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono">
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>AI Neuro-Adaptive Difficulty Engine</span>
              <span className="text-purple-500">•</span>
              <span className="text-amber-300 font-bold">L1 Foundation ➔ L6 Board Simulation</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Dynamic Adaptive Mastery System
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Vyniq AI continuously assesses your conceptual grasp, step precision, and NCERT keywords.
              When you demonstrate flawless understanding, the difficulty level escalates towards Board Simulation.
              If gaps are detected, the system immediately scaffolds down to reinforce foundational intuition.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          {isSessionActive && (
            <div className="flex flex-wrap lg:flex-col gap-3 bg-[#080219]/80 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-md shrink-0 min-w-[200px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">Current Level:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentLevelInfo.badgeBg} ${currentLevelInfo.textBadge}`}>
                  Level {currentLevel} ({currentLevelInfo.name})
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">Mastery Streak:</span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {streak} in a row
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">Peak Level:</span>
                <span className="text-xs font-bold text-purple-300">
                  Level {highestLevelReached}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6-STAGE ADAPTIVE LADDER STEPPER (Always Visible Visual Hierarchy) */}
      <div className="bg-[#09031c] border border-purple-900/40 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              6-Tier CBSE Cognitive Complexity Hierarchy
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Target: 100% Board Readiness
          </span>
        </div>

        {/* The 6 Nodes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {levelHierarchy.map((lvl) => {
            const Icon = lvl.icon;
            const isCurrent = isSessionActive && currentLevel === lvl.level;
            const isCompleted = isSessionActive && lvl.level < currentLevel;
            const isPeak = isSessionActive && highestLevelReached === lvl.level && highestLevelReached > currentLevel;

            return (
              <div
                key={lvl.level}
                className={`relative rounded-2xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? `${lvl.border} bg-slate-900/90 shadow-[0_0_20px_${lvl.bgGlow}] ring-2 ring-purple-500/40 scale-[1.03] z-10`
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-950/20 text-slate-300"
                    : "border-purple-950/60 bg-slate-950/60 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Active Pulse indicator */}
                {isCurrent && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 text-[9px] font-bold text-white items-center justify-center">
                      ★
                    </span>
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? lvl.badgeBg + " " + lvl.textBadge
                          : isCompleted
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      L{lvl.level}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isCurrent ? lvl.textBadge : isCompleted ? "text-emerald-400" : "text-slate-500"
                      }`}
                    />
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{lvl.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">{lvl.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span
                    className={
                      isCurrent
                        ? "text-purple-300 font-bold"
                        : isCompleted
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    {isCurrent ? "Active Tier" : isCompleted ? "Mastered ✓" : isPeak ? "Peak Reached" : "Pending"}
                  </span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-300 hover:text-white font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SESSION SETUP MODAL / CARD (When no active session) */}
      {!isSessionActive ? (
        <div className="bg-[#0b0420] border border-purple-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-purple-900/40 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Configure Adaptive Session</h2>
              <p className="text-xs text-slate-400">
                Choose your CBSE chapter and target concept. The engine will calibrate an entry question.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chapter Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                1. Select Chapter ({activeSubject.name} — {currentClass})
              </label>
              <select
                aria-label="Select Chapter for Adaptive Session"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full bg-[#120732] border border-purple-500/30 text-slate-200 text-xs rounded-2xl p-3 focus:outline-none focus:border-purple-400 transition"
              >
                {activeSubject.chapters.map((ch, idx) => (
                  <option key={idx} value={ch} className="bg-slate-950 text-slate-200">
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Concept Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                2. Target Subtopic / Concept (Optional)
              </label>
              <input
                type="text"
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                placeholder="e.g. Pro-Rata Forfeiture, BPT Theorem, Ohm's Law, Fayol's Principles..."
                className="w-full bg-[#120732] border border-purple-500/30 text-slate-200 text-xs rounded-2xl p-3 focus:outline-none focus:border-purple-400 placeholder:text-slate-500 transition"
              />
            </div>
          </div>

          {/* Initial Entry Level Choice */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              3. Select Starting Baseline Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {levelHierarchy.map((l) => (
                <button
                  key={l.level}
                  type="button"
                  onClick={() => setStartLevel(l.level)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    startLevel === l.level
                      ? `${l.border} ${l.badgeBg} text-white shadow-lg ring-1 ring-purple-400`
                      : "bg-[#120732]/60 border-purple-950/60 text-slate-400 hover:text-slate-200 hover:border-purple-800"
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-purple-300">Level {l.level}</div>
                  <div className="text-xs font-bold text-slate-100 mt-0.5">{l.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/40">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Grounded in Official 2026–27 CBSE Syllabus & NCERT Texts</span>
            </div>

            <button
              onClick={handleStartSession}
              disabled={initLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {initLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Adaptive Probe...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Launch Adaptive Mastery Session →</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE ADAPTIVE SESSION VIEW */
        <div className="space-y-6">
          {/* Top Session Breadcrumb Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c0422] border border-purple-800/40 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentLevelInfo.badgeBg} ${currentLevelInfo.textBadge} border`}>
                Level {currentLevel}: {currentLevelInfo.name}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {sessionMeta?.concept || selectedChapter}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeSubject.name} • {currentClass}
                </p>
              </div>
            </div>

            <button
              onClick={handleResetSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-slate-300 hover:text-white hover:border-purple-400 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change Topic / Restart</span>
            </button>
          </div>

          {/* ACTIVE QUESTION CARD */}
          {activeQuestion && (
            <div className="bg-[#0b0420] border border-purple-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-200">
                    Question ({activeQuestion.marks} {activeQuestion.marks === 1 ? "Mark" : "Marks"})
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                    Type: {activeQuestion.type}
                  </span>
                </div>

                <div className="text-xs text-purple-300 font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>{activeQuestion.ncertReference}</span>
                </div>
              </div>

              {/* Question Text with LaTeX */}
              <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed bg-[#120732]/60 p-4 sm:p-6 rounded-2xl border border-purple-500/20">
                <LatexRenderer content={activeQuestion.question} />
              </div>

              {/* MCQ Options If Available */}
              {activeQuestion.options && activeQuestion.options.length > 0 ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Select Your Answer:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeQuestion.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = selectedMcqOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedMcqOption(idx)}
                          className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? "bg-purple-950/90 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400"
                              : "bg-[#120732]/60 border-purple-900/40 text-slate-300 hover:bg-[#180a42] hover:border-purple-600/50"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-normal">
                            <LatexRenderer content={opt} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Textarea with LaTeX / Symbol bar for Written Answers */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Draft Your Step-Wise Answer:
                    </label>
                    {/* Math / Chemistry quick symbol palette */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">Insert:</span>
                      {["$", "₹", "\\sqrt{}", "\\frac{}{}", "\\Delta", "\\pi", "\\rightarrow", "\\pm"].map(
                        (sym, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => insertSymbol(sym)}
                            className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 hover:bg-purple-800 hover:text-white font-mono text-[11px] transition"
                          >
                            {sym}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Provide your step-by-step working, NCERT keywords, legal provisions, or calculations here..."
                    className="w-full bg-[#120732]/80 border border-purple-500/30 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-400 font-sans leading-relaxed placeholder:text-slate-500"
                  />
                </div>
              )}

              {/* Scaffolding Hint Toggle */}
              {activeQuestion.hint && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition font-medium"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>{showHint ? "Hide Scaffolding Hint" : "Stuck? View Scaffolding Hint (No Penalty)"}</span>
                  </button>

                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs leading-relaxed"
                      >
                        <p className="font-bold text-amber-300 mb-1">💡 Scaffolding Guide:</p>
                        <LatexRenderer content={activeQuestion.hint} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/40">
                <div className="text-xs text-slate-400">
                  Evaluated against official CBSE marking schemes and NCERT criteria.
                </div>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={evalLoading}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {evalLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Diagnosing Comprehension & Adapting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Submit for Adaptive Assessment →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ADAPTIVE EVALUATION & DIFFICULTY RECALIBRATION CARD */}
          <AnimatePresence>
            {lastEvaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-gradient-to-b from-[#150a3d] to-[#0d0526] border border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              >
                {/* Level Transition Alert Banner */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    lastEvaluation.levelAction === "PROMOTE"
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200"
                      : lastEvaluation.levelAction === "MAINTAIN"
                      ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-200"
                      : "bg-amber-950/80 border-amber-500/60 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {lastEvaluation.levelAction === "PROMOTE" ? (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-900/80 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    ) : lastEvaluation.levelAction === "MAINTAIN" ? (
                      <div className="w-10 h-10 rounded-2xl bg-cyan-900/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                        <Zap className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-amber-900/80 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                        <ArrowDownRight className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-base font-extrabold tracking-tight">
                        {lastEvaluation.actionMessage}
                      </h3>
                      <p className="text-xs opacity-90 mt-0.5">
                        Status: <span className="font-bold">{lastEvaluation.comprehensionStatus}</span> • Understanding Index:{" "}
                        <span className="font-bold">{lastEvaluation.understandingScore}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-extrabold font-mono text-white">
                      {lastEvaluation.scoreDisplay} Marks
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                      Assessed Score
                    </div>
                  </div>
                </div>

                {/* Strengths & Gaps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-2xl bg-[#0e0529] border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Conceptual Strengths Verified</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {lastEvaluation.strengthsIdentified.map((st, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Conceptual Gaps & Missed Keywords */}
                  <div className="p-4 rounded-2xl bg-[#0e0529] border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Diagnosed Gaps / Key NCERT Terms Missed</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {lastEvaluation.gapsIdentified.length > 0 ? (
                        lastEvaluation.gapsIdentified.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-emerald-300">No major conceptual gaps detected. Clean execution!</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Calibrated Adaptive Explanation */}
                <div className="p-5 rounded-2xl bg-[#0e0529] border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Adaptive NCERT Pedagogical Explanation</span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
                    <LatexRenderer content={lastEvaluation.adaptiveExplanation} />
                  </div>
                </div>

                {/* Examiner Topper Tip */}
                {lastEvaluation.topperTip && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-400/40 text-xs text-purple-200 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 mr-1">CBSE Examiner Topper Insight:</span>
                      <span>{lastEvaluation.topperTip}</span>
                    </div>
                  </div>
                )}

                {/* Next Step Action Button */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/40">
                  <div className="text-xs text-slate-400 font-mono">
                    Next Target: Level {lastEvaluation.newLevel} ({lastEvaluation.newLevelTitle})
                  </div>

                  <button
                    onClick={handleProceedToNext}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <span>Proceed to Next Adaptive Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* SESSION ATTEMPT TRAJECTORY & HISTORY */}
      {attemptHistory.length > 0 && (
        <div className="bg-[#0a031e] border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Session Performance Trajectory ({attemptHistory.length} Probes)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Live Neuro-Cognitive Audit
            </span>
          </div>

          <div className="space-y-3">
            {attemptHistory.map((att, idx) => (
              <div
                key={att.id}
                className="p-4 rounded-2xl bg-[#120732]/60 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-300 font-mono">Probe #{attemptHistory.length - idx}:</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-200 text-[10px] font-bold">
                      {att.levelTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        att.levelAction === "PROMOTE"
                          ? "bg-emerald-950 text-emerald-300"
                          : att.levelAction === "MAINTAIN"
                          ? "bg-cyan-950 text-cyan-300"
                          : "bg-amber-950 text-amber-300"
                      }`}
                    >
                      {att.levelAction}
                    </span>
                  </div>
                  <p className="text-slate-300 line-clamp-1">{att.questionText}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-100">
                    {att.scoreAwarded} / {att.maxMarks} Marks ({att.understandingScore}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
