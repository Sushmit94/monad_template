// app/(tabs)/index.tsx - Simple Connect Wallet with Hello World

import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useWallet } from '@/context/WalletContext';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { address, balance, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  // Debug logging
  useEffect(() => {
    console.log('🏠 Home Screen - Wallet State:', {
      isConnected,
      address,
      balance,
      isConnecting,
    });
  }, [isConnected, address, balance, isConnecting]);

  const handleConnectWallet = async () => {
    try {
      console.log('🔗 User clicked Connect Wallet');
      await connectWallet();
    } catch (error) {
      console.error('❌ Connection error:', error);
      Alert.alert('❌ Connection Failed', 'Please try again or check MetaMask');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      Alert.alert('🔌 Disconnected', 'Wallet disconnected successfully');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.helloText}>Hello World</ThemedText>
      
      {isConnected ? (
        <View style={styles.walletConnected}>
          <ThemedText style={styles.walletLabel}>✅ Connected</ThemedText>
          <ThemedText style={styles.walletAddress}>{formatAddress(address!)}</ThemedText>
          <ThemedText style={styles.walletBalance}>{balance} MON</ThemedText>
          <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
            <ThemedText style={styles.disconnectText}>Disconnect</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.connectButton} 
          onPress={handleConnectWallet}
          disabled={isConnecting}
        >
          <ThemedText style={styles.connectText}>
            {isConnecting ? '🔄 CONNECTING...' : '🔗 CONNECT WALLET'}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  helloText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 40,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  connectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  walletConnected: {
    backgroundColor: '#F5F5F5',
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    width: '100%',
  },
  walletLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 8,
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  disconnectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  disconnectText: {
    fontSize: 12,
    color: '#FF4444',
    fontWeight: 'bold',
  },
});