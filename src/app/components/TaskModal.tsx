"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useScopedI18n } from "../i18n"; // 👈 import your scoped hook

type FormValues = {
  project: string;
  typeOfWork: string;
  description: string;
  hours: number;
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
  const t = useScopedI18n("taskModal"); // 👈 translations under "taskModal"

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

  const queryClient = useQueryClient();
  const assignedDate = watch("assignedDate");

  useEffect(() => {
    if (open) {
      if (entry) {
        setValue("project", entry.project);
        setValue("typeOfWork", entry.typeOfWork);
        setValue("description", entry.description);
        setValue("hours", entry.hours);
        setValue("assignedDate", new Date(entry.assignedDate));
      } else {
        reset();
        if (defaultDate) {
          setValue("assignedDate", new Date(defaultDate));
        }
      }
    }
  }, [open, entry, defaultDate, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (entry) {
        // Edit mode
        const res = await api.put(`/timesheet-entries/${entry.documentId}`, {
          data: { ...data, timesheet: entry.timesheet?.id },
        });
        return res.data;
      } else {
        // Add mode
        const res = await api.post("/timesheets", {
          data: {
            userId: "user123",
            ...data,
          },
        });
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
          {/* Project */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("project")} *
            </label>
            <Input
              placeholder={t("projectPlaceholder")}
              {...register("project", { required: t("projectRequired") })}
            />
            {errors.project && (
              <p className="text-red-500 text-sm mt-1">
                {errors.project.message}
              </p>
            )}
          </div>

          {/* Type of Work */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("typeOfWork")} *
            </label>
            <Select
              onValueChange={(val) =>
                setValue("typeOfWork", val, { shouldValidate: true })
              }
              value={watch("typeOfWork") || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("chooseWorkType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug Fixes">{t("bugFixes")}</SelectItem>
                <SelectItem value="Feature Development">
                  {t("featureDevelopment")}
                </SelectItem>
                <SelectItem value="Code Review">{t("codeReview")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.typeOfWork && (
              <p className="text-red-500 text-sm mt-1">
                {t("typeOfWorkRequired")}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("description")} *
            </label>
            <Textarea
              placeholder={t("descriptionPlaceholder")}
              {...register("description", {
                required: t("descriptionRequired"),
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
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

          {/* Assigned Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("assignedDate")} *
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
