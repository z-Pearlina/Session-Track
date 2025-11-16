import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreenExpo from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    if (appReady) {
      await SplashScreenExpo.hideAsync();
    }
  }, [appReady]);

  const handleSplashFinish = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  if (!appReady) {
    return null;
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
  },
  errorMessage: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});