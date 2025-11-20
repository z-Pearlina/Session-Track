import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  InteractionManager,
  Keyboard,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import {
  useCategories,
  useLoadCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory
} from '../stores/useCategoryStore';
import { GlassCard } from '../components/GlassCard';
import { Category } from '../types';
import { validation } from '../services/validation';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';


const CATEGORY_ICONS = [
  'briefcase', 'school', 'fitness', 'restaurant', 'bed', 'book', 'code', 'brush',
  'musical-notes', 'game-controller', 'heart', 'home', 'car', 'airplane',
  'basketball', 'bicycle', 'bulb', 'calculator', 'camera', 'cart',
] as const;

const CATEGORY_COLORS = [
  '#38BDF8', '#34D399', '#A78BFA', '#FB923C', '#F87171',
  '#FBBF24', '#60A5FA', '#EC4899', '#10B981', '#8B5CF6',
] as const;

const InfoCard = React.memo(() => (
  <GlassCard style={styles.infoCard}>
    <View style={styles.infoContent}>
      <Ionicons name="information-circle" size={24} color={theme.colors.primary.cyan} />
      <Text style={styles.infoText}>
        Organize your sessions by creating custom categories. Default categories cannot be deleted.
      </Text>
    </View>
  </GlassCard>
));

const CategoryCardItem = React.memo<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}>(({ category, onEdit, onDelete }) => (
  <GlassCard style={styles.categoryCard}>
    <View style={styles.categoryContent}>
      <View style={styles.categoryLeft}>
        <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon as any} size={24} color={category.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(category)} activeOpacity={0.7}>
          <Ionicons name="pencil" size={20} color={theme.colors.primary.cyan} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(category)} activeOpacity={0.7}>
          <Ionicons name="trash" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  </GlassCard>
));

