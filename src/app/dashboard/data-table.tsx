"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  DataTable as ShadcnDataTable,
} from "@/components/data-table/data-table"

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"

import { useDataTable } from "@/hooks/use-data-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount = 1,
}: DataTableProps<TData, TValue>) {
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
  })

  // Grab the column object for "status" from the table
  const statusColumn = table.getColumn("status")

  return (
    <div className="space-y-4">
      {/* Toolbar with Status Filter */}
      <DataTableToolbar table={table}>
        {statusColumn && (
          <DataTableFilterMenu
            table={table}
          
            title="Status"
          />
        )}
      </DataTableToolbar>

      {/* Table */}
      <div className="rounded-md border">
        <ShadcnDataTable table={table} />
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
