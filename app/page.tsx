"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense, useCallback } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useBalance,
  useWriteContract,
} from 'wagmi';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TbHexagonLetterN } from 'react-icons/tb'
import { FaTrophy, FaWallet, FaMedal, FaGamepad, FaHome } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ConnectButton from "./Components/WalletConnectButton";
import IFrame from './Components/IFrame';
import NFT from "./Components/NFT";
import { NeuCard, cn } from "./Components/ui";
import { useToast } from "./Components/Toast";

// Firestore
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// --- Claim contract config (same as old page) ---
const CLAIM_CONTRACT = (
  process.env.NEXT_PUBLIC_CLAIM_CONTRACT ||
  "0x5D1e186A8f7D26771d6791E6B232DD4A2Ad7d72d"
) as `0x${string}`;

// minimal ABI: claim(uint256 amount)
const claimAbi = [
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const;

/* ----------------------------- UI helpers ----------------------------- */

/* ------------------------------ Brand/UI ------------------------------ */
const BrandKazar: React.FC = () => {
  const letters = useMemo(() => ["K", "A", "Z", "A", "R"], []);
  return (
    <div className="relative select-none">
      <div className="absolute -inset-1 rounded-2xl blur-xl bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/30 to-cyan-500/30" />
      <motion.h1
        className="relative z-10 font-black tracking-[0.25em] text-xl sm:text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 drop-shadow-[0_2px_6px_rgba(251,146,60,0.35)]"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              hidden: { y: 20, opacity: 0 },
              show: { y: 0, opacity: 1 },
            }}
            whileHover={{ y: -2, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {ch}
          </motion.span>
        ))}
        <span className="relative ml-3 align-middle text-[10px] sm:text-xs font-semibold text-white/70">
          <motion.span
            className="inline-block"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            on CAMP
          </motion.span>
        </span>
      </motion.h1>
    </div>
  );
};

const Navbar: React.FC = () => (
<div className="sticky top-0 z-40 w-full">
  {/* Background Bar */}
  <div className="h-16 w-full bg-gradient-to-r from-orange-900/50 via-amber-900/50 to-red-900/50 backdrop-blur-xl border-b border-white/10 shadow-[0_0_25px_rgba(251,146,60,0.3)] transition-all duration-500"/>

  {/* Content Wrapper */}
  <div className="px-4 md:px-6 max-w-screen-xl mx-auto">
    <div className="relative flex flex-wrap items-center justify-between -mt-10">
      {/* Logo or Brand */}
      <div className="flex-shrink-0">
        <BrandKazar />
      </div>

      {/* Buttons / Controls */}
      <div className="flex items-center gap-2 sm:gap-3 mt-4 md:mt-0">
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
          <ConnectButton />
        </motion.div>
      </div>
    </div>
  </div>
</div>
);

const RowSkeleton: React.FC = () => (
  <div className="flex justify-between items-center p-4 rounded-2xl bg-zinc-900/70 border border-white/10 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-5 w-5 rounded-full bg-white/10" />
      <div className="h-4 w-40 sm:w-56 rounded bg-white/10" />
    </div>
    <div className="h-4 w-10 rounded bg-white/10" />
  </div>
);

/* ----------------------------- Claim helpers -------------------------- */
const PRICE_PER_POINT = 0.00001;
const claimableToEth = (pts: number) => (pts * PRICE_PER_POINT).toFixed(18);

/* ------------------ Reusable UI Components ------------------ */

type View = "dashboard" | "game1" | "game2" | "nft";

const navItems = [
  {
    view: "dashboard" as View,
    label: "Dashboard",
    icon: FaHome,
    hoverRotate: "hover:rotate-6",
    activeGlow: "shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.1),inset_2px_2px_8px_rgba(0,0,0,0.3),0_0_25px_rgba(251,146,60,0.8)]",
    activeGradient: "from-orange-600/60 to-amber-700/60",
    activeBorder: "border-orange-400/30",
    tooltipGradient: "from-orange-500 via-amber-500 to-yellow-400",

  },
  {
    view: "game1" as View,
    label: "CAMP Tunes",
    icon: FaGamepad,
    hoverRotate: "hover:-rotate-6",
    activeGlow: "shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.1),inset_2px_2px_8px_rgba(0,0,0,0.3),0_0_25px_rgba(236,72,153,0.8)]",
    activeGradient: "from-pink-600/60 to-red-700/60",
    activeBorder: "border-pink-400/30",
    tooltipGradient: "from-pink-500 via-red-500 to-yellow-400",
  },
  {
    view: "game2" as View,
    label: "AttackURP",
    icon: FaGamepad,
    hoverRotate: "hover:rotate-5",
    activeGlow: "shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.1),inset_2px_2px_8px_rgba(0,0,0,0.3),0_0_25px_rgba(34,197,94,0.8)]",
    activeGradient: "from-green-600/60 to-teal-700/60",
    activeBorder: "border-green-400/30",
    tooltipGradient: "from-green-400 via-teal-400 to-cyan-400",
  },
  {
    view: "nft" as View,
    label: "NFT",
    icon: TbHexagonLetterN,
    hoverRotate: "hover:-rotate-8",
    activeGlow: "shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.1),inset_2px_2px_8px_rgba(0,0,0,0.3),0_0_25px_rgba(251,146,60,0.8)]",
    activeGradient: "from-orange-600/60 to-amber-700/60",
    activeBorder: "border-orange-400/30",
    tooltipGradient: "from-orange-400 via-amber-400 to-yellow-400",
  },
];

