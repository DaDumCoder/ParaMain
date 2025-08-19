"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaTrophy, FaWallet, FaMedal, FaGamepad } from "react-icons/fa";
import ConnectButton from "./Components/WalletConnectButton";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // <- landing se correct path

// wagmi tx + receipt
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

// ETH value calc
import { parseEther } from "viem";

// utility: cn
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

// soft-ui tokens
const SOFT = {
  card:
    "rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl shadow-[inset_-6px_-6px_16px_rgba(255,255,255,0.05),inset_6px_6px_16px_rgba(0,0,0,0.7),12px_12px_24px_rgba(0,0,0,0.8)]",
  hover: "transition-all duration-300 hover:scale-[1.01]",
};

const NeuCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={cn(SOFT.card, SOFT.hover, className)}>{children}</div>
);

const BrandKazar: React.FC = () => {
  const letters = useMemo(() => ["K", "A", "Z", "A", "R"], []);
  return (
    <div className="relative select-none">
      <div className="absolute -inset-1 rounded-2xl blur-xl bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/30 to-cyan-500/30" />
      <motion.h1
        className="relative z-10 font-black tracking-[0.25em] text-xl sm:text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 drop-shadow-[0_2px_6px_rgba(168,85,247,0.35)]"
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
            super dApp
          </motion.span>
        </span>
      </motion.h1>
    </div>
  );
};

