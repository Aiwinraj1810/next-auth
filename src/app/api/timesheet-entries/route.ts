// app/api/timesheet-entries/route.ts
import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import TimesheetEntry from "@/models/TimesheetEntry"

export async function GET(req: Request) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const timesheetId = searchParams.get("timesheetId")

  if (!timesheetId) {
    return NextResponse.json({ error: "Missing timesheetId" }, { status: 400 })
  }

  const entries = await TimesheetEntry.find({ timesheetId })
    .populate("timesheetId", "weekStart weekEnd status") // ✅ include weekEnd + status
    .lean()

  return NextResponse.json(entries)
}
