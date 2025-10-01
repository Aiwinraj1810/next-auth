// src/data/timesheets.ts
import { Timesheet } from "@/types/timesheet";


export const timesheets: Timesheet[] = [
  { id: 1, week: 1, date: "2024-01-01", status: "COMPLETED" },   // Jan 1–5
  { id: 2, week: 2, date: "2024-01-08", status: "COMPLETED" },   // Jan 8–12
  { id: 3, week: 3, date: "2024-01-15", status: "INCOMPLETE" },  // Jan 15–19
  { id: 4, week: 4, date: "2024-01-22", status: "COMPLETED" },   // Jan 22–26
  { id: 5, week: 5, date: "2024-01-29", status: "MISSING" },     // Jan 29–Feb 2
]
