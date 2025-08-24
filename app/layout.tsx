// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "@getpara/react-sdk/styles.css";
import { AppKitProvider } from "./Context/index";
import { AppWrapper } from "./Components/AppWrapper";
import { supercell } from "./fonts/supercell"; // ✅

export const metadata: Metadata = {
  title: "KAZAR Games",
  description: "Play and Roll",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // expose CSS var globally (good for Tailwind v4 @theme inline or future use)
    <html lang="en" className={supercell.variable}>
      {/* make Supercell the actual font on the page */}
      <body className={supercell.className}>
        <AppKitProvider>
          <AppWrapper>{children}</AppWrapper>
        </AppKitProvider>
      </body>
    </html>
  );
}
