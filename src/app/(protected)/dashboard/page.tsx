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
import { useLocale } from "@/app/context/LocaleContext";
import { useScopedI18n } from "@/app/i18n"; // 👈 use scoped version

async function fetchTimesheets({
  queryKey,
}: {
  queryKey: [string, number, number, DateRange | undefined, string];
}) {
  const [, page, pageSize, dateRange, locale] = queryKey;
  const from = dateRange?.from
    ? formatISO(dateRange.from, { representation: "date" })
    : undefined;
  const to = dateRange?.to
    ? formatISO(dateRange.to, { representation: "date" })
    : undefined;

  const res = await api.get("/timesheets/full", {
    params: { userId: "user123", from, to, page, pageSize, locale },
  });

  return {
    data: res.data.data || [],
    pagination: res.data.meta?.pagination || {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 0,
    },
  };
}

export default function DashboardPage() {
  const { locale } = useLocale();
  const t = useScopedI18n("dashboard");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: response, isLoading, isFetching } = useQuery({
    queryKey: ["timesheets", page, pageSize, dateRange, locale],
    queryFn: fetchTimesheets,
    placeholderData: (prev) => prev,
  });

  const data = transformData(response?.data || []);
  const pagination = response?.pagination;

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
        <h1 className="text-lg sm:text-xl font-semibold">{t("title")}</h1>
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
          <span className="ml-2 text-gray-500 text-sm">{t("loading")}</span>
        </div>
      ) : (
        <DataTable
          columns={getColumns(handleOpenCreate,t)}
          data={data}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isFetching={isFetching}
          totalPages={pagination?.pageCount || 1}
        />
      )}
    </div>
  );
}
