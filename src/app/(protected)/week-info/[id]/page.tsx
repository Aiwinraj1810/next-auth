"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getApi } from "@/lib/axios";
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
import { useScopedI18n } from "@/app/i18n";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

async function fetchWeekEntries(weekStart: string, jwt : string | undefined) {
    const api = getApi(jwt);
  const res = await api.get(`/timesheet-entries`, {
    params: {
      filters: {
        weekStart: { $eq: weekStart },
      },
      populate: "*",
      sort: ["date:asc"],
    },
  });
  return res.data?.data || [];
}

export default function WeekInfoPage() {
  const {data : session} = useSession()
  console.log("session from info : ", session)
  const t = useScopedI18n("weekInfo");
  const params = useParams();
  const weekStartParam = params.id as string;

  const weekStart = parseISO(weekStartParam);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formattedWeekEnd = weekEnd.toISOString().split("T")[0];
  const validWeekRange = isValid(weekStart) && isValid(weekEnd);

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const {
    data: entries = [],
    isLoading,
    refetch: refetchEntries,
  } = useQuery({
    queryKey: ["weekEntries", weekStartParam, session?.jwt],
    queryFn: () => fetchWeekEntries(weekStartParam, session?.jwt),
    enabled: !!weekStartParam && !!session?.jwt,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalHours = entries.reduce(
    (sum: number, e: any) => sum + (e.hours || 0),
    0
  );
  const days = validWeekRange
    ? eachDayOfInterval({ start: weekStart, end: weekEnd })
    : [];

  return (
    <div className="container mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
            {t("title")}
          </h1>
          {validWeekRange ? (
            <p className="text-sm text-gray-500">
              {format(weekStart, "d MMM")} - {format(weekEnd, "d MMM yyyy")}
            </p>
          ) : (
            <p className="text-sm text-gray-400">{t("invalidWeekRange")}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Progress
            value={(totalHours / 40) * 100}
            indicatorClassName="bg-orange-500"
            className="w-full sm:w-[300px]"
          />
          <span className="text-sm font-medium text-center sm:text-left">
            {t("hoursProgress", { total: totalHours })}
          </span>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-6">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const entriesForDay = entries.filter(
            (entry: any) =>
              entry.date &&
              format(parseISO(entry.date), "yyyy-MM-dd") === dayStr
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
                {entriesForDay.map((entry: any) => {
                  const entryStatus =
                    entry.entryStatus.charAt(0).toUpperCase() +
                    entry.entryStatus.slice(1);
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border rounded px-3 py-2 gap-2"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <p className="text-sm font-medium">
                          {entry.typeOfWork}
                        </p>
                        <p className="text-sm text-gray-500">
                          {entry.task || t("noDescription")}
                        </p>

                        {/* Status Badge */}
                        <Badge
                          variant={
                            entry.entryStatus === "approved"
                              ? "secondary"
                              : entry.entryStatus === "submitted"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            entry.entryStatus === "Approved"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : entry.entryStatus === "Submitted"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : "bg-red-100 text-red-500 border-red-100"
                          }
                        >
                          {t(entryStatus)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-sm">
                          {entry.hours || 0} {t("hrs")}
                        </span>
                        <span className="text-xs text-blue-600 hidden sm:inline">
                          {entry.project?.name || t("noProject")}
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
                                setSelectedDate(entry.date);
                                setOpen(true);
                              }}
                            >
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setDeletingEntryId(entry.documentId.toString());
                                setDeleteOpen(true);
                              }}
                            >
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}

                {/* Add new task */}
                <Button
                  variant="outline"
                  className="w-full bg-[#E1EFFE] border-blue-400 border-dotted cursor-pointer text-blue-600 text-sm"
                  onClick={() => {
                    setSelectedDate(dayStr);
                    setEditingEntry(null);
                    setOpen(true);
                  }}
                >
                  + {t("addNewTask")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {selectedDate && (
        <TaskModal
          weekId={weekStartParam}
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
        weekId={weekStartParam}
      />
    </div>
  );
}
