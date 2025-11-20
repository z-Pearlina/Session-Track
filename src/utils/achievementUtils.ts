import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '../types';
import { ACHIEVEMENT_DEFINITIONS } from '../constants/achievements';

export async function fixDuplicateAchievements() {
  try {
    console.log('🔧 Fixing duplicate achievements...');
    
    const keys = await AsyncStorage.getAllKeys();
    const achievementKeys = keys.filter(key => key.startsWith('achievement_'));
    
    console.log(`Found ${achievementKeys.length} achievement keys in storage`);
    
    await AsyncStorage.multiRemove(achievementKeys);
    console.log('✅ Removed all old achievements from storage');
    
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      await AsyncStorage.setItem(
        `achievement_${achievement.id}`,
        JSON.stringify(achievement)
      );
    }
    
    console.log(`✅ Re-initialized ${ACHIEVEMENT_DEFINITIONS.length} achievements`);
    
    const uniqueIds = new Set(ACHIEVEMENT_DEFINITIONS.map(a => a.id));
    console.log(`✅ Verified ${uniqueIds.size} unique achievement IDs`);
    
    if (uniqueIds.size !== ACHIEVEMENT_DEFINITIONS.length) {
      console.error('❌ WARNING: Duplicate IDs detected in ACHIEVEMENT_DEFINITIONS!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing achievements:', error);
    return false;
  }
}

export async function clearAllAchievements() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const achievementKeys = keys.filter(key => key.startsWith('achievement_'));
    await AsyncStorage.multiRemove(achievementKeys);
    console.log('✅ Cleared all achievements');
    return true;
  } catch (error) {
    console.error('❌ Error clearing achievements:', error);
    return false;
  }
}