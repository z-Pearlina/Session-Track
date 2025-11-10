import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export function CustomHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Menu Button */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={28} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>SESSION TRACK</Text>

        {/* Profile Picture */}
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
    backgroundColor: theme.colors.backdrop,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
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
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.light,
    letterSpacing: 3.2,
    color: theme.colors.text.secondary,
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