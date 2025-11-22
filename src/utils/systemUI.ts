import { Platform, StatusBar } from 'react-native';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

/**
 * System UI Configuration
 * Hides system navigation bar and configures immersive mode
 */

/**
 * Hide system navigation bar on Android
 * This creates a clean, immersive experience with only your custom bottom tab bar
 */
export const hideSystemNavigationBar = async () => {
  if (Platform.OS === 'android') {
    try {
      // Hide the navigation bar
      await NavigationBar.setVisibilityAsync('hidden');
      
      // Set behavior to show temporarily on swipe
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      
      // Make it transparent when it does appear
      await NavigationBar.setBackgroundColorAsync('#00000000');
      
      // Set button color to light (for when it appears)
      await NavigationBar.setButtonStyleAsync('light');
      
      console.log('✅ System navigation bar hidden');
    } catch (error) {
      console.warn('⚠️ Could not hide navigation bar:', error);
    }
  }
};

/**
 * Configure status bar
 */
export const configureStatusBar = () => {
  if (Platform.OS === 'android') {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setBarStyle('light-content');
  } else {
    StatusBar.setBarStyle('light-content');
  }
};

/**
 * React hook to configure system UI on mount
 */
export const useSystemUI = () => {
  useEffect(() => {
    // Configure on mount
    configureStatusBar();
    hideSystemNavigationBar();

    // Re-hide navigation bar when app comes to foreground
    // (Android sometimes shows it again)
    if (Platform.OS === 'android') {
      const interval = setInterval(() => {
        hideSystemNavigationBar();
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, []);
};

/**
 * Get safe bottom padding accounting for hidden navigation bar
 * Use this instead of insets.bottom for your tab bar
 */
export const getSafeBottomPadding = (insetsBottom: number): number => {
  if (Platform.OS === 'android') {
    // On Android with hidden nav bar, use a fixed bottom padding
    return 16;
  } else {
    // On iOS, respect the home indicator area
    return insetsBottom > 0 ? insetsBottom : 16;
  }
};

/**
 * Check if expo-navigation-bar is available
 * If not, the app will still work but navigation bar won't be hidden
 */
export const isNavigationBarAvailable = (): boolean => {
  return Platform.OS === 'android' && !!NavigationBar;
};