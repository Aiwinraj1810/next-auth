import mongoose, { Schema, models, model } from "mongoose";

const TimesheetSchema = new Schema(
  {
    userId: { type: String, required: true },
    weekStart: { type: String, required: true }, // ISO date string
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["COMPLETED", "INCOMPLETE", "MISSING"],
      default: "MISSING",
    },
  },
  { timestamps: true }
);

export default models.Timesheet || model("Timesheet", TimesheetSchema);
