"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1D1D1F",
          color: "#FBFBFD",
          borderRadius: "9999px",
          padding: "10px 20px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#1DB954", secondary: "#FBFBFD" } },
        error: { iconTheme: { primary: "#E8453C", secondary: "#FBFBFD" } },
      }}
    />
  );
}
