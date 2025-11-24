import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
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
import NotificationHistoryScreen from '../screens/NotificationHistoryScreen';

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

interface TabIconProps {
  name: string;
  color: string;
  focused: boolean;
}

function TabIcon({ name, color, focused }: TabIconProps) {
  const scaleAnim = React.useRef(new Animated.Value(focused ? 1.05 : 1)).current;
  const ringAnim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;
  const glowAnim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.05 : 1,
        useNativeDriver: true,
        friction: 7,
        tension: 120,
      }),
      Animated.spring(ringAnim, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.timing(glowAnim, {
        toValue: focused ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabIconWrapper}>
      {focused && (
        <>
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
                }),
                transform: [
                  { 
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.activeRing,
              {
                opacity: ringAnim,
                transform: [
                  { 
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }
                ],
              },
            ]}
          />
        </>
      )}
      
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Ionicons name={name as any} size={28} color={color} style={styles.icon} />
      </Animated.View>
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
        tabBarItemStyle: {
          backgroundColor: 'transparent',
        },
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
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="StartSession"
        component={StartSessionScreen}
        options={{
          title: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="stats-chart" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
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

        <Stack.Screen
          name="NotificationHistory"
          component={NotificationHistoryScreen}
          options={{
            ...smoothIOSSlide,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  activeRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.primary.cyan,
  },
  glowRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    shadowColor: theme.colors.primary.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    zIndex: 10,
  },
});