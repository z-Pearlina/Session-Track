import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useSessionStore } from '../stores/useSessionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { SwipeableSessionCard } from '../components/SwipeableSessionCard';
import { GlassCard } from '../components/GlassCard';

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { sessions, loadSessions } = useSessionStore();
  const { categories } = useCategoryStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSessions();
  }, []);

  // Create marked dates object
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
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startedAt).toISOString().split('T')[0];
      return sessionDate === selectedDate;
    }).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
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

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          >
            <Ionicons name="today" size={24} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
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
                      <Text style={styles.statValue}>{selectedDateSessions.length}</Text>
                      <Text style={styles.statLabel}>
                        Session{selectedDateSessions.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            )}
          </View>

          {/* Sessions List */}
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>
              {selectedDateSessions.length > 0
                ? `Sessions (${selectedDateSessions.length})`
                : 'No Sessions'}
            </Text>

            {selectedDateSessions.length === 0 ? (
              <GlassCard>
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color={theme.colors.text.quaternary} />
                  <Text style={styles.emptyText}>No sessions on this day</Text>
                  <Text style={styles.emptySubtext}>
                    Select a different date or start tracking
                  </Text>
                </View>
              </GlassCard>
            ) : (
              selectedDateSessions.map((session) => (
                <SwipeableSessionCard key={session.id} session={session} />
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
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
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
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
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  emptyState: {
    padding: theme.spacing[8],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});