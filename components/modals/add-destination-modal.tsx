"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface AddDestinationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddDestinationModal({ open, onClose, onSuccess }: AddDestinationModalProps) {
  const [destinationName, setDestinationName] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!destinationName.trim()) {
      toast({
        title: "Error",
        description: "Please enter destination name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('destinations')
        .insert([{ destination_name: destinationName.trim() }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Destination added successfully",
        variant: "success",
      })

      setDestinationName("")
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Add New Destination</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="destinationName">Destination Name</Label>
            <Input
              id="destinationName"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              placeholder="Enter destination name"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Destination"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
