import { NextResponse } from "next/server"
import TimesheetEntry from "@/models/TimesheetEntry"
import Timesheet from "@/models/Timesheet"
import { dbConnect } from "@/lib/db"
import { startOfWeek, endOfWeek, formatISO } from "date-fns"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await req.json()
    const { project, typeOfWork, description, hours, assignedDate } = body

    const entry = await TimesheetEntry.findById(params.id)
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // Update entry fields
    entry.project = project
    entry.typeOfWork = typeOfWork
    entry.description = description
    entry.hours = hours
    entry.assignedDate = assignedDate

    // Recalculate week info
    const start = startOfWeek(new Date(assignedDate), { weekStartsOn: 1 })
    const end = endOfWeek(new Date(assignedDate), { weekStartsOn: 1 })
    entry.weekStart = formatISO(start, { representation: "date" })
    entry.weekEnd = formatISO(end, { representation: "date" })

    await entry.save()

    // Update parent timesheet totals
    const timesheet = await Timesheet.findById(entry.timesheetId)
    if (timesheet) {
      const entries = await TimesheetEntry.find({ timesheetId: timesheet._id })
      const totalHours = entries.reduce((acc, e) => acc + e.hours, 0)

      let status: "COMPLETED" | "INCOMPLETE" | "MISSING" = "MISSING"
      if (totalHours >= 40) status = "COMPLETED"
      else if (totalHours > 0) status = "INCOMPLETE"

      timesheet.totalHours = totalHours
      timesheet.status = status
      await timesheet.save()
    }

    return NextResponse.json(entry)
  } catch (err) {
    console.error("PATCH /timesheet-entries/:id error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const entry = await TimesheetEntry.findById(params.id)
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    const timesheetId = entry.timesheetId
    await TimesheetEntry.findByIdAndDelete(params.id)

    // Recalculate parent timesheet
    await recalcTimesheet(timesheetId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /timesheet-entries/:id error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ---------------- Helper ----------------
async function recalcTimesheet(timesheetId: string) {
  const timesheet = await Timesheet.findById(timesheetId)
  if (!timesheet) return

  const entries = await TimesheetEntry.find({ timesheetId })
  const totalHours = entries.reduce((acc, e) => acc + e.hours, 0)

  let status: "COMPLETED" | "INCOMPLETE" | "MISSING" = "MISSING"
  if (totalHours >= 40) status = "COMPLETED"
  else if (totalHours > 0) status = "INCOMPLETE"

  timesheet.totalHours = totalHours
  timesheet.status = status
  await timesheet.save()
}
