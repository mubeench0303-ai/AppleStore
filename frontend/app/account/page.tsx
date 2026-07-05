"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/lib/services/auth.service";

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await authService.updateProfile(name);
      setUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setPasswordForm(EMPTY_PASSWORD_FORM);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't change password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (!user) {
    return <p className="text-muted text-[14px]">Loading your profile…</p>;
  }

  return (
    <div className="max-w-sm space-y-10">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="space-y-5"
      >
        <label className="block">
          <span className="text-[13px] text-ink/70 mb-1.5 block">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
          />
        </label>
        <label className="block">
          <span className="text-[13px] text-ink/70 mb-1.5 block">Email</span>
          <input
            value={user.email}
            disabled
            className="w-full border border-border rounded-xl px-4 py-3 text-[14px] bg-surface text-muted"
          />
        </label>
        <label className="block">
          <span className="text-[13px] text-ink/70 mb-1.5 block">Role</span>
          <input
            value={user.role}
            disabled
            className="w-full border border-border rounded-xl px-4 py-3 text-[14px] bg-surface text-muted capitalize"
          />
        </label>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full px-7 py-3 text-[14px] font-medium transition-colors"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </motion.button>
      </motion.form>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="border border-border rounded-3xl p-6"
      >
        <h2 className="font-heading text-lg font-semibold mb-1">Change password</h2>
        <p className="text-[13px] text-muted mb-5">Use at least 8 characters for your new password.</p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <label className="block">
            <span className="text-[13px] text-ink/70 mb-1.5 block">Current password</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              autoComplete="current-password"
              className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-ink/70 mb-1.5 block">New password</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              autoComplete="new-password"
              className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-ink/70 mb-1.5 block">Confirm new password</span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              autoComplete="new-password"
              className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
            />
          </label>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isChangingPassword}
            className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full px-7 py-3 text-[14px] font-medium transition-colors"
          >
            {isChangingPassword ? "Updating…" : "Update password"}
          </motion.button>
        </form>
      </motion.section>
    </div>
  );
}
