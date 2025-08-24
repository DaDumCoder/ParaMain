"use client";

import React, { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { FaGamepad, FaArrowLeft } from "react-icons/fa";
import { NeuCard, cn } from "./ui";

/* -------------------------------------------------------------------------- */
/*                               Types & Helpers                              */
/* -------------------------------------------------------------------------- */

interface IFrameProps {
  gameType: "game1" | "game2"; // which game to load
  onBack: () => void; // callback for back button
}

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */

const IFrame: React.FC<IFrameProps> = ({ gameType, onBack }) => {
  const { address } = useAccount(); // wallet address
  const [iframeSrc, setIframeSrc] = useState<string>(""); // dynamic iframe url

  // Configs for different games (easy to extend if new games are added later)
  const gameConfig = {
    game1: {
      title: "Game 1",
      description: "A fun experience powered by blockchain.",
      gradient: "from-pink-500 via-red-500 to-yellow-400",
      glowColor: "rgba(236,72,153,0.6)",
    },
    game2: {
      title: "Game 2",
      description: "Another exciting adventure awaits.",
      gradient: "from-green-400 via-teal-400 to-cyan-400",
      glowColor: "rgba(34,197,94,0.6)",
    },
  };

  const config = gameConfig[gameType];

  // When user clicks "Start Game", we pass wallet address to the iframe
  // When user clicks "Start Game", we pass wallet address to the iframe
const startGame = useCallback(() => {
  if (!address) return;

  // Game 1 stays on musiccamp, Game 2 opens holahu.com in the iframe
  const base =
    gameType === "game2"
      ? "https://luxury-fudge-465d1d.netlify.app/"
      : "https://musiccamp.netlify.app/";

  // keep address in query (safe if ignored by the page)
  const separator = base.includes("?") ? "&" : "?";
  const url = `${base}${separator}address=${address}`;

  setIframeSrc(url);
}, [address, gameType]);


  return (
    <div className="space-y-6 md:space-y-8">
      {/* ---------------------------- Header Section ---------------------------- */}
      <div className="flex items-center gap-4">
        {/* Back button to go to dashboard */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all duration-300"
        >
          <FaArrowLeft className="text-sm" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Game title + description */}
        <div className="flex-1">
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-white"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {config.title}
          </motion.h1>
          <p className="text-sm text-zinc-400 mt-1">{config.description}</p>
        </div>
      </div>

      {/* ---------------------------- Game Section ----------------------------- */}
      <NeuCard
        className={`p-6 md:p-8 hover:shadow-[0_0_30px_${config.glowColor}]`}
      >
        <div className="space-y-6">
          {/* ----------------------- IFrame Container ----------------------- */}
          <div className="relative">
            <div className="rounded-2xl bg-zinc-900/70 border border-white/10 overflow-hidden w-full h-[60vh] md:h-[85vh] max-h-[1000px]">
              {iframeSrc ? (
                // If "Start Game" clicked → show iframe
                <iframe
                  src={iframeSrc}
                  className="w-full h-full"
                  title={config.title}
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                // Otherwise show placeholder loader screen
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    {/* Animated glowing circle with gamepad icon */}
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 opacity-20"
                      />
                      <FaGamepad className="absolute inset-0 m-auto text-2xl text-zinc-400" />
                    </div>
                    {/* Loading text */}
                    <div>
                      <p className="text-lg font-semibold text-zinc-300">
                        Game Loading Soon
                      </p>
                      <p className="text-sm text-zinc-500 mt-2">
                        Click Start to launch the game
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --------------------------- Controls --------------------------- */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Start button only active if wallet connected */}
            {address ? (
              <button
                onClick={startGame}
                className={cn(
                  "inline-flex items-center justify-center h-12 px-6 rounded-2xl font-semibold",
                  `bg-gradient-to-r ${config.gradient} text-black`,
                  "border border-white/20",
                  "shadow-[inset_-4px_-4px_12px_rgba(255,255,255,0.08),8px_8px_20px_rgba(0,0,0,0.3)]",
                  "hover:scale-110 hover:shadow-[0_0_35px_rgba(255,255,255,0.2)]",
                  "active:scale-95 transition-all duration-300"
                )}
              >
                <FaGamepad className="mr-2 animate-pulse" /> Start Game
              </button>
            ) : (
              <button
                disabled
                className="h-12 px-6 rounded-2xl font-semibold bg-zinc-800 text-zinc-400 border border-white/10 cursor-not-allowed"
              >
                Connect Wallet to Start
              </button>
            )}

            {/* Instructions button (future use) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-12 px-6 rounded-2xl font-semibold bg-zinc-800/80 text-zinc-300 border border-white/10 hover:bg-zinc-700/80 hover:text-white transition-all duration-300"
            >
              Game Instructions
            </motion.button>
          </div>
        </div>
      </NeuCard>
    </div>
  );
};

export default IFrame;
