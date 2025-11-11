import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useSessionStore } from '../stores/useSessionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { CustomHeader } from '../components/CustomHeader';
import { EnergyRingCard } from '../components/EnergyRingCard';
import { MiniStatCard } from '../components/MiniStatCard';
import { CategoryProgressCard } from '../components/CategoryProgressCard';
import { GlassCard } from '../components/GlassCard';
import { FABButton } from '../components/FABButton';
import { SwipeableSessionCard } from '../components/SwipeableSessionCard';
import { FilterChips } from '../components/FilterChips';
import { SearchBar } from '../components/SearchBar';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { sessions, filteredSessions, loadSessions, filter, setFilter } = useSessionStore();
  const { categories, loadCategories } = useCategoryStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadSessions();
    loadCategories();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilter({ ...filter, searchQuery });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    await loadCategories();
    setRefreshing(false);
  }, []);

  // Calculate TODAY stats
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.startedAt);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const todayTotalMs = todaySessions.reduce((sum, s) => sum + s.durationMs, 0);
  const todayHours = Math.floor(todayTotalMs / (1000 * 60 * 60));
  const todayMinutes = Math.floor((todayTotalMs % (1000 * 60 * 60)) / (1000 * 60));

  // Calculate YESTERDAY stats for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.startedAt);
    return sessionDate.toDateString() === yesterday.toDateString();
  });
  const yesterdayTotalMs = yesterdaySessions.reduce((sum, s) => sum + s.durationMs, 0);
  
  // Calculate percentage change
  const percentageChange = yesterdayTotalMs > 0 
    ? Math.round(((todayTotalMs - yesterdayTotalMs) / yesterdayTotalMs) * 100)
    : todayTotalMs > 0 ? 100 : 0;

  // Calculate STREAK
  const calculateStreak = (): number => {
    if (sessions.length === 0) return 0;
    
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = currentDate.toDateString();
      const hasSession = sortedSessions.some(s => 
        new Date(s.startedAt).toDateString() === dateStr
      );
      
      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
      
      if (streak > 365) break;
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Calculate AVERAGE SESSION LENGTH
  const avgSessionMs = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.durationMs, 0) / sessions.length
    : 0;
  const avgMinutes = Math.round(avgSessionMs / (1000 * 60));

  // Calculate CATEGORY PROGRESS
  const calculateCategoryProgress = (categoryId: string): number => {
    const categorySessions = sessions.filter(s => s.categoryId === categoryId);
    const totalMs = categorySessions.reduce((sum, s) => sum + s.durationMs, 0);
    const hours = totalMs / (1000 * 60 * 60);
    
    const monthlyGoal = 40;
    return Math.min(Math.round((hours / monthlyGoal) * 100), 100);
  };

  const workProgress = calculateCategoryProgress('work');
  const studyProgress = calculateCategoryProgress('study');

  // Use filtered sessions
  const sessionsToDisplay = filter.categoryId || filter.dateRange || filter.searchQuery
    ? filteredSessions
    : sessions;

  const handleStartSession = () => {
    navigation.navigate('StartSession' as never);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilter({ ...filter, searchQuery: '' });
    Keyboard.dismiss();
  };

  const hasActiveFilters = filter.categoryId || filter.dateRange || searchQuery;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <CustomHeader />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
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
      >
        <EnergyRingCard
          hours={todayHours}
          minutes={todayMinutes}
          percentageChange={percentageChange}
        />

        {/* Mini Stats - Centered */}
        <View style={styles.miniStatsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.miniStatsScroll}
            style={styles.miniStatsContainer}
          >
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
          </ScrollView>
        </View>

        <View style={styles.categoriesGrid}>
          <CategoryProgressCard
            icon="briefcase"
            title="Work"
            progress={workProgress}
            color="#38BDF8"
            gradientColors={['#38BDF8', '#67E8F9']}
          />
          <CategoryProgressCard
            icon="school"
            title="Study"
            progress={studyProgress}
            color="#34D399"
            gradientColors={['#34D399', '#67E8F9']}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            placeholder="Search by title or notes..."
          />
        </View>

        <FilterChips />

        {/* Sessions Header with Count */}
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

        <View style={styles.sessionsList}>
          {sessionsToDisplay.length === 0 ? (
            <GlassCard>
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
          ) : (
            sessionsToDisplay
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .slice(0, 20)
              .map((session) => (
                <SwipeableSessionCard
                  key={session.id}
                  session={session}
                />
              ))
          )}
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 120,
    paddingBottom: theme.spacing[8],
  },
  miniStatsWrapper: {
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  miniStatsContainer: {
    flexGrow: 0,
  },
  miniStatsScroll: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
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
  sessionsList: {
    paddingHorizontal: theme.spacing[4],
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