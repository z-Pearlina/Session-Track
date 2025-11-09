import { StorageService } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession: Session = {
    id: 'test-1',
    title: 'Test Session',
    categoryId: 'work',
    durationMs: 3600000,
    startedAt: '2024-01-01T10:00:00Z',
    endedAt: '2024-01-01T11:00:00Z',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  };

  describe('getSessions', () => {
    it('returns empty array when no sessions exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const sessions = await StorageService.getSessions();
      
      expect(sessions).toEqual([]);
    });

    it('returns parsed sessions from storage', async () => {
      const mockData = JSON.stringify([mockSession]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockData);
      
      const sessions = await StorageService.getSessions();
      
      expect(sessions).toEqual([mockSession]);
    });
  });

  describe('saveSession', () => {
    it('adds new session to storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      
      await StorageService.saveSession(mockSession);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@session_track:sessions',
        JSON.stringify([mockSession])
      );
    });
  });

  describe('deleteSession', () => {
    it('removes session from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockSession])
      );
      
      await StorageService.deleteSession('test-1');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@session_track:sessions',
        JSON.stringify([])
      );
    });
  });
});