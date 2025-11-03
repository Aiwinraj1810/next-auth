"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { format } from "date-fns";

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
import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useScopedI18n } from "../i18n";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  isFetching?: boolean;
  totalPages: number;
  onStatusFilterChange?: (status?: string) => void; // backend-driven filter
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  dateRange,
  setDateRange,
  isFetching,
  totalPages,
  onStatusFilterChange,
}: DataTableProps<TData, TValue>) {
  const t = useScopedI18n("dashboard");
  const [currentStatus, setCurrentStatus] = useState<string>("");

  // ✅ Memoize props
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  // ✅ Initialize table (no filters, only core model)
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* ✅ Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* ✅ Date range filter */}
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
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* ✅ Status filter dropdown (backend-driven) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {currentStatus
                  ? t(currentStatus)
                  : t("status")}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              {/* All */}
              <DropdownMenuItem
                onClick={() => {
                  setCurrentStatus("");
                  onStatusFilterChange?.(undefined);
                }}
              >
                {!currentStatus && <Check className="mr-2 h-4 w-4" />}
                {t("all")}
              </DropdownMenuItem>

              {/* Completed */}
              <DropdownMenuItem
                onClick={() => {
                  setCurrentStatus("Completed");
                  onStatusFilterChange?.("Completed");
                }}
              >
                {currentStatus === "Completed" && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {t("completed")}
              </DropdownMenuItem>

              {/* Incomplete */}
              <DropdownMenuItem
                onClick={() => {
                  setCurrentStatus("Incomplete");
                  onStatusFilterChange?.("Incomplete");
                }}
              >
                {currentStatus === "Incomplete" && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {t("incomplete")}
              </DropdownMenuItem>

              {/* Missing */}
              <DropdownMenuItem
                onClick={() => {
                  setCurrentStatus("Missing");
                  onStatusFilterChange?.("Missing");
                }}
              >
                {currentStatus === "Missing" && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {t("missing")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="overflow-x-auto rounded-md border relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        )}

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
            {table.getRowModel().rows?.length ? (
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
                <TableCell
                  colSpan={memoizedColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("rowsPerPage")}
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
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

        {/* Pagination Controls */}
        <Pagination className="flex flex-wrap justify-center sm:justify-end gap-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              >
                {t("previous")}
              </PaginationPrevious>
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => onPageChange(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              >
                {t("next")}
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
