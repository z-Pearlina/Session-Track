import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  InteractionManager,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useSessions, useLoadSessions } from '../stores/useSessionStore';
import { useCategories } from '../stores/useCategoryStore';
import { SwipeableSessionCard } from '../components/SwipeableSessionCard';
import { GlassCard } from '../components/GlassCard';
import { Session } from '../types';
import { typography, fonts } from '../utils/typography';

// Memoized components
const EmptyState = React.memo(() => (
  <GlassCard>
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={48} color={theme.colors.text.quaternary} />
      <Text style={styles.emptyText}>No sessions on this day</Text>
      <Text style={styles.emptySubtext}>Select a different date or start tracking</Text>
    </View>
  </GlassCard>
));

const StatsCard = React.memo<{ totalHours: number; totalMinutes: number; sessionCount: number }>(
  ({ totalHours, totalMinutes, sessionCount }) => (
    <GlassCard style={styles.statsCard}>
      <View style={styles.statsContent}>
        <View style={styles.statItem}>
          <Ionicons name="time" size={24} color={theme.colors.primary.cyan} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>
              {totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{sessionCount}</Text>
            <Text style={styles.statLabel}>Session{sessionCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>
    </GlassCard>
  )
);

export default function CalendarScreen() {
  const navigation = useNavigation();

  const sessions = useSessions();
  const loadSessions = useLoadSessions();
  const categories = useCategories();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load data with InteractionManager
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadSessions();
    });
    return () => task.cancel();
  }, [loadSessions]);

  // Create marked dates object - marks days with sessions AND today
  const markedDates = useMemo(() => {
    const marked: any = {};

    // Mark all dates that have sessions
    sessions.forEach((session) => {
      const date = new Date(session.startedAt).toISOString().split('T')[0];
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dots: [],
        };
      }
    });

    // Add selected date styling
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary.cyan,
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary.cyan,
      };
    }

    return marked;
  }, [sessions, selectedDate]);

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const sessionDate = new Date(session.startedAt).toISOString().split('T')[0];
        return sessionDate === selectedDate;
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [sessions, selectedDate]);

  // Calculate stats for selected date
  const totalDurationMs = selectedDateSessions.reduce((sum, s) => sum + s.durationMs, 0);
  const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Callbacks
  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleGoToToday = useCallback(() => setSelectedDate(new Date().toISOString().split('T')[0]), []);
  const renderSessionItem = useCallback(({ item }: ListRenderItemInfo<Session>) => (
    <SwipeableSessionCard session={item} />
  ), []);
  const keyExtractor = useCallback((item: Session) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <>
      {/* Calendar */}
      <GlassCard style={styles.calendarCard}>
        <Calendar
          current={selectedDate}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: theme.colors.text.secondary,
            selectedDayBackgroundColor: theme.colors.primary.cyan,
            selectedDayTextColor: theme.colors.text.inverse,
            todayTextColor: theme.colors.primary.cyan,
            dayTextColor: theme.colors.text.primary,
            textDisabledColor: theme.colors.text.quaternary,
            dotColor: theme.colors.primary.cyan,
            selectedDotColor: theme.colors.text.inverse,
            arrowColor: theme.colors.primary.cyan,
            monthTextColor: theme.colors.text.primary,
            textDayFontFamily: fonts.regular,
            textMonthFontFamily: fonts.bold,
            textDayHeaderFontFamily: fonts.semibold,
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />
      </GlassCard>

      {/* Selected Date Info */}
      <View style={styles.dateInfoSection}>
        <Text style={styles.dateLabel}>{formatDate(selectedDate)}</Text>
        {selectedDateSessions.length > 0 && (
          <StatsCard
            totalHours={totalHours}
            totalMinutes={totalMinutes}
            sessionCount={selectedDateSessions.length}
          />
        )}
      </View>

      {/* Sessions List Header */}
      <View style={styles.sessionsSection}>
        <Text style={styles.sectionTitle}>
          {selectedDateSessions.length > 0
            ? `Sessions (${selectedDateSessions.length})`
            : 'No Sessions'}
        </Text>
      </View>
    </>
  ), [selectedDate, handleDayPress, markedDates, formatDate, selectedDateSessions, totalHours, totalMinutes]);

  const ListEmptyComponent = useCallback(() => <EmptyState />, []);
  const ListFooterComponent = useCallback(() => <View style={{ height: 100 }} />, []);

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoToToday}>
            <Ionicons name="today" size={24} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        {/* Optimized FlatList */}
        <FlatList
          data={selectedDateSessions}
          renderItem={renderSessionItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          initialNumToRender={5}
          windowSize={5}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  calendarCard: {
    marginBottom: theme.spacing[4],
    overflow: 'hidden',
  },
  calendar: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[2],
  },
  dateInfoSection: {
    marginBottom: theme.spacing[4],
  },
  dateLabel: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  statsCard: {
    overflow: 'hidden',
  },
  statsContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    ...typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  statLabel: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.glass.border,
    marginHorizontal: theme.spacing[3],
  },
  sessionsSection: {
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  emptyState: {
    padding: theme.spacing[8],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  emptyText: {
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});