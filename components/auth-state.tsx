"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AccountUser = {
  name: string;
  email: string;
  phone?: string;
};

export type StoredAccount = AccountUser & {
  password: string;
};

type AuthState = {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  user: AccountUser | null;
  login: (email: string, name?: string, phone?: string) => void;
  registerAccount: (name: string, email: string, password: string, phone?: string) => void;
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

function writeStoredAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readUserState(): AccountUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AccountUser;
    if (!parsed?.email || !parsed?.name) return null;
    return {
      name: parsed.name,
      email: normalizeEmail(parsed.email),
      phone: parsed.phone || undefined,
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
    const syncAuthState = () => {
      const currentUser = readUserState();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser) && readAuthState());
      setIsAdminAuthenticated(readAdminAuthState());
    };

    syncAuthState();

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
    login: (email, name, phone) => {
      const normalizedEmail = normalizeEmail(email);
      const nextUser = {
        name: name?.trim() || "Customer",
        email: normalizedEmail,
        phone: phone?.trim() || undefined,
      };

      window.localStorage.setItem(AUTH_KEY, "true");
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsAdminAuthenticated(false);
    },
    registerAccount: (name, email, password, phone) => {
      const normalizedEmail = normalizeEmail(email);
      const sanitizedName = name.trim() || "Customer";
      const normalizedPhone = phone?.trim() || undefined;
      const accounts = readStoredAccounts();
      const nextAccounts = accounts.filter((account) => account.email !== normalizedEmail);

      nextAccounts.push({
        name: sanitizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
      });

      writeStoredAccounts(nextAccounts);

      const nextUser = { name: sanitizedName, email: normalizedEmail, phone: normalizedPhone };
      window.localStorage.setItem(AUTH_KEY, "true");
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsAdminAuthenticated(false);
    },
    loginAdminAccess: () => {
      const nextUser = {
        name: "VINI RO Admin",
        email: "vinirostore@gmail.com",
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
