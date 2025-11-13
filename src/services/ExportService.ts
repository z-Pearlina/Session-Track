import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { StorageService } from './StorageService';
import { Session, Category, DashboardPreferences } from '../types';
import { logger } from './logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

export class ExportService {
  private static getDocumentDirectory(): string {
    return FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  }

  static async exportToJSON(): Promise<void> {
    try {
      const data = await StorageService.getAllData();

      const exportData = {
        appName: 'Session Tracker',
        exportDate: new Date().toISOString(),
        version: data.version,
        data: {
          sessions: data.sessions,
          categories: data.categories,
          preferences: data.preferences,
        },
        stats: {
          totalSessions: data.sessions.length,
          totalCategories: data.categories.length,
          totalDurationMs: data.sessions.reduce((sum, s) => sum + s.durationMs, 0),
        },
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `session-tracker-backup-${timestamp}.json`;

      const fileUri = `${this.getDocumentDirectory()}${filename}`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Backup Your Session Data',
          UTI: 'public.json',
        });
      } else {
        Alert.alert(
          'Success',
          `Backup saved to:\n${fileUri}\n\nYou can find it in your Files app.`
        );
      }

      logger.success(`Exported ${data.sessions.length} sessions to ${filename}`);
    } catch (error) {
      logger.error('Export to JSON failed', error);
      Alert.alert(
        'Export Failed',
        ERROR_MESSAGES.EXPORT_FAILED
      );
      throw error;
    }
  }

  static async importFromJSON(fileUri: string): Promise<void> {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri);

      const importData = JSON.parse(content);

      if (!importData.data || !importData.data.sessions || !importData.data.categories) {
        throw new Error('Invalid backup file format');
      }

      const stats = importData.stats || {
        totalSessions: importData.data.sessions.length,
        totalCategories: importData.data.categories.length,
      };

      Alert.alert(
        'Restore Backup?',
        `This will restore:\n\n` +
        `• ${stats.totalSessions} sessions\n` +
        `• ${stats.totalCategories} categories\n\n` +
        `Your current data will be backed up first.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await StorageService.restoreAllData(importData.data);
                Alert.alert(
                  'Success!',
                  `Restored ${stats.totalSessions} sessions and ${stats.totalCategories} categories.`
                );
              } catch (error) {
                Alert.alert(
                  'Restore Failed',
                  'Could not restore backup. Your data is safe.'
                );
                throw error;
              }
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Import from JSON failed', error);
      Alert.alert(
        'Import Failed',
        ERROR_MESSAGES.IMPORT_FAILED
      );
      throw error;
    }
  }

  static async exportSessionsToCSV(): Promise<void> {
    try {
      const data = await StorageService.getAllData();
      const { sessions, categories } = data;

      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      const headers = [
        'Date',
        'Title',
        'Category',
        'Duration (minutes)',
        'Duration (hours)',
        'Notes',
        'Started At',
        'Session ID',
      ];

      const rows = sessions.map(session => {
        const durationMinutes = Math.round(session.durationMs / 60000);
        const durationHours = (session.durationMs / 3600000).toFixed(2);
        const categoryName = categoryMap.get(session.categoryId) || 'Unknown';
        const date = new Date(session.startedAt).toLocaleDateString();
        const startTime = new Date(session.startedAt).toLocaleString();

        return [
          date,
          this.escapeCSV(session.title),
          this.escapeCSV(categoryName),
          durationMinutes,
          durationHours,
          this.escapeCSV(session.notes || ''),
          startTime,
          session.id,
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `session-tracker-export-${timestamp}.csv`;

      const fileUri = `${this.getDocumentDirectory()}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Session Data',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert(
          'Success',
          `CSV exported to:\n${fileUri}\n\nOpen in Excel or Google Sheets.`
        );
      }

      logger.success(`Exported ${sessions.length} sessions to CSV`);
    } catch (error) {
      logger.error('Export to CSV failed', error);
      Alert.alert(
        'Export Failed',
        ERROR_MESSAGES.EXPORT_FAILED
      );
      throw error;
    }
  }

  private static escapeCSV(value: string): string {
    if (!value) return '';
    
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  static async exportStatisticsToCSV(): Promise<void> {
    try {
      const data = await StorageService.getAllData();
      const { sessions, categories } = data;

      const categoryStats = new Map<string, {
        name: string;
        count: number;
        totalMinutes: number;
        totalHours: number;
      }>();

      categories.forEach(cat => {
        categoryStats.set(cat.id, {
          name: cat.name,
          count: 0,
          totalMinutes: 0,
          totalHours: 0,
        });
      });

      sessions.forEach(session => {
        const stats = categoryStats.get(session.categoryId);
        if (stats) {
          stats.count++;
          const minutes = session.durationMs / 60000;
          stats.totalMinutes += minutes;
          stats.totalHours = stats.totalMinutes / 60;
        }
      });

      const headers = [
        'Category',
        'Total Sessions',
        'Total Minutes',
        'Total Hours',
        'Average Minutes per Session',
      ];

      const rows = Array.from(categoryStats.values())
        .filter(stat => stat.count > 0)
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .map(stat => [
          this.escapeCSV(stat.name),
          stat.count,
          Math.round(stat.totalMinutes),
          stat.totalHours.toFixed(2),
          stat.count > 0 ? Math.round(stat.totalMinutes / stat.count) : 0,
        ]);

      const totals = Array.from(categoryStats.values()).reduce(
        (acc, stat) => ({
          count: acc.count + stat.count,
          totalMinutes: acc.totalMinutes + stat.totalMinutes,
        }),
        { count: 0, totalMinutes: 0 }
      );

      rows.push([
        'TOTAL',
        totals.count,
        Math.round(totals.totalMinutes),
        (totals.totalMinutes / 60).toFixed(2),
        totals.count > 0 ? Math.round(totals.totalMinutes / totals.count) : 0,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `session-tracker-stats-${timestamp}.csv`;

      const fileUri = `${this.getDocumentDirectory()}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Statistics',
        });
      }

      logger.success('Statistics exported to CSV');
    } catch (error) {
      logger.error('Export statistics failed', error);
      Alert.alert('Export Failed', ERROR_MESSAGES.EXPORT_FAILED);
      throw error;
    }
  }

  static showExportMenu(): void {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        {
          text: 'Full Backup (JSON)',
          onPress: () => this.exportToJSON(),
        },
        {
          text: 'Sessions (CSV)',
          onPress: () => this.exportSessionsToCSV(),
        },
        {
          text: 'Statistics (CSV)',
          onPress: () => this.exportStatisticsToCSV(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }

  static async canShare(): Promise<boolean> {
    try {
      return await Sharing.isAvailableAsync();
    } catch {
      return false;
    }
  }

  static getExportDirectory(): string {
    return this.getDocumentDirectory();
  }
}

export default ExportService;