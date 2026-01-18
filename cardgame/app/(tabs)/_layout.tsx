// app/(tabs)/index.tsx - UPDATED WITH BETTER ERROR HANDLING

import { ImageBackground, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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

  const handleQuickPlay = () => {
    if (!isConnected) {
      Alert.alert(
        '⚠️ Connect Wallet',
        'Please connect your wallet first to play!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect', onPress: handleConnectWallet },
        ]
      );
      return;
    }
    router.push('/game');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <ImageBackground
      source={require('@/assets/images/tyy.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.1)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          
          {/* Game Title */}
          <View style={styles.titleSection}>
            <ThemedText style={styles.gameTitle}>1v1</ThemedText>
            <ThemedText style={styles.gameTitle}>BLACKJACK</ThemedText>
            <View style={styles.underline} />
            <ThemedText style={styles.tagline}>BEAT THE HOUSE • WIN BIG</ThemedText>
          </View>

          {/* Wallet Section */}
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
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isConnecting ? ['#666666', '#444444'] : ['#4CAF50', '#388E3C']}
                style={styles.buttonGradient}
              >
                <ThemedText style={styles.connectText}>
                  {isConnecting ? '🔄 CONNECTING...' : '🔗 CONNECT WALLET'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Play Button */}
          <TouchableOpacity 
            style={[styles.playButton, !isConnected && styles.playButtonDisabled]} 
            onPress={handleQuickPlay}
            activeOpacity={0.8}
            disabled={!isConnected}
          >
            <LinearGradient
              colors={isConnected ? ['#2196F3', '#1976D2'] : ['#666666', '#444444']}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.playText}>
                {isConnected ? '🎲 PLAY GAME' : 'CONNECT TO PLAY'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    lineHeight: 70,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  underline: {
    width: 80,
    height: 4,
    backgroundColor: '#2196F3',
    marginTop: 12,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64B5F6',
    letterSpacing: 2,
  },
  walletConnected: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  disconnectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  disconnectText: {
    fontSize: 12,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  connectButton: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  connectText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  playButton: {
    marginBottom: 50,
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonDisabled: {
    opacity: 0.5,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  playText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});