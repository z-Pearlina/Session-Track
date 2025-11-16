import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets, CardStyleInterpolators, StackCardInterpolationProps } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { MainTabParamList, RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import StartSessionScreen from '../screens/StartSessionScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditSessionScreen from '../screens/EditSessionScreen';
import SessionDetailsScreen from '../screens/SessionDetailsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CategoryManagerScreen from '../screens/CategoryManagerScreen';
import CustomizeDashboardScreen from '../screens/CustomizeDashboardScreen';

import GoalsScreen from '../screens/GoalsScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();


function MainTabs() {
  return (
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
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          show: { animation: 'timing', config: { duration: 250 } },
          hide: { animation: 'timing', config: { duration: 200 } },
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeGlow, { borderColor: color, backgroundColor: color + '20' }]} />}
              <Ionicons name="home" size={26} color={color} style={styles.icon} />
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
              {focused && <View style={[styles.activeGlow, { borderColor: color, backgroundColor: color + '20' }]} />}
              <Ionicons name="list" size={26} color={color} style={styles.icon} />
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
              {focused && <View style={[styles.activeGlow, { borderColor: color, backgroundColor: color + '20' }]} />}
              <Ionicons name="stats-chart" size={26} color={color} style={styles.icon} />
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
              {focused && <View style={[styles.activeGlow, { borderColor: color, backgroundColor: color + '20' }]} />}
              <Ionicons name="person" size={26} color={color} style={styles.icon} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * ✨ CUSTOM TRANSITIONS
 */

// Standard iOS slide
const smoothIOSSlide = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: {
      animation: 'spring' as const,
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring' as const,
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

// 🎨 SPECIAL: Modal (Swipe down to dismiss)
const modalSwipeDown = {
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
  presentation: 'modal' as const,
  transitionSpec: {
    open: {
      animation: 'spring' as const,
      config: {
        stiffness: 800,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring' as const,
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.94, 1],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.3, 0.8, 1],
          outputRange: [0, 0.4, 0.9, 1],
        }),
        borderTopLeftRadius: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
        borderTopRightRadius: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.7],
        }),
      },
    };
  },
};

// 🎨 SPECIAL: Calendar Screen (Zoom + Rotate reveal)
const calendarReveal = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: {
      animation: 'spring' as const,
      config: {
        stiffness: 900,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring' as const,
      config: {
        stiffness: 900,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.88, 0.94, 1],
            }),
          },
          {
            rotateZ: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['3deg', '0deg'],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 0.6, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.2],
        }),
      },
    };
  },
};

// 🎨 SPECIAL: Settings Features (Elegant lift and fade)
const settingsFeatureLift = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 850,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 850,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [60, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.92, 1],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.7, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.15],
        }),
      },
    };
  },
};

/**
 * ✨ MAIN NAVIGATOR
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          ...smoothIOSSlide,
          cardOverlayEnabled: true,
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 250 } },
              close: { animation: 'timing', config: { duration: 200 } },
            },
            cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => ({
              cardStyle: { opacity: current.progress },
            }),
          }}
        />

        {/* Edit Session - Modal from bottom */}
        <Stack.Screen
          name="EditSession"
          component={EditSessionScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        {/* Session Details - Standard iOS slide */}
        <Stack.Screen
          name="SessionDetails"
          component={SessionDetailsScreen}
          options={{
            ...smoothIOSSlide,
            presentation: 'card',
          }}
        />

        {/* 🎨 SPECIAL: Calendar - Zoom + Rotate reveal */}
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            ...calendarReveal,
            presentation: 'card',
            cardOverlayEnabled: true,
          }}
        />

        {/* 🎨 SPECIAL: Category Manager - Modal swipe down */}
        <Stack.Screen
          name="CategoryManager"
          component={CategoryManagerScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        {/* 🎨 SPECIAL: Customize Dashboard - Modal swipe down */}
        <Stack.Screen
          name="CustomizeDashboard"
          component={CustomizeDashboardScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        {/* ========================================
            ✅ NEW: GOALS, ACHIEVEMENTS, NOTIFICATIONS
            ======================================== */}

        {/* Goals Screen - Modal swipe down */}
        <Stack.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        {/* Create Goal - Modal from bottom */}
        <Stack.Screen
          name="CreateGoal"
          component={CreateGoalScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        {/* Goal Details - Standard iOS slide */}
        <Stack.Screen
          name="GoalDetails"
          component={GoalDetailsScreen}
          options={{
            ...smoothIOSSlide,
            presentation: 'card',
          }}
        />

        {/* Achievements Screen - Modal swipe down */}
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        {/* Notification Settings - Modal swipe down */}
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
      </Stack.Navigator>
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
    ...theme.shadows.glowBottomNav,
  },
});