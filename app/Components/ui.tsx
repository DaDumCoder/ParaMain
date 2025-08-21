import React from "react";

// Simple classNames combiner (avoids long string concatenations)
export const cn = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// Base styles for soft / neumorphic card look
export const SOFT = {
  card:
    "rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl shadow-[inset_-6px_-6px_16px_rgba(255,255,255,0.05),inset_6px_6px_16px_rgba(0,0,0,0.7),12px_12px_24px_rgba(0,0,0,0.8)]",
  hover: "transition-all duration-300 hover:scale-[1.01]",
};

// Small reusable card wrapper
export const NeuCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => <div className={cn(SOFT.card, SOFT.hover, className)}>{children}</div>;
