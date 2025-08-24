'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { AppKitButton } from '@reown/appkit/react';

export default function ConnectButton() {
  const { address } = useAccount();

  // keep your existing persistence logic (unchanged)
  useEffect(() => {
    const saveWalletConnection = async () => {
      if (!address) return;
      try {
        const res = await fetch('/api/wallet-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save wallet connection');
      } catch (e) {
        console.error('Error saving wallet connection:', e);
      }
    };
    saveWalletConnection();
  }, [address]);

  /**
   * We DO NOT change AppKit behavior—only visuals around it.
   * Layers:
   *  - Soft outer aura
   *  - Gradient border
   *  - Glass panel with internal color blobs + glossy stripe
   *  - AppKitButton forced transparent & neon text
   */
  return (
    <div className="relative inline-block group">
      {/* 1) Soft outer aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 opacity-70 group-hover:opacity-100 transition"
      >
        <div className="
          absolute inset-0 rounded-[22px] blur-2xl
          bg-[radial-gradient(120%_100%_at_30%_0%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(120%_100%_at_70%_100%,rgba(34,211,238,0.35),transparent_60%)]
        " />
      </div>

      {/* 2) Gradient border (multi-color neon) */}
      <div className="
        relative rounded-[20px] p-[1.6px]
        bg-[conic-gradient(at_20%_-10%,#60a5fa,#22d3ee,#a78bfa,#60a5fa)]
        shadow-[0_10px_40px_rgba(56,189,248,0.35)]
        group-hover:shadow-[0_16px_60px_rgba(56,189,248,0.55)]
        transition
      ">
        {/* (Switch to Camp-Orange theme? See NOTE at bottom) */}

        {/* 3) Glass panel */}
        <div className="relative rounded-[18px] bg-white/8 backdrop-blur-xl overflow-hidden">
          {/* glossy top stripe */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-2 right-2 top-0 h-[55%] rounded-t-[18px] bg-white/20 blur-[10px] opacity-70"
          />
          {/* internal color blobs */}
          <span aria-hidden className="pointer-events-none absolute -left-8 -top-6 h-16 w-20 bg-cyan-400/30 blur-2xl rounded-full" />
          <span aria-hidden className="pointer-events-none absolute -right-6 -bottom-6 h-16 w-20 bg-fuchsia-400/30 blur-2xl rounded-full" />

          {/* 4) The real button (from AppKit) made transparent & neon */}
          <div
            className="
              relative z-[1]
              [&_button]:rounded-[18px]
              [&_button]:px-5 [&_button]:py-3
              [&_button]:bg-transparent [&_button]:border-0
              [&_button]:text-white [&_button]:font-semibold [&_button]:text-sm
              [&_button]:drop-shadow-[0_0_12px_rgba(147,197,253,0.85)]
              [&_button]:transition [&_button]:duration-200
              group-hover:[&_button]:scale-[1.02] active:[&_button]:scale-[0.98]
              focus:[&_button]:outline-none focus:[&_button]:ring-2 focus:[&_button]:ring-sky-300/60
            "
          >
            <AppKitButton />
          </div>
        </div>
      </div>
    </div>
  );
}
