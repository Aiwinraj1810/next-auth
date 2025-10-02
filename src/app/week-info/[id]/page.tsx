"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import api from "@/lib/axios"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { format } from "date-fns"

async function fetchWeekEntries(timesheetId: string) {
  const res = await api.get(`/timesheet-entries?timesheetId=${timesheetId}`)
  return res.data
}

export default function WeekInfoPage() {
  const params = useParams()
  const id = params.id as string

  const { data = [], isLoading } = useQuery({
    queryKey: ["weekEntries", id],
    queryFn: () => fetchWeekEntries(id),
    enabled: !!id,
  })

  let weekStart: string | null = null
  let weekEnd: string | null = null

  if (data.length > 0) {
    weekStart = data[0].weekStart || data[0].timesheetId?.weekStart
    weekEnd = data[0].weekEnd || null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6">
        Week Info{" "}
        {weekStart && weekEnd
          ? `(${format(new Date(weekStart), "d MMM")} - ${format(
              new Date(weekEnd),
              "d MMM yyyy"
            )})`
          : ""}
      </h1>

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Type of Work</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((entry: any) => (
                <TableRow key={entry._id}>
                  <TableCell>{entry.project}</TableCell>
                  <TableCell>{entry.typeOfWork}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.hours}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No tasks found for this week.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
