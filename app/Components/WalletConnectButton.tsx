// app/Components/WalletConnectButton.tsx
'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { AppKitButton } from '@reown/appkit/react';

type Theme = 'orange' | 'blue';
const PALETTE = {
  orange: {
    // outer aura (behind the button)
    aura1:
      'bg-[radial-gradient(80%_120%_at_25%_0%,rgba(251,146,60,0.35),transparent_60%)]',
    aura2:
      'bg-[radial-gradient(80%_120%_at_75%_100%,rgba(245,158,11,0.35),transparent_60%)]',
    // border & shadows
    border:
      'bg-[conic-gradient(at_20%_-10%,#fb923c,#f59e0b,#f97316,#fb923c)] ' +
      'shadow-[0_12px_40px_rgba(251,146,60,0.35)] ' +
      'group-hover:shadow-[0_20px_70px_rgba(251,146,60,0.6)]',
    // interior fill (under the AppKit button)
    fill:
      'bg-gradient-to-br from-orange-400/70 via-amber-300/60 to-yellow-300/70',
    // blobs & rings
    blobL: 'bg-orange-400/40',
    blobR: 'bg-amber-300/40',
    focusRing: 'focus:[&_button]:ring-amber-300/60',
    txtGlow:
      '[&_button]:drop-shadow-[0_0_12px_rgba(251,189,35,0.85)]',
    bottomGlow: 'bg-orange-400/45',
  },
  blue: {
    aura1:
      'bg-[radial-gradient(80%_120%_at_25%_0%,rgba(99,102,241,0.35),transparent_60%)]',
    aura2:
      'bg-[radial-gradient(80%_120%_at_75%_100%,rgba(34,211,238,0.35),transparent_60%)]',
    border:
      'bg-[conic-gradient(at_20%_-10%,#60a5fa,#22d3ee,#a78bfa,#60a5fa)] ' +
      'shadow-[0_12px_40px_rgba(56,189,248,0.35)] ' +
      'group-hover:shadow-[0_20px_70px_rgba(56,189,248,0.6)]',
    fill:
      'bg-gradient-to-br from-sky-400/70 via-cyan-300/60 to-indigo-300/70',
    blobL: 'bg-cyan-400/40',
    blobR: 'bg-fuchsia-400/40',
    focusRing: 'focus:[&_button]:ring-sky-300/60',
    txtGlow:
      '[&_button]:drop-shadow-[0_0_12px_rgba(147,197,253,0.85)]',
    bottomGlow: 'bg-sky-400/45',
  },
};

export default function ConnectButton({ theme = 'orange' }: { theme?: Theme }) {
  const { address } = useAccount();
  const C = PALETTE[theme];

  // keep your original persistence logic (unchanged)
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

  return (
    <div className="relative inline-block group">
      {/* soft outer aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 opacity-70 group-hover:opacity-100 transition"
      >
        <div className={`absolute inset-0 rounded-[26px] blur-2xl ${C.aura1}`} />
        <div className={`absolute inset-0 rounded-[26px] blur-2xl ${C.aura2}`} />
      </div>

      {/* gradient border + big glow */}
      <div
        className={`relative rounded-[24px] p-[2px] ${C.border} transition`}
      >
        {/* glass panel with glossy top + color blobs */}
        <div className="relative rounded-[22px] overflow-hidden backdrop-blur-xl bg-white/8">
          {/* glossy stripe */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-2 right-2 top-0 h-[58%] rounded-t-[22px] bg-white/25 blur-[10px] opacity-80"
          />
          {/* interior gradient fill */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 rounded-[22px] ${C.fill}`}
          />
          {/* subtle color blobs */}
          <span
            aria-hidden
            className={`pointer-events-none absolute -left-8 -top-6 h-16 w-20 ${C.blobL} blur-2xl rounded-full`}
          />
          <span
            aria-hidden
            className={`pointer-events-none absolute -right-6 -bottom-6 h-16 w-20 ${C.blobR} blur-2xl rounded-full`}
          />

          {/* the real AppKit button — forced transparent */}
          <div
            className={[
              'relative z-[1]',
              // make AppKit’s internal <button> transparent & sized
              '[&_button]:bg-transparent [&_button]:border-0',
              '[&_button]:text-white [&_button]:font-semibold [&_button]:text-sm',
              '[&_button]:px-5 [&_button]:py-3',
              '[&_button]:rounded-[22px]',
              '[&_button]:transition [&_button]:duration-200',
              'group-hover:[&_button]:scale-[1.02] active:[&_button]:scale-[0.98]',
              'focus:[&_button]:outline-none',
              C.focusRing,
              C.txtGlow,
            ].join(' ')}
          >
            <AppKitButton />
          </div>
        </div>
      </div>

      {/* bottom glow/reflection */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-2 left-6 right-6 h-5 blur-xl rounded-full opacity-70 ${C.bottomGlow}`}
      />
    </div>
  );
}
