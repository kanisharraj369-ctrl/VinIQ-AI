import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  CreditCard,
  Plus,
  ArrowUpDown,
  Mail,
  Smartphone,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_EMAIL, AFFORDABLE_PRICING_PLANS } from "../data/authData";
import { SubscriptionPlan, SubscriptionStatus, UserProfile, UserRole } from "../types/auth";

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    allUsers,
    isAdmin,
    adminAllowUser,
    adminRemoveUser,
    adminUpdateUserPlan,
    adminAddUser,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("student");
  const [newClass, setNewClass] = useState<"Class 10" | "Class 12">("Class 12");
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>("monthly_pro");
  const [newStatus, setNewStatus] = useState<SubscriptionStatus>("active");
  const [newUpiRef, setNewUpiRef] = useState("");

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.upiTransactionRef && u.upiTransactionRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "allowed"
        ? u.isAllowed
        : filterStatus === "pending"
        ? u.subscriptionStatus === "pending_approval"
        : filterStatus === "revoked"
        ? !u.isAllowed
        : true;

    const matchesPlan = filterPlan === "all" ? true : u.subscriptionPlan === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalUsers = allUsers.length;
  const activeSubscribers = allUsers.filter((u) => u.isAllowed && u.subscriptionStatus === "active").length;
  const pendingApprovals = allUsers.filter((u) => u.subscriptionStatus === "pending_approval").length;
  const totalRevenueINR = allUsers.reduce((sum, u) => sum + (u.paymentAmount || 0), 0);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    adminAddUser({
      email: newEmail.trim().toLowerCase(),
      name: newName.trim() || newEmail.split("@")[0],
      role: newRole,
      currentClass: newClass,
      subscriptionPlan: newPlan,
      subscriptionStatus: newStatus,
      isAllowed: newStatus === "active",
      upiTransactionRef: newUpiRef.trim() || undefined,
      paymentAmount: AFFORDABLE_PRICING_PLANS.find((p) => p.id === newPlan)?.priceINR || 0,
      notes: "Directly provisioned by Admin Kanisha Raj",
    });

    setIsAddUserModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewUpiRef("");
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Restricted Administrator Area</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          This panel is exclusively accessible by Chief Super Administrator <strong>{ADMIN_EMAIL}</strong> to manage user accounts, subscriptions, and access permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-[#0b051e]/90 border border-purple-500/30 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_35px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Admin User & Subscription Control Centre
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-400/50 text-purple-300 font-mono">
                Super Admin: {ADMIN_EMAIL}
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-1">
              Approve subscriber access, manage subscription tiers, verify UPI references, and remove inactive or unauthorized accounts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 transition hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e0728]/80 border border-purple-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Enrolled Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalUsers}</p>
          <p className="text-[11px] text-purple-300 mt-1">Class 10 & 12 Learners</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0728]/80 border border-emerald-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Allowed Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{activeSubscribers}</p>
          <p className="text-[11px] text-emerald-300/80 mt-1">Full System Access Granted</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0728]/80 border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{pendingApprovals}</p>
          <p className="text-[11px] text-amber-300/80 mt-1">Subscribed / Awaiting Validation</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0728]/80 border border-indigo-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Subscription Volume</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-300 mt-2">₹{totalRevenueINR.toLocaleString()}</p>
          <p className="text-[11px] text-indigo-200/80 mt-1">Verified UPI & Card Volume</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c0622]/80 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or UPI ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050214] border border-purple-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#050214] border border-purple-500/30 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Statuses</option>
            <option value="allowed">Allowed / Active</option>
            <option value="pending">Pending Approval</option>
            <option value="revoked">Revoked / Disallowed</option>
          </select>
        </div>

        {/* Plan filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300 font-medium">Plan:</span>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-[#050214] border border-purple-500/30 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Plans</option>
            <option value="free_trial">Starter Trial</option>
            <option value="monthly_pro">CBSE Pro Monthly</option>
            <option value="annual_topper">Annual Topper</option>
            <option value="lifetime_board">All-Stream Scholar</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0c0622]/90 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#070318] text-purple-300 uppercase text-[10px] tracking-wider border-b border-purple-900/40 font-bold">
              <tr>
                <th className="px-5 py-3.5">User / Learner</th>
                <th className="px-4 py-3.5">Role & Class</th>
                <th className="px-4 py-3.5">Subscription Plan</th>
                <th className="px-4 py-3.5">Payment / UPI Ref</th>
                <th className="px-4 py-3.5">Access State</th>
                <th className="px-5 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/60 font-normal">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuperAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-purple-950/20 transition-colors duration-150"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              {user.name}
                              {isSuperAdmin && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500 text-amber-300 font-mono">
                                  SUPER ADMIN
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-purple-300/80 font-mono">{user.email}</p>
                            {user.phone && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Smartphone className="w-3 h-3 text-slate-500" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Class */}
                      <td className="px-4 py-4">
                        <span className="capitalize font-semibold text-slate-200">
                          {user.role}
                        </span>
                        <p className="text-[11px] text-purple-300">{user.currentClass}</p>
                      </td>

                      {/* Plan & Status */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <select
                            disabled={isSuperAdmin}
                            value={user.subscriptionPlan}
                            onChange={(e) =>
                              adminUpdateUserPlan(
                                user.id,
                                e.target.value as SubscriptionPlan,
                                user.subscriptionStatus
                              )
                            }
                            className="bg-[#050214] border border-purple-500/30 text-[11px] rounded-lg px-2 py-1 text-purple-200 focus:outline-none focus:border-purple-400 cursor-pointer"
                          >
                            <option value="free_trial">Starter Trial (Free)</option>
                            <option value="monthly_pro">CBSE Pro (₹299/mo)</option>
                            <option value="annual_topper">Annual Topper (₹1,499/yr)</option>
                            <option value="lifetime_board">All-Stream Scholar (₹2,499)</option>
                          </select>

                          <div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                user.subscriptionStatus === "active"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                  : user.subscriptionStatus === "pending_approval"
                                  ? "bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse"
                                  : "bg-rose-950 text-rose-300 border border-rose-500/40"
                              }`}
                            >
                              {user.subscriptionStatus.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Payment / UPI Ref */}
                      <td className="px-4 py-4">
                        {user.upiTransactionRef ? (
                          <div>
                            <span className="font-mono text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                              {user.upiTransactionRef}
                            </span>
                            {user.paymentAmount && (
                              <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                                Paid: ₹{user.paymentAmount}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">— No Transaction —</span>
                        )}
                        {user.notes && (
                          <p className="text-[10px] text-slate-400 italic max-w-xs mt-1 truncate">
                            {user.notes}
                          </p>
                        )}
                      </td>

                      {/* Access Switch (Allowed vs Disallowed) */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isSuperAdmin}
                            onClick={() => adminAllowUser(user.id, !user.isAllowed)}
                            className={`px-3 py-1 text-[11px] font-bold rounded-full transition flex items-center gap-1.5 ${
                              user.isAllowed
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900"
                                : "bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900"
                            }`}
                          >
                            {user.isAllowed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Allowed</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Blocked</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions: Allow / Revoke / Delete */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!user.isAllowed ? (
                            <button
                              onClick={() => adminAllowUser(user.id, true)}
                              title="Approve and Allow User"
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-white font-semibold transition"
                            >
                              Approve
                            </button>
                          ) : (
                            !isSuperAdmin && (
                              <button
                                onClick={() => adminAllowUser(user.id, false)}
                                title="Revoke Access"
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 transition"
                              >
                                Revoke
                              </button>
                            )
                          )}

                          {!isSuperAdmin && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to completely remove user ${user.email}?`
                                  )
                                ) {
                                  adminRemoveUser(user.id);
                                }
                              }}
                              title="Delete user from database"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/80 border border-rose-500/20 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual User Creation Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e0728] border border-purple-400/40 rounded-3xl p-6 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.8)] relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Provision New Student / Admin User
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-purple-950/60"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Sengupta"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="diya@school.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    CBSE Class
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value as "Class 10" | "Class 12")}
                    className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as SubscriptionPlan)}
                    className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="free_trial">Starter Trial</option>
                    <option value="monthly_pro">CBSE Pro (₹299/mo)</option>
                    <option value="annual_topper">Annual Topper (₹1,499/yr)</option>
                    <option value="lifetime_board">All-Stream Scholar (₹2,499)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as SubscriptionStatus)}
                    className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="active">Active (Allowed)</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="revoked">Blocked / Revoked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  UPI Ref / Payment Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/2026/884901"
                  value={newUpiRef}
                  onChange={(e) => setNewUpiRef(e.target.value)}
                  className="w-full bg-[#050214] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] transition mt-2"
              >
                Add User to Database
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
