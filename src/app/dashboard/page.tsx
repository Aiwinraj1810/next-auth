// app/dashboard/page.tsx
"use client"

import { columns, Timesheet } from "./columns"
import { DataTable } from "./data-table"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import AddEntryModal from "../components/AddEntryModal"
import { useState } from "react"
import { startOfMonth, endOfMonth, startOfWeek, addWeeks, isBefore, formatISO } from "date-fns"


async function fetchTimesheets(): Promise<any[]> {
  const res = await api.get("/timesheets?userId=user123")
  return res.data
}

// Build full list of weeks in the range
function generateWeeks(fromDate: Date, toDate: Date) {
  const weeks: string[] = []
  let current = startOfWeek(fromDate, { weekStartsOn: 1 }) // Monday start

  while (isBefore(current, toDate) || current.getTime() === toDate.getTime()) {
    weeks.push(formatISO(current, { representation: "date" }))
    current = addWeeks(current, 1)
  }

  return weeks
}

// Transform API response into Timesheet[]
function transformData(timesheetsFromApi: any[], fromDate: Date, toDate: Date): Timesheet[] {
  const allWeeks = generateWeeks(fromDate, toDate)

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

export default function DashboardPage() {
  // Default to this month
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()))
  const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()))

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["timesheets"],
    queryFn: fetchTimesheets,
  })

  // Transform backend response → include missing weeks
  const data = transformData(raw, fromDate, toDate)

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Your Timesheets</h1>
        <AddEntryModal />
      </div>


      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  )
}
