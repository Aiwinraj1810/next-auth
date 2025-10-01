import mongoose, { Schema, models, model } from "mongoose";

const TimesheetEntrySchema = new Schema(
  {
    timesheetId: { type: Schema.Types.ObjectId, ref: "Timesheet" },
    project: { type: String, required: true },
    typeOfWork: { type: String, required: true },
    description: { type: String },
    hours: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.TimesheetEntry || model("TimesheetEntry", TimesheetEntrySchema);
