import { StorageService } from '../services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);
  });

  describe('getSessions', () => {
    it('should return empty array when no sessions exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const sessions = await StorageService.getSessions();

      expect(sessions).toEqual([]);
    });

    it('should return parsed sessions when they exist', async () => {
      const mockSessions = [{ id: '1', title: 'Test Session' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSessions));

      const sessions = await StorageService.getSessions();

      expect(sessions).toEqual(mockSessions);
    });
  });

  describe('saveSession', () => {
    it('should save session successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');

      const newSession = {
        id: '1',
        title: 'Test',
        categoryId: 'work',
        durationMs: 3600000,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await StorageService.saveSession(newSession);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should return empty array when no categories exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const categories = await StorageService.getCategories();

      expect(categories).toEqual([]);
    });
  });
});