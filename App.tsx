import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { StorageService } from './src/services/StorageService';

export default function App() {
  useEffect(() => {
    StorageService.initialize()
      .then(() => {
        console.log('✅ Storage initialized successfully');
      })
      .catch((error) => {
        console.error('❌ Storage initialization failed:', error);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}