// hooks/useBlackjackContract.ts - USING WALLETCONNECT MODAL PROVIDER
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import {
  BLACKJACK_CONTRACT_ADDRESS,
  BLACKJACK_ABI,
  Game,
  ContractGame,
  GamePhase,
  GameResult,
  BalanceInfo,
} from '@/constants/blackjackContract';

export function useBlackjackContract() {
  const { address, provider, isConnected } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize contract
  useEffect(() => {
    if (isConnected && provider && address) {
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
      const contractInstance = new ethers.Contract(
        BLACKJACK_CONTRACT_ADDRESS,
        BLACKJACK_ABI,
        ethersProvider
      );
      setContract(contractInstance);
    }
  }, [isConnected, provider, address]);

  // Load active game after contract is set
  useEffect(() => {
    if (contract && address) {
      loadActiveGame();
    }
  }, [contract, address]);

  // Load active game if player is in one
  const loadActiveGame = async () => {
    if (!contract || !address) return;

    try {
      const gameId = await contract.getActiveGameForPlayer(address);
      if (gameId.gt(0)) {
        setActiveGameId(gameId.toString());
        console.log('🎮 Active game:', gameId.toString());
      } else {
        setActiveGameId(null);
      }
    } catch (error) {
      console.error('Error loading active game:', error);
    }
  };

  // Helper function to open MetaMask
  const openMetaMask = async () => {
    try {
      await Linking.openURL('metamask://');
    } catch (e) {
      console.log('Could not open MetaMask automatically');
    }
  };

  /**
   * Place a bet to start a game vs the house
   * @param betAmountInEth Bet amount in MON (e.g., "0.01")
   * @returns Game ID if successful, null otherwise
   */
  const placeBet = async (betAmountInEth: string): Promise<string | null> => {
    if (!provider || !address || !contract) {
      console.error('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    try {
      console.log('🎲 Placing bet:', betAmountInEth, 'MON...');

      const betAmountWei = ethers.utils.parseEther(betAmountInEth);

      // Encode function call
      const iface = new ethers.utils.Interface(BLACKJACK_ABI);
      const callData = iface.encodeFunctionData('placeBet', []);

      await openMetaMask();
      Alert.alert(
        '📱 Approve in MetaMask',
        'Please check MetaMask app to approve the transaction',
        [{ text: 'OK' }]
      );

      console.log('📤 Sending transaction via WalletConnect modal provider...');
      
      // Send transaction directly via provider
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: address,
            to: BLACKJACK_CONTRACT_ADDRESS,
            data: callData,
            value: betAmountWei.toHexString(),
            chainId: '0x279F', // Monad Testnet
          },
        ],
      });

      console.log('✅ Transaction sent:', txHash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction confirmation
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
      const receipt = await ethersProvider.waitForTransaction(txHash);
      console.log('✅ Transaction confirmed!', receipt);

      // Parse logs to get gameId
      const iface2 = new ethers.utils.Interface(BLACKJACK_ABI);
      const logs = receipt.logs
        .map((log: any) => {
          try {
            return iface2.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((log: any) => log !== null);

      const gameCreatedEvent = logs.find((log: any) => log?.name === 'GameCreated');

      if (gameCreatedEvent) {
        const gameId = gameCreatedEvent.args.gameId.toString();
        console.log('🎮 Game ID:', gameId);
        setActiveGameId(gameId);
        setIsLoading(false);
        return gameId;
      }

      setIsLoading(false);
      return null;
    } catch (error: any) {
      console.error('❌ Bet placement error:', error);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Submit game result after player finishes playing
   * @param gameId The game ID
   * @param playerWon Whether the player won
   * @returns true if successful, false otherwise
   */
  const submitGameResult = async (
    gameId: string,
    playerWon: boolean
  ): Promise<boolean> => {
    if (!provider || !address || !contract) {
      console.error('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('📤 Submitting game result:', gameId, 'playerWon:', playerWon);

      // Encode function call
      const iface = new ethers.utils.Interface(BLACKJACK_ABI);
      const callData = iface.encodeFunctionData('submitGameResult', [gameId, playerWon]);

      await openMetaMask();
      Alert.alert(
        '📱 Approve in MetaMask',
        'Submitting game result...',
        [{ text: 'OK' }]
      );

      console.log('📤 Sending transaction via WalletConnect modal provider...');

      // Send transaction directly via provider
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: address,
            to: BLACKJACK_CONTRACT_ADDRESS,
            data: callData,
            chainId: '0x279F', // Monad Testnet
          },
        ],
      });

      console.log('✅ Transaction sent:', txHash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction confirmation
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any');
      const receipt = await ethersProvider.waitForTransaction(txHash);
      console.log('✅ Game result submitted!', receipt);

      setActiveGameId(null);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('❌ Submit result error:', error);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Get detailed game information
   * @param gameId The game ID
   * @returns Game details or null
   */
  const getGame = async (gameId: string): Promise<Game | null> => {
    if (!contract) return null;

    try {
      const gameData: ContractGame = await contract.getGame(gameId);

      return {
        gameId: gameData.gameId.toString(),
        player: gameData.player,
        betAmount: ethers.utils.formatEther(gameData.betAmount),
        phase: gameData.phase as GamePhase,
        result: gameData.result as GameResult,
        startTime: Number(gameData.startTime),
        winner: gameData.winner,
        settled: gameData.settled,
        gameHash: gameData.gameHash,
      };
    } catch (error) {
      console.error('Error getting game:', error);
      return null;
    }
  };

  /**
   * Check if player is currently in a game
   * @returns true if player is in active game
   */
  const isPlayerInGame = async (): Promise<boolean> => {
    if (!contract || !address) return false;

    try {
      return await contract.isPlayerInGame(address);
    } catch (error) {
      console.error('Error checking if player in game:', error);
      return false;
    }
  };

  /**
   * Get house balance information
   * @returns Balance info with contract balance, house available, and fees
   */
  const getBalanceInfo = async (): Promise<BalanceInfo | null> => {
    if (!contract) return null;

    try {
      const info = await contract.getBalanceInfo();
      return {
        contractBalance: ethers.utils.formatEther(info.contractBalance),
        houseAvailable: ethers.utils.formatEther(info.houseAvailable),
        accumulatedFees: ethers.utils.formatEther(info.accumulatedFees),
      };
    } catch (error) {
      console.error('Error getting balance info:', error);
      return null;
    }
  };

  return {
    // State
    activeGameId,
    isLoading,

    // Functions
    placeBet,
    submitGameResult,
    getGame,
    isPlayerInGame,
    getBalanceInfo,
    loadActiveGame,
  };
}