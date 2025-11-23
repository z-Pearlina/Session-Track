import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Session, Goal, Achievement, Category } from "../types";
import { logger } from "./logger";
import { format } from "date-fns";

export class ExportService {
  static async exportToJSON(data: {
    sessions: Session[];
    goals: Goal[];
    achievements: Achievement[];
    categories: Category[];
  }): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `flowtrix-backup-${format(
        new Date(),
        "yyyy-MM-dd-HHmmss"
      )}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export FlowTrix Data",
        });
      }

      logger.success("Data exported to JSON successfully");
    } catch (error) {
      logger.error("Failed to export data to JSON", error);
      throw error;
    }
  }

  static async exportSessionsToCSV(sessions: Session[]): Promise<void> {
    try {
      const csvContent = this.convertSessionsToCSV(sessions);
      const fileName = `flowtrix-sessions-${format(
        new Date(),
        "yyyy-MM-dd-HHmmss"
      )}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Sessions to CSV",
        });
      }

      logger.success("Sessions exported to CSV successfully");
    } catch (error) {
      logger.error("Failed to export sessions to CSV", error);
      throw error;
    }
  }

  static async exportGoalsToCSV(goals: Goal[]): Promise<void> {
    try {
      const csvContent = this.convertGoalsToCSV(goals);
      const fileName = `flowtrix-goals-${format(
        new Date(),
        "yyyy-MM-dd-HHmmss"
      )}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Goals to CSV",
        });
      }

      logger.success("Goals exported to CSV successfully");
    } catch (error) {
      logger.error("Failed to export goals to CSV", error);
      throw error;
    }
  }

  private static convertSessionsToCSV(sessions: Session[]): string {
    const headers = [
      "Date",
      "Title",
      "Category",
      "Duration (Minutes)",
      "Start Time",
      "End Time",
      "Notes",
      "Goal",
      "Tags",
    ];

    const rows = sessions.map((session) => {
      const durationMinutes = Math.round(session.durationMs / (1000 * 60));
      const startTime = format(
        new Date(session.startedAt),
        "yyyy-MM-dd HH:mm:ss"
      );
      const endTime = format(new Date(session.endedAt), "yyyy-MM-dd HH:mm:ss");
      const date = format(new Date(session.startedAt), "yyyy-MM-dd");

      return [
        date,
        this.escapeCSV(session.title),
        this.escapeCSV(session.categoryName),
        durationMinutes.toString(),
        startTime,
        endTime,
        this.escapeCSV(session.notes || ""),
        session.goalId || "",
        session.tags?.join("; ") || "",
      ];
    });

    rows.sort((a, b) => b[0].localeCompare(a[0]));

    const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];

    return csvLines.join("\n");
  }

  private static convertGoalsToCSV(goals: Goal[]): string {
    const headers = [
      "Title",
      "Category",
      "Period",
      "Target (Minutes)",
      "Progress (Minutes)",
      "Progress (%)",
      "Status",
      "Start Date",
      "End Date",
      "Completed At",
    ];

    const rows = goals.map((goal) => {
      const currentMins = goal.currentMinutes ?? 0;
      const progressPercent =
        goal.targetMinutes > 0
          ? Math.round((currentMins / goal.targetMinutes) * 100)
          : 0;

      return [
        this.escapeCSV(goal.title),
        this.escapeCSV(goal.categoryName || ""),
        goal.period,
        goal.targetMinutes.toString(),
        currentMins.toString(),
        progressPercent.toString(),
        goal.status,
        format(new Date(goal.startDate), "yyyy-MM-dd"),
        format(new Date(goal.endDate), "yyyy-MM-dd"),
        goal.completedAt
          ? format(new Date(goal.completedAt), "yyyy-MM-dd HH:mm:ss")
          : "",
      ];
    });

    const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];

    return csvLines.join("\n");
  }

  private static escapeCSV(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  static async importSessionsFromCSV(csvContent: string): Promise<Session[]> {
    try {
      const lines = csvContent.split("\n");
      const sessions: Partial<Session>[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = this.parseCSVLine(lines[i]);
        const session: Partial<Session> = {
          id: `imported_${Date.now()}_${i}`,
          title: values[1] || "Imported Session",
          categoryName: values[2] || "General",
          categoryId: "",
          categoryColor: "#38BDF8",
          categoryIcon: "time-outline",
          durationMs: parseInt(values[3] || "0") * 60 * 1000,
          startedAt: values[4] || new Date().toISOString(),
          endedAt: values[5] || new Date().toISOString(),
          notes: values[6] || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        sessions.push(session as Session);
      }

      logger.success(`Imported ${sessions.length} sessions from CSV`);
      return sessions as Session[];
    } catch (error) {
      logger.error("Failed to import sessions from CSV", error);
      throw error;
    }
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);

    return values;
  }

  static getExportFileSize(sessions: Session[], goals: Goal[]): number {
    const data = { sessions, goals };
    const jsonString = JSON.stringify(data);
    let byteLength = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = jsonString.charCodeAt(i);
      if (charCode < 0x80) {
        byteLength += 1;
      } else if (charCode < 0x800) {
        byteLength += 2;
      } else if (charCode < 0x10000) {
        byteLength += 3;
      } else {
        byteLength += 4;
      }
    }
    return byteLength;
  }

  static async exportAchievementsToCSV(
    achievements: Achievement[]
  ): Promise<void> {
    try {
      const csvContent = this.convertAchievementsToCSV(achievements);
      const fileName = `flowtrix-achievements-${format(
        new Date(),
        "yyyy-MM-dd-HHmmss"
      )}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Achievements to CSV",
        });
      }

      logger.success("Achievements exported to CSV successfully");
    } catch (error) {
      logger.error("Failed to export achievements to CSV", error);
      throw error;
    }
  }

  private static convertAchievementsToCSV(achievements: Achievement[]): string {
    const headers = [
      "Title",
      "Description",
      "Category",
      "Tier",
      "Progress (%)",
      "Unlocked",
      "Unlocked At",
    ];

    const rows = achievements.map((achievement) => {
      return [
        this.escapeCSV(achievement.title),
        this.escapeCSV(achievement.description),
        achievement.category,
        achievement.tier,
        achievement.progress.toString(),
        achievement.isUnlocked ? "Yes" : "No",
        achievement.unlockedAt
          ? format(new Date(achievement.unlockedAt), "yyyy-MM-dd HH:mm:ss")
          : "",
      ];
    });

    const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];

    return csvLines.join("\n");
  }

  static async exportAllToCSV(data: {
    sessions: Session[];
    goals: Goal[];
    achievements: Achievement[];
  }): Promise<void> {
    try {
      await this.exportSessionsToCSV(data.sessions);
      await this.exportGoalsToCSV(data.goals);
      await this.exportAchievementsToCSV(data.achievements);
      logger.success("All data exported to CSV successfully");
    } catch (error) {
      logger.error("Failed to export all data to CSV", error);
      throw error;
    }
  }

  static validateCSVContent(csvContent: string): {
    isValid: boolean;
    errors: string[];
    rowCount: number;
  } {
    const errors: string[] = [];
    const lines = csvContent.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      errors.push("CSV file is empty");
      return { isValid: false, errors, rowCount: 0 };
    }

    if (lines.length === 1) {
      errors.push("CSV file contains only headers, no data rows");
      return { isValid: false, errors, rowCount: 0 };
    }

    const headerCount = this.parseCSVLine(lines[0]).length;

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headerCount) {
        errors.push(
          `Row ${i + 1} has ${values.length} columns, expected ${headerCount}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      rowCount: lines.length - 1,
    };
  }
}
