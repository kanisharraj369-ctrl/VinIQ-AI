import React from "react";
import { motion } from "motion/react";
import {
  Brain,
  Award,
  BarChart3,
  HelpCircle,
  Clock,
  BookOpen,
  ChevronDown,
  Zap,
  ShieldCheck,
  CreditCard,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ClassLevel, SubjectId, NeuroLevel } from "../types";
import { SUBJECTS_DATA } from "../data/curriculumData";
import { VyniqLogo } from "./VyniqLogo";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentClass: ClassLevel;
  onSelectClass: (c: ClassLevel) => void;
  currentSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  neuroLevel: NeuroLevel;
  onSetNeuroLevel: (level: NeuroLevel) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentClass,
  onSelectClass,
  currentSubjectId,
  onSelectSubject,
  activeTab,
  onSelectTab,
  neuroLevel,
  onSetNeuroLevel,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const currentSubjects = SUBJECTS_DATA.filter((s) => s.classLevel === currentClass);

  const neuroLevelLabels: Record<NeuroLevel, { label: string; desc: string; color: string }> = {
    0: { label: "L0 - Unknown", desc: "Concept not learned yet", color: "bg-slate-800 text-slate-300 border-slate-700" },
    1: { label: "L1 - Recognition", desc: "Recognises terminology only", color: "bg-emerald-950 text-emerald-300 border-emerald-800" },
    2: { label: "L2 - Understanding", desc: "Can explain in simple terms", color: "bg-teal-950 text-teal-300 border-teal-800" },
    3: { label: "L3 - Application", desc: "Solves standard questions", color: "bg-emerald-950 text-emerald-300 border-emerald-600" },
    4: { label: "L4 - Exam Mastery", desc: "Handles CBSE case-based & HOTS", color: "bg-amber-950 text-amber-300 border-amber-700/60" },
    5: { label: "L5 - Advanced Mastery", desc: "Unfamiliar multi-concept mastery", color: "bg-emerald-900 text-emerald-200 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" },
  };

  const navTabs = [
    { id: "adaptive", label: "Adaptive Mastery", icon: TrendingUp, badge: "Foundation ➔ Board" },
    { id: "tutor", label: "AI Neuro-Tutor", icon: Brain, badge: "NCERT-Grounded" },
    { id: "evaluator", label: "Exam Evaluator", icon: Award, badge: "Strict Rubric" },
    { id: "dashboard", label: "Weakness Map & Analytics", icon: BarChart3, badge: "Spaced Retention" },
    { id: "generator", label: "Question Engine", icon: HelpCircle, badge: "L1–L6" },
    { id: "simulator", label: "Board Simulation", icon: Clock, badge: "Timed Test" },
    { id: "labs", label: "NCERT Protocol Labs", icon: BookOpen, badge: "Acc / BST" },
    { id: "pricing", label: "Subscription Plans", icon: CreditCard, badge: "Affordable" },
    ...(isAdmin ? [{ id: "admin", label: "Admin Control", icon: ShieldCheck, badge: "Master Panel" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#04140e]/95 backdrop-blur-xl border-b border-emerald-900/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      {/* Top Banner with Brand Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab("tutor")}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
            >
              <VyniqLogo size="md" subtitle="TECHNOLOGIES" variant="horizontal" />
            </button>
            <div className="hidden xl:block pl-3 border-l border-emerald-900/40">
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                AI Neuro-Tutor & Chief Evaluator
              </p>
              <p className="text-[10px] text-emerald-400 font-mono">
                “Unlock what’s next.”
              </p>
            </div>
          </div>

          {/* Right Controls: Class, Subject, Neuro Level, User Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Class Switcher Pills */}
            <div className="flex rounded-full bg-[#081e15] p-1 border border-emerald-500/25 backdrop-blur-md">
              {(["Class 10", "Class 12"] as ClassLevel[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSelectClass(c);
                    const newSubs = SUBJECTS_DATA.filter((s) => s.classLevel === c);
                    if (newSubs.length > 0) onSelectSubject(newSubs[0].id);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                    currentClass === c
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Subject Selector */}
            <div className="relative">
              <select
                aria-label="Select Subject"
                value={currentSubjectId}
                onChange={(e) => onSelectSubject(e.target.value as SubjectId)}
                className="bg-[#081e15] border border-emerald-500/25 text-slate-200 text-xs rounded-full px-3.5 py-1.5 font-medium pr-8 focus:outline-none focus:border-emerald-400 cursor-pointer appearance-none shadow-sm hover:border-emerald-400/50 transition-colors"
              >
                {currentSubjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#05140d] text-slate-200">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Neuro-Tutor Diagnostic Level Pill */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#081e15] border border-emerald-500/25 rounded-full px-3 py-1 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-200 font-medium">Diagnostic:</span>
              <select
                aria-label="Select Diagnostic Level"
                value={neuroLevel}
                onChange={(e) => onSetNeuroLevel(Number(e.target.value) as NeuroLevel)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer bg-transparent border border-transparent focus:outline-none ${neuroLevelLabels[neuroLevel].color}`}
              >
                <option value={0} className="bg-[#05140d] text-slate-200">L0 - Unknown</option>
                <option value={1} className="bg-[#05140d] text-slate-200">L1 - Recognition</option>
                <option value={2} className="bg-[#05140d] text-slate-200">L2 - Understanding</option>
                <option value={3} className="bg-[#05140d] text-slate-200">L3 - Application</option>
                <option value={4} className="bg-[#05140d] text-slate-200">L4 - Exam Mastery</option>
                <option value={5} className="bg-[#05140d] text-slate-200">L5 - Advanced Mastery</option>
              </select>
            </div>

            {/* User Account / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#081e15] border border-emerald-500/30 rounded-full px-3 py-1 text-xs">
                <button
                  onClick={() => onSelectTab(isAdmin ? "admin" : "pricing")}
                  className="flex items-center gap-1.5 text-emerald-200 hover:text-white font-medium truncate max-w-[130px] sm:max-w-[170px]"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentUser.name}</span>
                  {isAdmin && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-bold shrink-0">
                      ADMIN
                    </span>
                  )}
                </button>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-400 transition ml-1 p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectTab("login")}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.35)] transition flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation with Animated Indicator */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-emerald-950/60 pt-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-white font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-emerald-950/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? "bg-emerald-950 text-emerald-200 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
