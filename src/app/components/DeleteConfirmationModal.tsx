"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import api from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function DeleteConfirmationModal({
  open,
  setOpen,
  entryId,
  weekId,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  entryId: string | null
  weekId: string
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!entryId) return
      await api.delete(`/timesheet-entries/${entryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekEntries", weekId] })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
