import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types';

const SESSIONS_KEY = '@session_track:sessions';

/**
 * Storage service for managing session data persistence
 * Uses AsyncStorage for offline-first local storage
 */
export const StorageService = {
  /**
   * Get all sessions from storage
   */
  async getSessions(): Promise<Session[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  },

  /**
   * Save a new session to storage
   */
  async saveSession(session: Session): Promise<void> {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  /**
   * Update an existing session
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index === -1) {
        throw new Error('Session not found');
      }

      sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  /**
   * Delete a session by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  /**
   * Clear all sessions (useful for testing)
   */
  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing sessions:', error);
      throw error;
    }
  },
};