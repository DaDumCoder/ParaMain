// import type { Metadata } from 'next'
// import './globals.css'
// import { Pixelify_Sans } from 'next/font/google'



// import { headers } from 'next/headers' // added
// import ContextProvider from '../app/Context' // updated import path

// const pixelifySans = Pixelify_Sans({ subsets: ['latin'] })


// export const metadata: Metadata = {
//   title: 'AppKit Example App',
//   description: 'Powered by Reown'
// }

// export default async function RootLayout({
//   children
// }: Readonly<{
//   children: React.ReactNode
// }>) {

//   const headersObj = await headers();
//   const cookies = headersObj.get('cookie')

//   return (
//     <html lang="en">
//       <body className={pixelifySans.className}>
//         <ContextProvider cookies={cookies}>{children}</ContextProvider>
//       </body>
//     </html>
//   )
// }

import type { Metadata } from "next";
import './globals.css'
import "@getpara/react-sdk/styles.css";
import { AppKitProvider } from "./Context/index";
import { AppWrapper } from "./Components/AppWrapper";

export const metadata: Metadata = {
  title: "Reown AppKit + Para",
  description: "Reown AppKit integration with Para wallet connector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppKitProvider>
          <AppWrapper>{children}</AppWrapper>
        </AppKitProvider>
      </body>
    </html>
  );
}
