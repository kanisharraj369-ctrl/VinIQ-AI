import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronUp, ChevronDown, Lock, CreditCard, UserCheck, ShieldAlert } from "lucide-react";
import { ClassLevel, SubjectId, NeuroLevel, WeaknessItem, SpacedRevisionItem, EvaluationResult } from "./types";
import { SUBJECTS_DATA, INITIAL_WEAKNESSES, INITIAL_SPACED_REVISIONS } from "./data/curriculumData";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { NeuroTutorChat } from "./components/NeuroTutorChat";
import { ExamEvaluator } from "./components/ExamEvaluator";
import { PerformanceDashboard } from "./components/PerformanceDashboard";
import { QuestionGenerator } from "./components/QuestionGenerator";
import { BoardSimulator } from "./components/BoardSimulator";
import { NcertProtocolLabs } from "./components/NcertProtocolLabs";
import { AdaptiveDifficultySystem } from "./components/AdaptiveDifficultySystem";
import { LoginPage } from "./components/LoginPage";
import { SubscriptionPage } from "./components/SubscriptionPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { VyniqLogo } from "./components/VyniqLogo";
import { useAuth } from "./context/AuthContext";
import { ADMIN_EMAIL } from "./data/authData";

export function App() {
  const { currentUser, isAdmin, isAllowed } = useAuth();
  const [currentClass, setCurrentClass] = useState<ClassLevel>("Class 12");
  const [currentSubjectId, setCurrentSubjectId] = useState<SubjectId>("c12-accountancy");
  const [activeTab, setActiveTab] = useState<string>("tutor");
  const [neuroLevel, setNeuroLevel] = useState<NeuroLevel>(3);
  const [showHeroBanner, setShowHeroBanner] = useState<boolean>(true);

  // Persistent-like application state across tools
  const [weaknessList, setWeaknessList] = useState<WeaknessItem[]>(INITIAL_WEAKNESSES);
  const [spacedRevisionList, setSpacedRevisionList] = useState<SpacedRevisionItem[]>(INITIAL_SPACED_REVISIONS);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationResult[]>([]);

  // Get active subject info object
  const activeSubject =
    SUBJECTS_DATA.find((s) => s.id === currentSubjectId) ||
    SUBJECTS_DATA.find((s) => s.classLevel === currentClass) ||
    SUBJECTS_DATA[0];

  const handleAddWeakness = (item: Omit<WeaknessItem, "id" | "dateIdentified">) => {
    const newItem: WeaknessItem = {
      ...item,
      id: `w-${Date.now()}`,
      dateIdentified: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    };
    setWeaknessList((prev) => [newItem, ...prev]);
  };

  const handleResolveWeakness = (id: string) => {
    setWeaknessList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "Mastered" as const } : w)).filter((w) => w.id !== id)
    );
  };

  const handleAdvanceSpacedRevision = (id: string) => {
    setSpacedRevisionList((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              currentIntervalIndex: Math.min(5, r.currentIntervalIndex + 1),
              dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
            }
          : r
      )
    );
  };

  const handleDeleteSpacedRevision = (id: string) => {
    setSpacedRevisionList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLogEvaluation = (evalResult: EvaluationResult) => {
    setEvaluationHistory((prev) => [evalResult, ...prev]);

    // Automatically add to Weakness Map if severe deduction or error
    if (
      evalResult.score / evalResult.maxMarks < 0.7 &&
      evalResult.errorClassification &&
      evalResult.errorClassification.category !== "None"
    ) {
      const topicName = evalResult.chapter || activeSubject.name;
      const alreadyExists = weaknessList.some(
        (w) => w.subtopic === topicName && w.subject === activeSubject.name
      );
      if (!alreadyExists) {
        handleAddWeakness({
          subject: activeSubject.name,
          chapter: evalResult.chapter || "Board Practice",
          subtopic: evalResult.chapter || "Conceptual Application",
          severity: "High",
          mistakeSummary: `${evalResult.errorClassification.category}: ${evalResult.errorClassification.cause}`,
          status: "Needs Practice",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05140d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Universal Navbar */}
      <Navbar
        currentClass={currentClass}
        onSelectClass={setCurrentClass}
        currentSubjectId={currentSubjectId}
        onSelectSubject={setCurrentSubjectId}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        neuroLevel={neuroLevel}
        onSetNeuroLevel={setNeuroLevel}
      />

      {/* Hero Eco Overview Banner (Interactive & Collapsible) */}
      <AnimatePresence>
        {showHeroBanner && activeTab !== "login" && activeTab !== "admin" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
          >
            <HeroSection
              currentClass={currentClass}
              currentSubject={currentSubjectId}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setShowHeroBanner(false);
              }}
              onSelectClass={(cls) => {
                setCurrentClass(cls);
                const newSubs = SUBJECTS_DATA.filter((s) => s.classLevel === cls);
                if (newSubs.length > 0) setCurrentSubjectId(newSubs[0].id);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Banner Toggle Bar */}
      {activeTab !== "login" && activeTab !== "admin" && (
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-end pt-2 pb-1">
          <button
            onClick={() => setShowHeroBanner((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#092218]/80 border border-emerald-500/20 text-slate-400 hover:text-emerald-300 hover:border-emerald-400/40 text-[11px] font-medium transition-all backdrop-blur-sm shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{showHeroBanner ? "Hide Academic Overview" : "Show Academic Overview"}</span>
            {showHeroBanner ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Account Locked / Pending Approval Warning if student is revoked */}
      {currentUser && !isAllowed && !isAdmin && activeTab !== "pricing" && activeTab !== "login" && (
        <div className="max-w-4xl mx-auto px-4 my-4 w-full">
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-300">
                  {currentUser.subscriptionStatus === "pending_approval"
                    ? "Subscription Pending Admin Approval"
                    : "Account Access Restricted"}
                </p>
                <p className="text-amber-200/80 text-[11px] mt-0.5">
                  {currentUser.subscriptionStatus === "pending_approval"
                    ? `Admin (${ADMIN_EMAIL}) will verify your payment and activate full access.`
                    : "Please subscribe to an affordable CBSE plan to continue using AI tools."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("pricing")}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition shadow-sm"
            >
              View Pricing & Plans →
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport with AnimatePresence */}
      <main className="flex-1 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "login" && (
              <LoginPage
                onSuccess={() => setActiveTab("tutor")}
                onNavigateSubscription={() => setActiveTab("pricing")}
              />
            )}

            {activeTab === "pricing" && (
              <SubscriptionPage
                onPlanSelected={() => {
                  setShowHeroBanner(false);
                  setActiveTab("tutor");
                }}
                onNavigateLogin={() => setActiveTab("login")}
              />
            )}

            {activeTab === "admin" && <AdminDashboard />}

            {activeTab === "adaptive" && (
              <AdaptiveDifficultySystem
                currentClass={currentClass}
                activeSubject={activeSubject}
                onSendToEvaluator={(q, m, ch) => {
                  setActiveTab("evaluator");
                }}
                onLogWeakness={(concept, deficit) => {
                  handleAddWeakness({
                    subject: activeSubject.name,
                    chapter: concept,
                    subtopic: concept,
                    severity: "High",
                    mistakeSummary: deficit,
                    status: "Needs Practice",
                  });
                }}
              />
            )}

            {activeTab === "tutor" && (
              <NeuroTutorChat
                currentClass={currentClass}
                activeSubject={activeSubject}
                neuroLevel={neuroLevel}
                onUpdateWeakness={(concept, deficit) => {
                  handleAddWeakness({
                    subject: activeSubject.name,
                    chapter: concept,
                    subtopic: concept,
                    severity: "Medium",
                    mistakeSummary: deficit,
                    status: "Needs Practice",
                  });
                }}
              />
            )}

            {activeTab === "evaluator" && (
              <ExamEvaluator
                currentClass={currentClass}
                activeSubject={activeSubject}
                onLogEvaluation={handleLogEvaluation}
              />
            )}

            {activeTab === "dashboard" && (
              <PerformanceDashboard
                currentClass={currentClass}
                activeSubject={activeSubject}
                weaknessList={weaknessList}
                spacedRevisionList={spacedRevisionList}
                evaluationHistory={evaluationHistory}
                onAddWeakness={handleAddWeakness}
                onResolveWeakness={handleResolveWeakness}
                onAdvanceSpacedRevision={handleAdvanceSpacedRevision}
                onDeleteSpacedRevision={handleDeleteSpacedRevision}
              />
            )}

            {activeTab === "generator" && (
              <QuestionGenerator
                currentClass={currentClass}
                activeSubject={activeSubject}
                onSendToEvaluator={() => {
                  setActiveTab("evaluator");
                }}
              />
            )}

            {activeTab === "simulator" && (
              <BoardSimulator
                currentClass={currentClass}
                activeSubject={activeSubject}
                onLogEvaluation={handleLogEvaluation}
              />
            )}

            {activeTab === "labs" && (
              <NcertProtocolLabs
                currentClass={currentClass}
                activeSubject={activeSubject}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Status */}
      <footer className="border-t border-emerald-950/60 bg-[#030d08] py-4 text-xs text-slate-400 mt-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <VyniqLogo size="xs" subtitle="TECHNOLOGIES" variant="horizontal" />
            <span className="text-emerald-800 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">Chief Academic Evaluator & AI Neuro-Tutor</span>
          </div>
          <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span>CBSE 2026–27 Official Syllabus Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
