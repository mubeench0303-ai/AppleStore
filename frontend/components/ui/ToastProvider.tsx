"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "rgb(var(--color-ink))",
          color: "rgb(var(--color-background))",
          borderRadius: "9999px",
          padding: "10px 20px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#1DB954", secondary: "rgb(var(--color-background))" } },
        error: { iconTheme: { primary: "#E8453C", secondary: "rgb(var(--color-background))" } },
      }}
    />
  );
}
