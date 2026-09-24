"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { saveCustomerProfile } from "@/lib/customer-data";

export type AccountUser = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
};

export type StoredAccount = AccountUser & {
  password: string;
  addresses?: Array<{ id: string; label: string; line1: string; city: string; state: string; pincode: string; phone: string; isDefault?: boolean; createdAt?: string; }>;
  notifications?: Record<string, boolean>;
  paymentPreferences?: { method: string; upiId?: string; cardLabel?: string; };
};

type AuthState = {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  user: AccountUser | null;
  login: (email: string, name?: string, phone?: string, createdAt?: string, password?: string) => Promise<{ error?: string }>;
  requestEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error?: string }>;
  registerAccount: (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  loginAdminAccess: () => void;
  logout: () => void;
};

const AuthStateContext = createContext<AuthState | null>(null);
const AUTH_KEY = "vini-authenticated";
const USER_KEY = "vini-user";
const ADMIN_AUTH_KEY = "vini-admin-authenticated";
const ACCOUNTS_KEY = "vini-accounts";

export const ADMIN_EMAIL = "vinirostore@gmail.com";
export const ADMIN_PASSWORD = "vinirostore@2020";
export const ADMIN_PHONE = "9104881806";
export const ADMIN_BIRTHDATE = "26-07-2007";

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

export function isValidIndianPhone(phone?: string) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}

export function readStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(ACCOUNTS_KEY);
    return [];
  }
}

export function writeStoredAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getStoredAccountByEmail(email: string): StoredAccount | undefined {
  return readStoredAccounts().find((account) => account.email.toLowerCase() === normalizeEmail(email));
}

export function saveStoredAccount(account: StoredAccount) {
  const accounts = readStoredAccounts();
  const normalizedEmail = normalizeEmail(account.email);
  const existingIndex = accounts.findIndex((item) => normalizeEmail(item.email) === normalizedEmail);

  const nextAccounts = existingIndex >= 0
    ? accounts.map((item) => normalizeEmail(item.email) === normalizedEmail ? { ...item, ...account } : item)
    : [...accounts, account];

  writeStoredAccounts(nextAccounts);
  return nextAccounts.find((item) => normalizeEmail(item.email) === normalizedEmail);
}

export function readUserState(): AccountUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AccountUser;
    if (!parsed?.email || !parsed?.name) return null;
    return {
      id: parsed.id,
      name: parsed.name,
      email: normalizeEmail(parsed.email),
      phone: parsed.phone || undefined,
      createdAt: parsed.createdAt || undefined,
    };
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

function readAuthState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "true";
}

