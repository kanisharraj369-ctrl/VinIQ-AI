import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BrainCircuit,
  BarChart3,
  FileCheck2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { HeroCosmicGlobe } from "./HeroCosmicGlobe";
import { ClassLevel, SubjectId } from "../types";

interface HeroSectionProps {
  currentClass: ClassLevel;
  currentSubject: SubjectId;
  onNavigateTab: (tab: string) => void;
  onSelectClass: (cls: ClassLevel) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentClass,
  currentSubject,
  onNavigateTab,
  onSelectClass,
}) => {
  return (
    <div className="relative w-full overflow-hidden bg-[#05140d] border-b border-emerald-900/40 pt-6 pb-14 lg:pb-20">
      {/* Clean Eco Harmonic Canvas */}
      <div className="absolute inset-0 z-0 opacity-90">
        <HeroCosmicGlobe className="w-full h-full min-h-[520px]" />
      </div>

      {/* Subtle Eco Atmospheric Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-emerald-500/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[180px] bg-teal-500/10 blur-[90px] pointer-events-none z-0" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Top Session Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md mb-5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
            Official CBSE Academic Session 2026–27
          </span>
          <span className="text-emerald-500/80">•</span>
          <span className="text-xs text-emerald-300 font-mono">Rationalised NCERT Matrix</span>
        </motion.div>

        {/* Big Display Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
        >
          <span className="block text-slate-100">Chief Academic Evaluator &</span>
          <span className="bg-gradient-to-r from-emerald-200 via-teal-300 to-mint-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.35)]">
            AI Neuro-Tutor
          </span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Master CBSE <span className="text-emerald-300 font-semibold">Class 10 & 12</span> with verified NCERT pedagogical accuracy, strict step-wise board evaluations, multi-tier competency generation, and spaced neuro-retrieval.
        </motion.p>

        {/* Class Selection & Quick Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          {/* Class Toggle Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#081f17]/90 border border-emerald-500/30 backdrop-blur-md shadow-md">
            <button
              onClick={() => onSelectClass("Class 10")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentClass === "Class 10"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Class 10 Secondary
            </button>
            <button
              onClick={() => onSelectClass("Class 12")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentClass === "Class 12"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Class 12 Senior Secondary
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigateTab("adaptive")}
            className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 border border-emerald-300/40"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>Launch Adaptive Engine (L1 ➔ L6)</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* AI Neuro-Tutor Button */}
          <button
            onClick={() => onNavigateTab("tutor")}
            className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/90 text-emerald-300 border border-emerald-500/30 font-bold text-sm hover:bg-emerald-950/60 hover:text-emerald-200 transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Start AI Neuro-Tutor</span>
          </button>

          {/* Secondary Action Pill */}
          <button
            onClick={() => onNavigateTab("evaluator")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 font-semibold text-sm hover:bg-emerald-900/70 hover:border-emerald-400/50 transition-all duration-200 backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Evaluate My Answer →</span>
          </button>
        </motion.div>

        {/* Clean Eco HUD Cards */}
        <div className="relative w-full max-w-5xl mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          
          {/* Card 1: Step-wise Marking Schemes */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{ y: -3 }}
            className="relative p-4 rounded-2xl bg-[#092218]/85 border border-emerald-500/25 backdrop-blur-xl shadow-lg overflow-hidden group cursor-pointer"
            onClick={() => onNavigateTab("evaluator")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                  Step-Wise Rubric
                </div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">
                  0.5m Precision Marking
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
              Deduction breakdown, error classification (<span className="text-emerald-300 font-medium">Mistake → Cause → Fix</span>), and NCERT model answers.
            </p>
          </motion.div>

          {/* Card 2: 4-Section Neuro-Tutor Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -3 }}
            className="relative p-4 rounded-2xl bg-[#092218]/85 border border-teal-500/25 backdrop-blur-xl shadow-lg overflow-hidden group cursor-pointer"
            onClick={() => onNavigateTab("tutor")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
                <BrainCircuit className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400">
                  AI Neuro-Tutor
                </div>
                <div className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors">
                  4-Section NCERT Protocol
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
              Conceptual Core, Step-by-Step Exemplar, Board Pitfalls, and L0–L5 Socratic Diagnostics.
            </p>
          </motion.div>

          {/* Card 3: Spaced Revision & Diagnostic Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            whileHover={{ y: -3 }}
            className="relative p-4 rounded-2xl bg-[#092218]/85 border border-emerald-500/25 backdrop-blur-xl shadow-lg overflow-hidden group cursor-pointer"
            onClick={() => onNavigateTab("dashboard")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                  Memory Mastery
                </div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Spaced Retrieval & Lab
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
              Day 0 to Day 30 scheduled retention loops and Accountancy 10-Step / BST 5-Step Protocol Labs.
            </p>
          </motion.div>

        </div>

      </div>
    </div>
  );
};
