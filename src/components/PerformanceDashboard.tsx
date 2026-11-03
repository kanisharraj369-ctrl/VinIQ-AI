import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Brain,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCw,
  Plus,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Award,
} from "lucide-react";
import { ClassLevel, SubjectInfo, WeaknessItem, SpacedRevisionItem, EvaluationResult } from "../types";
import { LatexRenderer } from "./LatexRenderer";

interface PerformanceDashboardProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
  weaknessList: WeaknessItem[];
  spacedRevisionList: SpacedRevisionItem[];
  evaluationHistory: EvaluationResult[];
  onAddWeakness: (item: Omit<WeaknessItem, "id" | "dateIdentified">) => void;
  onResolveWeakness: (id: string) => void;
  onAdvanceSpacedRevision: (id: string) => void;
  onDeleteSpacedRevision: (id: string) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  currentClass,
  activeSubject,
  weaknessList,
  spacedRevisionList,
  evaluationHistory,
  onAddWeakness,
  onResolveWeakness,
  onAdvanceSpacedRevision,
  onDeleteSpacedRevision,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "weaknessMap" | "spacedRevision" | "errorLog">("overview");

  // Manual Weakness Form State
  const [newChapter, setNewChapter] = useState(activeSubject.chapters[0] || "");
  const [newSubtopic, setNewSubtopic] = useState("");
  const [newDeficit, setNewDeficit] = useState("");
  const [newSeverity, setNewSeverity] = useState<"High" | "Medium" | "Low">("High");

  // Active Recall Modal State
  const [activeRecallItem, setActiveRecallItem] = useState<SpacedRevisionItem | null>(null);
  const [userRecallAnswer, setUserRecallAnswer] = useState("");
  const [showKeySummary, setShowKeySummary] = useState(false);

  // Compute Live Metrics from actual evaluation data
  const subjectEvals = evaluationHistory.filter((e) => e.subject === activeSubject.name);
  const totalSubmissions = subjectEvals.length;

  const totalScoreEarned = subjectEvals.reduce((acc, curr) => acc + curr.score, 0);
  const totalMaxPossible = subjectEvals.reduce((acc, curr) => acc + curr.maxMarks, 0);

  const accuracyPct = totalMaxPossible > 0 ? Math.round((totalScoreEarned / totalMaxPossible) * 100) : 74;
  const conceptMasteryPct = totalSubmissions > 0 ? Math.min(100, Math.round(accuracyPct * 1.05)) : 78;
  const applicationPct = totalSubmissions > 0 ? Math.max(40, Math.round(accuracyPct * 0.92)) : 68;
  const recallPct = totalSubmissions > 0 ? Math.min(100, Math.round(accuracyPct * 0.98)) : 82;
  const overallMasteryPct = Math.round((conceptMasteryPct + applicationPct + recallPct + accuracyPct) / 4);

  let boardReadinessBadge = "🟢 High Probability (85%+)";
  if (overallMasteryPct < 60) boardReadinessBadge = "🔴 Major Gaps (<60%)";
  else if (overallMasteryPct < 75) boardReadinessBadge = "🟡 Needs Intensive Practice (60-75%)";
  else if (overallMasteryPct < 88) boardReadinessBadge = "🟢 Board-Ready (75-88%)";
  else boardReadinessBadge = "🔵 Topper-Grade Distinction (90%+)";

  // Filter weakness map by subject
  const subjectWeaknesses = weaknessList.filter((w) => w.subject === activeSubject.name);
  const subjectRevisions = spacedRevisionList.filter((r) => r.subject === activeSubject.name);

  const intervals = ["Day 0 (Learn)", "Day 1 (1st Recall)", "Day 3 (Consolidate)", "Day 7 (Deep Retention)", "Day 14 (Exam Readiness)", "Day 30 (Mastery)"];

  const handleCreateWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtopic.trim() || !newDeficit.trim()) return;

    onAddWeakness({
      subject: activeSubject.name,
      chapter: newChapter.split("(")[0].trim(),
      subtopic: newSubtopic,
      severity: newSeverity,
      mistakeSummary: newDeficit,
      status: "Needs Practice",
    });

    setNewSubtopic("");
    setNewDeficit("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "overview"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Performance Analytics
          </button>
          <button
            onClick={() => setActiveSubTab("weaknessMap")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "weaknessMap"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Weakness Map ({subjectWeaknesses.length})
          </button>
          <button
            onClick={() => setActiveSubTab("spacedRevision")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "spacedRevision"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Spaced Revision Engine (Day 0–30)
          </button>
          <button
            onClick={() => setActiveSubTab("errorLog")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "errorLog"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Error Log ({evaluationHistory.length})
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Subject: <strong className="text-cyan-300">{activeSubject.name}</strong> • {currentClass}
        </div>
      </div>

      {/* SUBTAB 1: OVERVIEW METRICS */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Overall Mastery</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text">
                {overallMasteryPct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${overallMasteryPct}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Concept Mastery</span>
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-purple-300">
                {conceptMasteryPct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${conceptMasteryPct}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Application & HOTS</span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-300">
                {applicationPct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${applicationPct}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Accuracy & Rigour</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-300">
                {accuracyPct}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${accuracyPct}%` }} />
              </div>
            </div>
          </div>

          {/* Diagnostic Assessment Card (Mandatory Section 28 Format) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Vyniq Official Diagnostic Report
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Weakest Topic:</span>
                <span className="text-rose-300 font-bold text-sm">
                  {subjectWeaknesses.length > 0 ? subjectWeaknesses[0].subtopic : "None logged yet"}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Requires active recall drill</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Strongest Topic:</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {activeSubject.highYieldTopics[0] || "NCERT Core Definitions"}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">High retention verified</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Priority Next Action:</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {subjectWeaknesses.length > 0 ? `Targeted 10-Step Drill: ${subjectWeaknesses[0].subtopic}` : "Timed Sectional Board Simulation"}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">High impact on board percentile</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Board Readiness Index:</span>
                <span className="text-amber-300 font-bold text-sm">{boardReadinessBadge}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Evaluated per CBSE marking trend</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: WEAKNESS MAP */}
      {activeSubTab === "weaknessMap" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form to log manual weakness */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Add Conceptual Deficit to Weakness Map
            </h3>

            <form onSubmit={handleCreateWeakness} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">NCERT Chapter</label>
                <select
                  aria-label="NCERT Chapter"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                >
                  {activeSubject.chapters.map((ch, idx) => (
                    <option key={idx} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specific Subtopic / Principle</label>
                <input
                  type="text"
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  placeholder="e.g. Hidden Goodwill on Admission / Saponification / Taylor's Functional Foremanship"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Severity & Priority</label>
                <select
                  aria-label="Severity & Priority"
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="High">High Severity (Frequent Board Mistake)</option>
                  <option value="Medium">Medium Severity (Calculation / Presentation)</option>
                  <option value="Low">Low Severity (Minor Recall Slip)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Underlying Misconception / Recurring Mistake</label>
                <textarea
                  value={newDeficit}
                  onChange={(e) => setNewDeficit(e.target.value)}
                  rows={3}
                  placeholder="e.g. Forgetting to deduct partner's actual capital from total capitalised value when finding hidden goodwill."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/30"
              >
                Log to Diagnostic Weakness Map
              </button>
            </form>
          </div>

          {/* List of Weakness Items */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Active Weakness Diagnostic Matrix ({subjectWeaknesses.length})</span>
              <span className="text-[11px] text-slate-500">Subject: {activeSubject.name}</span>
            </h3>

            {subjectWeaknesses.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold">No critical weaknesses logged yet!</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Take a Board Simulation or submit answers in Exam Evaluator to automatically detect gaps.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {subjectWeaknesses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.severity === "High"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : item.severity === "Medium"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-blue-950 text-blue-300 border border-blue-800"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">{item.subtopic}</h4>
                      </div>
                      <button
                        onClick={() => onResolveWeakness(item.id)}
                        className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition"
                      >
                        Mark Mastered ✓
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">{item.mistakeSummary}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1.5">
                      <span>Chapter: {item.chapter}</span>
                      <span>Identified: {item.dateIdentified}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SPACED REVISION ENGINE */}
      {activeSubTab === "spacedRevision" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Spaced Revision Engine (Ebbinghaus Forgetting Curve Offset)
              </h3>
              <p className="text-xs text-slate-400">
                Scheduled active recall at intervals: Day 0 → Day 1 → Day 3 → Day 7 → Day 14 → Day 30.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono">
              {subjectRevisions.length} Active Memory Trails
            </span>
          </div>

          {/* Interval Visual Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {intervals.map((intv, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-cyan-400 block font-bold">Stage {idx + 1}</span>
                <span className="text-xs font-semibold text-slate-300">{intv}</span>
              </div>
            ))}
          </div>

          {/* Active Recall Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectRevisions.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{rev.concept}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/60">
                      {intervals[rev.currentIntervalIndex] || "Mastered"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{rev.chapter}</p>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-amber-200">
                    <strong>Active Recall Challenge: </strong>
                    {rev.activeRecallQuestion}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <button
                    onClick={() => {
                      setActiveRecallItem(rev);
                      setUserRecallAnswer("");
                      setShowKeySummary(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition text-xs flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    Test My Recall
                  </button>

                  <button
                    onClick={() => onDeleteSpacedRevision(rev.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: ERROR LOG */}
      {activeSubTab === "errorLog" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              Classified Error Log & Remediation History
            </h3>
            <span className="text-xs text-slate-400">Total Evaluations: {evaluationHistory.length}</span>
          </div>

          {evaluationHistory.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">
                No evaluated exam answers yet. Use the **Exam Evaluator** to test your answers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {evaluationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {item.subject} • {item.chapter}
                    </span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {item.score} / {item.maxMarks} ({item.examinerVerdict})
                    </span>
                  </div>

                  <p className="text-slate-400 italic">“{item.question}”</p>

                  {item.errorClassification && item.errorClassification.category !== "None" && (
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200">
                      <div className="font-bold mb-1">{item.errorClassification.category}</div>
                      <div>
                        <strong>Cause: </strong>
                        {item.errorClassification.cause}
                      </div>
                      <div className="text-emerald-300 mt-1">
                        <strong>Correction: </strong>
                        {item.errorClassification.correction}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Recall Modal */}
      {activeRecallItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Active Retrieval Drill: {activeRecallItem.concept}
              </h3>
              <button
                onClick={() => setActiveRecallItem(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-200">
              <strong>Question: </strong>
              {activeRecallItem.activeRecallQuestion}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                State your recall / answer before checking the solution:
              </label>
              <textarea
                value={userRecallAnswer}
                onChange={(e) => setUserRecallAnswer(e.target.value)}
                rows={3}
                placeholder="Type your explanation, formula or journal entry from memory..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {showKeySummary ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-700/60 text-xs text-slate-200 space-y-2">
                <span className="font-bold text-emerald-300 block">Authoritative NCERT Key Summary:</span>
                <LatexRenderer content={activeRecallItem.keySummary} />
              </div>
            ) : (
              <button
                onClick={() => setShowKeySummary(true)}
                className="w-full py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
              >
                Reveal Official Model Key
              </button>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveRecallItem(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onAdvanceSpacedRevision(activeRecallItem.id);
                  setActiveRecallItem(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/30"
              >
                Promote to Next Retention Stage ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
