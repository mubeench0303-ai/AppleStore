"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import type { User } from "@/types";
import { authService } from "@/lib/services/auth.service";
import { APIError } from "@/lib/api-client";
import { clearAccessToken, hasAccessToken, setAccessToken } from "@/lib/auth-token";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: User | null) => void;
}

function syncAuthCookie(user: User | null) {
  if (user) {
    Cookies.set("auth_state", JSON.stringify({ role: user.role }), { expires: 1, sameSite: "lax" });
  } else {
    Cookies.remove("auth_state");
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  setUser: (user) => {
    if (!user) clearAccessToken();
    syncAuthCookie(user);
    set({ user });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.login(email, password);
      if (!token) {
        throw new Error("Login succeeded but no session token was returned");
      }
      setAccessToken(token);
      syncAuthCookie(user);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.register(name, email, password);
      if (!token) {
        throw new Error("Registration succeeded but no session token was returned");
      }
      setAccessToken(token);
      syncAuthCookie(user);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.verifyEmail(email, code);
      if (!token) {
        throw new Error("Verification succeeded but no session token was returned");
      }
      setAccessToken(token);
      syncAuthCookie(user);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  resendCode: async (email) => {
    await authService.resendCode(email);
  },

  logout: async () => {
    await authService.logout().catch(() => {});
    clearAccessToken();
    get().setUser(null);
  },

  hydrate: async () => {
    if (!hasAccessToken()) {
      set({ user: null, isHydrated: true });
      return;
    }

    try {
      const user = await authService.me();
      syncAuthCookie(user);
      set({ user });
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        clearAccessToken();
        syncAuthCookie(null);
        set({ user: null });
      }
    } finally {
      set({ isHydrated: true });
    }
  },
}));
