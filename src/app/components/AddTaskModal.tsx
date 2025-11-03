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

type FormValues = {
  project: string;
  typeOfWork: string;
  description: string;
  hours: number;
  assignedDate: Date;
};

export default function AddTaskModal({
  weekId,
  defaultDate,
  open,
  setOpen,
}: {
  weekId: string;
  defaultDate: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>();
  const queryClient = useQueryClient();

  // Watch current assignedDate
  const assignedDate = watch("assignedDate");

  useEffect(() => {
    if (open && defaultDate) {
      setValue("assignedDate", new Date(defaultDate));
    }
  }, [open, defaultDate, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await api.post("/timesheets", {
        userId: "user123", // replace with session.user.id later
        ...data,
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekEntries", weekId] });
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Project *
            </label>
            <Input
              placeholder="Project name"
              {...register("project", { required: true })}
            />
          </div>

          {/* Type of Work */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type of Work *
            </label>
            <Select onValueChange={(val) => setValue("typeOfWork", val)}>
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
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Task description *
            </label>
            <Textarea
              placeholder="Write text here..."
              {...register("description", { required: true })}
            />
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <Input
              type="number"
              min={1}
              max={40}
              {...register("hours", { valueAsNumber: true, required: true })}
            />
          </div>

          {/* Assigned Date with Shadcn Calendar */}
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
                  {assignedDate ? (
                    format(assignedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={assignedDate}
                  onSelect={(date) => date && setValue("assignedDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}