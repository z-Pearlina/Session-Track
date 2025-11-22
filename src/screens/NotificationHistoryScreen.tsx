import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { theme } from '../theme/theme';
import { typography, fonts } from '../utils/typography';
import { GlassCard } from '../components/GlassCard';
import {
  useNotificationHistory,
  useUnreadNotificationCount,
  useLoadNotificationHistory,
  useMarkNotificationAsRead,
  useMarkNotificationAsDismissed,
  useClearNotificationHistory,
  useNotificationsLoading,
} from '../stores/useNotificationStore';
import { NotificationHistoryItem } from '../services/NotificationService';

const NotificationHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const history = useNotificationHistory();
  const unreadCount = useUnreadNotificationCount();
  const loadHistory = useLoadNotificationHistory();
  const markAsRead = useMarkNotificationAsRead();
  const markAsDismissed = useMarkNotificationAsDismissed();
  const clearHistory = useClearNotificationHistory();
  const isLoading = useNotificationsLoading();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleNotificationPress = async (item: NotificationHistoryItem) => {
    if (!item.read) {
      await markAsRead(item.id);
    }

    if (item.data?.screen) {
      navigation.navigate(item.data.screen as any, item.data.params);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    await markAsDismissed(notificationId);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all notification history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
          },
        },
      ]
    );
  };

  const handleGoBack = () => navigation.goBack();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_completion':
        return { name: 'checkmark-circle' as const, color: '#10B981' };
      case 'session_reminder':
        return { name: 'time' as const, color: theme.colors.primary.cyan };
      case 'goal_completion':
        return { name: 'flag' as const, color: '#F59E0B' };
      case 'goal_progress':
        return { name: 'trending-up' as const, color: '#F59E0B' };
      case 'streak_reminder':
        return { name: 'flame' as const, color: '#EF4444' };
      case 'streak_milestone':
        return { name: 'flame' as const, color: '#EF4444' };
      case 'achievement_unlocked':
        return { name: 'trophy' as const, color: '#9B59B6' };
      case 'daily_reminder':
        return { name: 'alarm' as const, color: '#FFD700' };
      default:
        return { name: 'notifications' as const, color: theme.colors.text.tertiary };
    }
  };

  const renderNotification = ({ item }: ListRenderItemInfo<NotificationHistoryItem>) => {
    const icon = getNotificationIcon(item.type);
    const isUnread = !item.read && !item.dismissed;

    return (
      <GlassCard style={styles.notificationCard}>
        <TouchableOpacity
          style={[styles.notificationContent, isUnread && styles.unreadCard]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(item.sentAt), { addSuffix: true })}
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismiss(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.glass.light }]}>
        <Ionicons name="notifications-off-outline" size={48} color={theme.colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You'll see your notification history here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.infoCardContainer}>
      <GlassCard style={styles.infoCard}>
        <View style={styles.infoContent}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary.cyan} />
          <Text style={styles.infoText}>
            Track all your notifications in one place. Tap to view details or swipe to dismiss.
          </Text>
        </View>
      </GlassCard>
    </View>
  );

  const visibleHistory = history.filter(item => !item.dismissed);

  return (
    <LinearGradient
      colors={theme.gradients.backgroundAnimated}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {visibleHistory.length > 0 && (
            <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
          {visibleHistory.length === 0 && <View style={styles.headerButton} />}
        </View>

        {/* List */}
        <FlatList
          data={visibleHistory}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={<View style={{ height: 100 }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary.cyan}
              colors={[theme.colors.primary.cyan]}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={5}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  headerTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  badge: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: theme.spacing[4],
  },
  infoCardContainer: {
    marginBottom: theme.spacing[4],
  },
  infoCard: {
    marginTop: theme.spacing[2],
  },
  infoContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  notificationCard: {
    marginBottom: theme.spacing[3],
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.cyan,
    backgroundColor: theme.colors.primary.cyan + '08',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: theme.spacing[1],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  title: {
    ...typography.bodyMedium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  body: {
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  timestamp: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.cyan,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    paddingVertical: theme.spacing[20],
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  emptyTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  emptyText: {
    ...typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[8],
  },
});

export default NotificationHistoryScreen;