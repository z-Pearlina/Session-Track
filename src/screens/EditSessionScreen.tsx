import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useSessions, useUpdateSession, useDeleteSession } from '../stores/useSessionStore';
import { useCategories, useLoadCategories } from '../stores/useCategoryStore';
import { GlassCard } from '../components/GlassCard';
import { validation } from '../services/validation';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';
import { dateUtils } from '../utils/dateUtils';

export default function EditSessionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params as { sessionId: string };

  const sessions = useSessions();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const categories = useCategories();
  const loadCategories = useLoadCategories();
  const session = sessions.find(s => s.id === sessionId);

  const [title, setTitle] = useState(session?.title || '');
  const [notes, setNotes] = useState(session?.notes || '');
  const [selectedCategory, setSelectedCategory] = useState(session?.categoryId || 'work');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      Alert.alert('Error', 'Session not found');
      navigation.goBack();
    }
  }, [session]);

  useEffect(() => {
    loadCategories();
  }, []);

  if (!session) return null;

  const handleSave = async () => {
    const titleError = validation.validateSessionTitle(title);
    if (titleError) {
      Alert.alert('Validation Error', titleError);
      return;
    }

    const notesError = validation.validateSessionNotes(notes);
    if (notesError) {
      Alert.alert('Validation Error', notesError);
      return;
    }

    const categoryError = validation.validateCategoryExists(selectedCategory, categories);
    if (categoryError) {
      Alert.alert('Validation Error', categoryError);
      return;
    }

    setIsSaving(true);
    try {
      await updateSession(sessionId, {
        title: title.trim() || 'Untitled Session',
        notes: notes.trim(),
        categoryId: selectedCategory,
      });

      Alert.alert('Success', SUCCESS_MESSAGES.SESSION_UPDATED, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : ERROR_MESSAGES.SESSION_UPDATE_FAILED
      );
    } finally {
      setIsSaving(false);
    }
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
              await deleteSession(sessionId);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : ERROR_MESSAGES.SESSION_DELETE_FAILED
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Session</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <GlassCard style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color={theme.colors.primary.cyan} />
                    <Text style={styles.infoText}>Started: {formatDate(session.startedAt)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primary.cyan} />
                    <Text style={styles.infoText}>Ended: {formatDate(session.endedAt)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="timer-outline" size={18} color={theme.colors.primary.cyan} />
                    <Text style={styles.infoText}>
                      Duration: {dateUtils.formatDuration(session.durationMs)}
                    </Text>
                  </View>
                  <View style={styles.infoNote}>
                    <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.tertiary} />
                    <Text style={styles.infoNoteText}>
                      Duration cannot be edited after session completion
                    </Text>
                  </View>
                </View>
              </GlassCard>

              <View style={styles.inputSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Session Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., Design Sprint"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={title}
                    onChangeText={setTitle}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add some details about your session"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <TouchableOpacity
                      style={styles.manageCategoriesButton}
                      onPress={() => navigation.navigate('CategoryManager' as never)}
                    >
                      <Ionicons name="settings" size={16} color={theme.colors.primary.cyan} />
                      <Text style={styles.manageCategoriesText}>Manage</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          { borderColor: category.color + '40' },
                          selectedCategory === category.id && {
                            backgroundColor: category.color,
                            borderColor: category.color,
                          },
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={16}
                          color={
                            selectedCategory === category.id
                              ? theme.colors.text.inverse
                              : category.color
                          }
                        />
                        <Text
                          style={[
                            styles.categoryButtonText,
                            selectedCategory === category.id && styles.categoryButtonTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isSaving ? (
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={22} color={theme.colors.text.inverse} />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 100 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },
  infoCard: {
    marginBottom: theme.spacing[6],
  },
  infoContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.glass.border,
  },
  infoNoteText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    flex: 1,
  },
  inputSection: {
    gap: theme.spacing[6],
  },
  inputGroup: {
    gap: theme.spacing[2],
  },
  inputLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  input: {
    height: 56,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.fontSize.base,
    color: theme.colors.text.primary,
  },
  textArea: {
    height: 112,
    paddingTop: theme.spacing[4],
    textAlignVertical: 'top',
  },
  categorySection: {
    gap: theme.spacing[3],
  },
  categoriesScroll: {
    gap: theme.spacing[3],
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary.cyan,
    borderColor: theme.colors.primary.cyan,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  categoryButtonTextActive: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  saveButton: {
    marginTop: theme.spacing[8],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
  },
  saveButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  manageCategoriesText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.cyan,
  },
});