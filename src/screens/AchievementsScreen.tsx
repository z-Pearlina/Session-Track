import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAchievements, useAchievementActions } from '../stores/useAchievementStore';
import { Achievement, AchievementTier } from '../types';
import { COLORS } from '../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const achievements = useAchievements();
  const { loadAchievements, initializeDefaultAchievements } = useAchievementActions();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'milestone' | 'streak' | 'dedication'>('all');

  useEffect(() => {
    const initialize = async () => {
      await loadAchievements();
      
      if (achievements.length === 0) {
        await initializeDefaultAchievements();
        await loadAchievements();
      }
    };
    
    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filterCategory === 'all') return true;
    return achievement.category === filterCategory;
  });

  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked);

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.isUnlocked).length,
    percentage: achievements.length > 0 
      ? Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100)
      : 0,
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.primary, COLORS.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.backButton} />
      </View>

      <BlurView intensity={30} tint="dark" style={styles.statsCard}>
        <View style={styles.statsContent}>
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
      </BlurView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {(['all', 'milestone', 'streak', 'dedication'] as const).map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setFilterCategory(category)}
            style={styles.filterChipWrapper}
          >
            <BlurView intensity={30} tint="dark" style={styles.filterChip}>
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === category && styles.filterChipTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.cyan}
          />
        }
      >
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

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Achievements</Text>
            <Text style={styles.emptyStateText}>
              Complete sessions to unlock achievements!
            </Text>
          </View>
        )}
      </ScrollView>
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
        return [COLORS.primary.cyan, COLORS.primary.aqua];
    }
  };

  const isUnlocked = achievement.isUnlocked;

  return (
    <View style={styles.badgeWrapper}>
      <BlurView
        intensity={isUnlocked ? 30 : 20}
        tint="dark"
        style={[styles.badge, !isUnlocked && styles.badgeLocked]}
      >
        <View style={styles.badgeIconContainer}>
          <LinearGradient
            colors={isUnlocked ? getTierColor(achievement.tier) : ['#333333', '#1a1a1a']}
            style={styles.badgeIconGradient}
          >
            <Ionicons
              name={achievement.icon as any}
              size={32}
              color={isUnlocked ? '#FFFFFF' : COLORS.text.quaternary}
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
              <View
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
            <Ionicons name="lock-closed" size={24} color={COLORS.text.quaternary} />
          </View>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  statsContent: {
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary.cyan,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.glass.border,
    marginHorizontal: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChipWrapper: {
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.primary.cyan,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  sectionTitleSpacing: {
    marginTop: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeWrapper: {
    width: CARD_WIDTH,
  },
  badge: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 16,
    minHeight: 200,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 40,
  },
  badgeTitleLocked: {
    color: COLORS.text.secondary,
  },
  badgeDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 32,
  },
  badgeDescriptionLocked: {
    color: COLORS.text.tertiary,
  },
  badgeProgressContainer: {
    marginTop: 12,
  },
  badgeProgressBackground: {
    height: 4,
    backgroundColor: COLORS.glass.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.cyan,
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontWeight: '600',
  },
  tierBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.glass.border,
    borderRadius: 4,
  },
  tierText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});