import { create } from 'zustand';
import { Session } from '../types';
import { StorageService } from '../services/storage';

interface SessionState {
  // State
  sessions: Session[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  addSession: (session: Session) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessions: [],
  isLoading: false,
  error: null,

  // Load all sessions from storage
  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await StorageService.getSessions();
      set({ sessions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load sessions',
        isLoading: false 
      });
    }
  },

  // Add a new session
  addSession: async (session: Session) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveSession(session);
      set(state => ({ 
        sessions: [...state.sessions, session],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save session',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update an existing session
  updateSession: async (sessionId: string, updates: Partial<Session>) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.updateSession(sessionId, updates);
      set(state => ({
        sessions: state.sessions.map(s => 
          s.id === sessionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update session',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a session
  deleteSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteSession(sessionId);
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),
}));