"use client";

import { getColumns } from "../../dashboard/columns";
import { DataTable } from "../../dashboard/data-table";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import AddEntryModal from "../../components/AddEntryModal";
import { transformData } from "../../dashboard/lib/timesheet-helpers";
import { useState } from "react";
import { Loader2 } from "lucide-react";

async function fetchTimesheets(): Promise<any[]> {
  const res = await api.get("/timesheets?userId=user123");
  return res.data;
}

export default function DashboardPage() {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["timesheets"],
    queryFn: fetchTimesheets,
  });

  const data = transformData(raw);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [weekRange, setWeekRange] = useState<{ start?: string; end?: string }>(
    {}
  );

  function handleOpenCreate(weekStart: string) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    setWeekRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
    setOpenCreateModal(true);
  }

  return (
    <div className="container mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-xl font-semibold">Your Timesheets</h1>
        <AddEntryModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
          weekStart={weekRange.start}
          weekEnd={weekRange.end}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500 text-sm">Loading timesheets...</span>
        </div>
      ) : (
        <DataTable columns={getColumns(handleOpenCreate)} data={data} />
      )}
    </div>
  );
}
