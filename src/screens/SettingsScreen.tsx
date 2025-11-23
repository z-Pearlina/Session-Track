import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  Share 
  // REMOVED ScrollView from here
} from 'react-native'; 

// ADDED this import:
import { ScrollView } from 'react-native-gesture-handler';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { RootStackNavigationProp } from '../types';
import { useSessionStore } from '../stores/useSessionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { logger } from '../services/logger';
import { typography, fonts } from '../utils/typography';

export default function SettingsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { sessions } = useSessionStore();
  const { categories } = useCategoryStore();
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async () => {
    try {
      setIsExporting(true);

      const exportPayload = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        categories: categories,
        sessions: sessions,
        statistics: {
          totalSessions: sessions.length,
          totalDurationMs: sessions.reduce((sum, s) => sum + s.durationMs, 0),
          totalHours: (sessions.reduce((sum, s) => sum + s.durationMs, 0) / (1000 * 60 * 60)).toFixed(2),
        }
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `session-track-export-${timestamp}.json`;

      const documentDir = FileSystem.documentDirectory;
      const cacheDir = FileSystem.cacheDirectory;
      
      if (!documentDir && !cacheDir) {
        if (Platform.OS === 'web') {
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
          Alert.alert('Export Successful!', `File downloaded as ${fileName}`);
        } else {
          await Share.share({
            message: jsonString,
            title: 'Session Track Export',
          });
        }
        logger.success('Data exported via fallback method');
        return;
      }

      const directory = documentDir || cacheDir;
      const fileUri = `${directory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: 'utf8',
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Session Track Data',
          UTI: 'public.json',
        });

        Alert.alert(
          'Export Successful!',
          `Your data has been exported to:\n${fileName}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Export Complete',
          `File saved to:\n${fileUri}\n\nYou can find it in your device's file manager.`,
          [{ text: 'OK' }]
        );
      }

      logger.success('Data exported successfully', { fileName, sessions: sessions.length });
    } catch (error) {
      logger.error('Export failed', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const settingsOptions = [
    {
      icon: 'trophy' as const,
      title: 'Goals',
      subtitle: 'Set and track your time goals',
      onPress: () => navigation.navigate('Goals'),
      color: theme.colors.primary.cyan,
    },
    {
      icon: 'medal' as const,
      title: 'Achievements',
      subtitle: 'View your unlocked badges',
      onPress: () => navigation.navigate('Achievements'),
      color: '#FFD700',
    },
    {
      icon: 'notifications' as const,
      title: 'Notifications',
      subtitle: 'Configure reminders and alerts',
      onPress: () => navigation.navigate('NotificationSettings'),
      color: theme.colors.primary.aqua,
    },
    {
      icon: 'grid' as const,
      title: 'Customize Dashboard',
      subtitle: 'Choose which category cards to display',
      onPress: () => navigation.navigate('CustomizeDashboard'),
      color: theme.colors.primary.mint,
    },
    {
      icon: 'apps' as const,
      title: 'Manage Categories',
      subtitle: 'Add, edit, or delete categories',
      onPress: () => navigation.navigate('CategoryManager'),
      color: theme.colors.primary.cyan,
    },
    {
      icon: 'download' as const,
      title: 'Export Data',
      subtitle: isExporting ? 'Exporting...' : `Export ${sessions.length} sessions to JSON`,
      onPress: exportData,
      color: theme.colors.primary.aqua,
      disabled: isExporting,
    },
    {
      icon: 'help-circle' as const,
      title: 'Help & Support',
      subtitle: 'Coming soon',
      onPress: () => {},
      color: theme.colors.primary.mint,
    },
    {
      icon: 'information-circle' as const,
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => {},
      color: theme.colors.primary.cyan,
    },
  ];

  return (
    <LinearGradient
      colors={[...theme.gradients.backgroundAnimated] as [string, string, ...string[]]}
      style={styles.root}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          // These props help with gesture handling too:
          bounces={true}
          overScrollMode="always"
        >
          <View style={styles.headerSection}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          {settingsOptions.map((option, index) => (
            <GlassCard key={index} style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={option.onPress}
                activeOpacity={0.7}
                disabled={option.disabled}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={option.disabled ? theme.colors.text.quaternary : option.color}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={option.disabled ? theme.colors.text.quaternary : theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            </GlassCard>
          ))}

          <GlassCard style={styles.infoCard}>
            <View style={styles.infoContent}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[...theme.gradients.primary] as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="timer" size={32} color={theme.colors.text.inverse} />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>FlowTrix</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Track your focus time and build productive habits
              </Text>
            </View>
          </GlassCard>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingTop: theme.spacing[8],
  },
  headerSection: {
    marginBottom: theme.spacing[6],
  },
  header: {
    ...typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    ...typography.body,
    color: theme.colors.text.tertiary,
  },
  optionCard: {
    marginBottom: theme.spacing[3],
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyMedium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  optionSubtitle: {
    ...typography.bodySmall,
    color: theme.colors.text.tertiary,
  },
  infoCard: {
    marginTop: theme.spacing[6],
  },
  infoContent: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing[4],
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowCyan,
  },
  appName: {
    ...typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  appVersion: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[3],
  },
  appDescription: {
    ...typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});