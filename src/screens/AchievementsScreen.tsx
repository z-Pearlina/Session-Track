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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  useAchievements, 
  useLoadAchievements, 
  useInitializeDefaultAchievements,
  useCheckAndUnlockAchievements 
} from '../stores/useAchievementStore';
import { useSessions } from '../stores/useSessionStore';
import { useGoals } from '../stores/useGoalStore';
import { useCategories } from '../stores/useCategoryStore';
import { Achievement, AchievementTier, AchievementCategory } from '../types';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (theme.spacing[4] * 3)) / 2;

type FilterType = 'all' | AchievementCategory;

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const achievements = useAchievements();
  const sessions = useSessions();
  const goals = useGoals();
  const categories = useCategories();
  
  const loadAchievements = useLoadAchievements();
  const initializeDefaultAchievements = useInitializeDefaultAchievements();
  const checkAndUnlockAchievements = useCheckAndUnlockAchievements();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FilterType>('all');
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

  useEffect(() => {
    if (achievements.length > 0 && sessions.length > 0) {
      checkAndUnlockAchievements(sessions, goals, categories);
    }
  }, [sessions.length, goals.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    await checkAndUnlockAchievements(sessions, goals, categories);
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
    filteredAchievements.filter(a => !a.isUnlocked).sort((a, b) => b.progress - a.progress),
    [filteredAchievements]
  );

  const stats = useMemo(() => {
    const totalAchievements = achievements.length;
    const totalUnlocked = achievements.filter(a => a.isUnlocked).length;
    const percentage = totalAchievements > 0 
      ? Math.round((totalUnlocked / totalAchievements) * 100)
      : 0;

    const recentlyUnlocked = achievements
      .filter(a => a.isUnlocked && a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 3);

    return { totalUnlocked, totalAchievements, percentage, recentlyUnlocked };
  }, [achievements]);

  const filterOptions: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'milestone', label: 'Milestones', icon: 'flag' },
    { key: 'streak', label: 'Streaks', icon: 'flame' },
    { key: 'dedication', label: 'Dedication', icon: 'heart' },
    { key: 'variety', label: 'Variety', icon: 'color-palette' },
    { key: 'speed', label: 'Speed', icon: 'flash' },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['top']}>
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

        <View style={styles.statsWrapper}>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsMainInfo}>
                <View style={styles.trophyContainer}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.trophyGradient}
                  >
                    <Ionicons name="trophy" size={32} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsMainValue}>{stats.totalUnlocked}/{stats.totalAchievements}</Text>
                  <Text style={styles.statsMainLabel}>Achievements Unlocked</Text>
                </View>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{stats.percentage}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${stats.percentage}%` }]}
              />
            </View>

            {stats.recentlyUnlocked.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentLabel}>Recently Unlocked:</Text>
                <View style={styles.recentBadges}>
                  {stats.recentlyUnlocked.map(achievement => (
                    <View key={achievement.id} style={styles.recentBadge}>
                      <Ionicons 
                        name={achievement.icon as any} 
                        size={16} 
                        color={theme.colors.primary.cyan} 
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </GlassCard>
        </View>

        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilterCategory(option.key)}
                activeOpacity={0.7}
              >
                <GlassCard style={[
                  styles.filterChip,
                  filterCategory === option.key && styles.filterChipActive
                ]}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={16} 
                    color={filterCategory === option.key ? theme.colors.primary.cyan : theme.colors.text.tertiary}
                    style={styles.filterIcon}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      filterCategory === option.key && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 100 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.cyan}
              colors={[theme.colors.primary.cyan]}
            />
          }
        >
          {unlockedAchievements.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Unlocked</Text>
                <Text style={styles.sectionCount}>{unlockedAchievements.length}</Text>
              </View>
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

          {lockedAchievements.length > 0 && (
            <>
              <View style={[styles.sectionHeader, unlockedAchievements.length > 0 && styles.sectionHeaderSpacing]}>
                <Text style={styles.sectionTitle}>Locked</Text>
                <Text style={styles.sectionCount}>{lockedAchievements.length}</Text>
              </View>
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
      <View style={styles.badgeIconContainer}>
        <LinearGradient
          colors={isUnlocked ? getTierColor(achievement.tier) : ['#2a2a3a', '#1a1a2a']}
          style={styles.badgeIconGradient}
        >
          <Ionicons
            name={achievement.icon as any}
            size={32}
            color={isUnlocked ? theme.colors.text.inverse : theme.colors.text.quaternary}
          />
        </LinearGradient>
      </View>

      <Text
        style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>

      <Text
        style={[styles.badgeDescription, !isUnlocked && styles.badgeDescriptionLocked]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>

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

      <View style={styles.tierBadge}>
        <Text style={styles.tierText}>{achievement.tier.toUpperCase()}</Text>
      </View>

      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={18} color={theme.colors.text.quaternary} />
        </View>
      )}

      {isUnlocked && achievement.unlockedAt && (
        <View style={styles.checkmarkOverlay}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
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
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  statsWrapper: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  statsCard: {
    padding: theme.spacing[5],
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  statsMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  trophyContainer: {
    width: 64,
    height: 64,
  },
  trophyGradient: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowCyan,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsMainValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  statsMainLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  percentageBadge: {
    backgroundColor: theme.colors.primary.cyan + '20',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
  },
  percentageText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.primary.cyan,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing[3],
  },
  progressBar: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  recentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.semibold,
  },
  recentBadges: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  recentBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrapper: {
    marginBottom: theme.spacing[3],
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginRight: theme.spacing[2],
    gap: theme.spacing[1.5],
  },
  filterChipActive: {
    borderColor: theme.colors.primary.cyan,
    borderWidth: 2,
    backgroundColor: theme.colors.primary.cyan + '10',
  },
  filterIcon: {
    marginRight: theme.spacing[0.5],
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  sectionHeaderSpacing: {
    marginTop: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.primary,
    letterSpacing: 0.3,
  },
  sectionCount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.tertiary,
    backgroundColor: theme.colors.glass.border,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
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
    opacity: 0.7,
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
    fontWeight: theme.fontWeight.bold,
  },
  tierBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.md,
  },
  tierText: {
    fontSize: 9,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.tertiary,
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: theme.spacing[2],
    right: theme.spacing[2],
  },
  checkmarkOverlay: {
    position: 'absolute',
    bottom: theme.spacing[2],
    right: theme.spacing[2],
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowCyan,
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