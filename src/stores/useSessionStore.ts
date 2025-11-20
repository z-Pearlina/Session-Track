import { create } from 'zustand';
import { Session, SessionFilter } from '../types';
import { StorageService } from '../services/StorageService';

interface SessionState {
  sessions: Session[];
  filteredSessions: Session[];
  isLoading: boolean;
  error: string | null;
  filter: SessionFilter;

  loadSessions: () => Promise<void>;
  addSession: (session: Session) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setFilter: (filter: SessionFilter) => void;
  clearFilter: () => void;
  applyFilter: () => void;
  clearError: () => void;
}

const useSessionStoreBase = create<SessionState>((set, get) => ({
  sessions: [],
  filteredSessions: [],
  isLoading: false,
  error: null,
  filter: {},

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await StorageService.getSessions();
      
      const { filter } = get();
      const filteredSessions = applyFilterToSessions(sessions, filter);
      
      set({ 
        sessions, 
        filteredSessions,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load sessions',
        isLoading: false 
      });
    }
  },

  addSession: async (session: Session) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveSession(session);
      
      const state = get();
      const newSessions = [...state.sessions, session];
      const filteredSessions = applyFilterToSessions(newSessions, state.filter);
      
      set({ 
        sessions: newSessions,
        filteredSessions,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save session',
        isLoading: false 
      });
      throw error;
    }
  },

  updateSession: async (sessionId: string, updates: Partial<Session>) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.updateSession(sessionId, updates);
      
      const state = get();
      const newSessions = state.sessions.map(s => 
        s.id === sessionId 
          ? { ...s, ...updates, updatedAt: new Date().toISOString() } 
          : s
      );
      const filteredSessions = applyFilterToSessions(newSessions, state.filter);
      
      set({
        sessions: newSessions,
        filteredSessions,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update session',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteSession(sessionId);
      
      const state = get();
      const newSessions = state.sessions.filter(s => s.id !== sessionId);
      const filteredSessions = applyFilterToSessions(newSessions, state.filter);
      
      set({
        sessions: newSessions,
        filteredSessions,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isLoading: false 
      });
      throw error;
    }
  },

  setFilter: (filter: SessionFilter) => {
    const { sessions } = get();
    const filteredSessions = applyFilterToSessions(sessions, filter);
    
    set({ filter, filteredSessions });
  },

  clearFilter: () => {
    const { sessions } = get();
    
    set({ 
      filter: {}, 
      filteredSessions: [...sessions] 
    });
  },

  applyFilter: () => {
    const { sessions, filter } = get();
    const filteredSessions = applyFilterToSessions(sessions, filter);
    set({ filteredSessions });
  },

  clearError: () => set({ error: null }),
}));

function applyFilterToSessions(sessions: Session[], filter: SessionFilter): Session[] {
  let filtered = [...sessions];

  if (filter.categoryId) {
    filtered = filtered.filter(s => s.categoryId === filter.categoryId);
  }

  if (filter.dateRange) {
    const startDate = new Date(filter.dateRange.start);
    const endDate = new Date(filter.dateRange.end);
    filtered = filtered.filter(s => {
      const sessionDate = new Date(s.startedAt);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  if (filter.searchQuery && filter.searchQuery.trim()) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(query) ||
      (s.notes && s.notes.toLowerCase().includes(query))
    );
  }

  return filtered;
}

export const useSessions = () => useSessionStoreBase((state) => state.sessions);
export const useFilteredSessions = () => useSessionStoreBase((state) => state.filteredSessions);
export const useSessionsLoading = () => useSessionStoreBase((state) => state.isLoading);
export const useSessionsError = () => useSessionStoreBase((state) => state.error);
export const useSessionFilter = () => useSessionStoreBase((state) => state.filter);

export const useLoadSessions = () => useSessionStoreBase((state) => state.loadSessions);
export const useAddSession = () => useSessionStoreBase((state) => state.addSession);
export const useUpdateSession = () => useSessionStoreBase((state) => state.updateSession);
export const useDeleteSession = () => useSessionStoreBase((state) => state.deleteSession);
export const useSetFilter = () => useSessionStoreBase((state) => state.setFilter);
export const useClearFilter = () => useSessionStoreBase((state) => state.clearFilter);
export const useClearSessionError = () => useSessionStoreBase((state) => state.clearError);

export const useSessionStore = useSessionStoreBase;