const IconSelector = React.memo<{ selectedIcon: string; onSelect: (icon: string) => void }>(
  ({ selectedIcon, onSelect }) => (
    <View style={styles.iconGrid}>
      {CATEGORY_ICONS.map((icon) => (
        <TouchableOpacity
          key={icon}
          style={[styles.iconOption, selectedIcon === icon && styles.iconOptionSelected]}
          onPress={() => onSelect(icon)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={selectedIcon === icon ? theme.colors.primary.cyan : theme.colors.text.secondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  )
);

const ColorSelector = React.memo<{ selectedColor: string; onSelect: (color: string) => void }>(
  ({ selectedColor, onSelect }) => (
    <View style={styles.colorGrid}>
      {CATEGORY_COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorOptionSelected]}
          onPress={() => onSelect(color)}
          activeOpacity={0.8}
        >
          {selectedColor === color && <Ionicons name="checkmark" size={20} color="#fff" />}
        </TouchableOpacity>
      ))}
    </View>
  )
);

const PreviewCard = React.memo<{ name: string; icon: string; color: string }>(
  ({ name, icon, color }) => (
    <GlassCard style={styles.previewCard}>
      <View style={styles.previewContent}>
        <View style={[styles.previewIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={32} color={color} />
        </View>
        <Text style={styles.previewName}>{name || 'Category Name'}</Text>
      </View>
    </GlassCard>
  )
);

export default function CategoryManagerScreen() {
  const navigation = useNavigation();

  const categories = useCategories();
  const loadCategories = useLoadCategories();
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('apps');
  const [selectedColor, setSelectedColor] = useState('#38BDF8');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => loadCategories());
    return () => task.cancel();
  }, [loadCategories]);

  const sortedCategories = useMemo(() => {
    const defaults = categories.filter(c => c.isDefault);
    const customs = categories.filter(c => !c.isDefault);

    return [...customs, ...defaults];
  }, [categories]);

  const handleOpenModal = useCallback((category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
    } else {
      setEditingCategory(null);
      setName('');
      setSelectedIcon('apps');
      setSelectedColor('#38BDF8');
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (isSaving) return;
    setShowModal(false);
    setEditingCategory(null);
    setName('');
    setSelectedIcon('apps');
    setSelectedColor('#38BDF8');
    Keyboard.dismiss();
  }, [isSaving]);

  const handleSave = useCallback(async () => {
    const validationError = validation.validateCategoryName(name, categories, editingCategory?.id);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
        Alert.alert('Success', SUCCESS_MESSAGES.CATEGORY_UPDATED);
      } else {
        const newCategory: Category = {
          id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
          createdAt: new Date().toISOString(),
          isDefault: false,
        };
        await addCategory(newCategory);
        Alert.alert('Success', SUCCESS_MESSAGES.CATEGORY_SAVED);
      }
      handleCloseModal();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : editingCategory
            ? ERROR_MESSAGES.CATEGORY_UPDATE_FAILED
            : ERROR_MESSAGES.CATEGORY_SAVE_FAILED
      );
    } finally {
      setIsSaving(false);
    }
  }, [name, selectedIcon, selectedColor, editingCategory, categories, addCategory, updateCategory, handleCloseModal]);

  const handleDelete = useCallback(
    (category: Category) => {
      if (category.isDefault) {
        Alert.alert('Cannot Delete', 'Default categories cannot be deleted.');
        return;
      }

      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteCategory(category.id);
                Alert.alert('Success', SUCCESS_MESSAGES.CATEGORY_DELETED);
              } catch (error) {
                Alert.alert(
                  'Error',
                  error instanceof Error ? error.message : ERROR_MESSAGES.CATEGORY_DELETE_FAILED
                );
              }
            },
          },
        ]
      );
    },
    [deleteCategory]
  );

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const renderCategoryItem = useCallback(
    ({ item }: ListRenderItemInfo<Category>) => (
      <CategoryCardItem category={item} onEdit={handleOpenModal} onDelete={handleDelete} />
    ),
    [handleOpenModal, handleDelete]
  );
  const keyExtractor = useCallback((item: Category) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <>
      <InfoCard />
      <Text style={styles.sectionTitle}>All Categories ({sortedCategories.length})</Text>
    </>
  ), [sortedCategories.length]);

  const ListFooterComponent = useCallback(() => <View style={{ height: 100 }} />, []);

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => handleOpenModal()} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={24} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedCategories}
          renderItem={renderCategoryItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={5}
        />

        <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={handleCloseModal} statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCloseModal} />
            <View style={styles.modalContent}>
              <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.modalGradient}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCloseModal} disabled={isSaving}>
                    <Ionicons name="close" size={28} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'New Category'}</Text>
                  <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={[1]}
                  renderItem={() => (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Category Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="E.g., Morning Routine"
                          placeholderTextColor={theme.colors.text.quaternary}
                          value={name}
                          onChangeText={setName}
                          autoFocus
                          editable={!isSaving}
                          returnKeyType="done"
                          onSubmitEditing={handleSave}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Select Icon</Text>
                        <IconSelector selectedIcon={selectedIcon} onSelect={setSelectedIcon} />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Select Color</Text>
                        <ColorSelector selectedColor={selectedColor} onSelect={setSelectedColor} />
                      </View>
                      <View style={styles.previewSection}>
                        <Text style={styles.inputLabel}>Preview</Text>
                        <PreviewCard name={name} icon={selectedIcon} color={selectedColor} />
                      </View>
                    </>
                  )}
                  keyExtractor={() => 'modal-content'}
                  contentContainerStyle={styles.modalScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListFooterComponent={<View style={{ height: 40 }} />}
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, letterSpacing: -0.5 },
  flatListContent: { paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[2] },
  infoCard: { marginBottom: theme.spacing[6] },
  infoContent: { flexDirection: 'row', padding: theme.spacing[4], gap: theme.spacing[3] },
  infoText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, lineHeight: 20 },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: theme.spacing[3] },
  categoryCard: { marginBottom: theme.spacing[3] },
  categoryContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing[4] },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: theme.borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing[0.5] },
  defaultBadge: { backgroundColor: theme.colors.primary.cyan + '20', paddingHorizontal: theme.spacing[2], paddingVertical: theme.spacing[0.5], borderRadius: theme.borderRadius.sm, alignSelf: 'flex-start' },
  defaultBadgeText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold, color: theme.colors.primary.cyan },
  categoryActions: { flexDirection: 'row', gap: theme.spacing[2] },
  actionButton: { width: 40, height: 40, borderRadius: theme.borderRadius.lg, backgroundColor: theme.colors.background.secondary, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalContent: { height: '90%', borderTopLeftRadius: theme.borderRadius['2xl'], borderTopRightRadius: theme.borderRadius['2xl'], overflow: 'hidden' },
  modalGradient: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[4], borderBottomWidth: 1, borderBottomColor: theme.colors.glass.border },
  modalTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
  saveButton: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.bold, color: theme.colors.primary.cyan },
  modalScroll: { padding: theme.spacing[4] },
  inputGroup: { marginBottom: theme.spacing[6] },
  inputLabel: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing[3] },
  input: { height: 56, backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.glass.border, borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing[4], fontSize: theme.fontSize.base, color: theme.colors.text.primary },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
  iconOption: { width: 56, height: 56, borderRadius: theme.borderRadius.lg, backgroundColor: theme.colors.background.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  iconOptionSelected: { borderWidth: 2, borderColor: theme.colors.primary.cyan, backgroundColor: theme.colors.background.tertiary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] },
  colorOption: { width: 56, height: 56, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorOptionSelected: { borderColor: theme.colors.text.primary },
  previewSection: { marginTop: theme.spacing[2] },
  previewCard: { overflow: 'hidden' },
  previewContent: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing[5], gap: theme.spacing[4] },
  previewIcon: { width: 64, height: 64, borderRadius: theme.borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
});