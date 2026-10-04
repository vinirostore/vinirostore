"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/admin-config";
import { saveCustomerProfile } from "@/lib/customer-data";

export { ADMIN_EMAIL };

export type AccountUser = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
};

export type PasswordRecoveryResult = { error?: string; question?: string; emailReset?: boolean };

type AuthState = {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isSupabaseAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  user: AccountUser | null;
  login: (email: string, name?: string, phone?: string, createdAt?: string, password?: string) => Promise<{ error?: string; hasCustomerProfile?: boolean }>;
  requestEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error?: string; hasCustomerProfile?: boolean }>;
  verifySignupOtp: (email: string, token: string) => Promise<{ error?: string }>;
  resendSignupOtp: (email: string) => Promise<{ error?: string }>;
  registerAccount: (name: string, email: string, password: string, phone?: string, securityQuestion?: string, securityAnswer?: string) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  requestPasswordReset: (email: string) => Promise<PasswordRecoveryResult>;
  resetPasswordWithSecurityAnswer: (email: string, answer: string, newPassword: string) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  signInAdmin: (email: string, password: string) => Promise<{ error?: string }>;
  verifyAdminAccess: (phone: string, birthDate: string) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthStateContext = createContext<AuthState | null>(null);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeIndianPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`.trim();
  if (digits.length === 12 && digits.startsWith("91")) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`.trim();
  return phone.trim();
}

async function readAdminAccessResponse<T>(response: Response): Promise<T | null> {
  if (!response.headers.get("content-type")?.includes("application/json")) return null;
  try {
    return await response.json() as T;
  } catch {
    return null;
  }
}

export function isValidIndianPhone(phone?: string) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}

