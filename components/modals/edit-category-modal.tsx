"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface EditCategoryModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  categoryData: any
}

export function EditCategoryModal({ open, onClose, onSuccess, categoryData }: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const supabase = createClient()

  useEffect(() => {
    if (open && categoryData) {
      setCategoryName(categoryData.category_name)
    }
  }, [open, categoryData])

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
      // Check if category already exists (excluding current category)
      const { data: existing } = await supabase
        .from('categories')
        .select('id, category_name')
        .eq('category_name', categoryName.trim())
        .neq('id', categoryData.id)
        .single()

      if (existing) {
        toast({
          title: "Error",
          description: "Category already exists",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Update category
      const { error } = await supabase
        .from('categories')
        .update({
          category_name: categoryName.trim()
        })
        .eq('id', categoryData.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Category updated successfully",
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
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
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
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
