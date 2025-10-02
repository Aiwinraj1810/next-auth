// app/dashboard/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Define the Timesheet type
export type Timesheet = {
  id: number;
  week: number;
  date: string;
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
};

export const columns: ColumnDef<Timesheet>[] = [
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
      end.setDate(start.getDate() + 6); // full week (Mon–Sun)

      const formatOptions: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
      };

      return `${start.toLocaleDateString(
        "en-GB",
        formatOptions
      )} - ${end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      })}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Timesheet["status"];

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
      const status = row.getValue("status") as Timesheet["status"];
      const id = row.original.id;

      let action = "View";
      if (status === "INCOMPLETE") action = "Update";
      if (status === "MISSING") action = "Create";

      return (
        <Link
          href={`/week-info/${id}`}
          className="text-blue-600 hover:underline"
        >
          {action}
        </Link>
      );
    },
  },
];
