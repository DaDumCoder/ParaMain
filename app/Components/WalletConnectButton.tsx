'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { AppKitButton } from '@reown/appkit/react';

export default function ConnectButton() {
  const { address } = useAccount();

  // your existing persistence logic (unchanged)
  useEffect(() => {
    const saveWalletConnection = async () => {
      if (!address) return;
      try {
        const response = await fetch('/api/wallet-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to save wallet connection');
        // console.log('Wallet connected & saved:', address);
      } catch (err) {
        console.error('Error saving wallet connection:', err);
      }
    };
    saveWalletConnection();
  }, [address]);

  /**
   * We don’t touch AppKitButton’s behavior at all.
   * The wrapper adds neon glass + hover glow.
   * The inner selectors style the rendered <button> from AppKit.
   */
  return (
    <div
      className="
        relative inline-block group
        rounded-2xl
      "
    >
      {/* neon mist behind (hover intensifies) */}
      <span
        className="
          pointer-events-none absolute -inset-1 rounded-2xl blur-xl opacity-60
          bg-[radial-gradient(120%_120%_at_50%_0%,rgba(125,211,252,0.18),rgba(59,130,246,0.24)_35%,transparent_70%)]
          transition-opacity group-hover:opacity-90
        "
      />
      {/* subtle edge glow ring */}
      <span
        className="
          pointer-events-none absolute inset-0 rounded-2xl
          ring-1 ring-inset ring-sky-400/25 group-hover:ring-sky-300/50
          transition
        "
      />

      {/* Style the INTERNAL AppKit button via descendant selectors */}
      <div
        className="
          relative z-10
          [&_button]:rounded-2xl
          [&_button]:border [&_button]:border-white/15
          [&_button]:bg-white/5
          [&_button]:backdrop-blur-md
          [&_button]:text-white
          [&_button]:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_30px_rgba(59,130,246,0.35)]
          hover:[&_button]:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_45px_rgba(59,130,246,0.55)]
          [&_button]:transition [&_button]:duration-200
          [&_button]:px-4 [&_button]:py-2.5 [&_button]:font-semibold [&_button]:text-sm
          [&_button]:drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]
          group-hover:[&_button]:scale-[1.02] active:[&_button]:scale-[0.98]
          focus:[&_button]:outline-none focus:[&_button]:ring-2 focus:[&_button]:ring-sky-300/60
        "
      >
        <AppKitButton />
      </div>
    </div>
  );
}
