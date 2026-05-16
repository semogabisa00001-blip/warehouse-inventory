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

interface AddPartModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPartModal({ open, onClose, onSuccess }: AddPartModalProps) {
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
    if (open) {
      fetchCategories()
    }
  }, [open])

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
      // Check if part number already exists
      const { data: existing } = await supabase
        .from('parts')
        .select('part_number')
        .eq('part_number', formData.part_number.trim())
        .single()

      if (existing) {
        toast({
          title: "Error",
          description: "Part number already exists",
          variant: "destructive",
        })
        return
      }

      // Insert new part
      const { error } = await supabase
        .from('parts')
        .insert({
          part_number: formData.part_number.trim(),
          description: formData.description.trim(),
          category_id: formData.category_id || null
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Part added successfully",
        variant: "success",
      })

      setFormData({ part_number: "", description: "", category_id: "" })
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
            <DialogTitle>Add New Part</DialogTitle>
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
                {loading ? "Saving..." : "Save"}
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
