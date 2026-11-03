import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, SubscriptionPlan } from "../types/auth";
import { INITIAL_USERS, ADMIN_EMAIL } from "../data/authData";

interface AuthContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  isAdmin: boolean;
  isAllowed: boolean;
  login: (email: string, name?: string, currentClass?: "Class 10" | "Class 12") => { success: boolean; message: string; user: UserProfile };
  logout: () => void;
  requestSubscription: (planId: SubscriptionPlan, upiRef?: string, phone?: string, amount?: number) => void;
  adminAllowUser: (userId: string, allow: boolean) => void;
  adminRemoveUser: (userId: string) => void;
  adminUpdateUserPlan: (userId: string, plan: SubscriptionPlan, status: "active" | "pending_approval" | "expired" | "revoked") => void;
  adminAddUser: (user: Omit<UserProfile, "id" | "createdAt">) => void;
  switchUserRoleForDemo: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = "vyniq_users_db_v1";
const LOCAL_STORAGE_CURRENT_USER_KEY = "vyniq_current_user_v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Default to admin or starter student
    return INITIAL_USERS[0];
  });

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users", e);
    }
  }, [users]);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error("Failed to save current user", e);
    }
  }, [currentUser]);

  // Sync current user if user in database was updated
  useEffect(() => {
    if (currentUser) {
      const updated = users.find((u) => u.id === currentUser.id);
      if (updated && (updated.isAllowed !== currentUser.isAllowed || updated.subscriptionPlan !== currentUser.subscriptionPlan || updated.subscriptionStatus !== currentUser.subscriptionStatus || updated.role !== currentUser.role)) {
        setCurrentUser(updated);
      }
    }
  }, [users, currentUser]);

  const login = (email: string, name?: string, currentClass: "Class 10" | "Class 12" = "Class 12") => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdminUser = cleanEmail === ADMIN_EMAIL.toLowerCase();

    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existingUser) {
      setCurrentUser(existingUser);
      return {
        success: true,
        message: isAdminUser ? "Welcome back, Admin Kanisha Raj!" : `Welcome back, ${existingUser.name}!`,
        user: existingUser,
      };
    }

    // Create new user record
    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      email: cleanEmail,
      name: name?.trim() || (cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1)),
      role: isAdminUser ? "admin" : "student",
      currentClass,
      subscriptionPlan: isAdminUser ? "lifetime_board" : "free_trial",
      subscriptionStatus: "active",
      isAllowed: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    return {
      success: true,
      message: `Account created for ${newUser.name}. Active on Starter Trial!`,
      user: newUser,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const requestSubscription = (planId: SubscriptionPlan, upiRef?: string, phone?: string, amount?: number) => {
    if (!currentUser) return;

    const isFree = planId === "free_trial";

    const updated: UserProfile = {
      ...currentUser,
      subscriptionPlan: planId,
      requestedPlan: planId,
      subscriptionStatus: isFree ? "active" : "pending_approval",
      // If free, allowed immediately. If paid, pending admin approval
      isAllowed: isFree ? true : currentUser.role === "admin" ? true : false,
      upiTransactionRef: upiRef,
      phone: phone || currentUser.phone,
      paymentAmount: amount,
      notes: isFree ? "Free Starter Trial activated" : `Subscribed to ${planId} via UPI: ${upiRef || "Pending"}. Awaiting Admin validation.`,
    };

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);
  };

  // Admin Actions
  const adminAllowUser = (userId: string, allow: boolean) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            isAllowed: allow,
            subscriptionStatus: allow ? "active" : "revoked",
          };
        }
        return u;
      })
    );
  };

  const adminRemoveUser = (userId: string) => {
    // Cannot delete the super admin
    const target = users.find((u) => u.id === userId);
    if (target?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      alert("Super Administrator account cannot be removed.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const adminUpdateUserPlan = (userId: string, plan: SubscriptionPlan, status: "active" | "pending_approval" | "expired" | "revoked") => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            subscriptionPlan: plan,
            subscriptionStatus: status,
            isAllowed: status === "active",
          };
        }
        return u;
      })
    );
  };

  const adminAddUser = (user: Omit<UserProfile, "id" | "createdAt">) => {
    const newUser: UserProfile = {
      ...user,
      id: "usr-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const switchUserRoleForDemo = (email: string) => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setCurrentUser(target);
    } else {
      login(email);
    }
  };

  const isAdmin = currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || currentUser?.role === "admin";
  const isAllowed = currentUser ? (isAdmin ? true : currentUser.isAllowed && currentUser.subscriptionStatus === "active") : false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: users,
        isAdmin,
        isAllowed,
        login,
        logout,
        requestSubscription,
        adminAllowUser,
        adminRemoveUser,
        adminUpdateUserPlan,
        adminAddUser,
        switchUserRoleForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
