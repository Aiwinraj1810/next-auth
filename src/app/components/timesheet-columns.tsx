// src/components/timesheet-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Timesheet } from "@/types/timesheet";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const timesheetColumns: ColumnDef<Timesheet>[] = [
  {
    accessorKey: "week",
    header: "Week #",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const color =
        status === "COMPLETED"
          ? "bg-green-100 text-green-700"
          : status === "INCOMPLETE"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-pink-100 text-pink-700";

      return (
        <Badge className={`${color} rounded px-2 py-1 text-xs font-medium`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const id = row.original.id;

      let action = "View";
      if (status === "INCOMPLETE") action = "Update";
      if (status === "MISSING") action = "Create";

      return (
        <Link href={`/timesheets/${id}`} className="text-blue-600 hover:underline">
          {action}
        </Link>
      );
    },
  },
];
