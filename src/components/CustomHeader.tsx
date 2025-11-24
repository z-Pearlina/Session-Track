import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { RootStackNavigationProp } from '../types';

export function CustomHeader() {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar" size={28} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <LinearGradient
            colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>FlowTrix</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileGlow} />
          <Image
            source={{ uri: 'https://ui-avatars.com/api/?name=User&background=67E8F9&color=08171c&size=128' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
    backgroundColor: theme.colors.backdrop,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[8] + 12,
    paddingBottom: theme.spacing[4],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
  },
  titleGradient: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius['2xl'],
  },
  title: {
    fontSize: theme.fontSize.xl + 2,
    fontFamily: theme.fontFamily.bold,
    letterSpacing: 2.5,
    color: theme.colors.background.primary,
  },
  profileButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.cyan,
    ...theme.shadows.glowCyan,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
  },
});