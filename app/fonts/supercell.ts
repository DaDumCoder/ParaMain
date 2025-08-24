import localFont from "next/font/local";

export const supercell = localFont({
  src: [
    { path: "./supercell/SupercellMagic-Regular.woff2", weight: "400", style: "normal" },
    { path: "./supercell/SupercellMagic-Bold.woff2",    weight: "700", style: "normal" },
  ],
  variable: "--font-supercell",   // exposes a CSS var we can use in Tailwind
  display: "swap",
});
