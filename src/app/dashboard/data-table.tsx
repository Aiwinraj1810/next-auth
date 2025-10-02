// app/dashboard/data-table.tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const memoizedColumns = React.useMemo(() => columns, [columns])
  const memoizedData = React.useMemo(() => data, [data])

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Current filter value for the "status" column
  const statusColumn = table.getColumn("status")
  const currentValue = (statusColumn?.getFilterValue() as string) ?? ""

  return (
    <div className="space-y-4">
      {/* ✅ Shadcn DropdownMenu for Status filter */}
      {statusColumn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {currentValue ? currentValue : "Filter by Status"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => statusColumn.setFilterValue(undefined)}
            >
              {!currentValue && <Check className="mr-2 h-4 w-4" />}
              All
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => statusColumn.setFilterValue("COMPLETED")}
            >
              {currentValue === "COMPLETED" && (
                <Check className="mr-2 h-4 w-4" />
              )}
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => statusColumn.setFilterValue("INCOMPLETE")}
            >
              {currentValue === "INCOMPLETE" && (
                <Check className="mr-2 h-4 w-4" />
              )}
              Incomplete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => statusColumn.setFilterValue("MISSING")}
            >
              {currentValue === "MISSING" && (
                <Check className="mr-2 h-4 w-4" />
              )}
              Missing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
    </div>
  )
}
