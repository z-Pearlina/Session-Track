import { useEffect, useRef } from 'react';
import { useSessions } from '../stores/useSessionStore';
import { useGoals } from '../stores/useGoalStore';
import { useCategories } from '../stores/useCategoryStore';
import { useCheckAndUnlockAchievements } from '../stores/useAchievementStore';

export function useAchievementTracker() {
  const sessions = useSessions();
  const goals = useGoals();
  const categories = useCategories();
  const checkAndUnlockAchievements = useCheckAndUnlockAchievements();
  
  const lastSessionCount = useRef(sessions.length);
  const lastGoalCount = useRef(goals.length);
  const lastCompletedGoals = useRef(goals.filter(g => g.status === 'completed').length);

  useEffect(() => {
    const checkAchievements = async () => {
      const sessionCountChanged = sessions.length !== lastSessionCount.current;
      const goalCountChanged = goals.length !== lastGoalCount.current;
      const completedGoalsChanged = goals.filter(g => g.status === 'completed').length !== lastCompletedGoals.current;

      if (sessionCountChanged || goalCountChanged || completedGoalsChanged) {
        await checkAndUnlockAchievements(sessions, goals, categories);
        
        lastSessionCount.current = sessions.length;
        lastGoalCount.current = goals.length;
        lastCompletedGoals.current = goals.filter(g => g.status === 'completed').length;
      }
    };

    if (sessions.length > 0) {
      checkAchievements();
    }
  }, [sessions.length, goals.length, goals.filter(g => g.status === 'completed').length]);
}