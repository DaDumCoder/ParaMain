"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import Link from "next/link";

export default function RetroGameMenu() {
  const router = useRouter();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  const quest = () => {
    router.push("/Quest");
  };
  return (
    <div
      className="min-h-screen bg-gray-300 p-8 flex items-center justify-center"
      style={{ fontFamily: "Pixelify Sans, monospace" }}
    >
      <div className="w-80 max-w-sm">
        {/* Main Game Window */}
        <div className=" border-3 border-bottom border-black bg-gray-800  mb-2">
          <div className="bg-white border-bottom border-black shadow-lg mb-6">
            {/* Window Header */}

            {/* Game Content */}
            <div
              className="p-[22px] bg-gray-100 border-2 border-gray-400"
              style={{ borderStyle: "inset" }}
            >
              <div className=" p-[16px] border text-black text-[40px] leading-[40px] ">
                <p className="mb-4">Hello.....</p>
                <p>
                  Collect and Claim prizes & badges by playing game and
                  completing quests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <Link
          href={`https://luxury-fudge-465d1d.netlify.app/?address=${address}`}
          target="_blank"
        >
          <button
            className="w-full cursor-pointer bg-white border-2 border-black text-black py-3 px-4 mb-3 text-sm font-bold hover:bg-gray-300 active:border-gray-400 transition-colors"
            style={{ borderStyle: "outset" }}
          >
            Start Game
          </button>
        </Link>

        {/* Claim Button */}

        {/* Prize Button */}
        {/* <button
          className="w-full cursor-pointer bg-white  border-2 border-black text-black py-3 px-4 mb-6 text-sm font-bold hover:bg-gray-300 active:border-gray-400 transition-colors"
          style={{ borderStyle: "outset" }}
        >
          Prize
        </button> */}

        {/* Bottom Button Row */}
        <div className="flex gap-2">
          {/* <button
            onClick={quest}
            className=" cursor-pointer flex-1 bg-white border-2 border-black text-black py-2 px-3 text-xs font-bold hover:bg-gray-300 active:border-gray-400 transition-colors"
            style={{ borderStyle: "outset" }}
          >
            Quests
          </button> */}
          <button
            onClick={() => disconnect()}
            className="flex-1 bg-white border-2 border-black text-black py-2 px-3 text-xs font-bold hover:bg-gray-300 active:border-gray-400 transition-colors"
            style={{ borderStyle: "outset" }}
          >
            {address
              ? `${address.slice(0, 4)}...${address.slice(-4)}`
              : "Disconnected"}
          </button>
          {/* <button
            onClick={DailyCheck}
            className=" cursor-pointer flex-1 bg-white border-2 border-black text-black py-2 px-3 text-xs font-bold hover:bg-gray-300 active:border-gray-400 transition-colors"
            style={{ borderStyle: "outset" }}
          >
            Daily Check
          </button> */}
        </div>
      </div>
    </div>
  );
}
