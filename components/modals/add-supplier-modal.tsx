"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface AddSupplierModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddSupplierModal({ open, onClose, onSuccess }: AddSupplierModalProps) {
  const [supplierName, setSupplierName] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supplierName.trim()) {
      toast({
        title: "Error",
        description: "Please enter supplier name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([{ supplier_name: supplierName.trim() }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier added successfully",
        variant: "success",
      })

      setSupplierName("")
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
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
