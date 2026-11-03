import React, { useState } from "react";
import {
  BookOpen,
  FileSpreadsheet,
  Briefcase,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Scale,
  Calculator,
} from "lucide-react";
import {
  ClassLevel,
  SubjectInfo,
  AccountancyProtocolResult,
  BstCaseStudyResult,
  SyllabusStatusResult,
} from "../types";
import {
  generateAccountancyProtocol,
  analyzeBstCaseStudy,
  verifySyllabusTopic,
} from "../services/api";
import { LatexRenderer } from "./LatexRenderer";

interface NcertProtocolLabsProps {
  currentClass: ClassLevel;
  activeSubject: SubjectInfo;
}

export const NcertProtocolLabs: React.FC<NcertProtocolLabsProps> = ({
  currentClass,
  activeSubject,
}) => {
  const [activeLab, setActiveLab] = useState<"accountancy" | "bst" | "syllabus">("accountancy");

  // Accountancy Lab State
  const [accTopic, setAccTopic] = useState("Past Adjustments for Omitted Interest on Capital & Drawings");
  const [accCustomProblem, setAccCustomProblem] = useState("");
  const [accLoading, setAccLoading] = useState(false);
  const [accResult, setAccResult] = useState<AccountancyProtocolResult | null>(null);

  // BST Lab State
  const [bstCaseText, setBstCaseText] = useState(
    "Alpha Tech Ltd. produces smartphones. The Production Manager, Mr. Aman, observed that workers frequently took unnecessary pauses and did not follow standardized motion paths, leading to missed production targets. Aman hired a specialist who systematically studied physical motions and eliminated 4 non-productive movements, reducing assembly time per unit by 25%."
  );
  const [bstQuestion, setBstQuestion] = useState(
    "Identify and explain the technique of Scientific Management highlighted in the above case. Quote the specific line that helped you identify this technique."
  );
  const [bstLoading, setBstLoading] = useState(false);
  const [bstResult, setBstResult] = useState<BstCaseStudyResult | null>(null);

  // Syllabus Guardrail State
  const [verifyTopicInput, setVerifyTopicInput] = useState("Fundamental Theorem of Arithmetic Proof");
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusResult, setSyllabusResult] = useState<SyllabusStatusResult | null>(null);

  const handleRunAccountancy = async () => {
    setAccLoading(true);
    try {
      const res = await generateAccountancyProtocol({
        topic: accTopic,
        numericalProblem: accCustomProblem || undefined,
      });
      setAccResult(res);
    } catch (err: any) {
      alert("Failed to generate Accountancy protocol: " + err.message);
    } finally {
      setAccLoading(false);
    }
  };

  const handleRunBstCase = async () => {
    setBstLoading(true);
    try {
      const res = await analyzeBstCaseStudy({
        caseText: bstCaseText,
        questionAsked: bstQuestion,
      });
      setBstResult(res);
    } catch (err: any) {
      alert("Failed to analyze BST case: " + err.message);
    } finally {
      setBstLoading(false);
    }
  };

  const handleRunSyllabusCheck = async () => {
    setSyllabusLoading(true);
    try {
      const res = await verifySyllabusTopic({
        classLevel: currentClass,
        subject: activeSubject.name,
        topicOrChapter: verifyTopicInput,
      });
      setSyllabusResult(res);
    } catch (err: any) {
      alert("Failed to check syllabus: " + err.message);
    } finally {
      setSyllabusLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header and Lab Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-slate-100">
              NCERT Protocol Labs & Specialized Engines
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-950 border border-purple-700/60 text-purple-300 font-mono">
              Strict Protocols
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dedicated pedagogical workspaces adhering to the Accountancy 10-Step Protocol, BST Case Clue Extraction, and CBSE 2026–27 Syllabus Verification.
          </p>
        </div>

        {/* Sub-lab selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveLab("accountancy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLab === "accountancy"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Accounts 10-Step Lab
          </button>
          <button
            onClick={() => setActiveLab("bst")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLab === "bst"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            BST Case Study Lab
          </button>
          <button
            onClick={() => setActiveLab("syllabus")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLab === "syllabus"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Syllabus Guardrail
          </button>
        </div>
      </div>

      {/* LAB 1: ACCOUNTANCY 10-STEP PROTOCOL */}
      {activeLab === "accountancy" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              Accountancy 10-Step Execution Engine
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Preset Core Topic</label>
              <select
                aria-label="Preset Core Topic"
                value={accTopic}
                onChange={(e) => setAccTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-purple-500"
              >
                <option value="Past Adjustments for Omitted Interest on Capital & Drawings">
                  Past Adjustments (Single Adjustment Entry)
                </option>
                <option value="Calculation of Hidden Goodwill upon Admission of a Partner">
                  Hidden Goodwill on Admission
                </option>
                <option value="Pro-Rata Share Forfeiture and Reissue to Capital Reserve">
                  Pro-Rata Allotment & Capital Reserve
                </option>
                <option value="Treatment of Deceased Partner Share of Profit up to Date of Death">
                  Deceased Partner Share of Profit (Time/Turnover)
                </option>
                <option value="Treatment of Realisation Expenses under Dissolution of Partnership">
                  Realisation Expenses in Dissolution
                </option>
                <option value="Cash Flow from Operating Activities - Provision for Tax & Dividend">
                  Cash Flow Statement (AS-3 Revised)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Optional Custom Numerical Problem
              </label>
              <textarea
                value={accCustomProblem}
                onChange={(e) => setAccCustomProblem(e.target.value)}
                rows={4}
                placeholder="Paste your specific question, or leave blank to generate an exemplary CBSE Board illustration..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <button
              onClick={handleRunAccountancy}
              disabled={accLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                accLoading
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-600/30 hover:opacity-95"
              }`}
            >
              {accLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing 10-Step Sequence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run 10-Step Strict Protocol</span>
                </>
              )}
            </button>
          </div>

          {/* 10-Step Output View */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {accResult ? (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100">{accResult.topic}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono border border-purple-800">
                    10-Step Complete
                  </span>
                </div>

                {/* Steps 1-3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-purple-300 block">{accResult.step1Concept.title}</span>
                    <p className="text-slate-300">{accResult.step1Concept.content}</p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-sky-300 block">{accResult.step2Why.title}</span>
                    <p className="text-slate-300">{accResult.step2Why.content}</p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-emerald-300 block">{accResult.step3LegalBasis.title}</span>
                    <span className="text-slate-400 font-semibold block">{accResult.step3LegalBasis.act}</span>
                    <p className="text-slate-300">{accResult.step3LegalBasis.rule}</p>
                  </div>
                </div>

                {/* Steps 4-6 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 block">{accResult.step4Identification.title}</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {accResult.step4Identification.clues?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-300 block">{accResult.step5Formula.title}</span>
                    <LatexRenderer content={accResult.step5Formula.formulaLatex} />
                    <p className="text-slate-400 text-[11px] mt-1">{accResult.step5Formula.notes}</p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-rose-300 block">{accResult.step6Calculation.title}</span>
                    <ul className="space-y-1 text-slate-300">
                      {accResult.step6Calculation.calculations?.map((c, i) => (
                        <li key={i} className="p-1 bg-slate-900 rounded font-mono text-[11px]">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Step 7: Standard 5-Column Journal Entry Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {accResult.step7JournalEntry.title}
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5 border-r border-slate-800">Date</th>
                          <th className="p-2.5 border-r border-slate-800">Particulars</th>
                          <th className="p-2.5 border-r border-slate-800 text-center">L.F.</th>
                          <th className="p-2.5 border-r border-slate-800 text-right">Debit (₹)</th>
                          <th className="p-2.5 text-right">Credit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {accResult.step7JournalEntry.entries?.map((entry, idx) => (
                          <React.Fragment key={idx}>
                            <tr>
                              <td className="p-2.5 border-r border-slate-800 text-slate-500">{entry.date || "—"}</td>
                              <td className="p-2.5 border-r border-slate-800 font-semibold text-cyan-200">
                                {entry.particulars}
                              </td>
                              <td className="p-2.5 border-r border-slate-800 text-center text-slate-500">{entry.lf || "—"}</td>
                              <td className="p-2.5 border-r border-slate-800 text-right font-bold text-emerald-300">
                                {entry.debit}
                              </td>
                              <td className="p-2.5 text-right font-bold text-emerald-300">{entry.credit}</td>
                            </tr>
                            {entry.narration && (
                              <tr className="bg-slate-950/40">
                                <td colSpan={5} className="p-2 pl-6 italic text-[11px] text-slate-400 font-sans">
                                  ({entry.narration})
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 9 & 10: Numerical & Mistake Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-200 block">{accResult.step9Numerical.title}</span>
                    <p className="text-slate-400 italic">“{accResult.step9Numerical.problem}”</p>
                    <div className="space-y-1 pt-2 border-t border-slate-900">
                      {accResult.step9Numerical.solutionSteps?.map((st, i) => (
                        <div key={i} className="text-slate-300">
                          {st}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-rose-950/30 rounded-xl border border-rose-800/60 space-y-2 text-xs">
                    <span className="font-bold text-rose-300 block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {accResult.step10MistakeAnalysis.title}
                    </span>
                    <div>
                      <strong className="text-slate-300">Common Mistake: </strong>
                      <span className="text-slate-400">{accResult.step10MistakeAnalysis.commonMistake}</span>
                    </div>
                    <div>
                      <strong className="text-slate-300">Why Wrong: </strong>
                      <span className="text-rose-300">{accResult.step10MistakeAnalysis.whyWrong}</span>
                    </div>
                    <div>
                      <strong className="text-slate-300">Correct Treatment: </strong>
                      <span className="text-emerald-300">{accResult.step10MistakeAnalysis.correctTreatment}</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono pt-1">
                      Potential Mark Loss: {accResult.step10MistakeAnalysis.potentialMarkLoss}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <FileSpreadsheet className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-xs">
                  Click **Run 10-Step Strict Protocol** to synthesize the complete legal, accounting, and calculation breakdown.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB 2: BUSINESS STUDIES CASE STUDY LAB */}
      {activeLab === "bst" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-rose-400" />
              BST 5-Step Case Deduction Engine
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Case Study Passage</label>
              <textarea
                value={bstCaseText}
                onChange={(e) => setBstCaseText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Question Asked</label>
              <textarea
                value={bstQuestion}
                onChange={(e) => setBstQuestion(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleRunBstCase}
              disabled={bstLoading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                bstLoading
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-rose-600/30 hover:opacity-95"
              }`}
            >
              {bstLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deducing Case Clues & Principles...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Deduce Case Study</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
            {bstResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{bstResult.ncertChapter}</span>
                    <h3 className="text-base font-bold text-rose-300">{bstResult.identifiedConcept}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800">
                    {bstResult.ncertHeading}
                  </span>
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-xl">
                  <span className="font-bold text-amber-300 block mb-1">
                    Step 2 — Quoted Clue Extracted from Case:
                  </span>
                  <p className="text-slate-200 italic">“{bstResult.extractedClue}”</p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-cyan-300 block">Step 3 — Textbook NCERT Definition:</span>
                  <p className="text-slate-300">{bstResult.conceptDefinition}</p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-300 block">Step 4 — Case Linkage & Explanation:</span>
                  <p className="text-slate-300">{bstResult.explanation}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-200 uppercase tracking-wider block mb-1">
                    Model Board Answer Formulation:
                  </span>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <LatexRenderer content={bstResult.modelBoardAnswer} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-xs">
                  Run the BST Case Study Lab to extract exact quote clues, identify NCERT headings, and format board-ready answers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB 3: SYLLABUS GUARDRAIL CHECKER */}
      {activeLab === "syllabus" && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              CBSE 2026–27 Syllabus & Rationalisation Guardrail
            </h3>
            <p className="text-slate-400">
              Verify whether any topic is officially in the CBSE 2026–27 board syllabus, or deleted/rationalised from NCERT.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={verifyTopicInput}
              onChange={(e) => setVerifyTopicInput(e.target.value)}
              placeholder="e.g. Euclid's Division Lemma / Periodic Classification / Comparative Balance Sheet..."
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleRunSyllabusCheck}
              disabled={syllabusLoading}
              className="px-5 py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/30 whitespace-nowrap flex items-center gap-2"
            >
              {syllabusLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Verify Status</span>
            </button>
          </div>

          {syllabusResult && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">{verifyTopicInput}</span>
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs ${
                    syllabusResult.status === "OFFICIALLY_INCLUDED"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : syllabusResult.status === "OFFICIALLY_DELETED"
                      ? "bg-rose-950 text-rose-300 border border-rose-700"
                      : "bg-amber-950 text-amber-300 border border-amber-700"
                  }`}
                >
                  {syllabusResult.statusBadge}
                </span>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{syllabusResult.explanation}</p>

              {syllabusResult.officialWarningMessage && (
                <div className="p-3 bg-amber-950/30 border border-amber-800 text-amber-300 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{syllabusResult.officialWarningMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-slate-400">
                <div>
                  <strong className="text-slate-300 block mb-0.5">NCERT Chapter Position:</strong>
                  <span>{syllabusResult.ncertChapterDetails}</span>
                </div>
                <div>
                  <strong className="text-slate-300 block mb-0.5">Utility & Exam Guidance:</strong>
                  <span>{syllabusResult.examWeightageGuidance}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
