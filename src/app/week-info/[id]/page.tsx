"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import TaskModal from "../../components/TaskModal"; // ✅ renamed modal that handles both add + edit
import { useState } from "react";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

async function fetchWeekEntries(timesheetId: string) {
  const res = await api.get(`/timesheet-entries?timesheetId=${timesheetId}`);
  return res.data;
}

export default function WeekInfoPage() {
  const params = useParams();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["weekEntries", id],
    queryFn: () => fetchWeekEntries(id),
    enabled: !!id,
  });

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  if (isLoading) return <p>Loading...</p>;
  if (!data.length) return <p>No tasks found for this week.</p>;

  // Week range
  const weekStart = parseISO(data[0].weekStart);
  const weekEnd = parseISO(data[0].weekEnd);

  // Total hours for header
  const totalHours = data.reduce((sum: number, t: any) => sum + t.hours, 0);

  // Generate list of days in the week
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex w-full justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold mb-4">This week’s timesheet</h1>
          <p className="text-sm text-gray-500">
            {format(weekStart, "d MMM")} - {format(weekEnd, "d MMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Progress value={(totalHours / 40) * 100} className="w-[300px]" />
          <span className="text-sm font-medium">{totalHours}/40 hrs</span>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-6">
        {days.map((day) => {
          const entriesForDay = data.filter(
            (entry: any) =>
              format(parseISO(entry.assignedDate), "yyyy-MM-dd") ===
              format(day, "yyyy-MM-dd")
          );

          return (
            <div key={day.toISOString()} className="space-y-2 flex gap-2">
              <div className="w-[15%]">
                <h2 className="text-sm font-medium">{format(day, "MMM d")}</h2>
              </div>

              <div className="space-y-2 w-full">
                {entriesForDay.map((entry: any) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{entry.project}</p>
                      <p className="text-xs text-gray-500">
                        {entry.typeOfWork}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{entry.hours} hrs</span>
                      <span className="text-xs text-blue-600">
                        Project Name
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
                              setDeletingEntryId(entry._id);
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
                  className="w-full text-blue-600 text-sm"
                  onClick={() => {
                    setSelectedDate(format(day, "yyyy-MM-dd"));
                    setEditingEntry(null); // ensure fresh add
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

      {/* ✅ Task Modal (shared across add + edit) */}
      {selectedDate && (
        <TaskModal
          weekId={id}
          defaultDate={selectedDate}
          entry={editingEntry}
          open={open}
          setOpen={setOpen}
        />
      )}

      <DeleteConfirmationModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        entryId={deletingEntryId}
        weekId={id}
      />
    </div>
  );
}
