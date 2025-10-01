// components/AddEntryModal.tsx
"use client"

import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import api from "@/lib/axios"
import { useState } from "react"

type FormValues = {
  project: string
  typeOfWork: string
  description: string
  hours: number
  weekStart: string
}

export default function AddEntryModal() {
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await api.post("/timesheets", {
        userId: "user123", // Replace with session.user.id from next-auth
        ...data,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] })
      setOpen(false)
      reset()
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">+ Add Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Project *</label>
            <Input placeholder="Project name" {...register("project", { required: true })} />
          </div>

          {/* Type of Work */}
          <div>
            <label className="block text-sm font-medium mb-1">Type of Work *</label>
            <Select onValueChange={(val) => setValue("typeOfWork", val)}>
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

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Task description *</label>
            <Textarea placeholder="Write text here..." {...register("description", { required: true })} />
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <Input type="number" min={1} max={12} {...register("hours", { valueAsNumber: true, required: true })} />
          </div>

          {/* Week Start */}
          <div>
            <label className="block text-sm font-medium mb-1">Week Start *</label>
            <Input type="date" {...register("weekStart", { required: true })} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Add Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
