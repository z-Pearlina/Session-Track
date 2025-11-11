import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useSessionStore } from '../stores/useSessionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { GlassCard } from '../components/GlassCard';
import { RootStackParamList, RootStackNavigationProp } from '../types';

type SessionDetailsRouteProp = RouteProp<RootStackParamList, 'SessionDetails'>;

export default function SessionDetailsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<SessionDetailsRouteProp>();
  const { sessionId } = route.params;

  const { sessions, deleteSession } = useSessionStore();
  const { getCategoryById } = useCategoryStore();

  const session = sessions.find(s => s.id === sessionId);
  const category = session ? getCategoryById(session.categoryId) : null;

  if (!session) {
    return (
      <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={theme.colors.danger} />
            <Text style={styles.errorText}>Session not found</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleEdit = () => {
    navigation.navigate('EditSession', { sessionId: session.id });
  };

  const handleDelete = () => {
    Alert.alert(
      '🗑️ Delete Session',
      `"${session.title}"\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Details</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={24} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title Card */}
          <GlassCard style={styles.titleCard}>
            <View style={styles.titleContent}>
              {category && (
                <View
                  style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}
                >
                  <Ionicons name={category.icon as any} size={20} color={category.color} />
                  <Text style={[styles.categoryBadgeText, { color: category.color }]}>
                    {category.name}
                  </Text>
                </View>
              )}
              <Text style={styles.sessionTitle}>{session.title}</Text>
            </View>
          </GlassCard>

          {/* Duration Card */}
          <GlassCard style={styles.durationCard}>
            <View style={styles.durationContent}>
              <View style={styles.durationIconContainer}>
                <Ionicons name="timer" size={32} color={theme.colors.primary.cyan} />
              </View>
              <View style={styles.durationInfo}>
                <Text style={styles.durationLabel}>Duration</Text>
                <Text style={styles.durationValue}>{formatDuration(session.durationMs)}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Time Info Cards */}
          <View style={styles.timeCardsRow}>
            <GlassCard style={styles.timeCard}>
              <View style={styles.timeCardContent}>
                <Ionicons name="play-circle" size={24} color={theme.colors.success} />
                <Text style={styles.timeCardLabel}>Started</Text>
                <Text style={styles.timeCardValue}>
                  {new Date(session.startedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.timeCardDate}>
                  {new Date(session.startedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.timeCard}>
              <View style={styles.timeCardContent}>
                <Ionicons name="stop-circle" size={24} color={theme.colors.danger} />
                <Text style={styles.timeCardLabel}>Ended</Text>
                <Text style={styles.timeCardValue}>
                  {new Date(session.endedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.timeCardDate}>
                  {new Date(session.endedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </GlassCard>
          </View>

          {/* Notes Card */}
          {session.notes && (
            <GlassCard style={styles.notesCard}>
              <View style={styles.notesContent}>
                <View style={styles.notesHeader}>
                  <Ionicons name="document-text" size={20} color={theme.colors.primary.cyan} />
                  <Text style={styles.notesLabel}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{session.notes}</Text>
              </View>
            </GlassCard>
          )}

          {/* Metadata Card */}
          <GlassCard style={styles.metadataCard}>
            <View style={styles.metadataContent}>
              <View style={styles.metadataRow}>
                <Ionicons name="calendar" size={18} color={theme.colors.text.tertiary} />
                <Text style={styles.metadataLabel}>Created:</Text>
                <Text style={styles.metadataValue}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Ionicons name="refresh" size={18} color={theme.colors.text.tertiary} />
                <Text style={styles.metadataLabel}>Updated:</Text>
                <Text style={styles.metadataValue}>
                  {new Date(session.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Ionicons name="finger-print" size={18} color={theme.colors.text.tertiary} />
                <Text style={styles.metadataLabel}>ID:</Text>
                <Text style={styles.metadataValue} numberOfLines={1}>
                  {session.id}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButtonLarge} onPress={handleEdit}>
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <Ionicons name="pencil" size={20} color={theme.colors.text.inverse} />
                <Text style={styles.editButtonText}>Edit Session</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButtonLarge} onPress={handleDelete}>
              <View style={styles.deleteButtonContent}>
                <Ionicons name="trash" size={20} color={theme.colors.danger} />
                <Text style={styles.deleteButtonText}>Delete Session</Text>
              </View>
            </TouchableOpacity>
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
    paddingTop: theme.spacing[4],
  },
  titleCard: {
    marginBottom: theme.spacing[4],
  },
  titleContent: {
    padding: theme.spacing[5],
    gap: theme.spacing[3],
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    paddingVertical: theme.spacing[1.5],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  sessionTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: 32,
  },
  durationCard: {
    marginBottom: theme.spacing[4],
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[5],
    gap: theme.spacing[4],
  },
  durationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.cyan + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationInfo: {
    flex: 1,
  },
  durationLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },
  durationValue: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  timeCardsRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  timeCard: {
    flex: 1,
  },
  timeCardContent: {
    padding: theme.spacing[4],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  timeCardLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeCardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  timeCardDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  notesCard: {
    marginBottom: theme.spacing[4],
  },
  notesContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  notesLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  notesText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  metadataCard: {
    marginBottom: theme.spacing[6],
  },
  metadataContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[2.5],
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  metadataLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    width: 70,
  },
  metadataValue: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  actionsContainer: {
    gap: theme.spacing[3],
  },
  editButtonLarge: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[4],
  },
  editButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  deleteButtonLarge: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.danger + '40',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[4],
  },
  deleteButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.danger,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
    gap: theme.spacing[4],
  },
  errorText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  backButton: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.primary.cyan,
    borderRadius: theme.borderRadius.full,
  },
  backButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});