/**
 * Sidebar navigation component.
 * It's responsive: a fixed vertical bar on desktop, and a fixed horizontal bar on the bottom for mobile.
 */
const SidebarNav = ({ currentView, onViewChange }: { currentView: View; onViewChange: (view: View) => void; }) => (
  <>
    {/* Desktop Sidebar */}
    <motion.div
      className="hidden md:flex flex-col items-center space-y-6 fixed left-0 top-0 h-full justify-center px-4 z-30"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {navItems.map(item => {
        const isActive = currentView === item.view;
        return (
          <motion.div
            key={item.view}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className={cn("group relative", item.hoverRotate)}
            onClick={() => onViewChange(item.view)}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300",
              "shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.05),inset_2px_2px_8px_rgba(0,0,0,0.5),4px_4px_12px_rgba(0,0,0,0.6)]",
              isActive
                ? cn(item.activeGradient, item.activeBorder, item.activeGlow)
                : "bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm border border-white/10 group-hover:shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.1),inset_2px_2px_8px_rgba(0,0,0,0.3),0_0_25px_rgba(168,85,247,0.6)]"
            )}>
              <item.icon className={cn("text-xl transition-colors duration-300", isActive ? "text-white" : "text-zinc-300 group-hover:text-white")} />
            </div>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "absolute left-20 top-1/2 -translate-y-1/2 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap",
                item.tooltipGradient,
                isActive ? "opacity-100 -translate-x-2" : "opacity-0 group-hover:opacity-100 group-hover:-translate-x-2"
              )}
            >
              {item.label}
            </motion.span>
          </motion.div>
        );
      })}
    </motion.div>

    {/* Mobile Bottom Bar */}
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-zinc-950/80 backdrop-blur-lg border-t border-white/10 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = currentView === item.view;
          return (
            <button key={item.view} onClick={() => onViewChange(item.view)} className="flex flex-col items-center justify-center gap-1 text-xs">
              <item.icon className={cn("text-lg", isActive ? 'text-fuchsia-400' : 'text-zinc-400')} />
              <span className={cn(isActive ? 'text-white font-semibold' : 'text-zinc-400')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </>
);

/**
 * Widget for claiming rewards.
 */
const ClaimWidget = React.memo(({ address, myRow, claimable, handleClaim, claimButtonDisabled, isClaiming, isClaimConfirming, loadScores }: { address: string | undefined; myRow: any; claimable: number; handleClaim: () => void; claimButtonDisabled: boolean; isClaiming: boolean; isClaimConfirming: boolean; loadScores: () => Promise<void> }) => (
  <NeuCard className="p-6 md:p-8">
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
        <FaWallet className="text-green-400" /> Claim
      </h2>
      <button
        onClick={loadScores}
        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
      >
        Refresh
      </button>
    </div>

    <div className="space-y-4">
      {!address ? (
        <p className="text-zinc-400">
          Connect wallet to see claimable amount.
        </p>
      ) : myRow ? (
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Claimable</span>
          <span className="font-mono text-white">{claimable}</span>
        </div>
      ) : (
        <p className="text-zinc-400">
          No record found for this wallet.
        </p>
      )}

      <button
        onClick={handleClaim}
        disabled={claimButtonDisabled}
        className="w-full cursor-pointer text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl shadow-[inset_0_2px_0_rgba(255,255,255,.12)] hover:scale-[1.01] active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isClaiming || isClaimConfirming ? "Claiming..." : "Claim Now"}
      </button>
    </div>
  </NeuCard>
));
ClaimWidget.displayName = "ClaimWidget";

/**
 * Widget for showing a pro tip.
 */
const ProTipWidget = () => (
  <NeuCard className="p-6 hover:shadow-[0_0_25px_rgba(52,211,153,0.35)]">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      <p className="text-sm text-zinc-400">Pro tip</p>
    </div>
    <p className="text-sm text-zinc-300">
      Connect your wallet to unlock quests, claim rewards, and appear on
      the leaderboard.
    </p>
  </NeuCard>
);

/**
 * A layout component that creates a responsive two-column grid.
 */
const TwoColumnLayout = ({ left, right }: { left: React.ReactNode, right: React.ReactNode }) => (
  <div className="grid grid-cols-12 gap-6 md:gap-8">
    <div className="col-span-12 lg:col-span-8 space-y-8">
      {left}
    </div>
    <aside className="col-span-12 lg:col-span-4 space-y-8">
      {right}
    </aside>
  </div>
);


/* ===================================================================== */

function HomeClient() {
  const { success, error, info } = useToast();
  const { address } = useAccount();
  useBalance({ address }); // optional: keeps wallet box fresh
  const searchParams = useSearchParams();
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // State for current view - added "nft" as an option
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const [leaderboard, setLeaderboard] = useState<
    Array<{ wallet: string; score: number }>
  >([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  // --- scores for claim ---
  const [scores, setScores] = useState<
    Array<{
      id: string;
      wallet: string;
      claim_value?: number;
      claim_done?: boolean;
    }>
  >([]);

  const loadScores = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "scores"));
      setScores(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (e) {
      console.error("loadScores failed", e);
    }
  }, []);
  useEffect(() => {
    loadScores();
  }, [loadScores]);

  // user row
  const myRow = useMemo(
    () => scores.find((s) => s.wallet?.toLowerCase() === address?.toLowerCase()),
    [scores, address]
  );
  const claimDone = !!myRow?.claim_done;
  const claimable = myRow?.claim_value ?? 0;

  // tx hooks (write -> wait receipt)
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  // run-once guards per transaction
const receiptHandledFor = useRef<`0x${string}` | null>(null);
const pendingRowIdRef = useRef<string | null>(null);
const pendingAmountRef = useRef<number>(0);

  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const [isClaiming, setIsClaiming] = useState(false);
  const claimButtonDisabled =
  !address || !myRow || claimable <= 0 || claimDone || isClaiming || isClaimConfirming;

  // receipt -> mark claimed in Firestore
useEffect(() => {
  if (!isClaimConfirmed || !txHash) return;

  // already handled this tx? bail
  if (receiptHandledFor.current === txHash) return;
  receiptHandledFor.current = txHash;

  const rowId = pendingRowIdRef.current || myRow?.id || null;
  const amount = pendingAmountRef.current || 0;

  (async () => {
    try {
      if (rowId) {
        await updateDoc(doc(db, "scores", rowId), {
          // mark this accrual as claimed (backend will flip to false/add value on new points)
          claim_done: true,
          claim_value: 0,
          last_claim_tx: txHash,
          last_claim_amount: amount,
          last_claim_at: serverTimestamp(),
        });

        setScores((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, claim_done: true, claim_value: 0 } : r
          )
        );
      }
      success("Reward claimed successfully!");
    } catch (e) {
      console.error("update after claim failed", e);
      error("Claim confirmed, but failed to record metadata.");
    } finally {
      setIsClaiming(false);
      // reset so refresh/route changes don't re-trigger this effect
      setTxHash(undefined);
      pendingRowIdRef.current = null;
      pendingAmountRef.current = 0;
    }
  })();
  // NOTE: sirf receipt state + txHash pe depend kare
}, [isClaimConfirmed, txHash]);


  // Claim via contract method (no value, only gas)
  const handleClaim = useCallback(async () => {
    try {
      if (!address) {
        info("Connect your wallet first.");
        return;
      }

      const amount = Math.floor(Number(claimable) || 0); // old flow: contract expects uint
      if (!amount || amount <= 0) {
        info("Nothing to claim.");
        return;
      }

      setIsClaiming(true);
      // remember which doc & how much for THIS claim
      pendingRowIdRef.current = myRow?.id || null;
      pendingAmountRef.current = amount;


      const hash = await writeContractAsync({
        address: CLAIM_CONTRACT,
        abi: claimAbi,
        functionName: "claim", // change here if your contract uses a different method name
        args: [BigInt(amount)],
      });

      console.log("Claim tx sent:", hash);
      setTxHash(hash);
    } catch (err: any) {
      console.error("Claim failed:", err);
      error(err?.shortMessage || err?.message || "Claim failed.");
      setIsClaiming(false);
    }
  }, [address, claimable, writeContractAsync, myRow?.id]);

  // pick score from URL once (game returns ?score=...)
  useEffect(() => {
    const s = searchParams.get("score");
    if (s) {
      try {
        localStorage.setItem("score", s);
      } catch {}
    }
  }, [searchParams]);

  const animateIcon = (index: number) => {
    const el = iconRefs.current[index];
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 0, opacity: 1, scale: 1 },
      { y: -30, scale: 1.6, opacity: 0, duration: 0.6, ease: "power3.out" }
    );
  };

  /**
   * Renders the main content based on the current view state.
   * This avoids repeating the layout structure for each view.
   */
  const renderMainContent = () => {
    const claimProps = {
      address,
      myRow,
      claimable,
      handleClaim,
      claimButtonDisabled,
      isClaiming,
      isClaimConfirming,
      loadScores,
    };

    switch (currentView) {
      case 'game1':
      case 'game2':
        return (
          <TwoColumnLayout
            left={<IFrame gameType={currentView} onBack={() => setCurrentView("dashboard")} />}
            right={<><ClaimWidget {...claimProps} /><ProTipWidget /></>}
          />
        );
      case 'nft':
        return (
          <TwoColumnLayout
            left={<NFT onBack={() => setCurrentView("dashboard")} />}
            right={<><ClaimWidget {...claimProps} /><ProTipWidget /></>}
          />
        );
      case 'dashboard':
      default:
        return (
          <TwoColumnLayout
            left={
              <>
                <NeuCard className="p-6 md:p-10 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  <motion.h1
                    className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    Gateway to Web3 Games
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
                      on Camp Network
                    </span>
                  </motion.h1>

                  <div className="mt-6">
                    <NeuCard className="p-5 md:p-6 bg-zinc-900/70">
                      <div className="text-xl md:text-2xl font-semibold text-zinc-50">
                        <p className="mb-2">Hello 👋</p>
                        <p className="text-sm md:text-base text-zinc-400">
                          Collect and claim prizes & badges by playing games and
                          completing quests.
                        </p>
                      </div>
                    </NeuCard>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <ConnectButton />
                    </motion.div>
                  </div>
                </NeuCard>

                <NeuCard className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                      <FaTrophy className="text-yellow-400 animate-bounce" />{" "}
                      Leaderboard
                    </h2>
                    <span className="text-xs text-zinc-400">Live soon</span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {loadingBoard ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <RowSkeleton key={i} />
                        ))}
                      </div>
                    ) : leaderboard.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 text-sm text-zinc-400"
                      >
                        No entries yet. Connect your wallet and start playing—scores
                        will appear here.
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {leaderboard.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => animateIcon(i)}
                            className={cn(
                              "flex justify-between items-center p-4 rounded-2xl",
                              "bg-zinc-900/70 border border-white/10",
                              "shadow-[inset_4px_4px_10px_rgba(0,0,0,0.8),inset_-4px_-4px_10px_rgba(255,255,255,0.05)]",
                              "group hover:bg-gradient-to-r hover:from-indigo-900/50 hover:to-purple-900/50",
                              "hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(139,92,246,0.45)]",
                              "transition-all duration-300 cursor-pointer"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                ref={(el: HTMLSpanElement | null) => {
                                  iconRefs.current[i] = el;
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-500"
                              >
                                {i === 0 ? (
                                  <FaTrophy className="text-yellow-400" />
                                ) : i === 1 ? (
                                  <FaMedal className="text-gray-300" />
                                ) : i === 2 ? (
                                  <FaMedal className="text-orange-400" />
                                ) : (
                                  <FaWallet className="text-green-400" />
                                )}
                              </span>
                              <span className="font-mono text-zinc-200">
                                {item.wallet}
                              </span>
                            </div>
                            <span className="font-semibold text-lg text-zinc-100">
                              {item.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </NeuCard>
              </>
            }
            right={<><ClaimWidget {...claimProps} /><ProTipWidget /></>}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-zinc-100 overflow-x-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl" />
      </div>

      <Navbar />
      <SidebarNav currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content Area: has padding to avoid fixed side/bottom navs */}
      <main className="mx-auto max-w-6xl w-full px-4 md:px-6 py-12 md:pl-24 pb-24 md:pb-12">
        {renderMainContent()}
      </main>
    </div>
  );
}

/* ------------------------------ Page (CSR) ----------------------------- */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
