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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // ✅ Server-side pagination props
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // ✅ Date range control (lifted state)
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;

  // ✅ For loading state (optional)
  isFetching?: boolean;
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
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const statusColumn = table.getColumn("sheetStatus");
  const currentStatus = (statusColumn?.getFilterValue() as string) ?? "";
  const dateColumn = table.getColumn("date");

  // ✅ Sync initial date filter when mounted
  useMemo(() => {
    if (dateColumn && dateRange?.from && dateRange?.to) {
      dateColumn.setFilterValue({
        from: dateRange.from.getTime(),
        to: dateRange.to.getTime(),
      });
    }
  }, [dateColumn, dateRange]);

  return (
    <div className="space-y-4">
      {/* ✅ Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* ✅ Date range filter */}
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
                    setDateRange(range); // Triggers backend refetch in parent
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

          {/* ✅ Status filter */}
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
                  {!currentStatus && <Check className="mr-2 h-4 w-4" />}
                  All
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
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

        {/* Pagination Controls */}
        <Pagination className="flex flex-wrap justify-center sm:justify-end gap-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Just simple pages (1,2,3...) */}
            {[...Array(5)].map((_, i) => (
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
                onClick={() => onPageChange(page + 1)}
                className=""
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