async function hashSecurityAnswer(answer: string) {
  const normalizedAnswer = answer.trim().toLowerCase();
  if (typeof window === "undefined" || !window.crypto?.subtle) return normalizedAnswer;
  const bytes = new TextEncoder().encode(normalizedAnswer);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSupabaseAuthenticated, setIsSupabaseAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const applySupabaseSession = async () => {
      if (!supabase) {
        setIsAuthReady(true);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        if (!sessionUser) {
          setUser(null);
          setIsAuthenticated(false);
          setIsSupabaseAuthenticated(false);
          setIsAdminAuthenticated(false);
          return;
        }

        const metadata = sessionUser.user_metadata || {};
        const nextUser: AccountUser = {
          id: sessionUser.id,
          name: String(metadata.name || "Customer"),
          email: normalizeEmail(sessionUser.email || ""),
          phone: normalizeIndianPhone(String(metadata.phone || "")) || undefined,
          createdAt: sessionUser.created_at,
        };

        setUser(nextUser);
        setIsAuthenticated(true);
        setIsSupabaseAuthenticated(true);

        if (normalizeEmail(sessionUser.email || "") === ADMIN_EMAIL) {
         const response = await fetch("/api/admin-access", {
  credentials: "include",
  headers: { Authorization: `Bearer ${data.session!.access_token}` },
  cache: "no-store",
});
          const result = await readAdminAccessResponse<{ verified?: boolean }>(response);
          setIsAdminAuthenticated(Boolean(response.ok && result?.verified));
        } else {
          setIsAdminAuthenticated(false);
        }
      } catch {
        setIsSupabaseAuthenticated(false);
        setIsAdminAuthenticated(false);
      } finally {
        setIsAuthReady(true);
      }
    };

    void applySupabaseSession();
    const authSubscription = supabase
      ? supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_OUT") {
            setIsSupabaseAuthenticated(false);
            setIsAdminAuthenticated(false);
          }
        }).data.subscription
      : null;

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => ({
    isAuthenticated,
    isAuthReady,
    isSupabaseAuthenticated,
    isAdminAuthenticated,
    user,
    login: async (email, name, phone, createdAt, password) => {
      const normalizedEmail = normalizeEmail(email);
      if (!supabase) return { error: "Sign-in is unavailable because Supabase is not configured." };

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password || "",
        });
        if (error || !data.user) return { error: error?.message || "Unable to sign in with this account." };

        const metadata = data.user.user_metadata || {};
        const nextUser: AccountUser = {
          id: data.user.id,
          name: String(metadata.name || name || "Customer"),
          email: normalizeEmail(data.user.email || normalizedEmail),
          phone: normalizeIndianPhone(String(metadata.phone || phone || "")) || undefined,
          createdAt: data.user.created_at || createdAt || new Date().toISOString(),
        };
        const { data: existingProfile, error: profileLookupError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", nextUser.id!)
          .maybeSingle();
        if (profileLookupError) return { error: `Signed in, but your customer account could not be checked: ${profileLookupError.message}` };
        const profileResult = await saveCustomerProfile({
          id: nextUser.id!,
          fullName: nextUser.name,
          email: nextUser.email,
          phone: nextUser.phone,
        });
        if (profileResult.error) return { error: `Signed in, but your profile could not be synced to Supabase: ${profileResult.error}` };

        setUser(nextUser);
        setIsAuthenticated(true);
        setIsSupabaseAuthenticated(true);
        setIsAdminAuthenticated(false);
        return { hasCustomerProfile: Boolean(existingProfile) };
      } catch (error) {
        return { error: error instanceof Error && error.message ? error.message : "Failed to sign in. Please try again." };
      }
    },
    requestEmailOtp: async (email) => {
      if (!supabase) return { error: "Email OTP is not configured on this website." };

      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: normalizeEmail(email),
          options: {
            shouldCreateUser: false,
          },
        });

        return error ? { error: error.message } : {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to fetch. Please try again." };
      }
    },
    verifyEmailOtp: async (email, token) => {
      if (!supabase) return { error: "Email OTP is not configured on this website." };

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: normalizeEmail(email),
          token: token.trim(),
          type: "email",
        });

        if (error || !data.user) return { error: error?.message || "The verification code is invalid or expired." };

        const metadata = data.user.user_metadata || {};
        const nextUser: AccountUser = {
          id: data.user.id,
          name: String(metadata.name || "Customer"),
          email: normalizeEmail(data.user.email || email),
          phone: normalizeIndianPhone(String(metadata.phone || "")) || undefined,
          createdAt: data.user.created_at,
        };

        const { data: existingProfile, error: profileLookupError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", nextUser.id!)
          .maybeSingle();
        if (profileLookupError) return { error: `Signed in, but your customer account could not be checked: ${profileLookupError.message}` };

        const profileResult = await saveCustomerProfile({ id: nextUser.id!, fullName: nextUser.name, email: nextUser.email, phone: nextUser.phone });
        if (profileResult.error) return { error: `Signed in, but your profile could not be synced to Supabase: ${profileResult.error}` };
        setUser(nextUser);
        setIsAuthenticated(true);
        setIsSupabaseAuthenticated(true);
        setIsAdminAuthenticated(false);
        return { hasCustomerProfile: Boolean(existingProfile) };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to fetch. Please try again." };
      }
    },
    verifySignupOtp: async (email, token) => {
      if (!supabase) return { error: "Email verification is not configured on this website." };

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: normalizeEmail(email),
          token: token.trim(),
          type: "signup",
        });
        if (error || !data.user) return { error: error?.message || "The verification code is invalid or expired." };

        const metadata = data.user.user_metadata || {};
        const nextUser: AccountUser = {
          id: data.user.id,
          name: String(metadata.name || "Customer"),
          email: normalizeEmail(data.user.email || email),
          phone: normalizeIndianPhone(String(metadata.phone || "")) || undefined,
          createdAt: data.user.created_at,
        };
        const profileResult = await saveCustomerProfile({ id: nextUser.id!, fullName: nextUser.name, email: nextUser.email, phone: nextUser.phone });
        if (profileResult.error) return { error: `Account verified, but your profile could not be saved to Supabase: ${profileResult.error}` };
        setUser(nextUser);
        setIsAuthenticated(true);
        setIsSupabaseAuthenticated(true);
        setIsAdminAuthenticated(false);
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to verify the signup code." };
      }
    },
    resendSignupOtp: async (email) => {
      if (!supabase) return { error: "Email verification is not configured on this website." };

      try {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: normalizeEmail(email),
        });
        return error ? { error: error.message } : {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to resend the verification code." };
      }
    },
    registerAccount: async (name, email, password, phone, securityQuestion, securityAnswer) => {
      if (!supabase) return { error: "Email verification is not configured on this website." };

      const normalizedEmail = normalizeEmail(email);
      const sanitizedName = name.trim() || "Customer";
      const normalizedPhone = normalizeIndianPhone(phone);
      const createdAt = new Date().toISOString();
      const securityAnswerHash = securityAnswer ? await hashSecurityAnswer(securityAnswer) : "";

      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              name: sanitizedName,
              phone: normalizedPhone,
              securityQuestion: securityQuestion || "",
              securityAnswerHash,
            },
          },
        });

        if (error) return { error: error.message };
        if (!data.user) return { error: "The account could not be created. Please try again." };
        if (!data.session) return { needsEmailConfirmation: true };

        const nextUser: AccountUser = {
          id: data.user.id,
          name: sanitizedName,
          email: normalizedEmail,
          phone: normalizedPhone || undefined,
          createdAt: data.user.created_at || createdAt,
        };
        const profileResult = await saveCustomerProfile({ id: nextUser.id!, fullName: nextUser.name, email: nextUser.email, phone: nextUser.phone });
        if (profileResult.error) return { error: `Account created, but your profile could not be saved to Supabase: ${profileResult.error}` };
        setUser(nextUser);
        setIsAuthenticated(true);
        setIsSupabaseAuthenticated(true);
        setIsAdminAuthenticated(false);
        return {};
      } catch (error) {
        return { error: error instanceof Error && error.message ? error.message : "Failed to fetch. Please try again." };
      }
    },
    requestPasswordReset: async (email) => {
      const normalizedEmail = normalizeEmail(email);
      if (!supabase) return { error: "Password recovery is unavailable because Supabase is not configured." };
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/account` : undefined,
        });
        return error ? { error: error.message } : { emailReset: true };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to send the password reset email." };
      }
    },
    resetPasswordWithSecurityAnswer: async () => {
      return { error: "Use the password reset link sent to your email to change your password." };
    },
    changePassword: async (currentPassword, newPassword) => {
      if (!user?.email) return { error: "You must be logged in to change your password." };
      if (!supabase) return { error: "Password changes are unavailable because Supabase is not configured." };
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return error ? { error: error.message } : {};
    },
    signInAdmin: async (email, password) => {
      if (!supabase) return { error: "Admin sign-in is unavailable because Supabase is not configured." };

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizeEmail(email),
          password,
        });
        if (error) return { error: error.message };
        if (!data.session || !data.user) return { error: "Supabase did not create an authenticated session." };
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session || sessionData.session.user.id !== data.user.id) {
          await supabase.auth.signOut();
          return { error: "Supabase did not persist the admin session. Please try again." };
        }
        if (normalizeEmail(data.user.email || "") !== ADMIN_EMAIL) {
          await supabase.auth.signOut();
          return { error: "This Supabase account is not authorized for admin access." };
        }

        const metadata = data.user.user_metadata || {};
        const nextUser: AccountUser = {
          id: data.user.id,
          name: String(metadata.name || "VINI RO Admin"),
          email: ADMIN_EMAIL,
          phone: normalizeIndianPhone(String(metadata.phone || "")) || undefined,
          createdAt: data.user.created_at,
        };
        setUser(nextUser);
        setIsAuthenticated(true);
        setIsAuthReady(true);
        setIsSupabaseAuthenticated(true);
        setIsAdminAuthenticated(false);
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to sign in to Supabase." };
      }
    },
    verifyAdminAccess: async (phone, birthDate) => {
      if (!supabase) return { error: "Admin verification is unavailable because Supabase is not configured." };

      try {
        const { data, error } = await supabase.auth.getSession();
        const session = data.session;
        if (error || !session || normalizeEmail(session.user.email || "") !== ADMIN_EMAIL) {
          return { error: "Sign in with the configured admin Supabase account first." };
        }

    const response = await fetch("/api/admin-access", {
  method: "POST",
  credentials: "include",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ phone, birthDate }),
});
        const result = await readAdminAccessResponse<{ verified?: boolean; error?: string }>(response);
        if (!result) return { error: "The admin verification endpoint returned an invalid response. Check that this site is deployed with its API routes enabled." };
        if (!response.ok || !result.verified) return { error: result.error || "Admin verification failed." };

        setIsAdminAuthenticated(true);
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to verify admin access." };
      }
    },
    logout: () => {
      if (supabase) void supabase.auth.signOut();
  void fetch("/api/admin-access", {
  method: "DELETE",
  credentials: "include",
  keepalive: true,
});
      setUser(null);
      setIsAuthenticated(false);
      setIsSupabaseAuthenticated(false);
      setIsAdminAuthenticated(false);
    },
  }), [isAuthenticated, isAuthReady, isSupabaseAuthenticated, isAdminAuthenticated, user]);

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error("useAuthState must be used inside AuthStateProvider");
  return context;
}
