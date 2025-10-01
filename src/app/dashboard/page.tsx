// app/dashboard/page.tsx
"use client"

import { columns, Timesheet } from "./columns"
import { DataTable } from "./data-table"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import AddEntryModal from "../components/AddEntryModal"

// Fetch timesheets from API
async function fetchTimesheets(): Promise<any[]> {
  const res = await api.get("/timesheets?userId=user123")
  return res.data
}

// Transform API response into Timesheet[]
function transformData(timesheetsFromApi: any[]): Timesheet[] {
  return timesheetsFromApi.map((t, index) => ({
    id: t._id,
    week: index + 1, // derive sequential week #
    date: t.weekStart, // ISO string from backend
    status: t.status,
  }))
}

export default function DashboardPage() {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["timesheets"],
    queryFn: fetchTimesheets,
  })

  const data = transformData(raw)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
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
