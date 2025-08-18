// "use client";

// import { wagmiAdapter, projectId } from "../Config/index";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { createAppKit } from "@reown/appkit";
// import {  basecampTestnet, sepolia, bscTestnet } from "@reown/appkit/networks";
// import React, { type ReactNode } from "react";
// import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// // Set up queryClient
// const queryClient = new QueryClient();

// if (!projectId) {
//   throw new Error("Project ID is not defined");
// }

// // Set up metadata
// const metadata = {
//   name: "appkit-example",
//   description: "AppKit Example",
//   url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
//   icons: ["https://avatars.githubusercontent.com/u/179229932"],
// };

// // Create the modal
// const modal = createAppKit({
//   adapters: [wagmiAdapter],
//   includeWalletIds: [
//     "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
//     "82061ee410cab0e705cf38830db84ba965effc51a1e1bf43da6d39ff70ae94fb",
//   ],
//   featuredWalletIds: [
//     "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
//     "82061ee410cab0e705cf38830db84ba965effc51a1e1bf43da6d39ff70ae94fb",
//   ],

//   projectId,
//   networks: [basecampTestnet, sepolia, bscTestnet],
//   defaultNetwork: basecampTestnet,
//   metadata: metadata,
//   features: {
//     analytics: true, // Optional - defaults to your Cloud configuration
//     socials: ['google'], // Optional - defaults to your Cloud configuration
//     email: false, // Optional - defaults to your Cloud configuration
//   },
// });

// function ContextProvider({
//   children,
//   cookies,
// }: {
//   children: ReactNode;
//   cookies: string | null;
// }) {
//   const initialState = cookieToInitialState(
//     wagmiAdapter.wagmiConfig as Config,
//     cookies
//   );

//   return (
//     <WagmiProvider
//       config={wagmiAdapter.wagmiConfig as Config}
//       initialState={initialState}
//     >
//       <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//     </WagmiProvider>
//   );
// }

// export default ContextProvider;


"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { wagmiAdapter } from "../Config/index";

// Setup query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function AppKitProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider 
      config={wagmiAdapter.wagmiConfig} 
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}