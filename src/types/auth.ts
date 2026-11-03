export type UserRole = "admin" | "student";

export type SubscriptionPlan = "free_trial" | "monthly_pro" | "annual_topper" | "lifetime_board";

export type SubscriptionStatus = "active" | "pending_approval" | "expired" | "revoked";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  currentClass: "Class 10" | "Class 12";
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  isAllowed: boolean;
  createdAt: string;
  expiresAt?: string;
  requestedPlan?: SubscriptionPlan;
  upiTransactionRef?: string;
  paymentAmount?: number;
  phone?: string;
  notes?: string;
}

export interface PricingPlanInfo {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  priceINR: number;
  originalPriceINR?: number;
  billingPeriod: string;
  badge?: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  ctaLabel: string;
}
