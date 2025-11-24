import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, G, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { theme } from '../theme/theme';
import { useSessions } from '../stores/useSessionStore';
import { useCategories } from '../stores/useCategoryStore';
import { GlassCard } from '../components/GlassCard';
import { typography, fonts } from '../utils/typography';

type TimeRange = 'week' | 'month' | 'year';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_PADDING = 32;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2;
const CHART_HEIGHT = 160;

export default function StatsScreen() {
  const navigation = useNavigation();
  const sessions = useSessions();
  const categories = useCategories();
  const insets = useSafeAreaInsets();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const filteredSessions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return sessions.filter(s => new Date(s.startedAt) >= startDate);
  }, [sessions, timeRange]);

  const stats = useMemo(() => {
    const totalDurationMs = filteredSessions.reduce((sum, s) => sum + s.durationMs, 0);
    const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
    const avgDurationMs = filteredSessions.length > 0 ? totalDurationMs / filteredSessions.length : 0;
    const avgMinutes = Math.round(avgDurationMs / (1000 * 60));

    const sortedByDate = [...filteredSessions].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

    let growthPercent = 0;
    if (sortedByDate.length >= 4) {
      const midPoint = Math.floor(sortedByDate.length / 2);
      const firstHalf = sortedByDate.slice(0, midPoint);
      const secondHalf = sortedByDate.slice(midPoint);

      const firstHalfMs = firstHalf.reduce((sum, s) => sum + s.durationMs, 0);
      const secondHalfMs = secondHalf.reduce((sum, s) => sum + s.durationMs, 0);

      if (firstHalfMs > 0) {
        const change = ((secondHalfMs - firstHalfMs) / firstHalfMs) * 100;
        growthPercent = Math.max(-99, Math.min(999, Math.round(change)));
      }
    }

    const sessionDates = new Set(
      sessions.map(s => new Date(s.startedAt).toDateString())
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toDateString();
      if (sessionDates.has(dateStr)) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        if (i > 0) {
          tempStreak = 0;
        }
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const lastSessionDate = sessions.length > 0
      ? new Date(Math.max(...sessions.map(s => new Date(s.startedAt).getTime())))
      : null;

    const daysSinceLastSession = lastSessionDate
      ? Math.floor((new Date().getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      totalHours,
      totalMinutes,
      totalSessions: filteredSessions.length,
      avgMinutes,
      growthPercent,
      currentStreak,
      longestStreak,
      lastActive: daysSinceLastSession === 0 ? 'Today' : daysSinceLastSession === 1 ? 'Yesterday' : `${daysSinceLastSession} days ago`,
    };
  }, [filteredSessions, sessions]);

  const chartData = useMemo(() => {
    const data: { label: string; value: number; shortLabel: string }[] = [];
    let maxValue = 1;

    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const label = date.toLocaleDateString('en-US', { weekday: 'short' });
        const shortLabel = label.substring(0, 3).toUpperCase();

        const daySessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.startedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === date.getTime();
        });

        const totalMs = daySessions.reduce((sum, s) => sum + s.durationMs, 0);
        const hours = totalMs / (1000 * 60 * 60);
        if (hours > maxValue) maxValue = hours;

        data.push({ label, value: hours, shortLabel });
      }
    } else if (timeRange === 'month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const shortLabel = day.toString();

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

        data.push({ label: shortLabel, value: hours, shortLabel });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const date = new Date(new Date().getFullYear(), i, 1);
        const label = date.toLocaleDateString('en-US', { month: 'long' });
        const shortLabel = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthSessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.startedAt);
          return sessionDate >= date && sessionDate <= monthEnd;
        });

        const totalMs = monthSessions.reduce((sum, s) => sum + s.durationMs, 0);
        const hours = totalMs / (1000 * 60 * 60);
        if (hours > maxValue) maxValue = hours;

        data.push({ label, value: hours, shortLabel });
      }
    }

    return { data, maxValue: Math.max(maxValue, 1) };
  }, [filteredSessions, timeRange]);

  const categoryStats = useMemo(() => {
    const statsMap = new Map();

    categories.forEach(cat => {
      statsMap.set(cat.id, {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
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

  const renderBarChart = () => {
    const { data, maxValue } = chartData;
    if (data.length === 0) return null;

    const barWidth = (CHART_WIDTH / data.length) * 0.6;
    const barSpacing = CHART_WIDTH / data.length;
    const availableHeightForBars = CHART_HEIGHT - 24; 

    return (
      <View style={styles.chartContainer}>
        <View style={styles.barChartWrapper}>
          {data.map((point, index) => {
            const heightPercent = (point.value / maxValue) * 100;
            const barHeight = Math.max(availableHeightForBars * (heightPercent / 100), 3);

            return (
              <View key={index} style={[styles.barContainer, { width: barSpacing }]}>
                <View style={styles.barColumn}>
                  <LinearGradient
                    colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                    style={[styles.bar, { height: barHeight, width: barWidth }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </View>
                <Text style={styles.barLabel}>{point.shortLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const { data, maxValue } = chartData;
    if (data.length === 0) return null;

    const points: { x: number; y: number; value: number }[] = [];
    const padding = 10;
    const LABELS_HEIGHT = 24;
    const GRAPH_HEIGHT = CHART_HEIGHT - LABELS_HEIGHT;
    const availableHeight = GRAPH_HEIGHT - padding * 2;

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * CHART_WIDTH;
      const normalizedValue = point.value / maxValue;
      const y = padding + availableHeight * (1 - normalizedValue);
      points.push({ x, y, value: point.value });
    });

    const smoothPath = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      
      const prevPoint = points[index - 1];
      const controlX1 = prevPoint.x + (point.x - prevPoint.x) * 0.33;
      const controlY1 = prevPoint.y;
      const controlX2 = prevPoint.x + (point.x - prevPoint.x) * 0.67;
      const controlY2 = point.y;

      return `C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${point.x} ${point.y}`;
    }).join(' ');

    const areaPath = `${smoothPath} L ${points[points.length - 1].x} ${GRAPH_HEIGHT} L ${points[0].x} ${GRAPH_HEIGHT} Z`;

    const showEveryNth = Math.ceil(data.length / 7);

    return (
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.svgChart}>
          <Defs>
            <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.primary.cyan} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={theme.colors.primary.cyan} stopOpacity="0" />
            </SvgGradient>
            <SvgGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={theme.colors.primary.aqua} />
              <Stop offset="50%" stopColor={theme.colors.primary.cyan} />
              <Stop offset="100%" stopColor={theme.colors.primary.aqua} />
            </SvgGradient>
          </Defs>

          <Path d={areaPath} fill="url(#areaGradient)" />
          <Path 
            d={smoothPath} 
            stroke="url(#lineGradient)" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            point.value > 0 && (
              <Circle 
                key={index} 
                cx={point.x} 
                cy={point.y} 
                r="4" 
                fill={theme.colors.primary.cyan}
                opacity="0.9"
              />
            )
          ))}
        </Svg>

        <View style={styles.lineChartLabels}>
          {data.map((point, index) => {
            if (index % showEveryNth === 0 || index === data.length - 1) {
              const x = (index / (data.length - 1)) * CHART_WIDTH;
              return (
                <Text 
                  key={index} 
                  style={[styles.lineChartLabel, { position: 'absolute', left: x - 15, width: 30 }]}
                >
                  {point.shortLabel}
                </Text>
              );
            }
            return null;
          })}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    if (categoryStats.length === 0) return null;

    const total = categoryStats.reduce((sum, stat) => sum + stat.percentage, 0);
    if (total === 0) return null;

    const radius = 70;
    const centerX = 90;
    const centerY = 90;
    const strokeWidth = 24;

    let cumulativePercent = 0;

    return (
      <Svg width={180} height={180}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={theme.colors.glass.light}
          strokeWidth={strokeWidth}
        />

        {categoryStats.slice(0, 4).map((stat, index) => {
          const startAngle = (cumulativePercent / 100) * 360 - 90;
          const endAngle = ((cumulativePercent + stat.percentage) / 100) * 360 - 90;
          cumulativePercent += stat.percentage;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = centerX + radius * Math.cos(startRad);
          const y1 = centerY + radius * Math.sin(startRad);
          const x2 = centerX + radius * Math.cos(endRad);
          const y2 = centerY + radius * Math.sin(endRad);

          const largeArc = stat.percentage > 50 ? 1 : 0;

          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          ].join(' ');

          return (
            <Path
              key={stat.categoryId}
              d={pathData}
              fill="none"
              stroke={stat.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}

        <G>
          <SvgText
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            fill={theme.colors.text.primary}
          >
            {categoryStats.length}
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            fontSize="14"
            fill={theme.colors.text.tertiary}
          >
            Categories
          </SvgText>
        </G>
      </Svg>
    );
  };

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Statistics</Text>
            <Text style={styles.headerSubtitle}>Track your productivity</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => navigation.navigate('Calendar' as never)}
          >
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.timeRangeSelector}>
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
                onPress={() => setTimeRange(range)}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeRangeButtonText, timeRange === range && styles.timeRangeButtonTextActive]}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <GlassCard style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>Total Time Spent</Text>
                <Text style={styles.heroValue}>
                  {stats.totalHours}h {stats.totalMinutes}m
                </Text>
                <Text style={styles.heroSubtext}>
                  across {stats.totalSessions} {stats.totalSessions === 1 ? 'session' : 'sessions'}
                </Text>
              </View>
              {stats.currentStreak > 0 && (
                <View style={styles.heroStreakBadge}>
                  <Text style={styles.heroStreakEmoji}>🔥</Text>
                  <View>
                    <Text style={styles.heroStreakNumber}>{stats.currentStreak}</Text>
                    <Text style={styles.heroStreakLabel}>Day Streak</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary.cyan + '20' }]}>
                  <Ionicons name="layers-outline" size={20} color={theme.colors.primary.cyan} />
                </View>
                <Text style={styles.statValue}>{stats.totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary.mint + '20' }]}>
                  <Ionicons name="timer-outline" size={20} color={theme.colors.primary.mint} />
                </View>
                <Text style={styles.statValue}>{stats.avgMinutes}m</Text>
                <Text style={styles.statLabel}>Avg Session</Text>
              </View>
            </View>

            {stats.growthPercent !== 0 && filteredSessions.length >= 4 && (
              <View style={styles.growthBanner}>
                <Ionicons
                  name={stats.growthPercent >= 0 ? 'trending-up' : 'trending-down'}
                  size={18}
                  color={stats.growthPercent >= 0 ? theme.colors.success : theme.colors.danger}
                />
                <Text style={styles.growthText}>
                  <Text style={[styles.growthPercent, { color: stats.growthPercent >= 0 ? theme.colors.success : theme.colors.danger }]}>
                    {stats.growthPercent >= 0 ? '+' : ''}{stats.growthPercent}%
                  </Text>
                  {' '}from previous period
                </Text>
              </View>
            )}
          </GlassCard>

          <GlassCard style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Productivity Over Time</Text>
              <Text style={styles.chartSubtitle}>
                {timeRange === 'week' && 'Last 7 days'}
                {timeRange === 'month' && 'This month'}
                {timeRange === 'year' && 'This year'}
              </Text>
            </View>
            {timeRange === 'month' ? renderLineChart() : renderBarChart()}
          </GlassCard>

          {stats.currentStreak > 0 && (
            <GlassCard style={styles.streakCard}>
              <View style={styles.streakContent}>
                <View style={styles.streakIconWrapper}>
                  <View style={styles.streakIconBg}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                  </View>
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakTitle}>{stats.currentStreak} Day Streak</Text>
                  <Text style={styles.streakDescription}>You're on fire! Keep it up.</Text>
                </View>
              </View>
              <View style={styles.streakStats}>
                <View style={styles.streakStatBox}>
                  <Text style={styles.streakStatValue}>{stats.longestStreak} days</Text>
                  <Text style={styles.streakStatLabel}>Longest Streak</Text>
                </View>
                <View style={styles.streakStatBox}>
                  <Text style={styles.streakStatValue}>{stats.lastActive}</Text>
                  <Text style={styles.streakStatLabel}>Last Active</Text>
                </View>
              </View>
            </GlassCard>
          )}

          <Text style={styles.sectionTitle}>Category Breakdown</Text>

          {categoryStats.length > 0 ? (
            <>
              <GlassCard style={styles.pieCard}>
                <View style={styles.pieContainer}>
                  {renderPieChart()}
                </View>
              </GlassCard>

              <View style={styles.categoryList}>
                {categoryStats.map((stat, index) => (
                  <GlassCard key={stat.categoryId} style={styles.categoryCard}>
                    <View style={styles.categoryContent}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryIcon, { backgroundColor: stat.color + '20' }]}>
                          <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                        </View>
                        <View style={styles.categoryTextContainer}>
                          <Text style={styles.categoryName}>{stat.name}</Text>
                          <Text style={styles.categoryMeta}>
                            {Math.floor(stat.totalMs / (1000 * 60 * 60))}h {Math.floor((stat.totalMs % (1000 * 60 * 60)) / (1000 * 60))}m
                            <Text style={styles.categoryMetaLight}> / {stat.count} sessions</Text>
                          </Text>
                        </View>
                      </View>
                      <View style={styles.categoryPercentageBadge}>
                        <Text style={styles.categoryPercentageText}>{stat.percentage.toFixed(0)}%</Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <LinearGradient
                        colors={[stat.color, stat.color + 'CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBar, { width: `${stat.percentage}%` }]}
                      />
                    </View>
                  </GlassCard>
                ))}
              </View>
            </>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="analytics-outline" size={64} color={theme.colors.text.quaternary} />
              </View>
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start tracking your sessions to see detailed statistics and insights
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('StartSession' as never)}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={styles.emptyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Start Session</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          )}

          <View style={{ height: insets.bottom + 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[7],
    paddingBottom: theme.spacing[4],
  },
  headerTitle: {
    ...typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: theme.colors.text.tertiary,
  },
  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.glass.background,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[1],
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: theme.spacing[2.5],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary.cyan,
    ...theme.shadows.glowCyan,
  },
  timeRangeButtonText: {
    fontFamily: fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  timeRangeButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  heroCard: {
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[5],
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    fontFamily: fonts.bold,
    fontSize: 42,
    color: theme.colors.text.primary,
    letterSpacing: -1.5,
    marginBottom: theme.spacing[1],
  },
  heroSubtext: {
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  heroStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  heroStreakEmoji: {
    fontSize: 28,
  },
  heroStreakNumber: {
    fontFamily: fonts.bold,
    fontSize: theme.fontSize.xl,
    color: '#FFB74D',
  },
  heroStreakLabel: {
    ...typography.caption,
    color: '#FFB74D',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.glass.border,
  },
  growthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.glass.border,
  },
  growthText: {
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  growthPercent: {
    fontFamily: fonts.bold,
  },
  chartCard: {
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  chartHeader: {
    marginBottom: theme.spacing[4],
  },
  chartTitle: {
    ...typography.bodyMedium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  chartSubtitle: {
    ...typography.caption,
    color: theme.colors.text.quaternary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartContainer: {
    height: CHART_HEIGHT,
  },
  barChartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingBottom: 0,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barColumn: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 6,
    minHeight: 3,
    shadowColor: theme.colors.primary.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  barLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: theme.colors.text.quaternary,
    marginTop: theme.spacing[1],
    textAlign: 'center',
    paddingBottom: 4,
  },
  svgChart: {
    marginBottom: 0,
  },
  lineChartLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  lineChartLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: theme.colors.text.quaternary,
    textAlign: 'center',
  },
  streakCard: {
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[5],
  },
  streakIconWrapper: {
    position: 'relative',
  },
  streakIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  streakDescription: {
    ...typography.bodySmall,
    color: theme.colors.text.tertiary,
  },
  streakStats: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  streakStatBox: {
    flex: 1,
    backgroundColor: theme.colors.glass.light,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  streakStatValue: {
    ...typography.bodyMedium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  streakStatLabel: {
    ...typography.caption,
    color: theme.colors.text.quaternary,
  },
  sectionTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  pieCard: {
    padding: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: {
    gap: theme.spacing[3],
  },
  categoryCard: {
    padding: theme.spacing[4],
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    ...typography.bodyMedium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  categoryMeta: {
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
    fontFamily: fonts.semibold,
  },
  categoryMetaLight: {
    color: theme.colors.text.tertiary,
    fontFamily: fonts.medium,
  },
  categoryPercentageBadge: {
    backgroundColor: theme.colors.glass.medium,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.lg,
  },
  categoryPercentageText: {
    ...typography.bodySmall,
    fontFamily: fonts.bold,
    color: theme.colors.text.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.glass.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  emptyCard: {
    padding: theme.spacing[8],
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    ...typography.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  emptyButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
  },
  emptyButtonText: {
    ...typography.buttonLarge,
    color: '#fff',
  },
});