import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, memo, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { theme } from '../theme/theme';
import { Session, RootStackNavigationProp } from '../types';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useSessionStore } from '../stores/useSessionStore';

interface SwipeableSessionCardProps {
  session: Session;
}

/**
 * ✅ OPTIMIZED: Swipeable card with performance fixes
 * 
 * CHANGES:
 * - Added React.memo to prevent unnecessary re-renders
 * - Memoized PanResponder creation (moved to useMemo)
 * - Memoized all callbacks
 * - Optimized date/time formatting
 * - Fixed gesture conflicts with navigation
 */
function SwipeableSessionCardComponent({ session }: SwipeableSessionCardProps) {
  const { deleteSession } = useSessionStore();
  const { getCategoryById } = useCategoryStore();
  const navigation = useNavigation<RootStackNavigationProp>();

  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const category = getCategoryById(session.categoryId);

  // ✅ Memoize expensive formatting functions
  const formattedDuration = useMemo(() => {
    const totalMinutes = Math.floor(session.durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [session.durationMs]);

  const formattedDate = useMemo(() => {
    const date = new Date(session.startedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, [session.startedAt]);

  // ✅ Memoized callbacks
  const handleEdit = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    lastOffset.current = 0;

    navigation.navigate('EditSession', { sessionId: session.id });
  }, [translateX, navigation, session.id]);

  const handleDelete = useCallback(async () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    lastOffset.current = 0;

    Alert.alert(
      '🗑️ Delete Session',
      `"${session.title}"\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteSession(session.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [translateX, session.title, session.id, deleteSession]);

  const handleViewDetails = useCallback(() => {
    navigation.navigate('SessionDetails', { sessionId: session.id });
  }, [navigation, session.id]);

  // ✅ OPTIMIZATION: Memoize PanResponder (was recreated every render)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isDeleting,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // ✅ GESTURE FIX: Require more horizontal movement to avoid conflicts
          return Math.abs(gestureState.dx) > 10 && 
                 Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && 
                 !isDeleting;
        },
        onPanResponderGrant: () => {
          translateX.setOffset(lastOffset.current);
          translateX.setValue(0);
        },
        onPanResponderMove: (_, gestureState) => {
          // Only allow left swipe
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldOpen = gestureState.dx < -80;
          const toValue = shouldOpen ? -120 : 0;

          lastOffset.current = toValue;
          translateX.flattenOffset();

          Animated.spring(translateX, {
            toValue,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        },
        // ✅ GESTURE FIX: Terminate gesture if it conflicts with navigation
        onPanResponderTerminationRequest: () => lastOffset.current === 0,
      }),
    [isDeleting, translateX]
  );

  if (isDeleting) {
    return (
      <View style={styles.deletingContainer}>
        <GlassCard style={styles.card}>
          <View style={styles.deletingContent}>
            <ActivityIndicator size="small" color={theme.colors.primary.cyan} />
            <Text style={styles.deletingText}>Deleting...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={22} color="#fff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={22} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleViewDetails}
          style={{ flex: 1 }}
        >
          <GlassCard style={styles.card}>
            <View style={styles.content}>
              {category && (
                <View
                  style={[
                    styles.categoryIndicator,
                    { backgroundColor: category.color },
                  ]}
                />
              )}
              <View style={styles.mainContent}>
                <Text style={styles.title} numberOfLines={1}>
                  {session.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{formattedDuration}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.meta}>{category?.name || 'General'}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.meta}>{formattedDate}</Text>
                </View>
                {session.notes && (
                  <Text style={styles.notes} numberOfLines={2}>
                    {session.notes}
                  </Text>
                )}
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ✅ Custom comparison function for React.memo
const areEqual = (
  prevProps: SwipeableSessionCardProps,
  nextProps: SwipeableSessionCardProps
): boolean => {
  return (
    prevProps.session.id === nextProps.session.id &&
    prevProps.session.title === nextProps.session.title &&
    prevProps.session.durationMs === nextProps.session.durationMs &&
    prevProps.session.notes === nextProps.session.notes &&
    prevProps.session.categoryId === nextProps.session.categoryId &&
    prevProps.session.startedAt === nextProps.session.startedAt
  );
};

// ✅ Export memoized component
export const SwipeableSessionCard = memo(SwipeableSessionCardComponent, areEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.borderRadius['2xl'],
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: theme.spacing[2],
    gap: theme.spacing[2],
    zIndex: 1,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[0.5],
  },
  actionText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: theme.colors.primary.cyan,
    ...theme.shadows.glowCyan,
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContainer: {
    width: '100%',
    zIndex: 10,
    backgroundColor: theme.colors.background.primary,
  },
  card: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    padding: theme.spacing[4],
  },
  categoryIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: theme.spacing[3],
  },
  mainContent: {
    flex: 1,
    paddingRight: theme.spacing[2],
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  metaDivider: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginHorizontal: theme.spacing[1],
  },
  notes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    marginTop: theme.spacing[1],
  },
  deletingContainer: {
    marginBottom: theme.spacing[3],
  },
  deletingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  deletingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.medium,
  },
});