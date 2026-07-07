import { apiFetch } from "@/lib/api-client";
import type { User } from "@/types";

export const authService = {
  register(name: string, email: string, password: string) {
    return apiFetch<{ message: string; email: string; user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  verifyEmail(email: string, code: string) {
    return apiFetch<{ user: User; token: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  resendCode(email: string) {
    return apiFetch<{ message: string }>("/auth/resend-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  forgotPassword(email: string) {
    return apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyResetCode(email: string, code: string) {
    return apiFetch<{ message: string; reset_token: string }>("/auth/verify-reset-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  resetPassword(email: string, resetToken: string, newPassword: string) {
    return apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
    });
  },

  login(email: string, password: string) {
    return apiFetch<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
  },

  me() {
    return apiFetch<User>("/auth/me");
  },

  updateProfile(name: string) {
    return apiFetch<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  changePassword(currentPassword: string, newPassword: string) {
    return apiFetch<{ message: string }>("/users/me/password", {
      method: "PUT",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },
};
