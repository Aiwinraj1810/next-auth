// app/dashboard/lib/timesheet-helpers.ts
import { startOfWeek, addWeeks, isBefore, formatISO } from "date-fns"
import { Timesheet } from "../columns"

// --- Build full list of weeks (generate gaps as "MISSING") ---
export function generateWeeks(fromDate: Date, toDate: Date) {
  const weeks: string[] = []
  let current = startOfWeek(fromDate, { weekStartsOn: 1 }) // Monday start

  while (isBefore(current, toDate) || current.getTime() === toDate.getTime()) {
    weeks.push(formatISO(current, { representation: "date" }))
    current = addWeeks(current, 1)
  }

  return weeks
}

// --- Transform API response → Timesheet[] ---
export function transformData(timesheetsFromApi: any[]): Timesheet[] {
  const start = new Date(new Date().getFullYear(), 0, 1) // Jan 1
  const end = new Date(new Date().getFullYear(), 11, 31) // Dec 31

  const allWeeks = generateWeeks(start, end)

  return allWeeks.map((weekStart, index) => {
    const match = timesheetsFromApi.find((t) => t.weekStart === weekStart)

    if (match) {
      return {
        id: match._id,
        week: index + 1,
        date: match.weekStart,
        status: match.status,
      }
    }

    return {
      id: index + 999999, // fake ID for missing week
      week: index + 1,
      date: weekStart,
      status: "MISSING",
    }
  })
}
