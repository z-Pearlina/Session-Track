import { NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList, MainTabParamList } from '../types';

type RootNavigation = NavigationProp<RootStackParamList>;
type TabNavigation = NavigationProp<MainTabParamList>;
type CombinedNavigation = NavigationProp<RootStackParamList & MainTabParamList>;

export const navigationHelpers = {
  navigateToScreen<T extends keyof RootStackParamList>(
    navigation: RootNavigation,
    screen: T,
    params?: RootStackParamList[T]
  ) {
    if (params) {
      navigation.dispatch(
        CommonActions.navigate({
          name: screen,
          params,
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.navigate({
          name: screen,
        })
      );
    }
  },

  navigateToEditSession(navigation: RootNavigation, sessionId: string) {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'EditSession',
        params: { sessionId },
      })
    );
  },

  navigateToSessionDetails(navigation: RootNavigation, sessionId: string) {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SessionDetails',
        params: { sessionId },
      })
    );
  },

  navigateToGoalDetails(navigation: RootNavigation, goalId: string) {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'GoalDetails',
        params: { goalId },
      })
    );
  },

  navigateToCalendar(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'Calendar' }));
  },

  navigateToCategoryManager(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'CategoryManager' }));
  },

  navigateToCustomizeDashboard(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'CustomizeDashboard' }));
  },

  navigateToGoals(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'Goals' }));
  },

  navigateToCreateGoal(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'CreateGoal' }));
  },

  navigateToAchievements(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'Achievements' }));
  },

  navigateToNotificationSettings(navigation: RootNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'NotificationSettings' }));
  },

  navigateToStartSession(navigation: CombinedNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'StartSession' as any }));
  },

  navigateToHome(navigation: CombinedNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'Home' as any }));
  },

  navigateToStats(navigation: CombinedNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'Stats' as any }));
  },

  navigateToSettings(navigation: CombinedNavigation) {
    navigation.dispatch(CommonActions.navigate({ name: 'Settings' as any }));
  },

  goBack(navigation: RootNavigation | TabNavigation) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  },
};
