import localFont from "next/font/local";

export const supercell = localFont({
  src: [
    // You only have Regular TTF in the repo right now
    { path: "./supercell/Supercell-Magic Regular.ttf", weight: "400", style: "normal" },
    // If you later add a bold TTF/WOFF2, add it here. For now we’ll fake bold in CSS.
  ],
  variable: "--font-supercell",
  display: "swap",
});
