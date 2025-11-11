import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { RootStackNavigationProp } from '../types';

export default function SettingsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  const settingsOptions = [
  {
    icon: 'grid',
    title: 'Customize Dashboard',
    subtitle: 'Choose which category cards to display',
    onPress: () => navigation.navigate('CustomizeDashboard'),
    color: theme.colors.primary.cyan,
  },
  {
    icon: 'apps',
    title: 'Manage Categories',
    subtitle: 'Add, edit, or delete categories',
    onPress: () => navigation.navigate('CategoryManager'),
    color: theme.colors.primary.mint,
  },
  {
    icon: 'notifications',
    title: 'Notifications',
    subtitle: 'Coming soon',
    onPress: () => {},
    color: theme.colors.primary.aqua,
  },
  {
    icon: 'download',
    title: 'Export Data',
    subtitle: 'Coming soon',
    onPress: () => {},
    color: theme.colors.primary.cyan,
  },
  {
    icon: 'help-circle',
    title: 'Help & Support',
    subtitle: 'Coming soon',
    onPress: () => {},
    color: theme.colors.primary.mint,
  },
  {
    icon: 'information-circle',
    title: 'About',
    subtitle: 'Version 1.0.0',
    onPress: () => {},
    color: theme.colors.primary.aqua,
  },
];

  return (
    <View style={styles.root}>
      {/* Animated background gradient - same as HomeScreen */}
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          {/* Settings Options */}
          {settingsOptions.map((option, index) => (
            <GlassCard key={index} style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            </GlassCard>
          ))}

          {/* App Info Section */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoContent}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="timer" size={32} color={theme.colors.text.inverse} />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>Session Track</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Track your focus time and build productive habits
              </Text>
            </View>
          </GlassCard>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    fontSize: theme.fontSize.base,
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
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  optionSubtitle: {
    fontSize: theme.fontSize.sm,
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
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  appVersion: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[3],
  },
  appDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});