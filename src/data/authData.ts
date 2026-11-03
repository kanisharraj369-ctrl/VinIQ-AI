import { PricingPlanInfo, UserProfile } from "../types/auth";

export const ADMIN_EMAIL = "kanisharraj369@gmail.com";

export const AFFORDABLE_PRICING_PLANS: PricingPlanInfo[] = [
  {
    id: "free_trial",
    name: "Starter Trial",
    tagline: "Experience AI Neuro-Tutor and CBSE step rubric evaluation",
    priceINR: 0,
    billingPeriod: "7 Days Access",
    popular: false,
    features: [
      "Access to Class 10 & 12 NCERT Protocols",
      "5 CBSE AI Evaluator Submissions",
      "AI Neuro-Tutor Standard Mode",
      "Active Recall & Question Engine (5 tests)",
      "Vyniq Weakness Detection Map"
    ],
    limitations: [
      "No 10-Step Accountancy Generator",
      "Standard queue priority"
    ],
    ctaLabel: "Start Free Trial"
  },
  {
    id: "monthly_pro",
    name: "CBSE Pro Monthly",
    tagline: "Full access for focused monthly revision & test series",
    priceINR: 299,
    originalPriceINR: 599,
    billingPeriod: "/ month",
    badge: "50% OFF",
    popular: true,
    features: [
      "Unlimited AI Step-Wise Answer Evaluations",
      "L0–L5 Dynamic Diagnostic Probing",
      "Accountancy 10-Step Protocol Engine",
      "BST NCERT Heading & Clue Lock Lab",
      "Custom Timed Board Simulations",
      "Unlimited Spaced Retention Tracker",
      "Direct Admin VIP Onboarding"
    ],
    ctaLabel: "Subscribe Pro (₹299/mo)"
  },
  {
    id: "annual_topper",
    name: "Board Topper (Full Year)",
    tagline: "Best value for complete 2026–27 Board Examination cycle",
    priceINR: 1499,
    originalPriceINR: 3599,
    billingPeriod: "/ academic year",
    badge: "MOST POPULAR",
    popular: false,
    features: [
      "Everything in CBSE Pro Monthly",
      "Full 12-Month Academic Year License",
      "Priority 24/7 AI Response Cluster",
      "Model Topper Answer Benchmarks & PDFs",
      "Pre-Board & Final Board Timed Mock Sets",
      "Instant Admin Approval Verification",
      "All Class 10 & Class 12 Streams Included"
    ],
    ctaLabel: "Get Annual Topper (₹1,499/yr)"
  },
  {
    id: "lifetime_board",
    name: "All-Stream Scholar",
    tagline: "One-time pass for 10th & 12th complete CBSE prep",
    priceINR: 2499,
    originalPriceINR: 6999,
    billingPeriod: "one-time payment",
    badge: "BEST VALUE",
    popular: false,
    features: [
      "Permanent multi-year access",
      "Covers Class 10, 11 & 12 Full Commerce & Science",
      "HOTS & Case-Study Masterclasses",
      "Dedicated High-Yield CBSE Question Banks",
      "Priority Admin Direct Whitelist Status"
    ],
    ctaLabel: "Get Scholar Pass (₹2,499)"
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "admin-1",
    email: ADMIN_EMAIL,
    name: "Kanisha Raj (Chief Administrator)",
    role: "admin",
    currentClass: "Class 12",
    subscriptionPlan: "lifetime_board",
    subscriptionStatus: "active",
    isAllowed: true,
    createdAt: "2026-01-10T10:00:00Z",
    notes: "Super Administrator & Chief Evaluator"
  },
  {
    id: "user-2",
    email: "rohit.sharma@commerce.in",
    name: "Rohit Sharma",
    role: "student",
    currentClass: "Class 12",
    subscriptionPlan: "monthly_pro",
    subscriptionStatus: "active",
    isAllowed: true,
    createdAt: "2026-02-15T14:30:00Z",
    paymentAmount: 299,
    upiTransactionRef: "UPI/260215/9948218",
    phone: "+91 98450 11223"
  },
  {
    id: "user-3",
    email: "priya.nair@school.edu",
    name: "Priya Nair",
    role: "student",
    currentClass: "Class 10",
    subscriptionPlan: "annual_topper",
    subscriptionStatus: "pending_approval",
    isAllowed: false,
    createdAt: "2026-02-28T09:15:00Z",
    paymentAmount: 1499,
    upiTransactionRef: "UPI/260228/4412890",
    phone: "+91 97110 33445",
    notes: "Subscribed via UPI. Awaiting admin approval."
  },
  {
    id: "user-4",
    email: "aditya.verma@gmail.com",
    name: "Aditya Verma",
    role: "student",
    currentClass: "Class 12",
    subscriptionPlan: "free_trial",
    subscriptionStatus: "active",
    isAllowed: true,
    createdAt: "2026-02-20T11:00:00Z"
  }
];
