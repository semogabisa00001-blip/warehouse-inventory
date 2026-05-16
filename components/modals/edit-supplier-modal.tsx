"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface EditSupplierModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  supplierData: {
    id: string
    supplier_name: string
  }
}

export function EditSupplierModal({ open, onClose, onSuccess, supplierData }: EditSupplierModalProps) {
  const [supplierName, setSupplierName] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (supplierData) {
      setSupplierName(supplierData.supplier_name)
    }
  }, [supplierData])

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
        .update({ supplier_name: supplierName.trim() })
        .eq('id', supplierData.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier updated successfully",
        variant: "success",
      })

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
          <DialogTitle>Edit Supplier</DialogTitle>
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
              {loading ? "Updating..." : "Update Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
