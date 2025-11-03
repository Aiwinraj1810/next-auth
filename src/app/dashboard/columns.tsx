"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useScopedI18n } from "../i18n"; // 👈 your custom hook

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
  week: number;
  date: string;
  sheetStatus: "COMPLETED" | "INCOMPLETE" | "MISSING";
};

// ⚡ Turn columns into a function
export function getColumns(
  handleOpenCreate: (weekStart: string) => void, t: ReturnType<typeof useScopedI18n>
): ColumnDef<Timesheet>[] {


  return [
    {
      accessorKey: "week",
      header: t("week"), // "Week #"
    },
    {
      accessorKey: "date",
      header: t("date"), // "Date"
      cell: ({ row }) => {
        const start = new Date(row.getValue("date"));
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // full week range

        // Use localized date format (will auto-switch for Arabic)
        return `${start.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        })} - ${end.toLocaleDateString(undefined, {
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

        return end >= from && start <= to;
      },
    },
    {
      accessorKey: "sheetStatus",
      header: t("status"), // "Status"
      meta: {
        filter: {
          type: "faceted",
          options: [
            { label: t("completed"), value: "COMPLETED" },
            { label: t("incomplete"), value: "INCOMPLETE" },
            { label: t("missing"), value: "MISSING" },
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

        const labelMap: Record<Timesheet["sheetStatus"], string> = {
          COMPLETED: t("completed"),
          INCOMPLETE: t("incomplete"),
          MISSING: t("missing"),
        };

        return (
          <Badge className={`${variant} rounded px-2 py-1 text-xs font-medium`}>
            {labelMap[status]}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"), // "Actions"
      cell: ({ row }) => {
        const status = row.getValue("sheetStatus") as Timesheet["sheetStatus"];
        const id = row.original.id;

        let actionKey = "view";
        if (status === "INCOMPLETE") actionKey = "update";
        if (status === "MISSING") actionKey = "create";

        const actionLabel = t(actionKey);

        if (status === "MISSING") {
          return (
            <button
              onClick={() => handleOpenCreate(row.original.date)}
              className="text-blue-600 hover:underline"
            >
              {actionLabel}
            </button>
          );
        }

        return (
          <Link
            href={`/week-info/${id}`}
            className="text-blue-600 hover:underline"
          >
            {actionLabel}
          </Link>
        );
      },
    },
  ];
}
