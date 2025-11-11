import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useCategoryStore } from '../stores/useCategoryStore';
import { GlassCard } from '../components/GlassCard';
import { Category } from '../types';

// Available icons for categories
const CATEGORY_ICONS = [
  'briefcase',
  'school',
  'fitness',
  'restaurant',
  'bed',
  'book',
  'code',
  'brush',
  'musical-notes',
  'game-controller',
  'heart',
  'home',
  'car',
  'airplane',
  'basketball',
  'bicycle',
  'bulb',
  'calculator',
  'camera',
  'cart',
];

// Available colors for categories
const CATEGORY_COLORS = [
  '#38BDF8', // Cyan
  '#34D399', // Mint
  '#A78BFA', // Purple
  '#FB923C', // Orange
  '#F87171', // Red
  '#FBBF24', // Yellow
  '#60A5FA', // Blue
  '#EC4899', // Pink
  '#10B981', // Green
  '#8B5CF6', // Violet
];

export default function CategoryManagerScreen() {
  const navigation = useNavigation();
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('apps');
  const [selectedColor, setSelectedColor] = useState('#38BDF8');

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setName('');
    setSelectedIcon('apps');
    setSelectedColor('#38BDF8');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
        Alert.alert('Success', 'Category updated successfully');
      } else {
        // Create new category
        const newCategory: Category = {
          id: `category_${Date.now()}`,
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
          createdAt: new Date().toISOString(),
          isDefault: false,
        };
        await addCategory(newCategory);
        Alert.alert('Success', 'Category created successfully');
      }
      handleCloseModal();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?\n\nSessions using this category will need to be reassigned to another category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete category');
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
          <Text style={styles.headerTitle}>Categories</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => handleOpenModal()}>
            <Ionicons name="add-circle" size={24} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary.cyan} />
              <Text style={styles.infoText}>
                Organize your sessions by creating custom categories. Default categories cannot be deleted.
              </Text>
            </View>
          </GlassCard>

          {/* Categories List */}
          <Text style={styles.sectionTitle}>All Categories ({categories.length})</Text>

          {categories.map((category) => (
            <GlassCard key={category.id} style={styles.categoryCard}>
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
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleOpenModal(category)}
                  >
                    <Ionicons name="pencil" size={20} color={theme.colors.primary.cyan} />
                  </TouchableOpacity>
                  {/* Always show delete button */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(category)}
                  >
                    <Ionicons name="trash" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add/Edit Category Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={theme.gradients.backgroundAnimated}
                style={styles.modalGradient}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Ionicons name="close" size={28} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </Text>
                  <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalScroll}>
                  {/* Category Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="E.g., Morning Routine"
                      placeholderTextColor={theme.colors.text.quaternary}
                      value={name}
                      onChangeText={setName}
                      autoFocus
                    />
                  </View>

                  {/* Icon Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Choose Icon</Text>
                    <View style={styles.iconGrid}>
                      {CATEGORY_ICONS.map((icon) => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.iconOption,
                            selectedIcon === icon && styles.iconOptionSelected,
                            { borderColor: selectedColor },
                          ]}
                          onPress={() => setSelectedIcon(icon)}
                        >
                          <Ionicons
                            name={icon as any}
                            size={24}
                            color={selectedIcon === icon ? selectedColor : theme.colors.text.secondary}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Color Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Choose Color</Text>
                    <View style={styles.colorGrid}>
                      {CATEGORY_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            selectedColor === color && styles.colorOptionSelected,
                          ]}
                          onPress={() => setSelectedColor(color)}
                        >
                          {selectedColor === color && (
                            <Ionicons name="checkmark" size={20} color="#fff" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Preview */}
                  <View style={styles.previewSection}>
                    <Text style={styles.inputLabel}>Preview</Text>
                    <GlassCard style={styles.previewCard}>
                      <View style={styles.previewContent}>
                        <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
                          <Ionicons name={selectedIcon as any} size={32} color={selectedColor} />
                        </View>
                        <Text style={styles.previewName}>{name || 'Category Name'}</Text>
                      </View>
                    </GlassCard>
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
  infoCard: {
    marginBottom: theme.spacing[6],
  },
  infoContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  categoryCard: {
    marginBottom: theme.spacing[3],
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary.cyan + '20',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[0.5],
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.cyan,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  saveButton: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
  },
  modalScroll: {
    padding: theme.spacing[4],
  },
  inputGroup: {
    marginBottom: theme.spacing[6],
  },
  inputLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderWidth: 2,
    backgroundColor: theme.colors.background.tertiary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.colors.text.primary,
  },
  previewSection: {
    marginTop: theme.spacing[2],
  },
  previewCard: {
    overflow: 'hidden',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[5],
    gap: theme.spacing[4],
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});