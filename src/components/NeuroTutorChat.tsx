import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Zap,
  Flame,
  Search,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Copy,
  Check,
  ChevronRight,
  BrainCircuit,
  RefreshCw,
} from "lucide-react";
import { ChatMessage, ClassLevel, SubjectInfo, TutorMode, NeuroLevel } from "../types";
import { askNeuroTutor } from "../services/api";
import { LatexRenderer } from "./LatexRenderer";
import { QUICK_PROMPTS } from "../data/curriculumData";
import { VyniqLogoIcon } from "./VyniqLogo";

interface NeuroTutorChatProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
  neuroLevel: NeuroLevel;
  onUpdateWeakness?: (concept: string, deficit: string) => void;
}

export const NeuroTutorChat: React.FC<NeuroTutorChatProps> = ({
  currentClass,
  activeSubject,
  neuroLevel,
  onUpdateWeakness,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "initial-welcome",
        role: "model",
        content: `### Welcome to **Vyniq AI Neuro-Tutor** 🧠
**Chief Academic Evaluator & Academic Intelligence Engine** (*CBSE 2026–27 Session*)

I am calibrated for rigorous, NCERT-grounded explanations, authentic CBSE step-wise rubrics, and active retrieval practice.

**Active Subject:** ${activeSubject.name} (${activeSubject.classLevel})

Select a high-yield concept below or type any question or upload handwritten notes to begin!`,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<TutorMode>("standard");
  const [selectedChapter, setSelectedChapter] = useState<string>(activeSubject.chapters[0] || "");
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedChapter(activeSubject.chapters[0] || "");
  }, [activeSubject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customPrompt?: string, modeOverride?: TutorMode) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend && !attachedImage) return;

    const currentTutorMode = modeOverride || activeMode;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
      image: attachedImage || undefined,
      imageMime: attachedImage ? imageMime : undefined,
      mode: currentTutorMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedImage(null);
    setLoading(true);
    setLastFailedPrompt(null);

    try {
      const historyPayload = messages
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content,
          image: m.image,
          imageMime: m.imageMime,
        }));

      const aiResponse = await askNeuroTutor({
        messages: historyPayload,
        classLevel: currentClass,
        subject: activeSubject.name,
        mode: currentTutorMode,
        currentConcept: selectedChapter,
      });

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        content: aiResponse,
        timestamp: Date.now(),
        mode: currentTutorMode,
      };

      setMessages((prev) => [...prev, modelMessage]);

      if (
        textToSend.toLowerCase().includes("don't understand") ||
        textToSend.toLowerCase().includes("confused") ||
        textToSend.toLowerCase().includes("weak")
      ) {
        if (onUpdateWeakness) {
          onUpdateWeakness(
            selectedChapter.split("(")[0].trim(),
            "Conceptual difficulty reported in Neuro-Tutor session"
          );
        }
      }
    } catch (err: any) {
      setLastFailedPrompt(textToSend);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "model",
        content: `⚠️ **Vyniq Engine Notice**: ${
          err.message || "We encountered a temporary connection issue. Please click retry below."
        }`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setAttachedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "model",
        content: `### Neuro-Tutor Session Reset 🧠
Ready for targeted NCERT revision in **${activeSubject.name}** (${activeSubject.classLevel}).`,
        timestamp: Date.now(),
      },
    ]);
    setLastFailedPrompt(null);
  };

  const relevantPrompts = QUICK_PROMPTS.filter((p) => p.subject === activeSubject.id);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Top Controller Bar: Mode Selection & Chapter Focus */}
      <div className="bg-[#092218]/90 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-3 mb-3 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mr-1">
              Mode:
            </span>
            <button
              onClick={() => setActiveMode("standard")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeMode === "standard"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/40"
                  : "bg-emerald-950/40 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Standard NCERT Protocol
            </button>
            <button
              onClick={() => setActiveMode("quick")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeMode === "quick"
                  ? "bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)] border border-amber-400/40"
                  : "bg-emerald-950/40 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Quick 1-Min Mode
            </button>
            <button
              onClick={() => setActiveMode("exam-eve")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeMode === "exam-eve"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/40"
                  : "bg-emerald-950/40 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-300" />
              Exam-Eve High-Yield
            </button>
            <button
              onClick={() => setActiveMode("diagnostic")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeMode === "diagnostic"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)] border border-teal-400/40"
                  : "bg-emerald-950/40 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-teal-300" />
              Diagnostic Probe (L0–L5)
            </button>
            <button
              onClick={() => setActiveMode("adaptive")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeMode === "adaptive"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.45)] border border-emerald-300/60 ring-1 ring-emerald-400/40"
                  : "bg-emerald-950/40 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Adaptive Difficulty (L1–L6)
            </button>
          </div>

          {/* Chapter Selector & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <select
                aria-label="Chapter Focus"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="bg-[#05140d] border border-emerald-500/30 text-xs rounded-full px-3 py-1 text-slate-200 focus:outline-none focus:border-emerald-400 max-w-[200px] truncate cursor-pointer"
              >
                {activeSubject.chapters.map((ch, idx) => (
                  <option key={idx} value={ch} className="bg-[#05140d] text-slate-200">
                    {ch}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleResetChat}
              title="Reset Chat"
              className="p-1.5 text-slate-400 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-500/20 rounded-full hover:bg-emerald-900 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* High Yield Quick Prompts */}
        {relevantPrompts.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-emerald-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-emerald-400/90 font-medium whitespace-nowrap">High-Yield Starters:</span>
            {relevantPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.prompt)}
                className="px-3 py-1 rounded-full bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 whitespace-nowrap transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                {p.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-emerald-950/60">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {/* Sender Name & Mode Tag */}
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isUser && <VyniqLogoIcon size={16} />}
                <span className="text-[11px] font-semibold text-emerald-200">
                  {isUser ? "You (Student)" : "Vyniq AI Neuro-Tutor"}
                </span>
                {msg.mode && msg.mode !== "standard" && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 uppercase font-mono shadow-sm">
                    {msg.mode}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Message Box */}
              <div
                className={`relative group max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-lg ${
                  isUser
                    ? "bg-gradient-to-br from-[#0c2e21] via-[#092218] to-[#061811] border border-emerald-400/40 text-slate-100 rounded-tr-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-[#092218]/90 border border-emerald-500/25 text-slate-100 rounded-tl-sm backdrop-blur-md"
                }`}
              >
                {/* Attached Image Preview if any */}
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-emerald-500/30 max-w-sm">
                    <img
                      src={`data:${msg.imageMime || "image/jpeg"};base64,${msg.image}`}
                      alt="Uploaded student work"
                      className="max-h-60 w-auto object-contain bg-slate-950"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Markdown & LaTeX Rendered Body */}
                <LatexRenderer content={msg.content} />

                {/* Retry action if this is an error message */}
                {msg.content.includes("Vyniq Engine Notice") && lastFailedPrompt && (
                  <div className="mt-3 pt-2 border-t border-emerald-900/40 flex items-center gap-2">
                    <button
                      onClick={() => handleSendMessage(lastFailedPrompt)}
                      className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Question
                    </button>
                  </div>
                )}

                {/* Quick Action Helpers for AI Responses */}
                {!isUser && !msg.content.includes("Vyniq Engine Notice") && (
                  <div className="mt-4 pt-3 border-t border-emerald-950/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendMessage("I don't understand. Can you simplify with an intuitive NCERT analogy and a tiny numerical?")}
                        className="px-3 py-1 rounded-full bg-[#061811] hover:bg-emerald-950 text-emerald-200 border border-emerald-500/30 transition flex items-center gap-1.5 text-[11px] hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                      >
                        <HelpCircle className="w-3 h-3 text-amber-400" />
                        Simplify & Analogy
                      </button>
                      <button
                        onClick={() => handleSendMessage("How does CBSE test this in 3-mark and 5-mark board papers with sample step marking criteria?")}
                        className="px-3 py-1 rounded-full bg-[#061811] hover:bg-emerald-950 text-emerald-200 border border-emerald-500/30 transition flex items-center gap-1.5 text-[11px] hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        CBSE Board Pattern
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1.5 text-emerald-300 hover:text-white bg-[#061811] rounded-full border border-emerald-500/25 transition cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-[#092218]/90 border border-emerald-500/30 backdrop-blur-md rounded-2xl max-w-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-emerald-200 font-medium animate-pulse">
              Vyniq Neuro-Tutor is consulting NCERT & CBSE Marking Rubrics...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 bg-[#092218]/95 border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        {/* Attached preview */}
        {attachedImage && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-[#05140d] rounded-xl border border-emerald-500/30">
            <ImageIcon className="w-4 h-4 text-emerald-300" />
            <span className="text-xs text-slate-200 truncate">Handwritten note/diagram attached</span>
            <button
              onClick={() => setAttachedImage(null)}
              className="ml-auto text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload handwritten solution or diagram"
            className="p-2 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded-xl transition cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Vyniq AI about ${selectedChapter.split("(")[0].trim()}... (LaTeX formulas supported)`}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm px-2 py-1.5 focus:outline-none"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !attachedImage)}
            className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              input.trim() || attachedImage
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95"
                : "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800"
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
