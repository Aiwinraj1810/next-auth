"use client";

import { getColumns, Timesheet } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import AddEntryModal from "../components/AddEntryModal";
import { transformData } from "./lib/timesheet-helpers";
import { useState } from "react";

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
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Your Timesheets</h1>
        <AddEntryModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
          weekStart={weekRange.start}
          weekEnd={weekRange.end}
        />
        {/* <button
          onClick={() => setOpenCreateModal(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          + Add Entry
        </button> */}
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={getColumns(handleOpenCreate)} data={data} />
      )}
    </div>
  );
}
