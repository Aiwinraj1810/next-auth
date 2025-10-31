"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, ChevronDown } from "lucide-react";
import { endOfMonth, eachWeekOfInterval, getISOWeek, format, startOfMonth } from "date-fns";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DateRange } from "react-day-picker";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Timesheet } from "./columns"; // ✅ import your type


interface DataTableProps {
  columns: ColumnDef<Timesheet, any>[];
  endpoint: string; // e.g. "/api/timesheets"
}

export function DataTable({ columns, endpoint }: DataTableProps) {
  const today = new Date();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Pagination (from Strapi)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 1,
  });

  // ✅ Default date filter (current month)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  const memoizedColumns = useMemo(() => columns, [columns]);

  // ✅ Fetch from Strapi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          "pagination[page]": String(pagination.page),
          "pagination[pageSize]": String(pagination.pageSize),
        });

        const statusColumn = columnFilters.find((f) => f.id === "sheetStatus");
        const dateFilter = columnFilters.find((f) => f.id === "date");

        if (statusColumn?.value) {
          params.append(
            "filters[sheetStatus][$eq]",
            String(statusColumn.value)
          );
        }

        // ✅ your collection uses weekStart / weekEnd in Strapi
        if (dateFilter?.value?.from && dateFilter?.value?.to) {
          params.append(
            "filters[weekStart][$gte]",
            new Date(dateFilter.value.from).toISOString()
          );
          params.append(
            "filters[weekEnd][$lte]",
            new Date(dateFilter.value.to).toISOString()
          );
        }

        const url = `http://localhost:1337${endpoint}?${params.toString()}`;
        console.log("📡 Fetching:", url);

        const res = await fetch(url);
        const json = await res.json();

    

        // ✅ Strapi data structure: data[].attributes
        const formatted = json.data?.map((item: any) => {
          const weekStartDate = new Date(item.weekStart);
          const weekNumber = getISOWeek(weekStartDate);

          return {
            id: item.id,
            week: weekNumber,
            date: item.weekStart, // ✅ date column handles range itself
            sheetStatus: item.sheetStatus,
            ...item
          };
        });

        setData(formatted || []);
        setPagination((prev) => ({
          ...prev,
          pageCount: json.meta?.pagination?.pageCount ?? 1,
        }));
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.page, pagination.pageSize, columnFilters, endpoint]);
  useEffect(() => {
    console.log("✅ Data after setData:", data);
  }, [data]);

  const table = useReactTable({
    data,
    columns: memoizedColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  });

  const statusColumn = table.getColumn("sheetStatus");
  const dateColumn = table.getColumn("date");
  const currentStatus = (statusColumn?.getFilterValue() as string) ?? "";

  // ✅ Default date filter when mounted
  useEffect(() => {
    if (dateColumn && dateRange?.from && dateRange?.to) {
      dateColumn.setFilterValue({
        from: dateRange.from.getTime(),
        to: dateRange.to.getTime(),
      });
    }
  }, [dateColumn]);

  return (
    <div className="space-y-4">
      {/* ✅ Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* ✅ Date Range Filter */}
          {dateColumn && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-[260px] justify-start"
                >
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) {
                      dateColumn.setFilterValue({
                        from: range.from.getTime(),
                        to: range.to.getTime(),
                      });
                    } else {
                      dateColumn.setFilterValue(undefined);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* ✅ Status Filter */}
          {statusColumn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {currentStatus ? currentStatus : "Status"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => statusColumn.setFilterValue(undefined)}
                >
                  {!currentStatus && <Check className="mr-2 h-4 w-4" />} All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => statusColumn.setFilterValue("COMPLETED")}
                >
                  {currentStatus === "COMPLETED" && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => statusColumn.setFilterValue("INCOMPLETE")}
                >
                  {currentStatus === "INCOMPLETE" && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Incomplete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => statusColumn.setFilterValue("MISSING")}
                >
                  {currentStatus === "MISSING" && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Missing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ✅ Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) =>
              setPagination({ ...pagination, pageSize: Number(value), page: 1 })
            }
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="flex flex-wrap justify-center sm:justify-end gap-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                aria-disabled={pagination.page === 1}
                className={
                  pagination.page === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: pagination.pageCount }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPagination({ ...pagination, page: i + 1 })}
                  isActive={pagination.page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.pageCount, prev.page + 1),
                  }))
                }
                aria-disabled={pagination.page === pagination.pageCount}
                className={
                  pagination.page === pagination.pageCount
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
