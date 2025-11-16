import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Keyboard,
  InteractionManager,
  ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import {
  useSessions,
  useFilteredSessions,
  useLoadSessions,
  useSessionFilter,
  useSetFilter,
} from '../stores/useSessionStore';
import { useCategories, useLoadCategories } from '../stores/useCategoryStore';
import {
  useDashboardPreferences,
  useLoadDashboardPreferences
} from '../stores/useDashboardStore';
import { CustomHeader } from '../components/CustomHeader';
import { EnergyRingCard } from '../components/EnergyRingCard';
import { MiniStatCard } from '../components/MiniStatCard';
import { CategoryProgressCard } from '../components/CategoryProgressCard';
import { GlassCard } from '../components/GlassCard';
import { FABButton } from '../components/FABButton';
import { SwipeableSessionCard } from '../components/SwipeableSessionCard';
import { FilterChips } from '../components/FilterChips';
import { SearchBar } from '../components/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '../types';

const getTodayDateString = () => new Date().toDateString();
const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
};

const getSessionDateString = (session: Session) => {
  return new Date(session.startedAt).toDateString();
};

export default function HomeScreen() {
  const navigation = useNavigation();

  const sessions = useSessions();
  const filteredSessions = useFilteredSessions();
  const filter = useSessionFilter();
  const loadSessions = useLoadSessions();
  const setFilter = useSetFilter();

  const categories = useCategories();
  const loadCategories = useLoadCategories();

  const preferences = useDashboardPreferences();
  const loadPreferences = useLoadDashboardPreferences();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [localCategoryId, setLocalCategoryId] = useState(filter.categoryId);
  const [localDateRange, setLocalDateRange] = useState(filter.dateRange);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilter({
        categoryId: localCategoryId,
        dateRange: localDateRange,
        searchQuery: searchQuery,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, localCategoryId, localDateRange]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      Promise.all([
        loadSessions(),
        loadCategories(),
        loadPreferences(),
      ]).finally(() => {
        setIsInitialLoad(false);
      });
    });

    return () => task.cancel();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      InteractionManager.runAfterInteractions(() => {
        loadSessions();
        loadCategories();
        loadPreferences();
      });
    });

    return unsubscribe;
  }, [navigation, loadSessions, loadCategories, loadPreferences]);

  const todayDateString = useMemo(() => getTodayDateString(), []);
  const yesterdayDateString = useMemo(() => getYesterdayDateString(), []);

  const todaySessions = useMemo(() => {
    return sessions.filter(s => getSessionDateString(s) === todayDateString);
  }, [sessions, todayDateString]);

  const yesterdaySessions = useMemo(() => {
    return sessions.filter(s => getSessionDateString(s) === yesterdayDateString);
  }, [sessions, yesterdayDateString]);

  const todayStats = useMemo(() => {
    const todayTotalMs = todaySessions.reduce((sum, s) => sum + s.durationMs, 0);
    const todayHours = Math.floor(todayTotalMs / (1000 * 60 * 60));
    const todayMinutes = Math.floor((todayTotalMs % (1000 * 60 * 60)) / (1000 * 60));
    return { todayHours, todayMinutes, todayTotalMs };
  }, [todaySessions]);

  const yesterdayTotalMs = useMemo(() => {
    return yesterdaySessions.reduce((sum, s) => sum + s.durationMs, 0);
  }, [yesterdaySessions]);

  const percentageChange = useMemo(() => {
    return yesterdayTotalMs > 0
      ? Math.round(((todayStats.todayTotalMs - yesterdayTotalMs) / yesterdayTotalMs) * 100)
      : todayStats.todayTotalMs > 0 ? 100 : 0;
  }, [todayStats.todayTotalMs, yesterdayTotalMs]);

  const streak = useMemo(() => {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    const sessionDates = new Set(
      sortedSessions.map(s => new Date(s.startedAt).toDateString())
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toDateString();
      if (sessionDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [sessions]);

  const avgMinutes = useMemo(() => {
    if (sessions.length === 0) return 0;
    const avgSessionMs = sessions.reduce((sum, s) => sum + s.durationMs, 0) / sessions.length;
    return Math.round(avgSessionMs / (1000 * 60));
  }, [sessions]);

  const calculateCategoryProgress = useCallback((categoryId: string): number => {
    const categorySessions = sessions.filter(s => s.categoryId === categoryId);
    const totalMs = categorySessions.reduce((sum, s) => sum + s.durationMs, 0);
    const hours = totalMs / (1000 * 60 * 60);
    const monthlyGoal = 40;
    return Math.min(Math.round((hours / monthlyGoal) * 100), 100);
  }, [sessions]);

  const visibleCategories = useMemo(() => {
    return categories.filter(cat =>
      preferences.visibleCategoryIds.includes(cat.id)
    );
  }, [categories, preferences.visibleCategoryIds]);

  const sessionsToDisplay = useMemo(() => {
    const hasFilters = filter.categoryId || filter.dateRange || filter.searchQuery;
    const baseList = hasFilters ? filteredSessions : sessions;

    return baseList
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 20);
  }, [sessions, filteredSessions, filter.categoryId, filter.dateRange, filter.searchQuery]);

  const hasActiveFilters = useMemo(() => {
    return !!(filter.categoryId || filter.dateRange || searchQuery);
  }, [filter.categoryId, filter.dateRange, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadSessions(),
      loadCategories(),
      loadPreferences(),
    ]);
    setRefreshing(false);
  }, [loadSessions, loadCategories, loadPreferences]);

  const handleStartSession = useCallback(() => {
    navigation.navigate('StartSession' as never);
  }, [navigation]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setLocalCategoryId(undefined);
    setLocalDateRange(undefined);
    setFilter({});
    Keyboard.dismiss();
  }, [setFilter]);

  const renderSessionItem = useCallback(({ item }: ListRenderItemInfo<Session>) => {
    return <SwipeableSessionCard session={item} />;
  }, []);

  const keyExtractor = useCallback((item: Session) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <>
      <EnergyRingCard
        hours={todayStats.todayHours}
        minutes={todayStats.todayMinutes}
        percentageChange={percentageChange}
      />

      <View style={styles.miniStatsWrapper}>
        <View style={styles.miniStatsScroll}>
          <MiniStatCard
            icon="flame"
            value={`${streak} Day${streak !== 1 ? 's' : ''}`}
            label="Streak"
          />
          <MiniStatCard
            icon="timer"
            value={`${avgMinutes} min`}
            label="Avg Session"
          />
          <MiniStatCard
            icon="happy"
            value={sessions.length > 0 ? "Focused" : "Start"}
            label="Focus Mood"
          />
        </View>
      </View>

      {visibleCategories.length > 0 ? (
        <View style={styles.categoriesGrid}>
          {visibleCategories.map((category) => (
            <CategoryProgressCard
              key={category.id}
              icon={category.icon as keyof typeof Ionicons.glyphMap}
              title={category.name}
              progress={calculateCategoryProgress(category.id)}
              color={category.color}
              gradientColors={[category.color, theme.colors.primary.mint]}
            />
          ))}
        </View>
      ) : (
        <GlassCard style={styles.emptyCardsCard}>
          <View style={styles.emptyCardsContent}>
            <Text style={styles.emptyCardsText}>
              No category cards selected
            </Text>
            <Text style={styles.emptyCardsSubtext}>
              Tap Settings to customize your dashboard
            </Text>
          </View>
        </GlassCard>
      )}

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Search by title or notes..."
        />
      </View>

      <FilterChips />

      <View style={styles.sessionsHeader}>
        <Text style={styles.sectionTitle}>
          {hasActiveFilters ? 'Filtered Sessions' : 'Recent Sessions'}
        </Text>
        {sessionsToDisplay.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{sessionsToDisplay.length}</Text>
          </View>
        )}
      </View>
    </>
  ), [
    todayStats,
    percentageChange,
    streak,
    avgMinutes,
    sessions.length,
    visibleCategories,
    calculateCategoryProgress,
    searchQuery,
    handleClearSearch,
    hasActiveFilters,
    sessionsToDisplay.length,
  ]);

  const ListEmptyComponent = useCallback(() => (
    <GlassCard style={styles.emptyStateCard}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          {hasActiveFilters
            ? 'No sessions found'
            : 'No sessions yet'
          }
        </Text>
        <Text style={styles.emptySubtext}>
          {hasActiveFilters
            ? searchQuery
              ? `No sessions match "${searchQuery}"`
              : 'Try adjusting your filters'
            : 'Tap "Start Session" below to begin tracking'
          }
        </Text>
      </View>
    </GlassCard>
  ), [hasActiveFilters, searchQuery]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <CustomHeader />

      <FlatList
        data={sessionsToDisplay}
        renderItem={renderSessionItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.cyan}
            colors={[theme.colors.primary.cyan]}
            progressViewOffset={100}
          />
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={5}
        ListFooterComponent={<View style={{ height: 200 }} />}
      />

      <FABButton onPress={handleStartSession} />
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
  flatListContent: {
    paddingTop: 120,
    paddingBottom: theme.spacing[8],
  },
  miniStatsWrapper: {
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  miniStatsScroll: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    justifyContent: 'space-between',
  },
  emptyCardsCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  emptyCardsContent: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  emptyCardsText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  emptyCardsSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  sessionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  countBadge: {
    backgroundColor: theme.colors.primary.cyan + '20',
    paddingHorizontal: theme.spacing[2.5],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.cyan + '40',
  },
  countText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
  },
  emptyStateCard: {
    marginHorizontal: theme.spacing[4],
  },
  emptyState: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});