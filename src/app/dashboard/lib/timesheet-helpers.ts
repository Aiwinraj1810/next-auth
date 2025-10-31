// app/dashboard/lib/timesheet-helpers.ts

import { Timesheet } from "../columns"

// Transform API response → frontend shape (just normalizing keys)
export function transformData(timesheetsFromApi: any[]): Timesheet[] {
  return timesheetsFromApi.map((t, index) => ({
    id: t.documentId,
    week: index + 1, // purely sequential from API pagination
    date: t.weekStart,
    sheetStatus: t.sheetStatus,
  }))
}
