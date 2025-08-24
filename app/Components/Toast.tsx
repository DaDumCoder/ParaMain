"use client";
import React, { createContext, useContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";
type ToastMsg = { id: number; type: ToastType; title?: string; message: string };
type ToastCtx = {
  show: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);
export const useToast = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
};

export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [counter, setCounter] = useState(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = counter + 1;
      setCounter(id);
      setToasts((prev) => [...prev, { id, message, type, title }]);
      setTimeout(() => remove(id), 3000); // auto-dismiss
    },
    [counter, remove]
  );

  const ctx: ToastCtx = {
    show,
    success: (m, t) => show(m, "success", t),
    error: (m, t) => show(m, "error", t),
    info: (m, t) => show(m, "info", t),
  };

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={[
                "pointer-events-auto rounded-2xl px-4 py-3 shadow-xl border backdrop-blur-md",
                t.type === "success" && "bg-emerald-900/60 border-emerald-600/40 text-emerald-100",
                t.type === "error" && "bg-rose-900/60 border-rose-600/40 text-rose-100",
                t.type === "info" && "bg-slate-900/60 border-slate-600/40 text-slate-100",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t.title && <div className="font-semibold text-sm mb-0.5">{t.title}</div>}
              <div className="text-sm leading-relaxed">{t.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
};
