import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { MainTabParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import StartSessionScreen from '../screens/StartSessionScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            height: 70,
            borderRadius: theme.borderRadius['2xl'],
            backgroundColor: theme.colors.glass.background,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: theme.colors.glass.border,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: theme.colors.primary.cyan,
          tabBarInactiveTintColor: theme.colors.text.quaternary,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeGlow} />}
                <Ionicons 
                  name="home" 
                  size={26} 
                  color={color}
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="StartSession"
          component={StartSessionScreen}
          options={{
            title: 'Track',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeGlow} />}
                <Ionicons 
                  name="list" 
                  size={26} 
                  color={color}
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeGlow} />}
                <Ionicons 
                  name="stats-chart" 
                  size={26} 
                  color={color}
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeGlow} />}
                <Ionicons 
                  name="person" 
                  size={26} 
                  color={color}
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  icon: {
    zIndex: 10,
  },
  activeGlow: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.cyan,
    backgroundColor: theme.colors.primary.cyan + '20',
    ...theme.shadows.glowBottomNav,
  },
});