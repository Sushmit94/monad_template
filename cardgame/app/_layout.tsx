// app/_layout.tsx - FIXED VERSION
// CRITICAL: Import polyfills FIRST before anything else
import '../polyfill';
import '@walletconnect/react-native-compat';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WalletProvider } from '@/context/WalletContext';
import * as Linking from 'expo-linking';

// ⚠️ CRITICAL: Import WalletConnectModal
import { WalletConnectModal } from '@walletconnect/modal-react-native';

const prefix = Linking.createURL('/');

export const unstable_settings = {
  anchor: '(tabs)',
};

// ⚠️ WalletConnect Configuration
const projectId = '750c107469ad27c91c6ed5ea90194def';

const providerMetadata = {
  name: 'Blackjack DApp',
  description: 'Play Blackjack on Monad Testnet',
  url: 'https://your-app-url.com', // Change this to your actual URL
  icons: ['https://your-app-url.com/icon.png'], // Change this to your actual icon
  redirect: {
    native: 'blackjackdapp://', // Your app's deep link scheme
    universal: 'https://your-app-url.com', // Optional: universal link
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      {/* ⚠️ CRITICAL: Render WalletConnectModal FIRST */}
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={providerMetadata}
      />

      {/* Then wrap with your custom WalletProvider */}
      <WalletProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="game" options={{ headerShown: false }} />
            <Stack.Screen name="play" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </WalletProvider>
    </>
  );
}