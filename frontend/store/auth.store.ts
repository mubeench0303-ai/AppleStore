"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import type { User } from "@/types";
import { authService } from "@/lib/services/auth.service";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ email: string; message: string }>;
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
    syncAuthCookie(user);
    set({ user });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.login(email, password);
      get().setUser(user);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(name, email, password);
      return { email: res.email, message: res.message };
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.verifyEmail(email, code);
      get().setUser(user);
    } finally {
      set({ isLoading: false });
    }
  },

  resendCode: async (email) => {
    await authService.resendCode(email);
  },

  logout: async () => {
    await authService.logout().catch(() => {});
    get().setUser(null);
  },

  hydrate: async () => {
    try {
      const user = await authService.me();
      get().setUser(user);
    } catch {
      get().setUser(null);
    } finally {
      set({ isHydrated: true });
    }
  },
}));
