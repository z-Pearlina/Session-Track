import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useSessionStore } from '../stores/useSessionStore';
import { CustomHeader } from '../components/CustomHeader';
import { EnergyRingCard } from '../components/EnergyRingCard';
import { MiniStatCard } from '../components/MiniStatCard';
import { CategoryProgressCard } from '../components/CategoryProgressCard';
import { GlassCard } from '../components/GlassCard';
import { FABButton } from '../components/FABButton';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { sessions, loadSessions } = useSessionStore();

  useEffect(() => {
    loadSessions();
  }, []);

  // Calculate stats
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.startedAt);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const todayTotalMs = todaySessions.reduce((sum, s) => sum + s.durationMs, 0);
  const todayHours = Math.floor(todayTotalMs / (1000 * 60 * 60));
  const todayMinutes = Math.floor((todayTotalMs % (1000 * 60 * 60)) / (1000 * 60));

  const formatDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStartSession = () => {
    navigation.navigate('StartSession' as never);
  };

  return (
    <View style={styles.root}>
      {/* Animated background gradient */}
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      {/* Custom Header */}
      <CustomHeader />

      {/* Main content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Energy Ring Hero Card */}
        <EnergyRingCard
          hours={todayHours}
          minutes={todayMinutes}
          percentageChange={15}
        />

        {/* Mini Stats Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.miniStatsScroll}
          style={styles.miniStatsContainer}
        >
          <MiniStatCard icon="flame" value="12 Days" label="Streak" />
          <MiniStatCard icon="flag" value="75%" label="Goal Progress" />
          <MiniStatCard icon="timer" value="47 min" label="Avg Session" />
          <MiniStatCard icon="happy" value="Focused" label="Focus Mood" />
        </ScrollView>

        {/* Category Cards Grid */}
        <View style={styles.categoriesGrid}>
          <CategoryProgressCard
            icon="briefcase"
            title="Work"
            progress={70}
            color="#38BDF8"
            gradientColors={['#38BDF8', '#67E8F9']}
          />
          <CategoryProgressCard
            icon="school"
            title="Study"
            progress={45}
            color="#34D399"
            gradientColors={['#34D399', '#67E8F9']}
          />
        </View>

        {/* Recent Sessions */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>

        <View style={styles.sessionsList}>
          {/* Timeline line */}
          <View style={styles.timelineLine} />

          {sessions.length === 0 ? (
            <GlassCard>
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap "Start Session" below to begin tracking
                </Text>
              </View>
            </GlassCard>
          ) : (
            sessions
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .slice(0, 10)
              .map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  {/* Timeline dot */}
                  <View style={styles.timelineDot} />
                  
                  {/* Session card */}
                  <GlassCard style={styles.sessionCard}>
                    <View style={styles.sessionContent}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionMeta}>
                        {formatDuration(session.durationMs)} • {session.categoryId === 'default' ? 'Work' : session.categoryId}
                      </Text>
                    </View>
                  </GlassCard>
                </View>
              ))
          )}
        </View>

        {/* Bottom padding for FAB and nav */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* FAB */}
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
    paddingHorizontal: theme.spacing[4],
    paddingTop: 112, // Account for custom header
    paddingBottom: theme.spacing[8],
  },
  miniStatsContainer: {
    marginBottom: theme.spacing[8],
    marginHorizontal: -theme.spacing[4],
  },
  miniStatsScroll: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  sessionsList: {
    position: 'relative',
    gap: theme.spacing[4],
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 0,
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(103, 232, 249, 0.5)',
    opacity: 0.3,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary.cyan,
    backgroundColor: theme.colors.background.primary,
    marginTop: 8,
  },
  sessionCard: {
    flex: 1,
  },
  sessionContent: {
    padding: theme.spacing[3],
  },
  sessionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  sessionMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
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