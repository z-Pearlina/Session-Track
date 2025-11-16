import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { theme } from '../theme/theme';
import { useSessions } from '../stores/useSessionStore';
import { useCategories } from '../stores/useCategoryStore';
import { GlassCard } from '../components/GlassCard';

/**
 * 📊 ULTIMATE STATS SCREEN
 * 
 * Week: Bar chart (7 bars, one per day)
 * Month: Smooth line chart (all days of current month)
 * Year: Bar chart (12 bars, one per month)
 * All: Horizontally scrollable line chart (entire history)
 */

type TimeRange = 'week' | 'month' | 'year' | 'all';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 200;

export default function StatsScreen() {
  const navigation = useNavigation();
  const sessions = useSessions();
  const categories = useCategories();

  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const scrollX = useRef(new Animated.Value(0)).current;

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // Current month only
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        return sessions;
    }

    return sessions.filter(s => new Date(s.startedAt) >= startDate);
  }, [sessions, timeRange]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalDurationMs = filteredSessions.reduce((sum, s) => sum + s.durationMs, 0);
    const totalHours = totalDurationMs / (1000 * 60 * 60);
    const totalSessions = filteredSessions.length;
    const avgDurationMs = totalSessions > 0 ? totalDurationMs / totalSessions : 0;

    // Calculate streak
    const sortedSessions = [...sessions]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (diffDays > streak) {
        break;
      }
    }

    // Calculate growth percentage
    let growthPercent = 0;
    if (timeRange !== 'all' && filteredSessions.length > 0) {
      const halfwayPoint = Math.floor(filteredSessions.length / 2);
      const firstHalf = filteredSessions.slice(0, halfwayPoint);
      const secondHalf = filteredSessions.slice(halfwayPoint);

      const firstHalfHours = firstHalf.reduce((sum, s) => sum + s.durationMs, 0) / (1000 * 60 * 60);
      const secondHalfHours = secondHalf.reduce((sum, s) => sum + s.durationMs, 0) / (1000 * 60 * 60);

    
      const MIN_HOURS = 0.1; // 6 minutes minimum
      if (firstHalfHours >= MIN_HOURS) {
        const raw = ((secondHalfHours - firstHalfHours) / firstHalfHours) * 100;
        growthPercent = Math.max(-100, Math.min(999, raw)); // Cap: -100% to +999%
      } else if (secondHalfHours > 0) {
        growthPercent = 999; 
      }
    }

    return {
      totalHours: totalHours.toFixed(1),
      totalSessions,
      avgMinutes: Math.round(avgDurationMs / (1000 * 60)),
      streak,
      growthPercent: growthPercent.toFixed(0),
      isPositiveGrowth: growthPercent >= 0,
    };
  }, [filteredSessions, sessions, timeRange]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const statsMap = new Map<string, {
      categoryId: string;
      name: string;
      color: string;
      count: number;
      totalMs: number;
      percentage: number;
    }>();

    categories.forEach(cat => {
      statsMap.set(cat.id, {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        count: 0,
        totalMs: 0,
        percentage: 0,
      });
    });

    const totalDurationMs = filteredSessions.reduce((sum, s) => sum + s.durationMs, 0);

    filteredSessions.forEach(session => {
      const stat = statsMap.get(session.categoryId);
      if (stat) {
        stat.count++;
        stat.totalMs += session.durationMs;
      }
    });

    statsMap.forEach(stat => {
      stat.percentage = totalDurationMs > 0 ? (stat.totalMs / totalDurationMs) * 100 : 0;
    });

    return Array.from(statsMap.values())
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.totalMs - a.totalMs);
  }, [filteredSessions, categories]);

  // Chart data - ADAPTIVE based on view
  const chartData = useMemo(() => {
    const data: { label: string; shortLabel: string; value: number; x: number; y: number; date?: string }[] = [];
    let maxValue = 0;

    if (timeRange === 'week') {
      // WEEK: 7 days - BAR CHART
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const fullLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const shortLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

        const daySessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.startedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === date.getTime();
        });

        const totalMs = daySessions.reduce((sum, s) => sum + s.durationMs, 0);
        const hours = totalMs / (1000 * 60 * 60);
        if (hours > maxValue) maxValue = hours;

        data.push({ label: fullLabel, shortLabel, value: hours, x: 0, y: 0 });
      }
    } else if (timeRange === 'month') {
      // MONTH: All days of current month - SMOOTH LINE CHART
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const shortLabel = day.toString();
        const fullLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Only show data for days that have passed
        let hours = 0;
        if (day <= today) {
          const daySessions = filteredSessions.filter(s => {
            const sessionDate = new Date(s.startedAt);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === date.getTime();
          });

          const totalMs = daySessions.reduce((sum, s) => sum + s.durationMs, 0);
          hours = totalMs / (1000 * 60 * 60);
        }

        if (hours > maxValue) maxValue = hours;

        // Show label every 5 days
        const showLabel = day % 5 === 0 || day === 1 || day === today;

        data.push({
          label: fullLabel,
          shortLabel: showLabel ? shortLabel : '',
          value: hours,
          x: 0,
          y: 0,
          date: date.toISOString(),
        });
      }
    } else if (timeRange === 'year') {
      // YEAR: 12 months - BAR CHART
      for (let i = 0; i < 12; i++) {
        const date = new Date(new Date().getFullYear(), i, 1);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'long' });
        const shortLabel = date.toLocaleDateString('en-US', { month: 'short' });

        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthSessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.startedAt);
          return sessionDate >= date && sessionDate <= monthEnd;
        });

        const totalMs = monthSessions.reduce((sum, s) => sum + s.durationMs, 0);
        const hours = totalMs / (1000 * 60 * 60);
        if (hours > maxValue) maxValue = hours;

        data.push({ label: monthLabel, shortLabel, value: hours, x: 0, y: 0 });
      }
    } else {
      // ALL: All days ever - SCROLLABLE LINE CHART
      const sortedSessions = [...sessions].sort((a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      );

      if (sortedSessions.length > 0) {
        const firstDate = new Date(sortedSessions[0].startedAt);
        firstDate.setHours(0, 0, 0, 0);

        const lastDate = new Date();
        lastDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= daysDiff; i++) {
          const date = new Date(firstDate);
          date.setDate(date.getDate() + i);

          const shortLabel = `${date.getMonth() + 1}/${date.getDate()}`;
          const fullLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          const daySessions = sessions.filter(s => {
            const sessionDate = new Date(s.startedAt);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === date.getTime();
          });

          const totalMs = daySessions.reduce((sum, s) => sum + s.durationMs, 0);
          const hours = totalMs / (1000 * 60 * 60);
          if (hours > maxValue) maxValue = hours;

          data.push({ label: fullLabel, shortLabel, value: hours, x: 0, y: 0 });
        }
      }
    }

    // Calculate positions
    const isLineChart = timeRange === 'month' || timeRange === 'all';
    const padding = 20;
    const width = timeRange === 'all' ? Math.max(CHART_WIDTH, data.length * 40) : CHART_WIDTH;
    const graphWidth = width - padding * 2;
    const graphHeight = CHART_HEIGHT - 80;

    data.forEach((point, index) => {
      point.x = padding + (index / (data.length - 1 || 1)) * graphWidth;
      point.y = maxValue > 0
        ? padding + graphHeight - (point.value / maxValue) * graphHeight
        : padding + graphHeight;
    });

    return { data, maxValue, width, isLineChart };
  }, [filteredSessions, sessions, timeRange]);

  // Generate smooth curve path for line charts
  const generateSmoothPath = () => {
    if (chartData.data.length === 0) return '';

    const points = chartData.data;
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      const controlPointX = (current.x + next.x) / 2;
      path += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  // Generate area gradient path
  const generateAreaPath = () => {
    if (chartData.data.length === 0) return '';

    const smoothPath = generateSmoothPath();
    const lastPoint = chartData.data[chartData.data.length - 1];
    const firstPoint = chartData.data[0];

    return `${smoothPath} L ${lastPoint.x} ${CHART_HEIGHT - 60} L ${firstPoint.x} ${CHART_HEIGHT - 60} Z`;
  };

  const TimeRangeButton = ({ range, label }: { range: TimeRange; label: string }) => (
    <TouchableOpacity
      style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
      onPress={() => setTimeRange(range)}
    >
      <Text style={[
        styles.timeRangeButtonText,
        timeRange === range && styles.timeRangeButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderChart = () => {
    if (chartData.isLineChart) {
      // LINE CHART (Month & All)
      const ChartSvg = (
        <Svg width={chartData.width} height={CHART_HEIGHT}>
          <Defs>
            <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.primary.cyan} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={theme.colors.primary.cyan} stopOpacity="0" />
            </SvgGradient>
          </Defs>

          {/* Gradient area under curve */}
          <Path
            d={generateAreaPath()}
            fill="url(#areaGradient)"
          />

          {/* Main curve line */}
          <Path
            d={generateSmoothPath()}
            stroke={theme.colors.primary.cyan}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Data points */}
          {chartData.data.map((point, index) => (
            point.value > 0 && (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={theme.colors.primary.cyan}
                stroke={theme.colors.background.primary}
                strokeWidth="2"
              />
            )
          ))}
        </Svg>
      );

      if (timeRange === 'all') {
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ChartSvg}
          </ScrollView>
        );
      }

      return (
        <>
          {ChartSvg}
          <View style={styles.chartLabels}>
            {chartData.data.map((point, index) => (
              point.shortLabel && (
                <Text key={index} style={styles.chartLabel}>
                  {point.shortLabel}
                </Text>
              )
            ))}
          </View>
        </>
      );
    } else {
      // BAR CHART (Week & Year)
      return (
        <View style={styles.barChartContainer}>
          {chartData.data.map((item, index) => {
            const maxHeight = CHART_HEIGHT - 80;
            const height = chartData.maxValue > 0
              ? (item.value / chartData.maxValue) * maxHeight
              : 0;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barColumn}>
                  <View style={[styles.bar, { height: Math.max(height, 3) }]} />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.shortLabel}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }
  };

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            <TimeRangeButton range="week" label="Week" />
            <TimeRangeButton range="month" label="Month" />
            <TimeRangeButton range="year" label="Year" />
            <TimeRangeButton range="all" label="All" />
          </View>

          {/* Main Stats Card - REDESIGNED */}
          <GlassCard style={styles.mainCard}>
            <View style={styles.mainCardContent}>
              <View style={styles.mainCardLeft}>
                <Text style={styles.mainStatLabel}>TOTAL FOCUS TIME</Text>
                <Text style={styles.mainStatValue}>{overallStats.totalHours}h</Text>
                <Text style={styles.mainStatSubtext}>
                  {overallStats.totalSessions} sessions • {overallStats.avgMinutes} min avg
                </Text>
              </View>
              {overallStats.growthPercent !== '0' && (
                <View style={[
                  styles.trendBadgeLarge,
                  {
                    backgroundColor: overallStats.isPositiveGrowth ? 'transparent' : 'transparent',
                    borderColor: overallStats.isPositiveGrowth ? theme.colors.success : theme.colors.danger,
                  }
                ]}>
                  <Ionicons
                    name={overallStats.isPositiveGrowth ? "trending-up" : "trending-down"}
                    size={18}
                    color={overallStats.isPositiveGrowth ? theme.colors.success : theme.colors.danger}
                  />
                  <Text style={[
                    styles.trendTextLarge,
                    { color: overallStats.isPositiveGrowth ? theme.colors.success : theme.colors.danger }
                  ]}>
                    {overallStats.isPositiveGrowth ? '' : ''}{overallStats.growthPercent}%
                  </Text>
                </View>
              )}
            </View>
          </GlassCard>

          {/* Chart Card */}
          <GlassCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              {timeRange === 'week' ? 'This Week' :
                timeRange === 'month' ? 'This Month' :
                  timeRange === 'year' ? 'This Year' :
                    'All Time'}
            </Text>
            {timeRange === 'all' && (
              <Text style={styles.chartSubtitle}>Scroll to explore →</Text>
            )}

            <View style={styles.chartContainer}>
              {renderChart()}
            </View>
          </GlassCard>

          {/* Quick Stats Grid */}
          <View style={styles.quickStatsGrid}>
            <GlassCard style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                <Ionicons name="flame" size={24} color={theme.colors.warning} />
              </View>
              <Text style={styles.quickStatValue}>{overallStats.streak}</Text>
              <Text style={styles.quickStatLabel}>Day Streak</Text>
            </GlassCard>

            <GlassCard style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              </View>
              <Text style={styles.quickStatValue}>{overallStats.totalSessions}</Text>
              <Text style={styles.quickStatLabel}>Sessions</Text>
            </GlassCard>

            <GlassCard style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.primary.aqua + '20' }]}>
                <Ionicons name="trending-up" size={24} color={theme.colors.primary.aqua} />
              </View>
              <Text style={styles.quickStatValue}>{overallStats.avgMinutes}m</Text>
              <Text style={styles.quickStatLabel}>Avg Time</Text>
            </GlassCard>
          </View>

          {/* Category Breakdown */}
          {categoryStats.length > 0 && (
            <View style={styles.categorySection}>
              <View style={styles.categorySectionHeader}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                <TouchableOpacity style={styles.categoryMenuButton}>
                  <Ionicons name="menu" size={24} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              </View>
              {categoryStats.slice(0, 3).map((stat) => (
                <GlassCard key={stat.categoryId} style={styles.categoryCard}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: stat.color }]} />
                      <Text style={styles.categoryName}>{stat.name}</Text>
                    </View>
                    <Text style={styles.categoryTime}>
                      {(stat.totalMs / (1000 * 60 * 60)).toFixed(1)}h
                    </Text>
                  </View>
                  <View style={styles.categoryBarContainer}>
                    <View
                      style={[
                        styles.categoryBar,
                        { width: `${stat.percentage}%`, backgroundColor: stat.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryPercentage}>{stat.percentage.toFixed(0)}% of total time</Text>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="bar-chart-outline" size={64} color={theme.colors.text.quaternary} />
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start tracking sessions to see your statistics
              </Text>
            </GlassCard>
          )}

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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: theme.spacing[2.5],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.glass.light,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary.cyan,
    borderColor: theme.colors.primary.cyan,
  },
  timeRangeButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.tertiary,
  },
  timeRangeButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  mainCard: {
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainCardLeft: {
    flex: 1,
  },
  mainStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  mainStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  trendText: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
  },
  trendTextLarge: {
    fontSize: 15,
    fontWeight: theme.fontWeight.bold,
  },
  mainStatValue: {
    fontSize: 64,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
    lineHeight: 72,
    letterSpacing: -2,
  },
  mainStatSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.medium,
  },
  chartCard: {
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
    overflow: 'visible',
  },
  chartHeader: {
    marginBottom: theme.spacing[4],
  },
  chartTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  chartSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  chartContainer: {
    height: CHART_HEIGHT,
  },
  barChartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingTop: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: 50,
  },
  barColumn: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
    minWidth: 12,
  },
  bar: {
    width: '100%',
    backgroundColor: theme.colors.primary.cyan,
    borderRadius: 4,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 1,
  },
  chartLabelsScrollable: {
    height: 20,
    marginTop: 8,
    position: 'relative',
  },
  chartLabel: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.medium,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  quickStatCard: {
    flex: 1,
    padding: theme.spacing[5],
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  quickStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.primary,
  },
  quickStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },
  categorySection: {
    marginBottom: theme.spacing[4],
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  categoryMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  categoryCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  categoryTime: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: theme.colors.glass.medium,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing[2],
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  emptyCard: {
    padding: theme.spacing[8],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});