// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "@getpara/react-sdk/styles.css";
import { AppKitProvider } from "./Context/index";
import { AppWrapper } from "./Components/AppWrapper";
import { supercell } from "./fonts/supercell"; // ✅

export const metadata: Metadata = {
  title: "Reown AppKit + Para",
  description: "Reown AppKit integration with Para wallet connector",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // expose the CSS variable globally
    <html lang="en" className={supercell.variable}>
      {/* make it the default app font (optional, remove if you only want it in some places) */}
      <body className="font-supercell">
        <AppKitProvider>
          <AppWrapper>{children}</AppWrapper>
        </AppKitProvider>
      </body>
    </html>
  );
}
