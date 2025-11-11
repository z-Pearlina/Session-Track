import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';

export default function StatsScreen() {
  return (
    <View style={styles.root}>
      {/* Animated background gradient */}
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
            <Text style={styles.header}>Statistics</Text>
            <Text style={styles.subtitle}>Your productivity insights</Text>
          </View>

          {/* Coming Soon Card */}
          <GlassCard style={styles.comingSoonCard}>
            <View style={styles.comingSoonContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="stats-chart" size={64} color={theme.colors.primary.cyan} />
              </View>
              <Text style={styles.comingSoonTitle}>Coming Soon</Text>
              <Text style={styles.comingSoonText}>
                Advanced statistics and insights about your focus sessions will be available here.
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.featureText}>Weekly & Monthly reports</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.featureText}>Visual charts & graphs</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.featureText}>Category breakdowns</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.featureText}>Productivity trends</Text>
                </View>
              </View>
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
  comingSoonCard: {
    overflow: 'hidden',
  },
  comingSoonContent: {
    padding: theme.spacing[8],
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary.cyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
    ...theme.shadows.glowCyan,
  },
  comingSoonTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  comingSoonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing[6],
  },
  featuresList: {
    width: '100%',
    gap: theme.spacing[3],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  featureText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
  },
});