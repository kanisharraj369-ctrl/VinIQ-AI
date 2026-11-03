import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_EMAIL } from "../data/authData";
import { VyniqLogo } from "./VyniqLogo";

interface LoginPageProps {
  onSuccess?: () => void;
  onNavigateSubscription?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateSubscription }) => {
  const { login, switchUserRoleForDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState<"Class 10" | "Class 12">("Class 12");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    const res = login(email, name, selectedClass);
    if (res.success) {
      setFeedback({ type: "success", text: res.message });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    }
  };

  const handleQuickDemoAdmin = () => {
    setEmail(ADMIN_EMAIL);
    setName("Kanisha Raj");
    switchUserRoleForDemo(ADMIN_EMAIL);
    setFeedback({ type: "success", text: `Logged in as Super Administrator (${ADMIN_EMAIL})` });
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 600);
  };

  const handleQuickDemoStudent = () => {
    const studentEmail = "rohit.sharma@commerce.in";
    setEmail(studentEmail);
    setName("Rohit Sharma");
    switchUserRoleForDemo(studentEmail);
    setFeedback({ type: "success", text: "Logged in as Rohit Sharma (CBSE Pro Subscriber)" });
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative">
      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0c0622]/90 border border-purple-500/30 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <VyniqLogo size="md" subtitle="TECHNOLOGIES" variant="stacked" />
          <h2 className="text-xl font-black text-white mt-3 tracking-tight">
            {isSignUp ? "Create Your Student Account" : "Sign In to Vyniq AI Tutor"}
          </h2>
          <p className="text-xs text-purple-300/80 mt-1 max-w-xs">
            Access official CBSE step-wise evaluators, AI neuro-tutoring, and NCERT revision labs.
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-5 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs">
          <p className="text-[11px] text-purple-300 font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick 1-Click Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-400/40 font-medium text-[11px] flex items-center justify-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Login</span>
            </button>
            <button
              type="button"
              onClick={handleQuickDemoStudent}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/30 font-medium text-[11px] flex items-center justify-center gap-1 transition"
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Student Pro</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                : "bg-rose-950/80 border border-rose-500/50 text-rose-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="e.g. Aryan Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050214] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@example.com or admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050214] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
            {email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Recognized Chief Super Admin Email!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Select Target CBSE Class
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Class 10", "Class 12"] as const).map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    selectedClass === cls
                      ? "bg-purple-900/80 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                      : "bg-[#050214] border-purple-500/20 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cls} Board
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isSignUp ? "Register & Enter Dashboard" : "Sign In with Credentials"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer toggles */}
        <div className="mt-6 pt-4 border-t border-purple-900/30 flex flex-col items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFeedback(null);
            }}
            className="text-purple-300 hover:text-white font-medium transition"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "New to Vyniq AI? Create a Student Account"}
          </button>

          {onNavigateSubscription && (
            <button
              type="button"
              onClick={onNavigateSubscription}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px] mt-1"
            >
              <span>View Affordable CBSE Subscription Plans</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
