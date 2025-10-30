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
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type FormValues = {
  project: string;
  typeOfWork: string;
  description: string;
  hours: number;
  assignedDate: string;
};

type Props = {
  open?: boolean;
  setOpen?: (val: boolean) => void;
  weekStart?: string;
  weekEnd?: string;
};

export default function AddEntryModal({
  open: controlledOpen,
  setOpen: setControlledOpen,
  weekStart,
  weekEnd,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { assignedDate: "" },
  });

  const queryClient = useQueryClient();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await api.post("/timesheets", {
        data: {
          userId: "user123",
          ...data,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      setOpen(false);
      reset();
    },
    onError:(error)=>[
      console.log("Post error : ", error)
    ]
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Project *
            </label>
            <Input
              placeholder="Project name"
              {...register("project", { required: "Project is required" })}
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
              Type of Work *
            </label>
            <Select
              onValueChange={(val) =>
                setValue("typeOfWork", val, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose work type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug Fixes">Bug Fixes</SelectItem>
                <SelectItem value="Feature Development">
                  Feature Development
                </SelectItem>
                <SelectItem value="Code Review">Code Review</SelectItem>
              </SelectContent>
            </Select>
            {errors.typeOfWork && (
              <p className="text-red-500 text-sm mt-1">
                Type of work is required
              </p>
            )}
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Task description *
            </label>
            <Textarea
              placeholder="Write text here..."
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Hours */}
          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const current = watch("hours") || 0;
                  if (current > 1)
                    setValue("hours", current - 1, { shouldValidate: true });
                }}
              >
                -
              </Button>

              <Input
                type="number"
                readOnly
                value={watch("hours") || 0}
                className="w-16 text-center"
                {...register("hours", {
                  valueAsNumber: true,
                  required: "Hours are required",
                  min: { value: 1, message: "Minimum 1 hour" },
                  max: { value: 40, message: "Maximum 40 hours" },
                })}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const current = watch("hours") || 0;
                  if (current < 40)
                    setValue("hours", current + 1, { shouldValidate: true });
                }}
              >
                +
              </Button>
            </div>
            {errors.hours && (
              <p className="text-red-500 text-sm mt-1">
                {errors.hours.message}
              </p>
            )}
          </div>

          {/* Assigned Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Assigned Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("assignedDate") ? (
                    format(new Date(watch("assignedDate")), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    watch("assignedDate")
                      ? new Date(watch("assignedDate"))
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      setValue("assignedDate", format(date, "yyyy-MM-dd"), {
                        shouldValidate: true,
                      });
                    }
                  }}
                  disabled={
                    [
                      weekStart ? { before: new Date(weekStart) } : undefined,
                      weekEnd ? { after: new Date(weekEnd) } : undefined,
                    ].filter(Boolean) as any
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.assignedDate && (
              <p className="text-red-500 text-sm mt-1">
                Assigned date is required
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
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !isValid}>
              {mutation.isPending ? "Saving..." : "Add Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
