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
  TouchableOpacity,
  ActivityIndicator, 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { SwipeableSessionCard } from '../components/SwipeableSessionCard';
import { FilterChips } from '../components/FilterChips';
import { SearchBar } from '../components/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '../types';
import { usePaginatedSessions } from '../hooks/usePaginatedSessions'; // Import the hook

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
  const insets = useSafeAreaInsets();

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

  // Debounce filter updates
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

  // Initial Data Load
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

  // Refresh on focus
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

  // --- Stats Calculations ---
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

  // --- Filtering & Pagination Logic ---

  const hasActiveFilters = useMemo(() => {
    return !!(filter.categoryId || filter.dateRange || searchQuery);
  }, [filter.categoryId, filter.dateRange, searchQuery]);

  // 1. Prepare the Sorted List (All items matching filter)
  const sortedSessions = useMemo(() => {
    const baseList = hasActiveFilters ? filteredSessions : sessions;
    return baseList.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [sessions, filteredSessions, hasActiveFilters]);

  // 2. Apply Pagination Hook
  const { 
    paginatedSessions, 
    hasMore, 
    loadMore, 
    currentPage, 
    totalPages 
  } = usePaginatedSessions(sortedSessions, 20);

  // --- Event Handlers ---

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

  // --- Render Helpers ---

  const renderSessionItem = useCallback(({ item }: ListRenderItemInfo<Session>) => {
    return <SwipeableSessionCard session={item} />;
  }, []);

  const keyExtractor = useCallback((item: Session) => item.id, []);

  // Footer component for loading indicator and spacing
  const ListFooterComponent = useCallback(() => {
    return (
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + 80 }]}>
        {hasMore ? (
          <View style={styles.loadingFooter}>
            <ActivityIndicator color={theme.colors.primary.cyan} />
            <Text style={styles.loadingText}>Loading more...</Text>
          </View>
        ) : (
          paginatedSessions.length > 0 && (
            <Text style={styles.endText}>
              — {sortedSessions.length} Sessions —
            </Text>
          )
        )}
      </View>
    );
  }, [hasMore, insets.bottom, paginatedSessions.length, sortedSessions.length]);

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
        {paginatedSessions.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{sortedSessions.length}</Text>
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
    paginatedSessions.length,
    sortedSessions.length, // Show total count, not just loaded count
  ]);

  const ListEmptyComponent = useCallback(() => (
    <GlassCard style={styles.emptyStateCard}>
      <View style={styles.emptyState}>
        <Ionicons name="analytics-outline" size={64} color={theme.colors.text.quaternary} />
        <Text style={styles.emptyText}>
          {hasActiveFilters ? 'No sessions found' : 'No sessions yet'}
        </Text>
        <Text style={styles.emptySubtext}>
          {hasActiveFilters
            ? searchQuery
              ? `No sessions match "${searchQuery}"`
              : 'Try adjusting your filters'
            : 'Tap "Start Session" below to begin tracking'
          }
        </Text>
        
        {!hasActiveFilters && sessions.length === 0 && (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={handleStartSession}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
              style={styles.emptyStateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play-circle" size={24} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Start Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </GlassCard>
  ), [hasActiveFilters, searchQuery, sessions.length, handleStartSession]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <CustomHeader />

      <FlatList
        data={paginatedSessions}
        renderItem={renderSessionItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
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
        
        // Pagination Props
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        
        // Optimization Props
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        windowSize={5}
      />
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
    paddingBottom: 0, // Handled by footer now
  },
  miniStatsWrapper: {
    marginBottom: theme.spacing[6],
  },
  miniStatsScroll: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[5],
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
    padding: theme.spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  emptySubtext: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    lineHeight: 22,
  },
  emptyStateButton: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.primary.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[2],
  },
  emptyStateButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  // Footer Styles
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[4],
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  loadingText: {
    color: theme.colors.text.tertiary,
    fontSize: theme.fontSize.sm,
  },
  endText: {
    color: theme.colors.text.quaternary,
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing[2],
  },
});