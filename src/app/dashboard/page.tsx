// app/dashboard/page.tsx
"use client"

import { columns, Timesheet } from "./columns"
import { DataTable } from "./data-table"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import AddEntryModal from "../components/AddEntryModal"
import { transformData } from "./lib/timesheet-helpers"

async function fetchTimesheets(): Promise<any[]> {
  const res = await api.get("/timesheets?userId=user123")
  return res.data
}

export default function DashboardPage() {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["timesheets"],
    queryFn: fetchTimesheets,
  })

  const data = transformData(raw)

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
