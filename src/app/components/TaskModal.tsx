"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {getApi} from "@/lib/axios";
import { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useScopedI18n } from "../i18n";
import { useLocale } from "../context/LocaleContext";
import { useSession } from "next-auth/react";

type FormValues = {
  project: string;
  task: string;
  hours: number;
  entryStatus: "Pending" | "Submitted" | "Approved";
  assignedDate: Date;
};

export default function TaskModal({
  weekId,
  defaultDate,
  entry,
  open,
  setOpen,
}: {
  weekId: string;
  defaultDate?: string;
  entry?: any;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const t = useScopedI18n("taskModal");
  const session = useSession()
  const api = getApi(session?.jwt)

  const queryClient = useQueryClient();
  const { locale } = useLocale();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects",locale],
    queryFn: async () => {
      const res = await api.get(`/projects?locale=${locale}`);
      return res.data.data || [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { assignedDate: undefined },
  });

  const assignedDate = watch("assignedDate");
  const entryStatus = watch("entryStatus");
  const project = watch("project");

  useEffect(() => {
    if (open) {
      if (entry) {
        setValue("project", entry.project?.id?.toString());
        setValue("task", entry.task);
        setValue("hours", entry.hours);
        setValue("entryStatus", entry.entryStatus || "Pending");
        setValue("assignedDate", new Date(entry.date));
      } else {
        reset();
        setValue("entryStatus", "Pending");
        if (defaultDate) {
          setValue("assignedDate", new Date(defaultDate));
        }
      }
    }
  }, [open, entry, defaultDate, setValue, reset]);

  // 🧠 Mutation logic
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        data: {
          task: data.task,
          hours: data.hours,
          entryStatus: data.entryStatus,
          date: format(data.assignedDate, "yyyy-MM-dd"),
          weekStart: weekId,
          project: data.project ? Number(data.project) : null,
        },
      };

      if (entry) {
        // Edit existing entry
        const res = await api.put(
          `/timesheet-entries/${entry.documentId}`,
          payload
        );
        return res.data;
      } else {
        // Create new entry
        const res = await api.post(`/timesheet-entries`, payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekEntries", weekId] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormValues) => mutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? t("editTask") : t("addTask")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("task")} *
            </label>
            <Input
              placeholder={t("taskPlaceholder")}
              {...register("task", { required: t("taskRequired") })}
            />
            {errors.task && (
              <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>
            )}
          </div>

          {/* Project Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("project")} *
            </label>
            <Select
              onValueChange={(val) =>
                setValue("project", val, { shouldValidate: true })
              }
              value={project || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("chooseProject")} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name || `Project ${p.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project && (
              <p className="text-red-500 text-sm mt-1">
                {t("projectRequired")}
              </p>
            )}
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("hours")} *
            </label>
            <Input
              type="number"
              min={1}
              max={40}
              {...register("hours", {
                valueAsNumber: true,
                required: t("hoursRequired"),
                min: { value: 1, message: t("minHour") },
                max: { value: 40, message: t("maxHour") },
              })}
            />
            {errors.hours && (
              <p className="text-red-500 text-sm mt-1">
                {errors.hours.message}
              </p>
            )}
          </div>

          {/* Entry Status */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("entryStatus")} *
            </label>
            <Select
              onValueChange={(val) =>
                setValue("entryStatus", val as any, { shouldValidate: true })
              }
              value={entryStatus || "Pending"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("chooseStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">{t("pending")}</SelectItem>
                <SelectItem value="Submitted">{t("submitted")}</SelectItem>
                <SelectItem value="Approved">{t("approved")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("date")} *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {assignedDate ? (
                    format(assignedDate, "PPP")
                  ) : (
                    <span>{t("pickDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={assignedDate}
                  onSelect={(date) =>
                    date &&
                    setValue("assignedDate", date, { shouldValidate: true })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.assignedDate && (
              <p className="text-red-500 text-sm mt-1">
                {t("assignedDateRequired")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending || !isValid}>
              {mutation.isPending
                ? t("saving")
                : entry
                ? t("updateTask")
                : t("addTask")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
