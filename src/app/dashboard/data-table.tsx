"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  DataTable as ShadcnDataTable,
} from "@/components/data-table/data-table"

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
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

  return (
    <div className="space-y-4">
      {/* Top Toolbar with only filters */}
   <DataTableToolbar table={table}>
  <div className="flex gap-2">
    {/* Custom Date Range Picker (replace later with real one) */}
    <button className="px-3 py-1 border rounded">Date Range</button>
    {/* Built-in Status filter */}
    <DataTableFilterList table={table} />
  </div>
</DataTableToolbar>


      {/* Table */}
      <div className="rounded-md border">
        <ShadcnDataTable table={table} />
      </div>

   
    </div>
  )
}
