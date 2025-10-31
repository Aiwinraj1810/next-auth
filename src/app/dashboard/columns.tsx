"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ---- Extend ColumnMeta to allow filter configs ----
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filter?: {
      type: "faceted";
      options: { label: string; value: string }[];
    };
  }
}

// Define the Timesheet type
export type Timesheet = {
  id: number;
  documentId : string
  week: number;
  date: string;
  sheetStatus: "COMPLETED" | "INCOMPLETE" | "MISSING";
};

// ⚡ Turn columns into a function
export function getColumns(  handleOpenCreate: (weekStart: string) => void): ColumnDef<Timesheet>[] {
  return [
    {
      accessorKey: "week",
      header: "Week #",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const start = new Date(row.getValue("date"));
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // full week

        return `${start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })} - ${end.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
        })}`;
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue?.from || !filterValue?.to) return true;

        const start = new Date(row.getValue(columnId));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const from = new Date(filterValue.from);
        const to = new Date(filterValue.to);

        // ✅ Check week overlap
        return end >= from && start <= to;
      },
    },
    {
      accessorKey: "sheetStatus",
      header: "Status",
      meta: {
        filter: {
          type: "faceted",
          options: [
            { label: "Completed", value: "COMPLETED" },
            { label: "Incomplete", value: "INCOMPLETE" },
            { label: "Missing", value: "MISSING" },
          ],
        },
      },
      cell: ({ row }) => {
        const status = row.getValue("sheetStatus") as Timesheet["sheetStatus"];

        const variant =
          status === "COMPLETED"
            ? "bg-green-100 text-green-700"
            : status === "INCOMPLETE"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-pink-100 text-pink-700";

        return (
          <Badge className={`${variant} rounded px-2 py-1 text-xs font-medium`}>
            {status}
          </Badge>
        );
      },
    },
        {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.getValue("sheetStatus") as Timesheet["sheetStatus"]

        const id = row.original.documentId
 

        let action = "View"
        if (status === "INCOMPLETE") action = "Update"
        if (status === "MISSING") action = "Create"

        if (status === "MISSING") {
          return (
            <button
              onClick={() => handleOpenCreate(row.original.date)} // ✅ pass start date
              className="text-blue-600 hover:underline"
            >
              {action}
            </button>
          )
        }

        return (
          <Link
            href={`/week-info/${id}`}
            className="text-blue-600 hover:underline"
          >
            {action}
          </Link>
        )
      },
    },
  ];
}
