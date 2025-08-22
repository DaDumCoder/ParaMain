// import { cookieStorage, createStorage, http } from '@wagmi/core'
// import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
// import { basecampTestnet } from '@reown/appkit/networks'
// import { paraConnector } from "@getpara/wagmi-v2-integration";
// import { para } from '../client/para';
// import { OAuthMethod } from '@getpara/react-sdk';
// // import { basecampTestnet } from "viem/chains";

// // Get projectId from https://cloud.reown.com
// export const projectId = "c70d056e9a9018d033c2195ba5aa5bf6"

// if (!projectId) {
//   throw new Error('Project ID is not defined')
// }

// export const networks = [ basecampTestnet]

// //Set up the Wagmi Adapter (Config)
// export const wagmiAdapter = new WagmiAdapter({
//   storage: createStorage({
//     storage: cookieStorage
//   }),
//   ssr: true,
//   projectId,
//   networks
// })


// export const config = wagmiAdapter.wagmiConfig


"use client";
import { http /*, fallback*/ } from "viem";  // RPC transport; fallback optional
import { defineChain } from "viem";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "../lib/para/client";
import { CreateConnectorFn } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { mainnet, arbitrum, optimism, polygon, base, basecampTestnet } from "wagmi/chains";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const APP_NAME = "Reown AppKit + Para Example";
export const APP_DESCRIPTION =
  "This example demonstrates how to integrate Para as a custom wagmi connector in Reown AppKit.";

//chaindefine
export const campMainnet = defineChain({
  id: 484,
  name: "Camp Mainnet",
  network: "camp-mainnet",
  nativeCurrency: { name: "Camp", symbol: "CAMP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.camp.raas.gelato.cloud/"] },
    public:  { http: ["https://rpc.camp.raas.gelato.cloud/"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://camp.cloud.blockscout.com/" },
  },
} as const);

//chaindefine
export const chains = [campMainnet] as const;

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const metadata = {
  name: "Reown AppKit Example",
  description: "Reown AppKit with Next.js and Wagmi",
  url: "https://reown.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const connector = paraConnector({
  para: para,
  chains: [...chains],
  appName: "Reown AppKit with Para",
  logo: "/para.svg",
  queryClient,
  oAuthMethods: [ "GOOGLE", "TWITTER"],
  theme: {
    foregroundColor: "#2D3648",
    backgroundColor: "#FFFFFF",
    accentColor: "#0066CC",
    darkForegroundColor: "#E8EBF2",
    darkBackgroundColor: "#1A1F2B",
    darkAccentColor: "#4D9FFF",
    mode: "light",
    borderRadius: "none" as const,
    font: "Inter",
  },
  onRampTestMode: true,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  authLayout: ["AUTH:FULL"],
  recoverySecretStepEnabled: true,
  options: {},
});

const connectors: CreateConnectorFn[] = [connector as CreateConnectorFn];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  connectors,

  // 👇 yahan RPC enforce karo
  transports: {
    // Single RPC
    [campMainnet.id]: http("https://rpc-campnetwork.xyz"),},

    // (optional) agar 2 RPC se fallback banana ho to, upar import me fallback enable karo
    // [campMainnet.id]: fallback([
    //   http("https://rpc-campnetwork.xyz"),
    //   http("https://rpc.basecamp.t.raas.gelato.cloud"),
    // ]),
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: "light",
  // enableEIP6963: false,
  enableInjected: true,
  // enableWalletConnect: false,
  enableCoinbase: false,
  allowUnsupportedChain: false,
  // allWallets: "HIDE",
});
