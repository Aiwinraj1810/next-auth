"use client";

import { getColumns } from "../../dashboard/columns";
import { DataTable } from "../../dashboard/data-table";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import AddEntryModal from "../../components/AddEntryModal";
import { transformData } from "../../dashboard/lib/timesheet-helpers";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, formatISO } from "date-fns";

async function fetchTimesheets({
  queryKey,
}: {
  queryKey: [string, number, number, DateRange | undefined];
}) {
  const [, page, pageSize, dateRange] = queryKey;

  const from = dateRange?.from
    ? formatISO(dateRange.from, { representation: "date" })
    : undefined;
  const to = dateRange?.to
    ? formatISO(dateRange.to, { representation: "date" })
    : undefined;

  const res = await api.get("/timesheets/full", {
    params: {
      userId: "user123",
      from,
      to,
      page,
      pageSize,
    },
  });

  return res.data.data || [];
}

export default function DashboardPage() {
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Default date range = current month
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: raw = [], isLoading, isFetching } = useQuery({
    queryKey: ["timesheets", page, pageSize, dateRange],
    queryFn: fetchTimesheets,
    keepPreviousData: true,
  });

  const data = transformData(raw);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [weekRange, setWeekRange] = useState<{ start?: string; end?: string }>({});

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
          <span className="ml-2 text-gray-500 text-sm">
            Loading timesheets...
          </span>
        </div>
      ) : (
        <DataTable
          columns={getColumns(handleOpenCreate)}
          data={data}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isFetching={isFetching}
          dateRange={dateRange}
          setDateRange={setDateRange} // 👈 Pass to table
        />
      )}
    </div>
  );
}
