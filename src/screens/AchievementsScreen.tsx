import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAchievements, useLoadAchievements, useInitializeDefaultAchievements } from '../stores/useAchievementStore';
import { Achievement, AchievementTier } from '../types';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (theme.spacing[4] * 3)) / 2;

/**
 * 🏆 ACHIEVEMENTS SCREEN - UI FIXED
 * 
 * ✅ Fixed gap issue - stats and filters outside ScrollView
 * ✅ Proper spacing with theme.spacing
 * ✅ Clean layout structure
 */

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const achievements = useAchievements();
  const loadAchievements = useLoadAchievements();
  const initializeDefaultAchievements = useInitializeDefaultAchievements();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'milestone' | 'streak' | 'dedication'>('all');
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        await loadAchievements();
        
        if (achievements.length === 0) {
          await initializeDefaultAchievements();
          await loadAchievements();
        }
      }
    };
    
    initialize();
  }, [loadAchievements, initializeDefaultAchievements, achievements.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const filteredAchievements = useMemo(() => {
    if (filterCategory === 'all') return achievements;
    return achievements.filter(achievement => achievement.category === filterCategory);
  }, [achievements, filterCategory]);

  const unlockedAchievements = useMemo(() => 
    filteredAchievements.filter(a => a.isUnlocked),
    [filteredAchievements]
  );
  
  const lockedAchievements = useMemo(() => 
    filteredAchievements.filter(a => !a.isUnlocked),
    [filteredAchievements]
  );

  const stats = useMemo(() => ({
    total: achievements.length,
    unlocked: achievements.filter(a => a.isUnlocked).length,
    percentage: achievements.length > 0 
      ? Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100)
      : 0,
  }), [achievements]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.backButton} />
        </View>

        {/* Stats Card - OUTSIDE ScrollView */}
        <View style={styles.statsWrapper}>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.unlocked}</Text>
                <Text style={styles.statLabel}>Unlocked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.percentage}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Filter Chips - OUTSIDE ScrollView */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {(['all', 'milestone', 'streak', 'dedication'] as const).map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setFilterCategory(category)}
                activeOpacity={0.7}
              >
                <GlassCard style={[
                  styles.filterChip,
                  filterCategory === category && styles.filterChipActive
                ]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filterCategory === category && styles.filterChipTextActive,
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Achievements Grid - ONLY THIS SCROLLS */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.cyan}
              colors={[theme.colors.primary.cyan]}
            />
          }
        >
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Unlocked 🎉</Text>
              <View style={styles.achievementsGrid}>
                {unlockedAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </View>
            </>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, unlockedAchievements.length > 0 && styles.sectionTitleSpacing]}>
                Locked 🔒
              </Text>
              <View style={styles.achievementsGrid}>
                {lockedAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </View>
            </>
          )}

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No Achievements</Text>
              <Text style={styles.emptyStateText}>
                Complete sessions to unlock achievements!
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const getTierColor = (tier: AchievementTier): string[] => {
    switch (tier) {
      case 'bronze':
        return ['#CD7F32', '#8B5A2B'];
      case 'silver':
        return ['#C0C0C0', '#808080'];
      case 'gold':
        return ['#FFD700', '#FFA500'];
      case 'platinum':
        return ['#E5E4E2', '#B5B5B5'];
      default:
        return theme.gradients.primary;
    }
  };

  const isUnlocked = achievement.isUnlocked;

  return (
    <GlassCard style={[styles.badge, !isUnlocked && styles.badgeLocked]}>
      {/* Icon Container */}
      <View style={styles.badgeIconContainer}>
        <LinearGradient
          colors={isUnlocked ? getTierColor(achievement.tier) : ['#333333', '#1a1a1a']}
          style={styles.badgeIconGradient}
        >
          <Ionicons
            name={achievement.icon as any}
            size={32}
            color={isUnlocked ? theme.colors.text.inverse : theme.colors.text.quaternary}
          />
        </LinearGradient>
      </View>

      {/* Title */}
      <Text
        style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>

      {/* Description */}
      <Text
        style={[styles.badgeDescription, !isUnlocked && styles.badgeDescriptionLocked]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>

      {/* Progress Bar (for locked achievements) */}
      {!isUnlocked && achievement.progress > 0 && (
        <View style={styles.badgeProgressContainer}>
          <View style={styles.badgeProgressBackground}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.badgeProgressFill,
                { width: `${achievement.progress}%` },
              ]}
            />
          </View>
          <Text style={styles.badgeProgressText}>
            {Math.round(achievement.progress)}%
          </Text>
        </View>
      )}

      {/* Tier Badge */}
      <View style={styles.tierBadge}>
        <Text style={styles.tierText}>{achievement.tier.toUpperCase()}</Text>
      </View>

      {/* Lock Icon Overlay */}
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={20} color={theme.colors.text.quaternary} />
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  statsWrapper: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  statsCard: {
    padding: theme.spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.glass.border,
  },
  filtersWrapper: {
    marginBottom: theme.spacing[3],
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterChip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    marginRight: theme.spacing[2],
  },
  filterChipActive: {
    borderColor: theme.colors.primary.cyan,
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.primary.cyan,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[4],
    paddingTop: 0,
    paddingBottom: theme.spacing[8],
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    letterSpacing: 0.3,
  },
  sectionTitleSpacing: {
    marginTop: theme.spacing[6],
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  badge: {
    width: CARD_WIDTH,
    padding: theme.spacing[4],
    minHeight: 200,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  badgeIconGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
    minHeight: 40,
  },
  badgeTitleLocked: {
    color: theme.colors.text.secondary,
  },
  badgeDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 32,
  },
  badgeDescriptionLocked: {
    color: theme.colors.text.tertiary,
  },
  badgeProgressContainer: {
    marginTop: theme.spacing[3],
  },
  badgeProgressBackground: {
    height: 4,
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing[1],
  },
  badgeProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  badgeProgressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontWeight: theme.fontWeight.semibold,
  },
  tierBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    paddingHorizontal: theme.spacing[1.5],
    paddingVertical: theme.spacing[0.5],
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.md,
  },
  tierText: {
    fontSize: 8,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.tertiary,
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: theme.spacing[2],
    right: theme.spacing[2],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[16],
  },
  emptyStateTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[8],
  },
});