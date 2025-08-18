'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  AppKitButton,
} from "@reown/appkit/react";

export default function ConnectButton() {
  const { address } = useAccount();

  useEffect(() => {
    const saveWalletConnection = async () => {
      if (address) {
        console.log('Wallet connected with address:', address);
        try {
          const response = await fetch('/api/wallet-connection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
          });
          
          const data = await response.json();
          console.log('API Response:', data);
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to save wallet connection');
          }
        } catch (error) {
          console.error('Error saving wallet connection:', error);
        }
      }
    };

    saveWalletConnection();
  }, [address]);

  return <AppKitButton/>;
}

