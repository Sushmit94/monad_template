// context/WalletContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import * as Linking from 'expo-linking';
import { AppState } from 'react-native';

const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainHex: '0x279F',
  chainName: 'Monad Testnet',
  rpcUrl: 'https://monad-testnet.g.alchemy.com/v2/eaFy-as1S6Bas2qUGyjLqcN8zqVDXMwD',
  explorerUrl: 'https://explorer.testnet.monad.xyz',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
};

type WalletContextType = {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: any | null;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  provider: null,
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // ⚠️ Use the hook from WalletConnectModal (which is now rendered in _layout)
  const { open, isConnected, address, provider } = useWalletConnectModal();

  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  console.log('🔍 WalletContext State:', {
    isConnected,
    address,
    hasProvider: !!provider,
  });

  /* ------------------------------------------------------------------ */
  /* Track app state to detect when returning from MetaMask */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('🔄 App became active - checking connection');
        if (isConnected && address) {
          updateBalance(address);
        }
      }
    });

    return () => subscription.remove();
  }, [isConnected, address]);

  /* ------------------------------------------------------------------ */
  /* Listen for deep link events */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('📲 Deep link received:', url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📲 App opened with URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  /* ------------------------------------------------------------------ */
  /* Sync WalletConnect state and switch to Monad */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const setupConnection = async () => {
      if (isConnected && address && provider && !isSwitchingChain) {
        console.log('✅ Wallet connected:', address);
        setIsConnecting(false);

        // Fetch balance from Monad
        await updateBalance(address);

        // Switch to Monad Testnet
        await switchToMonad();
      } else if (!isConnected) {
        setIsConnecting(false);
      }
    };

    setupConnection();
  }, [isConnected, address, provider]);

  /* ------------------------------------------------------------------ */
  /* Update balance */
  /* ------------------------------------------------------------------ */
  const updateBalance = async (walletAddress: string) => {
    try {
      const monadProvider = new ethers.providers.JsonRpcProvider(
        MONAD_TESTNET_CONFIG.rpcUrl,
        { chainId: MONAD_TESTNET_CONFIG.chainId, name: 'monad-testnet' }
      );

      const balWei = await monadProvider.getBalance(walletAddress);
      const balEth = ethers.utils.formatEther(balWei);
      setBalance(parseFloat(balEth).toFixed(4));
      console.log('💰 Balance:', balEth, 'MON');
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      setBalance('0');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Switch to Monad Testnet */
  /* ------------------------------------------------------------------ */
  const switchToMonad = async () => {
    if (!provider || isSwitchingChain) return;

    try {
      setIsSwitchingChain(true);
      console.log('🔄 Switching to Monad Testnet...');

      // Try switching first
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainHex }],
        });
        console.log('✅ Switched to Monad Testnet');
      } catch (switchError: any) {
        // If chain doesn't exist (error 4902), add it
        if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
          console.log('📝 Adding Monad Testnet to wallet...');
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MONAD_TESTNET_CONFIG.chainHex,
                chainName: MONAD_TESTNET_CONFIG.chainName,
                nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
                rpcUrls: [MONAD_TESTNET_CONFIG.rpcUrl],
                blockExplorerUrls: [MONAD_TESTNET_CONFIG.explorerUrl],
              },
            ],
          });
          console.log('✅ Monad Testnet added and switched!');
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to switch to Monad:', error);
      if (error.code !== 'ACTION_REJECTED') {
        console.error('Error details:', error.message);
      }
    } finally {
      setIsSwitchingChain(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Connect wallet - NOW PROPERLY OPENS THE MODAL */
  /* ------------------------------------------------------------------ */
  const connectWallet = async () => {
    try {
      console.log('🔗 Opening wallet connection modal...');
      setIsConnecting(true);

      // ✅ This will now work because WalletConnectModal is rendered in _layout
      await open();

      console.log('✅ Modal opened');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Disconnect wallet */
  /* ------------------------------------------------------------------ */
  const disconnectWallet = async () => {
    try {
      console.log('🔌 Disconnecting wallet...');

      if (provider?.disconnect) {
        await provider.disconnect();
      }

      setBalance('0');
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address: address || null,
        balance,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}