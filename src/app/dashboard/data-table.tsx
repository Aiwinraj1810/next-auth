"use client"

import {
  ColumnDef,
} from "@tanstack/react-table"

import {
  DataTable as ShadcnDataTable,
} from "@/components/data-table/data-table"

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"

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
      {/* Toolbar with just filters */}
      <DataTableToolbar table={table}>
        <DataTableFilterList table={table} />
      </DataTableToolbar>

      {/* The table itself */}
      <ShadcnDataTable table={table} />
    </div>
  )
}
