"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { AddCategoryModal } from "./add-category-modal"

interface EditPartModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  partData: any
}

export function EditPartModal({ open, onClose, onSuccess, partData }: EditPartModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [formData, setFormData] = useState({
    part_number: "",
    description: "",
    category_id: ""
  })
  const supabase = createClient()

  useEffect(() => {
    if (open && partData) {
      fetchCategories()
      setFormData({
        part_number: partData.part_number,
        description: partData.description,
        category_id: partData.category_id || ""
      })
    }
  }, [open, partData])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_name')

    if (!error && data) {
      setCategories(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.part_number.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Part number and description are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if part number already exists (excluding current part)
      const { data: existing } = await supabase
        .from('parts')
        .select('id, part_number')
        .eq('part_number', formData.part_number.trim())
        .neq('id', partData.id)
        .single()

      if (existing) {
        toast({
          title: "Error",
          description: "Part number already exists",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Update part
      const { error } = await supabase
        .from('parts')
        .update({
          part_number: formData.part_number.trim(),
          description: formData.description.trim(),
          category_id: formData.category_id || null
        })
        .eq('id', partData.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Part updated successfully",
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
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent onClose={onClose} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="part_number">Part Number *</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  placeholder="Enter part number"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <div className="flex gap-2">
                  <Select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    disabled={loading}
                    className="flex-1"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddCategory(true)}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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

      <AddCategoryModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSuccess={() => {
          fetchCategories()
          setShowAddCategory(false)
        }}
      />
    </>
  )
}
