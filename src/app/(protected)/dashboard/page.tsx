"use client";

import { getColumns } from "../../dashboard/columns";
import { DataTable } from "../../dashboard/data-table";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import AddEntryModal from "../../components/AddEntryModal";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, formatISO } from "date-fns";
import { useLocale } from "@/app/context/LocaleContext";
import { useScopedI18n } from "@/app/i18n";


// Fetch timesheet summaries directly from Strapi

async function fetchTimesheetSummaries({
  queryKey,
}: {
  queryKey: [string, number, number, DateRange | undefined, string, string | undefined];
}) {
  const [, page, pageSize, dateRange, locale, status] = queryKey;

  // ✅ Format date range to ISO strings (YYYY-MM-DD)
  const from = dateRange?.from
    ? formatISO(dateRange.from, { representation: "date" })
    : undefined;
  const to = dateRange?.to
    ? formatISO(dateRange.to, { representation: "date" })
    : undefined;

  // ✅ Build query params in Strapi-friendly (nested) structure
  const params: Record<string, any> = {
    page,
    pageSize,
    sort: "weekStart:asc",
    locale,
    filters: {}, 
    status
  };

  // ✅ Apply filters in nested form so Strapi parses them correctly
  if (from) params.filters.weekStart = { $gte: from };
  if (to) params.filters.weekEnd = { $lte: to };
  if (status) params.filters.summaryStatus = { $eq: status };

  // 🟢 Optional: debug log for sanity check
  console.log("🧾 Fetching timesheet summaries with params:", params);

  // ✅ Fetch from Strapi (Axios automatically encodes nested filters)
  const res = await api.get("/timesheet-summaries/complete", { params });
  const { data, meta } = res.data;

  return {
    data: data || [],
    pagination: meta?.pagination || {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 0,
    },
  };
}


//
// ✅ Dashboard Component
//
export default function DashboardPage() {
  const { locale } = useLocale();
  const t = useScopedI18n("dashboard");

  // Pagination + filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  //
  // ✅ Fetch from Strapi
  //
  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["timesheet-summaries", page, pageSize, dateRange, locale,statusFilter],
    queryFn: fetchTimesheetSummaries,
    placeholderData: (prev) => prev,
  });

  const summaries = response?.data ?? [];
  const pagination = response?.pagination ?? { page: 1, pageCount: 1 };

  // Modal handling for adding entries
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

  //
  // ✅ Transform Strapi data → table-friendly shape
  //
  const data = summaries.map((item: any) => ({
    id: item.id,
    weekStart: item.weekStart,
    weekEnd: item.weekEnd,
    totalHours: item.totalHours,
    sheetStatus: item.summaryStatus,
  }));

  //
  // ✅ Render
  //
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
          columns={getColumns(handleOpenCreate, t)}
          data={data}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isFetching={isFetching}
          totalPages={pagination.pageCount || 1}
          onStatusFilterChange={(status)=>{
            setStatusFilter(status);
            setPage(1)
          }}
        />
      )}
    </div>
  );
}
