"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useScopedI18n } from "../i18n";

// ---- Extend ColumnMeta to allow filter configs ----
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filter?: {
      type: "faceted";
      options: { label: string; value: string }[];
    };
  }
}

// ✅ Updated Timesheet type (matches Strapi’s summary)
export type Timesheet = {
  id: number;
  weekStart: string;
  weekEnd?: string;
  totalHours?: number;
  sheetStatus: "Completed" | "Incomplete" | "Missing";
};

// ⚡ Turn columns into a function
export function getColumns(
  handleOpenCreate: (weekStart: string) => void,
  t: ReturnType<typeof useScopedI18n>
): ColumnDef<Timesheet>[] {
  return [
    // 🗓️ Week range
    {
      accessorKey: "weekStart",
      header: t("week"),
      cell: ({ row }) => {
        const start = new Date(row.original.weekStart);
        const end = row.original.weekEnd
          ? new Date(row.original.weekEnd)
          : new Date(start.setDate(start.getDate() + 6));

        return `${start.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        })} - ${end.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
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

    // ⏱️ Total hours
    {
      accessorKey: "totalHours",
      header: t("hours"),
      cell: ({ row }) => {
        return(
        <span className="font-medium">{row.original.totalHours ?? 0}</span>
      )},
    },

    // 📊 Status column
    {
      accessorKey: "sheetStatus",
      header: t("status"),
      meta: {
        filter: {
          type: "faceted",
          options: [
            { label: t("completed"), value: "Completed" },
            { label: t("incomplete"), value: "Incomplete" },
            { label: t("missing"), value: "Missing" },
          ],
        },
      },
      cell: ({ row }) => {
        const status = row.original.sheetStatus;
        const variant =
          status === "Completed"
            ? "bg-green-100 text-green-700"
            : status === "Incomplete"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-pink-100 text-pink-700";

        const labelMap: Record<Timesheet["sheetStatus"], string> = {
          Completed: t("completed"),
          Incomplete: t("incomplete"),
          Missing: t("missing"),
        };

        return (
          <Badge className={`${variant} rounded px-2 py-1 text-xs font-medium`}>
            {labelMap[status]}
          </Badge>
        );
      },
    },

    // ⚙️ Actions column
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const status = row.original.sheetStatus;
        const weekStart = row.original.weekStart; // ✅ Key param

        let actionKey = "view";
        if (status === "Incomplete") actionKey = "update";
        if (status === "Missing") actionKey = "create";

        const actionLabel = t(actionKey);

        // 🟡 Missing → opens Add Task modal
        if (status === "Missing") {
          return (
            <button
              onClick={() => handleOpenCreate(weekStart)}
              className="text-blue-600 hover:underline"
            >
              {actionLabel}
            </button>
          );
        }

        return (
          <Link
            href={`/week-info/${weekStart}`} // ✅ pass weekStart param
            className="text-blue-600 hover:underline"
          >
            {actionLabel}
          </Link>
        );
      },
    },
  ];
}
