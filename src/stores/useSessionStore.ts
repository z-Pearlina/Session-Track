import { create } from 'zustand';
import { Session, SessionFilter } from '../types';
import { StorageService } from '../services/storage';

interface SessionState {
  // State
  sessions: Session[];
  filteredSessions: Session[];
  isLoading: boolean;
  error: string | null;
  filter: SessionFilter;

  // Actions
  loadSessions: () => Promise<void>;
  addSession: (session: Session) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setFilter: (filter: SessionFilter) => void;
  clearFilter: () => void;
  applyFilter: () => void; // Added this
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessions: [],
  filteredSessions: [],
  isLoading: false,
  error: null,
  filter: {},

  // Load all sessions from storage
  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await StorageService.getSessions();
      set({ sessions, isLoading: false });
      get().applyFilter();
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
      get().applyFilter();
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
      get().applyFilter();
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
      get().applyFilter();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isLoading: false 
      });
      throw error;
    }
  },

  // Set filter
  setFilter: (filter: SessionFilter) => {
    set({ filter });
    get().applyFilter();
  },

  // Clear filter
  clearFilter: () => {
    set({ filter: {} });
    get().applyFilter();
  },

  // Apply current filter (internal method)
  applyFilter: () => {
    const { sessions, filter } = get();
    let filtered = [...sessions];

    // Filter by category
    if (filter.categoryId) {
      filtered = filtered.filter(s => s.categoryId === filter.categoryId);
    }

    // Filter by date range
    if (filter.dateRange) {
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      filtered = filtered.filter(s => {
        const sessionDate = new Date(s.startedAt);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    }

    // Filter by search query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        (s.notes && s.notes.toLowerCase().includes(query))
      );
    }

    set({ filteredSessions: filtered });
  },

  // Clear error message
  clearError: () => set({ error: null }),
}));