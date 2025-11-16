import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList, MainTabParamList } from '../types';

type RootNavigation = NavigationProp<RootStackParamList>;
type TabNavigation = NavigationProp<MainTabParamList>;

export const navigationHelpers = {
  navigateToScreen<T extends keyof RootStackParamList>(
    navigation: RootNavigation,
    screen: T,
    params?: RootStackParamList[T]
  ) {
    if (params) {
      navigation.navigate(screen as any, params as any);
    } else {
      navigation.navigate(screen as any);
    }
  },

  navigateToEditSession(navigation: RootNavigation, sessionId: string) {
    navigation.navigate('EditSession', { sessionId });
  },

  navigateToSessionDetails(navigation: RootNavigation, sessionId: string) {
    navigation.navigate('SessionDetails', { sessionId });
  },

  navigateToGoalDetails(navigation: RootNavigation, goalId: string) {
    navigation.navigate('GoalDetails', { goalId });
  },

  navigateToCalendar(navigation: RootNavigation) {
    navigation.navigate('Calendar');
  },

  navigateToCategoryManager(navigation: RootNavigation) {
    navigation.navigate('CategoryManager');
  },

  navigateToCustomizeDashboard(navigation: RootNavigation) {
    navigation.navigate('CustomizeDashboard');
  },

  navigateToGoals(navigation: RootNavigation) {
    navigation.navigate('Goals');
  },

  navigateToCreateGoal(navigation: RootNavigation) {
    navigation.navigate('CreateGoal');
  },

  navigateToAchievements(navigation: RootNavigation) {
    navigation.navigate('Achievements');
  },

  navigateToNotificationSettings(navigation: RootNavigation) {
    navigation.navigate('NotificationSettings');
  },

  navigateToStartSession(navigation: TabNavigation | RootNavigation) {
    navigation.navigate('StartSession' as any);
  },

  navigateToHome(navigation: TabNavigation | RootNavigation) {
    navigation.navigate('Home' as any);
  },

  navigateToStats(navigation: TabNavigation | RootNavigation) {
    navigation.navigate('Stats' as any);
  },

  navigateToSettings(navigation: TabNavigation | RootNavigation) {
    navigation.navigate('Settings' as any);
  },

  goBack(navigation: RootNavigation | TabNavigation) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  },
};