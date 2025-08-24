"use client";

import { ToastProvider } from "./Toast";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
}
