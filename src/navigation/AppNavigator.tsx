import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets, CardStyleInterpolators, StackCardInterpolationProps } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/theme';
import { MainTabParamList, RootStackParamList } from '../types';
import { useSystemUI, getSafeBottomPadding } from '../utils/systemUI';

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

function BlurredTabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={80}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(30, 49, 59, 0.6)',
          }
        ]} 
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(103, 232, 249, 0.02)',
          }
        ]}
      />
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  useSystemUI();
  
  const bottomPadding = getSafeBottomPadding(insets.bottom);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomPadding,
          left: 16,
          right: 16,
          height: 72,
          borderRadius: theme.borderRadius['3xl'],
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderWidth: 1.5,
          borderColor: theme.colors.glass.border,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          elevation: 0,
          shadowColor: theme.colors.primary.cyan,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          overflow: 'hidden',
        },
        tabBarBackground: () => <BlurredTabBarBackground />,
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
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={28} color={color} style={styles.icon} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="StartSession"
        component={StartSessionScreen}
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="list" size={28} color={color} style={styles.icon} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart" size={28} color={color} style={styles.icon} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={28} color={color} style={styles.icon} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

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
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="EditSession"
          component={EditSessionScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="SessionDetails"
          component={SessionDetailsScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="CategoryManager"
          component={CategoryManagerScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="CustomizeDashboard"
          component={CustomizeDashboardScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="CreateGoal"
          component={CreateGoalScreen}
          options={{
            ...modalSwipeDown,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="GoalDetails"
          component={GoalDetailsScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />

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
    width: 56,
    height: 56,
  },
  icon: {
    zIndex: 10,
  },
});