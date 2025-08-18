"use client";
import React, { use, useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSendTransaction
} from "wagmi";
import { db } from "../../lib/firebase";
import { abi } from "../ABI/abi";
import { parseEther } from "viem";

const Claim = () => {
  const [scores, setScores] = useState<
    Array<{ id: string; [key: string]: any }>
  >([]);
  const [claimUpdatePerformed, setClaimUpdatePerformed] = useState(false);
  const [purchaseUpdatePerformed, setPurchaseUpdatePerformed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: claimHash, sendTransactionAsync } = useSendTransaction();

  // Separate write contract hooks for claim and purchase
  // const {
  //   writeContract: writeClaimContract,
  //   data: claimHash,
  //   error: claimWriteError,
  // } = useWriteContract();

  // const {
  //   writeContract: writePurchaseContract,
  //   data: purchaseHash,
  //   error: purchaseWriteError,
  // } = useWriteContract();

  const { data: purchaseHash, sendTransactionAsync: sendPurchaseTransactionAsync } = useSendTransaction();


  // Wait for claim transaction receipt
  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    error: claimReceiptError,
  } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Wait for purchase transaction receipt
  const {
    isLoading: isPurchaseConfirming,
    isSuccess: isPurchaseConfirmed,
    error: purchaseReceiptError,
  } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  useEffect(() => {
    const fetchScores = async () => {
      const querySnapshot = await getDocs(collection(db, "scores"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScores(data);
      // console.log("Fetched scores:", data);
    };

    fetchScores();
  }, []);

  // Update Firestore when claim transaction is confirmed
  useEffect(() => {
    const updateScoreInFirestore = async () => {
      console.log("Claim useEffect triggered:", {
        isClaimConfirmed,
        claimHash,
        address,
        claimUpdatePerformed,
        isClaiming,
      });

      if (isClaimConfirmed && claimHash && address && !claimUpdatePerformed) {
        console.log("Starting claim Firestore update...");
        try {
          // Find the user's score document from the current scores state
          const userScoreObj = scores.find((score) => score.wallet === address);

          if (userScoreObj) {
            // Update the document in Firestore - set claim_value to full score and claim_done to true
            const scoreDocRef = doc(db, "scores", userScoreObj.id);
            console.log("Updating claim for user:", userScoreObj);

            await updateDoc(scoreDocRef, {
              claim_done: true,
              claim_value: 0,
            });

            console.log("Claim updated successfully in Firestore");

            // Update local state to reflect the changes
            setScores((prevScores) =>
              prevScores.map((score) =>
                score.id === userScoreObj.id
                  ? {
                      ...score,
                      claim_done: true,
                      claim_value: 0,
                    }
                  : score
              )
            );

            // Mark claim update as performed
            setClaimUpdatePerformed(true);
            setIsClaiming(false); // Reset claiming state after successful update

            alert("Reward claimed successfully!");
          } else {
            console.log("No user score found for address:", address);
          }
        } catch (error) {
          console.error("Error updating claim in Firestore:", error);
          alert("Error updating claim status. Please contact support.");
        }
      } else {
        console.log("Claim update conditions not met:", {
          isClaimConfirmed,
          claimHash: !!claimHash,
          address: !!address,
          claimUpdatePerformed,
          isClaiming,
        });
      }
    };

    updateScoreInFirestore();
  }, [isClaimConfirmed, claimHash, address, claimUpdatePerformed, scores]);

  // Update Firestore when purchase transaction is confirmed
  useEffect(() => {
    const updatePurchaseInFirestore = async () => {
      console.log("Purchase useEffect triggered:", {
        isPurchaseConfirmed,
        purchaseHash,
        address,
        purchaseUpdatePerformed,
        isPurchasing,
      });

      if (
        isPurchaseConfirmed &&
        purchaseHash &&
        address &&
        !purchaseUpdatePerformed
      ) {
        console.log("Starting purchase Firestore update...");
        try {
          // Find the user's score document from the current scores state
          const userScoreObj = scores.find((score) => score.wallet === address);

          if (userScoreObj) {
            // Update the document in Firestore - set Purchase_Value to 0 and Purchase_Done to true
            const scoreDocRef = doc(db, "scores", userScoreObj.id);
            console.log("Updating purchase for user:", userScoreObj);

            await updateDoc(scoreDocRef, {
              Purchase_Done: true,
              Purchase_Value: 0,
            });

            console.log("Purchase updated successfully in Firestore");

            // Update local state to reflect the changes
            setScores((prevScores) =>
              prevScores.map((score) =>
                score.id === userScoreObj.id
                  ? {
                      ...score,
                      Purchase_Done: true,
                      Purchase_Value: 0,
                    }
                  : score
              )
            );

            // Mark purchase update as performed
            setPurchaseUpdatePerformed(true);
            setIsPurchasing(false); // Reset purchasing state after successful update

            alert("Purchase completed successfully!");
          } else {
            console.log("No user score found for address:", address);
          }
        } catch (error) {
          console.error("Error updating purchase in Firestore:", error);
          alert("Error updating purchase status. Please contact support.");
        }
      } else {
        console.log("Purchase update conditions not met:", {
          isPurchaseConfirmed,
          purchaseHash: !!purchaseHash,
          address: !!address,
          purchaseUpdatePerformed,
          isPurchasing,
        });
      }
    };

    updatePurchaseInFirestore();
  }, [
    isPurchaseConfirmed,
    purchaseHash,
    address,
    purchaseUpdatePerformed,
    scores,
  ]);

  // Reset states when address changes
  useEffect(() => {
    setClaimUpdatePerformed(false);
    setPurchaseUpdatePerformed(false);
    setIsClaiming(false);
    setIsPurchasing(false);
  }, [address]);

  // Reset updatePerformed when a new transaction starts
  useEffect(() => {
    if (claimHash && !isClaimConfirmed) {
      console.log("Claim transaction hash received:", claimHash);
      setClaimUpdatePerformed(false);
    }
    if (purchaseHash && !isPurchaseConfirmed) {
      console.log("Purchase transaction hash received:", purchaseHash);
      setPurchaseUpdatePerformed(false);
    }
  }, [claimHash, isClaimConfirmed, purchaseHash, isPurchaseConfirmed]);

  // Monitor transaction confirmation states
  useEffect(() => {
    if (isClaimConfirmed) {
      console.log("Claim transaction confirmed!");
      // Keep isClaiming true until Firestore update is complete
    }
    if (isPurchaseConfirmed) {
      console.log("Purchase transaction confirmed!");
      // Keep isPurchasing true until Firestore update is complete
    }
  }, [isClaimConfirmed, isPurchaseConfirmed]);

  // Handle wallet connection errors
  // useEffect(() => {
  //   if (claimWriteError) {
  //     console.error("Claim contract write error:", claimWriteError);
  //     setIsClaiming(false);

  //     if (
  //       claimWriteError.message.includes("session_request") ||
  //       claimWriteError.message.includes("without any listeners")
  //     ) {
  //       alert(
  //         "Wallet connection issue. Please refresh the page and try again."
  //       );
  //     }
  //   }
  //   if (purchaseWriteError) {
  //     console.error("Purchase contract write error:", purchaseWriteError);
  //     setIsPurchasing(false);

  //     if (
  //       purchaseWriteError.message.includes("session_request") ||
  //       purchaseWriteError.message.includes("without any listeners")
  //     ) {
  //       alert(
  //         "Wallet connection issue. Please refresh the page and try again."
  //       );
  //     }
  //   }
  // }, [claimWriteError, purchaseWriteError]);

  // Handle transaction receipt errors
  useEffect(() => {
    if (claimReceiptError) {
      console.error("Claim transaction receipt error:", claimReceiptError);
      setIsClaiming(false);
      alert("Claim transaction failed. Please try again.");
    }
    if (purchaseReceiptError) {
      console.error(
        "Purchase transaction receipt error:",
        purchaseReceiptError
      );
      setIsPurchasing(false);
      alert("Purchase transaction failed. Please try again.");
    }
  }, [claimReceiptError, purchaseReceiptError]);

  // Helper function to get button text and icon for claim
  const getClaimButtonContent = () => {
    const userScore = scores.find((score) => score.wallet === address);
    if (!userScore) return { text: "No Score", icon: "❌" };

    const remaining = userScore.claim_value || 0;

    if (remaining <= 0) return { text: "Fully Claimed", icon: "✅" };
    return { text: "Claim Rewards", icon: "🎁" };
  };

  // Helper function to get button text and icon for purchase
  const getPurchaseButtonContent = () => {
    const userScore = scores.find((score) => score.wallet === address);
    if (!userScore) return { text: "No Purchase", icon: "❌" };

    if (userScore.Purchase_Done)
      return { text: "Purchase Complete", icon: "✅" };
    return { text: "Purchase NFT", icon: "🛒" };
  };

  // Helper function to check if claim button should be disabled
  const isClaimButtonDisabled = () => {
    const userScore = scores.find((score) => score.wallet === address);
    if (!userScore) return true;
    const remaining = userScore.claim_value || 0;
    return (
      remaining <= 0 ||
      userScore.claim_done === true ||
      isClaiming ||
      isClaimConfirming
    );
  };

  // Helper function to check if purchase button should be disabled
  const isPurchaseButtonDisabled = () => {
    const userScore = scores.find((score) => score.wallet === address);
    if (!userScore) return true;
    return (
      userScore.Purchase_Done === true || isPurchasing || isPurchaseConfirming
    );
  };

  async function handleClaim() {
    // Check if wallet is connected
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    // Prevent multiple clicks
    if (isClaiming || isPurchasing) {
      return;
    }

    setIsClaiming(true);

    try {
      // Check localStorage safely inside the function
      if (typeof window === "undefined") {
        alert("Please try again in a moment.");
        return;
      }

      // Find the score for the connected wallet
      const userScoreObj = scores.find((score) => score.wallet === address);
      const userScore = userScoreObj ? userScoreObj.score : 0;

      // Check if already claimed
      if (userScoreObj?.claim_done) {
        alert("You have already claimed your reward!");
        setIsClaiming(false);
        return;
      }


      // Calculate the remaining score to claim (subtract already claimed amount)
      const alreadyClaimed = userScoreObj?.claim_value || 0;
      const remainingToClaim = alreadyClaimed;

      if (remainingToClaim <= 0) {
        alert(
          "No remaining score to claim. You have already claimed everything."
        );
        setIsClaiming(false);
        return;
      }
    

      const Claim_contractAddress = process.env.NEXT_PUBLIC_CLAIM_CONTRACT;

      console.log("Initiating claim transaction with values:", {
        receiver: address,
        quantity: remainingToClaim,
        Claim_contractAddress,
      });

      // Simple contract write
      // writeClaimContract({
      //   address: Claim_contractAddress as `0x${string}`,
      //   abi: abi,
      //   functionName: "claim",
      //   args: [
      //     hardcodedValues.receiver as `0x${string}`,
      //     BigInt(remainingToClaim),
      //     hardcodedValues.currency as `0x${string}`,
      //     BigInt(hardcodedValues.pricePerToken),
      //     hardcodedValues.allowlistProof,
      //     hardcodedValues.data, // Added the sixth parameter
      //   ],
      //   value: BigInt(hardcodedValues.pricePerToken) * BigInt(remainingToClaim),
      // });
      const value = parseEther((remainingToClaim*Number(process.env.NEXT_PUBLIC_PRICE_PER_TOKEN) ).toString());
      console.log("debug333")
      sendTransactionAsync({
        to: Claim_contractAddress as `0x${string}`,
        value: value,
      })
      console.log(
        "Claim transaction initiated, amount to claim:",
        remainingToClaim
      );
      console.log(
        "Claim transaction hash will be available in claimHash state"
      );

      // Don't reset isClaiming here - let it be reset after successful database update
    } catch (error) {
      console.error("Error initiating claim:", error);
      setIsClaiming(false);

      // Handle specific wallet connection errors
      if (error instanceof Error) {
        if (
          error.message.includes("session_request") ||
          error.message.includes("without any listeners")
        ) {
          alert(
            "Wallet connection issue. Please refresh the page and try again."
          );
        } else if (error.message === "Request timeout") {
          alert("Request timed out. Please try again.");
        } else if (
          error.message.includes("user rejected") ||
          error.message.includes("User denied")
        ) {
          alert("Transaction was cancelled by user.");
        } else {
          alert("Error initiating claim. Please try again.");
        }
      } else {
        alert("Error initiating claim. Please try again.");
      }
    }
  }

  async function handlePurchase() {
    // Check if wallet is connected
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    // Prevent multiple clicks
    if (isClaiming || isPurchasing) {
      return;
    }

    setIsPurchasing(true);

    try {
      // Check localStorage safely inside the function
      if (typeof window === "undefined") {
        alert("Please try again in a moment.");
        return;
      }

      // Find the score for the connected wallet
      const userScoreObj = scores.find((score) => score.wallet === address);
      const userScore = userScoreObj ? userScoreObj.Purchase_Value : 0;

      // Check if already purchased
      if (userScoreObj?.Purchase_Done === true) {
        alert("You have already completed your purchase!");
        return;
      }

      const hardcodedValues = {
        receiver: address,
        quantity: userScore,
        currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token (ETH)
        pricePerToken: "0",
        allowlistProof: {
          proof: [],
          quantityLimitPerWallet: 0,
          pricePerToken:
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          currency: "0x0000000000000000000000000000000000000000",
        },
        data: "0x", // This is a common additional parameter for many NFT claim functions
      };

      if (userScore === 0) {
        alert("No purchase value found for your wallet.");
        setIsPurchasing(false);
        return;
      }

      const Purchase_contractAddress =process.env.NEXT_PUBLIC_PURCHASE_CONTRACT;

      // Simple contract write
      // writePurchaseContract({
      //   address: Purchase_contractAddress as `0x${string}`,
      //   abi: abi,
      //   functionName: "claim",
      //   args: [
      //     hardcodedValues.receiver as `0x${string}`,
      //     BigInt(userScore),
      //     hardcodedValues.currency as `0x${string}`,
      //     BigInt(hardcodedValues.pricePerToken),
      //     hardcodedValues.allowlistProof,
      //     hardcodedValues.data, // Added the sixth parameter
      //   ],
      //   value: BigInt(hardcodedValues.pricePerToken) * BigInt(userScore),
      // });
      const value = BigInt(process.env.NEXT_PUBLIC_PRICE_PER_TOKEN || 0)  * BigInt(userScore)
      sendPurchaseTransactionAsync({
        to: Purchase_contractAddress as `0x${string}`,
        value: value,
      })
      console.log(
        "Purchase transaction initiated, amount to purchase:",
        userScore
      );
      console.log(
        "Purchase transaction hash will be available in purchaseHash state"
      );
      console.log({
        address: Purchase_contractAddress as `0x${string}`,
        abi: abi,
        functionName: "claim",
        args: [
          hardcodedValues.receiver as `0x${string}`,
          BigInt(userScore),
          hardcodedValues.currency as `0x${string}`,
          BigInt(hardcodedValues.pricePerToken),
          hardcodedValues.allowlistProof,
          hardcodedValues.data,
        ],
        value: BigInt(hardcodedValues.pricePerToken) * BigInt(userScore),
      });
    } catch (error) {
      console.error("Error initiating purchase:", error);

      // Handle specific wallet connection errors
      if (error instanceof Error) {
        if (
          error.message.includes("session_request") ||
          error.message.includes("without any listeners")
        ) {
          alert(
            "Wallet connection issue. Please refresh the page and try again."
          );
        } else if (error.message === "Request timeout") {
          alert("Request timed out. Please try again.");
        } else if (
          error.message.includes("user rejected") ||
          error.message.includes("User denied")
        ) {
          alert("Transaction was cancelled by user.");
        } else {
          alert("Error initiating purchase. Please try again.");
        }
      } else {
        alert("Error initiating purchase. Please try again.");
      }
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8 flex items-center justify-center relative overflow-hidden"
      style={{ fontFamily: "Pixelify Sans, monospace" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-blue-400 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Main container with pixel art style */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-gray-600 rounded-lg shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 border-b-4 border-gray-600 p-4">
            <h1 className="text-3xl font-bold text-gray-900 text-center tracking-wider">
              🎮 REWARD CLAIM 🎮
            </h1>
          </div>

          <div
            className="p-6 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 m-4 rounded-lg"
            style={{ borderStyle: "inset" }}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Achievement
              </h2>
              <p className="text-gray-600 text-lg">
                Claim your hard-earned rewards!
              </p>

              {/* Wallet connection status */}
              {!isConnected ? (
                <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="text-red-800 font-semibold">
                    ⚠️ Wallet Not Connected
                  </div>
                  <div className="text-red-600 text-sm">
                    Please connect your wallet to claim rewards
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <div className="text-green-800 font-semibold">
                    ✅ Wallet Connected
                  </div>
                
                  <div className="text-green-600 text-sm">
                  
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
              )}
            </div>

            {/* Score display with enhanced styling */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-6 shadow-inner">
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                📊 Score Summary
              </h3>
              <div className="space-y-3">
                {scores.some((score) => score.wallet === address) ? (
                  scores
                    .filter((score) => score.wallet === address)
                    .map((score) => {
                      const alreadyClaimed = score.claim_value || 0;
                      const remainingToClaim = alreadyClaimed;
                      return (
                        <div
                          key={score.id}
                          className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4"
                        >
                          {!score.claim_done && (
                            <>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-semibold text-gray-700">
                                  Available to Claim:
                                </span>
                                <span className="text-2xl font-bold text-blue-600">
                                  {remainingToClaim}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-semibold text-gray-700">
                              Purchase:
                            </span>
                            <span className="text-2xl font-bold text-blue-600">
                              {score.Purchase_Value || "0"}
                            </span>
                          </div>

                          {score.claim_done && (
                            <div className="text-center mb-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border-2 border-green-300">
                                <span className="mr-2">✓</span>
                                Fully Claimed
                              </span>
                            </div>
                          )}

                          {score.Purchase_Done && (
                            <div className="text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border-2 border-blue-300">
                                <span className="mr-2">✓</span>
                                Purchase Complete
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">😔</div>
                    <p className="text-gray-600 font-semibold">
                      No rewards available for this wallet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction status with enhanced styling */}
            {isClaimConfirming && isClaiming && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-blue-800 font-semibold text-lg">
                  Claim transaction confirming...
                </p>
                <div className="mt-2">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {isPurchaseConfirming && isPurchasing && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-blue-800 font-semibold text-lg">
                  Purchase transaction confirming...
                </p>
                <div className="mt-2">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {isClaimConfirmed && isClaiming && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-green-800 font-semibold text-lg">
                  Claim transaction confirmed!
                </p>
              </div>
            )}
            {isPurchaseConfirmed && isPurchasing && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-green-800 font-semibold text-lg">
                  Purchase transaction confirmed!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced claim button */}
        <button
          onClick={handleClaim}
          disabled={isClaimButtonDisabled()}
          className="w-full cursor-pointer text-2xl bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-gray-600 text-gray-900 py-4 px-6 font-bold rounded-lg shadow-lg hover:from-yellow-300 hover:to-orange-400 active:from-yellow-500 active:to-orange-600 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
          style={{
            borderStyle: "outset",
            textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
          }}
        >
          {isClaiming ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⚡</span>
              Initiating...
            </span>
          ) : isClaimConfirming ? (
            <span className="flex items-center justify-center">
              <span className="animate-pulse mr-2">🔥</span>
              Claiming...
            </span>
          ) : (
            (() => {
              const { text, icon } = getClaimButtonContent();
              return (
                <span className="flex items-center justify-center">
                  <span className="mr-2">{icon}</span>
                  {text}
                </span>
              );
            })()
          )}
        </button>

        {/* purchasing nft */}
        <button
          onClick={handlePurchase}
          disabled={isPurchaseButtonDisabled()}
          className="w-full cursor-pointer text-2xl bg-gradient-to-r from-purple-400 to-pink-500 border-4 border-gray-600 text-gray-900 py-4 px-6 font-bold rounded-lg shadow-lg hover:from-purple-300 hover:to-pink-400 active:from-purple-500 active:to-pink-600 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
          style={{
            borderStyle: "outset",
            textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
          }}
        >
          {isPurchasing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⚡</span>
              Initiating...
            </span>
          ) : isPurchaseConfirming ? (
            <span className="flex items-center justify-center">
              <span className="animate-pulse mr-2">🔥</span>
              Purchasing...
            </span>
          ) : (
            (() => {
              const { text, icon } = getPurchaseButtonContent();
              return (
                <span className="flex items-center justify-center">
                  <span className="mr-2">{icon}</span>
                  {text}
                </span>
              );
            })()
          )}
        </button>
      </div>
    </div>
  );
};

export default Claim;