// navbar
const Navbar: React.FC = () => {
  return (
    <div className="sticky top-0 z-40">
      <div className="h-16 w-full bg-gradient-to-r from-fuchsia-800/50 via-rose-800/50 to-indigo-800/50 backdrop-blur-xl border-b border-white/10 shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-500" />
      <div className="px-4 md:px-6">
        <div className="-mt-10 flex items-center justify-between">
          <BrandKazar />
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
              <ConnectButton />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RowSkeleton: React.FC = () => (
  <div className="flex justify-between items-center p-4 rounded-2xl bg-zinc-900/70 border border-white/10 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-5 w-5 rounded-full bg-white/10" />
      <div className="h-4 w-40 sm:w-56 rounded bg-white/10" />
    </div>
    <div className="h-4 w-10 rounded bg-white/10" />
  </div>
);

function HomeClient() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [leaderboard, setLeaderboard] = useState<Array<{ wallet: string; score: number }>>([]);
  const [loadingBoard, setLoadingBoard] = useState<boolean>(false);

  // ---- Claim state ----
const [scores, setScores] = useState<Array<{ id: string; [k: string]: any }>>([]);
const [isClaiming, setIsClaiming] = useState(false);
const [claimUpdatePerformed, setClaimUpdatePerformed] = useState(false);

// Firestore se scores load/refresh
const loadScores = async () => {
  const snap = await getDocs(collection(db, "scores"));
  setScores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
};
useEffect(() => { loadScores(); }, []);

// wagmi tx + receipt
const { data: claimHash, sendTransactionAsync } = useSendTransaction();
const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } =
  useWaitForTransactionReceipt({ hash: claimHash });

// Current user score & helpers
const myScore = useMemo(() => scores.find(s => s.wallet === address), [scores, address]);
const claimable = myScore?.claim_value ?? 0;
const claimButtonDisabled = !address || isClaiming || isClaimConfirming || !myScore || claimable <= 0;

// Tx confirm hone par Firestore update
useEffect(() => {
  (async () => {
    if (!isClaimConfirmed || claimUpdatePerformed || !address) return;
    const userScoreObj = scores.find(s => s.wallet === address);
    if (!userScoreObj) return;

    try {
      const ref = doc(db, "scores", userScoreObj.id);
      await updateDoc(ref, { claim_done: true, claim_value: 0 });
      setScores(prev => prev.map(s => s.id === userScoreObj.id ? { ...s, claim_done: true, claim_value: 0 } : s));
      setClaimUpdatePerformed(true);
      setIsClaiming(false);
      alert("Reward claimed successfully!");
    } catch (e) {
      setIsClaiming(false);
      alert("Error updating claim status. Please contact support.");
    }
  })();
}, [isClaimConfirmed, claimHash, address, scores, claimUpdatePerformed]);

// Claim button handler
async function handleClaim() {
  if (!address) { alert("Please connect your wallet first!"); return; }
  if (isClaiming || isClaimConfirming) return;
  if (!myScore) { alert("No record found for this wallet."); return; }

  const remainingToClaim = myScore.claim_value || 0;
  if (remainingToClaim <= 0) { alert("Nothing to claim."); return; }

  const Claim_contractAddress = process.env.NEXT_PUBLIC_CLAIM_CONTRACT as `0x${string}` | undefined;
  if (!Claim_contractAddress) { alert("Missing NEXT_PUBLIC_CLAIM_CONTRACT"); return; }

  const pricePerToken = Number(process.env.NEXT_PUBLIC_PRICE_PER_TOKEN || "0");
  const value = parseEther((remainingToClaim * pricePerToken).toString());

  setClaimUpdatePerformed(false);
  setIsClaiming(true);

  try {
    await sendTransactionAsync({ to: Claim_contractAddress, value });
    // Receipt ka wait hook se hoga; Firestore update upar wale effect me
  } catch (err: any) {
    setIsClaiming(false);
    const msg = typeof err?.message === "string" ? err.message : String(err);
    if (msg.includes("user rejected") || msg.includes("User denied")) {
      alert("Transaction was cancelled by user.");
    } else if (msg === "Request timeout") {
      alert("Request timed out. Please try again.");
    } else {
      alert("Error initiating claim. Please try again.");
    }
  }
}

  useEffect(() => {
    const score = searchParams.get("score");
    if (score) {
      try {
        localStorage.setItem("score", score);
      } catch {}
    }
  }, [searchParams]);

  const startGameHref = address
    ? `https://sparkling-daffodil-bd2f48.netlify.app/?address=${address}`
    : undefined;

  const animateIcon = (index: number) => {
    if (iconRefs.current[index]) {
      gsap.fromTo(
        iconRefs.current[index],
        { y: 0, opacity: 1, scale: 1 },
        { y: -30, scale: 1.6, opacity: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-zinc-100 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 md:px-6 py-12 grid grid-cols-12 gap-6 md:gap-8">
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <NeuCard className="p-6 md:p-10 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <motion.h1
              className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              All-in-one Super dApp
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400">
                on Camp Network
              </span>
            </motion.h1>

            <div className="mt-6">
              <NeuCard className="p-5 md:p-6 bg-zinc-900/70">
                <div className="text-xl md:text-2xl font-semibold text-zinc-50">
                  <p className="mb-2">Hello 👋</p>
                  <p className="text-sm md:text-base text-zinc-400">
                    Collect and claim prizes & badges by playing games and completing quests.
                  </p>
                </div>
              </NeuCard>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ConnectButton />
              </motion.div>

              {startGameHref ? (
                <Link
                  href={startGameHref}
                  target="_blank"
                  className={cn(
                    "inline-flex items-center justify-center h-12 px-6 rounded-2xl font-semibold",
                    "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-black",
                    "border border-emerald-400/50",
                    "shadow-[inset_-4px_-4px_12px_rgba(255,255,255,0.08),8px_8px_20px_rgba(16,185,129,0.55)]",
                    "hover:scale-110 hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]",
                    "active:scale-95 transition-all duration-300"
                  )}
                >
                  <FaGamepad className="mr-2 animate-pulse" /> Start Game
                </Link>
              ) : (
                <button
                  disabled
                  className="h-12 px-6 rounded-2xl font-semibold bg-zinc-800 text-zinc-400 border border-white/10 cursor-not-allowed"
                >
                  Start Game
                </button>
              )}
            </div>
          </NeuCard>

          <NeuCard className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                <FaTrophy className="text-yellow-400 animate-bounce" /> Leaderboard
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
                  No entries yet. Connect your wallet and start playing—scores will appear here.
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
                            ref={(el: HTMLSpanElement | null): void => { iconRefs.current[i] = el; }}
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
                        <span className="font-mono text-zinc-200">{item.wallet}</span>
                      </div>
                      <span className="font-semibold text-lg text-zinc-100">{item.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </NeuCard>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* Claim (landing) */}
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
      <p className="text-zinc-400">Connect wallet to see claimable amount.</p>
    ) : myScore ? (
      <div className="flex items-center justify-between">
        <span className="text-zinc-400">Claimable</span>
        <span className="font-mono text-white">{claimable}</span>
      </div>
    ) : (
      <p className="text-zinc-400">No record found for this wallet.</p>
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

          <NeuCard className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Status</h2>
              <span className="text-xs text-zinc-500"></span>
            </div>
            <div className="mt-6 text-sm text-zinc-300 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span>Wallet</span>
                <span className="font-mono">
                  {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Score</span>
                <span className="font-mono">
                  {typeof window !== "undefined" ? localStorage.getItem("score") ?? "--" : "--"}
                </span>
              </div>
            </div>
          </NeuCard>

          <NeuCard className="p-6 hover:shadow-[0_0_25px_rgba(52,211,153,0.35)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm text-zinc-400">Pro tip</p>
            </div>
            <p className="text-sm text-zinc-300">
              Connect your wallet to unlock quests, claim rewards, and appear on the leaderboard.
            </p>
          </NeuCard>
        </aside>
      </main>
    </div>
   );
}
    export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
