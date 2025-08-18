"use client";

// import { Header } from "";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
     
      <main>{children}</main>
    </div>
  );
}