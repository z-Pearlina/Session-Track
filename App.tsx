import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreenExpo from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import AppNavigator from './src/navigation/AppNavigator';
import { StorageService } from './src/services/StorageService';
import { NotificationService } from './src/services/NotificationService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { SplashScreen } from './src/components/SplashScreen';
import { logger } from './src/services/logger';
import { theme } from './src/theme/theme';
import { useAchievementStore } from './src/stores/useAchievementStore';

SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Load Outfit fonts
  const [fontsLoaded, fontError] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await StorageService.initialize();
        logger.success('Storage initialized');

        await NotificationService.initialize();
        logger.success('Notifications initialized');

        const achievements = await StorageService.getAchievements();
        if (achievements.length === 0) {
          logger.info('Initializing default achievements');
          await useAchievementStore.getState().initializeDefaultAchievements();
        }

        logger.success('App initialized successfully');
        setIsInitialized(true);
        setAppReady(true);
      } catch (error) {
        logger.error('App initialization failed', error);
        setInitError(
          'Failed to initialize the app. Please restart the application.'
        );
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady && fontsLoaded) {
      await SplashScreenExpo.hideAsync();
    }
  }, [appReady, fontsLoaded]);

  const handleSplashFinish = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  // Wait for both app initialization and fonts to load
  if (!appReady || !fontsLoaded) {
    return null;
  }

  // Handle font loading error
  if (fontError) {
    logger.error('Font loading failed', fontError);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Font Loading Error</Text>
        <Text style={styles.errorMessage}>
          Failed to load fonts. Please restart the application.
        </Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer} onLayout={onLayoutRootView}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  if (showCustomSplash) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <AppNavigator />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing[6],
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  errorTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
    fontFamily: theme.fontFamily.bold,
  },
  errorMessage: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: theme.fontFamily.regular,
  },
});