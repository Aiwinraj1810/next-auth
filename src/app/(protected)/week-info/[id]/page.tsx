"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { format, parseISO, eachDayOfInterval, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import TaskModal from "../../../components/TaskModal";
import { useState } from "react";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

type TimesheetEntry = {
  id: number;
  documentId: string;
  project: string;
  typeOfWork: string;
  description: string;
  hours: number;
  assignedDate: string;
  weekStart: string;
  weekEnd: string;
  timesheet?: { id: number; documentId: string };
};

async function fetchWeekEntries(timesheetId: string) {
  const res = await api.get(
    `/timesheet-entries?filters[timesheet][documentId][$eq]=${timesheetId}&populate=*`
  );
  return res.data.data || [];
}

export default function WeekInfoPage() {
  const params = useParams();
  const id = params.id as string;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

const { data = [], isLoading } = useQuery<TimesheetEntry[]>({
  queryKey: ["weekEntries", id],
  queryFn: () => fetchWeekEntries(id),
  enabled: !!id,
  placeholderData: (prev) => prev, // ✅ React Query v5 safe
});

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // Handle empty state
  if (!data?.length) {
    return <p className="text-center text-gray-500 py-10">No tasks found for this week.</p>;
  }

  // ✅ Safely extract and validate week range
  const weekStartStr = data?.[0]?.weekStart ?? null;
  const weekEndStr = data?.[0]?.weekEnd ?? null;

  const weekStart = weekStartStr ? parseISO(weekStartStr) : null;
  const weekEnd = weekEndStr ? parseISO(weekEndStr) : null;

  const validWeekRange = weekStart && weekEnd && isValid(weekStart) && isValid(weekEnd);

  // ✅ Safely calculate total hours
  const totalHours = data.reduce((sum: number, t: any) => sum + (t.hours || 0), 0);

  // ✅ Safely build week days (guard if invalid)
  const days = validWeekRange
    ? eachDayOfInterval({ start: weekStart, end: weekEnd })
    : [];

  return (
    <div className="container mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
            This week’s timesheet
          </h1>
          {validWeekRange ? (
            <p className="text-sm text-gray-500">
              {format(weekStart!, "d MMM")} - {format(weekEnd!, "d MMM yyyy")}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Invalid week range</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Progress
            value={(totalHours / 40) * 100}
            indicatorClassName="bg-orange-500"
            className="w-full sm:w-[300px]"
          />
          <span className="text-sm font-medium text-center sm:text-left">
            {totalHours}/40 hrs
          </span>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-6">
        {days.map((day) => {
          const entriesForDay = data.filter(
            (entry: any) =>
              entry.assignedDate &&
              format(parseISO(entry.assignedDate), "yyyy-MM-dd") ===
                format(day, "yyyy-MM-dd")
          );

          return (
            <div
              key={day.toISOString()}
              className="flex flex-col sm:flex-row sm:items-start gap-2"
            >
              {/* Date label */}
              <div className="sm:w-[15%]">
                <h2 className="text-sm font-medium">{format(day, "MMM d")}</h2>
              </div>

              {/* Tasks list */}
              <div className="flex-1 space-y-2">
                {entriesForDay.map((entry: any) => (
                  <div
                    key={entry.id || entry.documentId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border rounded px-3 py-2 gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.typeOfWork}</p>
                      <p className="text-xs text-gray-500">
                        {entry.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-sm">{entry.hours || 0} hrs</span>
                      <span className="text-xs text-blue-600 hidden sm:inline">
                        {entry.project || "No project"}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingEntry(entry);
                              setSelectedDate(entry.assignedDate);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingEntryId(entry.id || entry.documentId);
                              setDeleteOpen(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {/* Add new task */}
                <Button
                  variant="outline"
                  className="w-full bg-[#E1EFFE] border-blue-400 border-dotted cursor-pointer text-blue-600 text-sm"
                  onClick={() => {
                    setSelectedDate(format(day, "yyyy-MM-dd"));
                    setEditingEntry(null);
                    setOpen(true);
                  }}
                >
                  + Add new task
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {selectedDate && (
        <TaskModal
          weekId={id}
          defaultDate={selectedDate}
          entry={editingEntry}
          open={open}
          setOpen={setOpen}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        entryId={deletingEntryId}
        weekId={id}
      />
    </div>
  );
}
