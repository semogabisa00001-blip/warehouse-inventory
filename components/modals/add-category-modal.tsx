"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface AddCategoryModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCategoryModal({ open, onClose, onSuccess }: AddCategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if category already exists
      const { data: existing } = await supabase
        .from('categories')
        .select('category_name')
        .eq('category_name', categoryName.trim())
        .single()

      if (existing) {
        toast({
          title: "Error",
          description: "Category already exists",
          variant: "destructive",
        })
        return
      }

      // Insert new category
      const { error } = await supabase
        .from('categories')
        .insert({
          category_name: categoryName.trim()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Category added successfully",
        variant: "success",
      })

      setCategoryName("")
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
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category_name">Category Name *</Label>
              <Input
                id="category_name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                disabled={loading}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
