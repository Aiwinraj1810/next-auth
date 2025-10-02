// app/api/timesheets/route.ts
import { NextResponse } from "next/server"
import Timesheet from "@/models/Timesheet"
import TimesheetEntry from "@/models/TimesheetEntry"
import { dbConnect } from "@/lib/db"
import { addDays } from "date-fns"
import { startOfWeek, endOfWeek, formatISO } from "date-fns"

export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const sheets = await Timesheet.find({ userId }).lean()
    return NextResponse.json(sheets)
  } catch (err) {
    console.error("GET /api/timesheets error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// inside POST /api/timesheets


export async function POST(req: Request) {
  await dbConnect()
  const { userId, project, typeOfWork, description, hours, assignedDate } = await req.json()

  if (!userId || !assignedDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const start = startOfWeek(new Date(assignedDate), { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(new Date(assignedDate), { weekStartsOn: 1 })
  console.log("week end", end)
  const weekStart = formatISO(start, { representation: "date" })
  const weekEnd = formatISO(end, { representation: "date" })
  console.log("weeknedasda : ", weekEnd)

  // find or create timesheet for this week
  let timesheet = await Timesheet.findOne({ userId, weekStart })
  if (!timesheet) {
    timesheet = await Timesheet.create({
      userId,
      weekStart,
      weekEnd,
      totalHours: 0,
      status: "MISSING",
    })
  }

  // add entry with week info
  await TimesheetEntry.create({
    timesheetId: timesheet._id,
    project,
    typeOfWork,
    description,
    hours,
    assignedDate,
    weekStart,
    weekEnd,
  })

  // recalc total hours for this week
  const entries = await TimesheetEntry.find({ timesheetId: timesheet._id })
  const totalHours = entries.reduce((acc, e) => acc + e.hours, 0)

  let status: "COMPLETED" | "INCOMPLETE" | "MISSING" = "MISSING"
  if (totalHours >= 40) status = "COMPLETED"
  else if (totalHours > 0) status = "INCOMPLETE"

  timesheet.totalHours = totalHours
  timesheet.status = status
  console.log("final enrty :", timesheet)
  await timesheet.save()

  return NextResponse.json(timesheet)
}
