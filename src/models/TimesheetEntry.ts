// models/TimesheetEntry.ts
import mongoose, { Schema, models, model } from "mongoose"

const TimesheetEntrySchema = new Schema(
  {
    timesheetId: { type: Schema.Types.ObjectId, ref: "Timesheet", required: true },
    project: { type: String, required: true },
    typeOfWork: { type: String, required: true },
    description: { type: String, required: true },
    hours: { type: Number, required: true },

    // ✅ Add these new fields
    assignedDate: { type: String, required: true }, // ISO yyyy-mm-dd
    weekStart: { type: String, required: true },
    weekEnd: { type: String, required: true },
  },
  { timestamps: true }
)

export default models.TimesheetEntry || model("TimesheetEntry", TimesheetEntrySchema)
