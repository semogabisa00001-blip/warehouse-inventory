"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName?: string
  loading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  loading = false
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription className="py-4">
          <p className="text-gray-600">{description}</p>
          {itemName && (
            <p className="mt-3 font-semibold text-gray-900">
              {itemName}
            </p>
          )}
          <p className="mt-3 text-sm text-red-600">
            This action cannot be undone.
          </p>
        </DialogDescription>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
