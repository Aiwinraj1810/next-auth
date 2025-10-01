// src/types/timesheet.ts
export type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

export interface Timesheet {
  id: number;
  week: number;
  date: string;
  status: TimesheetStatus;
}
