import { NextResponse } from "next/server";
import Timesheet from "@/models/Timesheet";
import TimesheetEntry from "@/models/TimesheetEntry";
import { dbConnect } from "@/lib/db";
import { addDays } from "date-fns";

// GET user’s timesheets
export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const sheets = await Timesheet.find({ userId }).lean();
  return NextResponse.json(sheets);
}

// POST add new entry
export async function POST(req: Request) {
  await dbConnect();
  const { userId, project, typeOfWork, description, hours, weekStart } = await req.json();

  // find or create timesheet for week
  let timesheet = await Timesheet.findOne({ userId, weekStart });
  if (!timesheet) {
    const weekEnd = addDays(new Date(weekStart), 4).toISOString().split("T")[0];
    timesheet = await Timesheet.create({
      userId,
      weekStart,
      weekEnd,
      totalHours: 0,
      status: "MISSING",
    });
  }

  // add entry
  const entry = await TimesheetEntry.create({
    timesheetId: timesheet._id,
    project,
    typeOfWork,
    description,
    hours,
  });

  // recalc total hours
  const entries = await TimesheetEntry.find({ timesheetId: timesheet._id });
  const totalHours = entries.reduce((acc, e) => acc + e.hours, 0);

  let status = "MISSING";
  if (totalHours >= 40) status = "COMPLETED";
  else if (totalHours > 0) status = "INCOMPLETE";

  timesheet.totalHours = totalHours;
  timesheet.status = status;
  await timesheet.save();

  return NextResponse.json(timesheet);
}
