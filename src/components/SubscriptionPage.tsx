import React, { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  CreditCard,
  QrCode,
  ArrowRight,
  Clock,
  HelpCircle,
  Check,
} from "lucide-react";
import { AFFORDABLE_PRICING_PLANS, ADMIN_EMAIL } from "../data/authData";
import { PricingPlanInfo, SubscriptionPlan } from "../types/auth";
import { useAuth } from "../context/AuthContext";

interface SubscriptionPageProps {
  onPlanSelected?: (planId: SubscriptionPlan) => void;
  onNavigateLogin?: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onPlanSelected,
  onNavigateLogin,
}) => {
  const { currentUser, requestSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanInfo>(
    AFFORDABLE_PRICING_PLANS[1] // Default Pro Monthly
  );
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [upiRef, setUpiRef] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const handleOpenCheckout = (plan: PricingPlanInfo) => {
    setSelectedPlan(plan);
    if (plan.id === "free_trial") {
      requestSubscription("free_trial");
      setIsSuccessMessage(true);
      setTimeout(() => {
        setIsSuccessMessage(false);
        if (onPlanSelected) onPlanSelected("free_trial");
      }, 1200);
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onNavigateLogin) onNavigateLogin();
      return;
    }

    requestSubscription(
      selectedPlan.id,
      upiRef.trim() || `UPI/${Date.now().toString().slice(-6)}`,
      phone.trim(),
      selectedPlan.priceINR
    );

    setIsCheckoutModalOpen(false);
    setIsSuccessMessage(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Affordable Transparent Pricing for Class 10 & 12 Board Aspirants</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Unlock Full AI Neuro-Tutor & Chief CBSE Rubric Evaluator
        </h1>
        <p className="text-sm text-slate-300">
          Tailored specifically for CBSE Board examinations. Master Accountancy 10-step journals, Business Studies NCERT clues, Economics graphs, Science formulas & Mathematics step marks.
        </p>

        {/* Current user status indicator */}
        {currentUser && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#0e0728] border border-purple-500/30 text-xs text-purple-200">
            <span>Signed in as <strong>{currentUser.email}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="capitalize text-amber-300 font-semibold">
              Current: {currentUser.subscriptionPlan.replace("_", " ")} ({currentUser.subscriptionStatus})
            </span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {isSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-emerald-300 text-sm">
              Subscription Request Sent for Admin Approval!
            </p>
            <p className="text-emerald-200/80 mt-0.5">
              Admin ({ADMIN_EMAIL}) will verify your transaction reference and activate your account. You will receive full access right after approval!
            </p>
          </div>
        </motion.div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {AFFORDABLE_PRICING_PLANS.map((plan) => {
          const isCurrent = currentUser?.subscriptionPlan === plan.id;
          const isPending = isCurrent && currentUser.subscriptionStatus === "pending_approval";

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                plan.popular
                  ? "bg-gradient-to-b from-[#190938] via-[#100528] to-[#0a021a] border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40"
                  : "bg-[#0c0622]/80 border-purple-500/20 shadow-lg hover:border-purple-500/40"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-300 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Title & Tagline */}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 min-h-[32px] mt-1">{plan.tagline}</p>

                {/* Price Display */}
                <div className="my-5 pb-4 border-b border-purple-900/30">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ₹{plan.priceINR}
                    </span>
                    {plan.originalPriceINR && (
                      <span className="text-xs text-slate-500 line-through">
                        ₹{plan.originalPriceINR}
                      </span>
                    )}
                    <span className="text-xs text-purple-300 font-medium ml-1">
                      {plan.billingPeriod}
                    </span>
                  </div>
                  {plan.priceINR > 0 && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">
                      Includes 18% GST • UPI, Net Banking & Cards
                    </p>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-500">
                      <span className="w-4 h-4 text-center shrink-0">—</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleOpenCheckout(plan)}
                  disabled={isCurrent && currentUser?.subscriptionStatus === "active"}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent && currentUser?.subscriptionStatus === "active"
                      ? "bg-purple-950/60 text-purple-300 border border-purple-500/30 cursor-default"
                      : isPending
                      ? "bg-amber-950/60 text-amber-300 border border-amber-500/40 cursor-default"
                      : plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-purple-950/80 hover:bg-purple-900 text-white border border-purple-500/30 hover:border-purple-400"
                  }`}
                >
                  <span>
                    {isCurrent && currentUser?.subscriptionStatus === "active"
                      ? "Current Active Plan"
                      : isPending
                      ? "Awaiting Admin Approval"
                      : plan.ctaLabel}
                  </span>
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Admin Approval Notice Banner */}
      <div className="bg-[#0b051e] border border-purple-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Instant Administrator Verification Workflow
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              Super Admin <strong>{ADMIN_EMAIL}</strong> manages all user accounts, verifies UPI payments, allows subscriptions, and maintains strict access control to ensure uninterrupted student learning.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-purple-300 bg-purple-950/80 border border-purple-500/30 px-3 py-1.5 rounded-full">
            Chief Admin: kanisharraj369@gmail.com
          </span>
        </div>
      </div>

      {/* Checkout UPI Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e0728] border border-purple-400/40 rounded-3xl p-6 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.8)] relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Subscribe to {selectedPlan.name}
                </h3>
                <p className="text-xs text-purple-300">Amount payable: ₹{selectedPlan.priceINR}</p>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-purple-950/60"
              >
                ✕ Close
              </button>
            </div>

            {/* UPI QR & Payment Info */}
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-center space-y-3">
              <div className="w-28 h-28 mx-auto bg-white rounded-xl p-2 flex items-center justify-center shadow-md">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <div>
                <p className="text-[11px] text-purple-300 font-semibold">Official Vyniq UPI ID:</p>
                <p className="text-sm font-mono font-bold text-amber-300 select-all">
                  vyniq.technologies@okhdfcbank
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Scan QR via GPay, PhonePe, Paytm or Cred to pay ₹{selectedPlan.priceINR}
                </p>
              </div>
            </div>

            {/* Payment Reference Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  UPI Transaction ID / Reference Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 339482710192 or UPI Ref"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Student Mobile Number (for confirmation SMS/WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {!currentUser && (
                <p className="text-[11px] text-amber-400">
                  Please log in first to link this subscription to your student profile.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] transition"
              >
                Submit Payment for Admin Approval
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
