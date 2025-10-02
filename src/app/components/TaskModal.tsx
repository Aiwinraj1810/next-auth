"use client"

import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import api from "@/lib/axios"
import { useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

type FormValues = {
  project: string
  typeOfWork: string
  description: string
  hours: number
  assignedDate: Date
}

export default function TaskModal({
  weekId,
  defaultDate,
  entry,
  open,
  setOpen,
}: {
  weekId: string
  defaultDate?: string
  entry?: any // edit mode if provided
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>()
  const queryClient = useQueryClient()
  const assignedDate = watch("assignedDate")

  // Populate form in edit mode
  useEffect(() => {
    if (open) {
      if (entry) {
        setValue("project", entry.project)
        setValue("typeOfWork", entry.typeOfWork)
        setValue("description", entry.description)
        setValue("hours", entry.hours)
        setValue("assignedDate", new Date(entry.assignedDate))
      } else if (defaultDate) {
        setValue("assignedDate", new Date(defaultDate))
      }
    }
  }, [open, entry, defaultDate, setValue])

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (entry) {
        // ✅ Edit mode
        const res = await api.patch(`/timesheet-entries/${entry._id}`, {
          ...data,
        })
        return res.data
      } else {
        // ✅ Add mode
        const res = await api.post("/timesheets", {
          userId: "user123",
          ...data,
        })
        return res.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekEntries", weekId] })
      setOpen(false)
      reset()
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project *</label>
            <Input {...register("project", { required: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type of Work *</label>
            <Select onValueChange={(val) => setValue("typeOfWork", val)} value={watch("typeOfWork") || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Choose work type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug Fixes">Bug Fixes</SelectItem>
                <SelectItem value="Feature Development">Feature Development</SelectItem>
                <SelectItem value="Code Review">Code Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Textarea {...register("description", { required: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <Input type="number" min={1} max={40} {...register("hours", { valueAsNumber: true, required: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assigned Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {assignedDate ? format(assignedDate, "PPP") : <span>Pick a date</span>}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : entry ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