function readAdminAuthState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const applySupabaseSession = async () => {
      if (!supabase) return;

      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        if (!sessionUser) return;

        const metadata = sessionUser.user_metadata || {};
        const nextUser: AccountUser = {
          id: sessionUser.id,
          name: String(metadata.name || "Customer"),
          email: normalizeEmail(sessionUser.email || ""),
          phone: normalizeIndianPhone(String(metadata.phone || "")) || undefined,
          createdAt: sessionUser.created_at,
        };

        window.localStorage.setItem(AUTH_KEY, "true");
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        setIsAuthenticated(true);
      } catch {
        // Ignore temporary Supabase fetch/session issues and fall back to local state.
      }
    };

    const syncAuthState = () => {
      const currentUser = readUserState();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser) && readAuthState());
      setIsAdminAuthenticated(readAdminAuthState());
    };

    syncAuthState();
    void applySupabaseSession();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_KEY || event.key === AUTH_KEY || event.key === ADMIN_AUTH_KEY) {
        syncAuthState();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<AuthState>(() => ({
    isAuthenticated,
    isAdminAuthenticated,
    user,
    login: async (email, name, phone, createdAt, password) => {
      const normalizedEmail = normalizeEmail(email);

      if (supabase) {
        try {
          const signInResult = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password || "",
          });
          let authUser = signInResult.data.user;
          let authError = signInResult.error;

          if (authError) {
            const legacyAccount = getStoredAccountByEmail(normalizedEmail);
            if (legacyAccount && legacyAccount.password === password) {
              const migration = await supabase.auth.signUp({
                email: normalizedEmail,
                password: password || "",
                options: {
                  data: {
                    name: legacyAccount.name,
                    phone: legacyAccount.phone || "",
                  },
                },
              });

              if (!migration.error && migration.data.user && migration.data.session) {
                authUser = migration.data.user;
                authError = null;
              }
            }
          }

          if (authError || !authUser) {
            return { error: authError?.message || "Unable to sign in with this account." };
          }

          const metadata = authUser.user_metadata || {};
          const nextUser: AccountUser = {
            id: authUser.id,
            name: String(metadata.name || name || "Customer"),
            email: normalizeEmail(authUser.email || normalizedEmail),
            phone: normalizeIndianPhone(String(metadata.phone || phone || "")) || undefined,
            createdAt: authUser.created_at || createdAt || new Date().toISOString(),
          };

          window.localStorage.setItem(AUTH_KEY, "true");
          window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
          await saveCustomerProfile({ id: nextUser.id!, fullName: nextUser.name, email: nextUser.email, phone: nextUser.phone });
          setUser(nextUser);
          setIsAuthenticated(true);
          setIsAdminAuthenticated(false);
          return {};
        } catch (error) {
          const legacyAccount = getStoredAccountByEmail(normalizedEmail);
          if (legacyAccount && legacyAccount.password === password) {
            const nextUser: AccountUser = {
              id: legacyAccount.id || `user-${Date.now()}`,
              name: legacyAccount.name || name || "Customer",
              email: normalizeEmail(legacyAccount.email),
              phone: normalizeIndianPhone(legacyAccount.phone || phone) || undefined,
              createdAt: legacyAccount.createdAt || createdAt || new Date().toISOString(),
            };

            window.localStorage.setItem(AUTH_KEY, "true");
            window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
            setUser(nextUser);
            setIsAuthenticated(true);
            setIsAdminAuthenticated(false);
            return {};
          }

          return { error: error instanceof Error && error.message ? error.message : "Failed to fetch. Please try again." };
        }
      }

      const storedAccounts = readStoredAccounts();
      const matchedAccount = storedAccounts.find((account) => normalizeEmail(account.email) === normalizedEmail);

      const nextUser: AccountUser = {
        id: matchedAccount?.id || `user-${Date.now()}`,
        name: (name || matchedAccount?.name || "Customer").trim() || "Customer",
        email: normalizedEmail,
        phone: normalizeIndianPhone(phone || matchedAccount?.phone) || undefined,
        createdAt: createdAt || matchedAccount?.createdAt || new Date().toISOString(),
      };

      if (matchedAccount && !matchedAccount.phone && nextUser.phone) {
        const updatedAccount = { ...matchedAccount, phone: nextUser.phone };
        saveStoredAccount(updatedAccount);
      }

      window.localStorage.setItem(AUTH_KEY, "true");
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsAdminAuthenticated(false);
      return {};
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

        window.localStorage.setItem(AUTH_KEY, "true");
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        setIsAuthenticated(true);
        setIsAdminAuthenticated(false);
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to fetch. Please try again." };
      }
    },
    registerAccount: async (name, email, password, phone) => {
      const normalizedEmail = normalizeEmail(email);
      const sanitizedName = name.trim() || "Customer";
      const normalizedPhone = normalizeIndianPhone(phone);
      const createdAt = new Date().toISOString();

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
              data: {
                name: sanitizedName,
                phone: normalizedPhone,
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

          window.localStorage.setItem(AUTH_KEY, "true");
          window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
          const profileResult = await saveCustomerProfile({ id: nextUser.id!, fullName: nextUser.name, email: nextUser.email, phone: nextUser.phone });
          if (profileResult.error) return { error: profileResult.error };
          setUser(nextUser);
          setIsAuthenticated(true);
          setIsAdminAuthenticated(false);
          return {};
        } catch (error) {
          const nextAccount: StoredAccount = {
            id: `user-${Date.now()}`,
            name: sanitizedName,
            email: normalizedEmail,
            phone: normalizedPhone,
            password,
            createdAt,
            addresses: [],
            notifications: { serviceUpdates: true, promos: true, orderStatus: true },
            paymentPreferences: { method: "cashfree" },
          };

          saveStoredAccount(nextAccount);
          const nextUser: AccountUser = {
            id: nextAccount.id,
            name: sanitizedName,
            email: normalizedEmail,
            phone: normalizedPhone || undefined,
            createdAt,
          };

          window.localStorage.setItem(AUTH_KEY, "true");
          window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
          setUser(nextUser);
          setIsAuthenticated(true);
          setIsAdminAuthenticated(false);
          return { error: error instanceof Error && error.message ? error.message : "Failed to fetch. Please try again." };
        }
      }

      const nextAccount: StoredAccount = {
        id: `user-${Date.now()}`,
        name: sanitizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
        createdAt,
        addresses: [],
        notifications: { serviceUpdates: true, promos: true, orderStatus: true },
        paymentPreferences: { method: "cashfree" },
      };

      const existingAccount = getStoredAccountByEmail(normalizedEmail);
      if (existingAccount) {
        const mergedAccount = {
          ...existingAccount,
          name: sanitizedName,
          email: normalizedEmail,
          phone: normalizedPhone || existingAccount.phone,
          password: password || existingAccount.password,
          createdAt: existingAccount.createdAt || createdAt,
        };
        saveStoredAccount(mergedAccount);
      } else {
        saveStoredAccount(nextAccount);
      }

      const persistedAccount = getStoredAccountByEmail(normalizedEmail) || nextAccount;
      const nextUser: AccountUser = {
        id: persistedAccount.id,
        name: sanitizedName,
        email: normalizedEmail,
        phone: normalizedPhone || persistedAccount.phone,
        createdAt: persistedAccount.createdAt || createdAt,
      };

      window.localStorage.setItem(AUTH_KEY, "true");
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsAdminAuthenticated(false);
      return {};
    },
    loginAdminAccess: () => {
      const nextUser: AccountUser = {
        id: "admin-vini-ro",
        name: "VINI RO Admin",
        email: "vinirostore@gmail.com",
        phone: ADMIN_PHONE,
        createdAt: new Date().toISOString(),
      };

      window.localStorage.setItem(AUTH_KEY, "true");
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsAdminAuthenticated(true);
    },
    logout: () => {
      window.localStorage.removeItem(AUTH_KEY);
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdminAuthenticated(false);
    },
  }), [isAuthenticated, isAdminAuthenticated, user]);

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error("useAuthState must be used inside AuthStateProvider");
  return context;
}
