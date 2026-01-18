import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';

export default function HowToPlayScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>How to Play</ThemedText>
        
        <ThemedText style={styles.text}>
          1. Choose a card from 13 available cards{"\n\n"}
          2. Place your bet amount{"\n\n"}
          3. A random card will be revealed{"\n\n"}
          4. If you guessed correctly, win 2X your bet!{"\n\n"}
          5. If you guessed wrong, you lose your bet
        </ThemedText>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.buttonText}>Got it!</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 30,
    marginTop: 20,
    color: '#FFD700',
  },
  text: {
    fontSize: 18,
    lineHeight: 32,
    color: '#FFF',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
});