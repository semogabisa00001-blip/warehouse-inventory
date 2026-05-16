"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { AddPartModal } from "./add-part-modal"

interface LineItem {
  id: string
  part_id: string
  part_number: string
  description: string
  category_name: string
  qty: number
}

interface AddInboundModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddInboundModal({ open, onClose, onSuccess }: AddInboundModalProps) {
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [showAddPart, setShowAddPart] = useState(false)
  const [username, setUsername] = useState("")
  const [formData, setFormData] = useState({
    inbound_number: "",
    inbound_date: new Date().toISOString().split('T')[0],
    supplier: ""
  })
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', part_id: '', part_number: '', description: '', category_name: '', qty: 1 }
  ])
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchParts()
      fetchSuppliers()
      fetchUsername()
    }
  }, [open])

  const fetchParts = async () => {
    const { data, error } = await supabase
      .from('parts')
      .select('*, categories(category_name)')
      .order('part_number')

    if (!error && data) {
      setParts(data)
    }
  }

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_name')

    if (!error && data) {
      setSuppliers(data)
    }
  }

  const fetchUsername = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUsername(profile.username)
      }
    }
  }

  const handlePartChange = (index: number, partId: string) => {
    const selectedPart = parts.find(p => p.id === partId)
    if (selectedPart) {
      const newItems = [...lineItems]
      newItems[index] = {
        ...newItems[index],
        part_id: partId,
        part_number: selectedPart.part_number,
        description: selectedPart.description,
        category_name: selectedPart.categories?.category_name || ''
      }
      setLineItems(newItems)
    }
  }

  const handleQtyChange = (index: number, qty: number) => {
    const newItems = [...lineItems]
    newItems[index].qty = qty
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), part_id: '', part_number: '', description: '', category_name: '', qty: 1 }
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.inbound_number.trim() || !formData.supplier.trim()) {
      toast({
        title: "Error",
        description: "Inbound number and supplier are required",
        variant: "destructive",
      })
      return
    }

    const validItems = lineItems.filter(item => item.part_id && item.qty > 0)
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if inbound number already exists
      const { data: existing } = await supabase
        .from('inbound_headers')
        .select('inbound_number')
        .eq('inbound_number', formData.inbound_number.trim())
        .single()

      if (existing) {
        toast({
          title: "Error",
          description: "Inbound number already exists",
          variant: "destructive",
        })
        return
      }

      // Insert header
      const { data: header, error: headerError } = await supabase
        .from('inbound_headers')
        .insert({
          inbound_number: formData.inbound_number.trim(),
          inbound_date: formData.inbound_date,
          supplier: formData.supplier.trim(),
          inbound_user: username
        })
        .select()
        .single()

      if (headerError) throw headerError

      // Insert details
      const { error: detailsError } = await supabase
        .from('inbound_details')
        .insert(
          validItems.map(item => ({
            inbound_header_id: header.id,
            part_id: item.part_id,
            qty: item.qty
          }))
        )

      if (detailsError) throw detailsError

      toast({
        title: "Success",
        description: "Inbound transaction created successfully",
        variant: "success",
      })

      // Reset form
      setFormData({
        inbound_number: "",
        inbound_date: new Date().toISOString().split('T')[0],
        supplier: ""
      })
      setLineItems([
        { id: '1', part_id: '', part_number: '', description: '', category_name: '', qty: 1 }
      ])
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
        <DialogContent onClose={onClose} className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Inbound Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inbound_number">Inbound Number *</Label>
                  <Input
                    id="inbound_number"
                    value={formData.inbound_number}
                    onChange={(e) => setFormData({ ...formData, inbound_number: e.target.value })}
                    placeholder="Enter inbound number"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inbound_date">Inbound Date *</Label>
                  <Input
                    id="inbound_date"
                    type="date"
                    value={formData.inbound_date}
                    onChange={(e) => setFormData({ ...formData, inbound_date: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <SearchableSelect
                    options={suppliers.map(s => ({ value: s.supplier_name, label: s.supplier_name }))}
                    value={formData.supplier}
                    onChange={(value) => setFormData({ ...formData, supplier: value })}
                    placeholder="Select supplier..."
                    searchPlaceholder="Search supplier..."
                    emptyText="No supplier found."
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>User</Label>
                  <Input value={username} disabled />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPart(true)}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Part
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <SearchableSelect
                          options={parts.map(p => ({ 
                            value: p.id, 
                            label: p.part_number 
                          }))}
                          value={item.part_id}
                          onChange={(value) => handlePartChange(index, value)}
                          placeholder="Select part..."
                          searchPlaceholder="Search part..."
                          emptyText="No part found."
                          disabled={loading}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input value={item.description} disabled placeholder="Description" />
                      </div>
                      <div className="col-span-2">
                        <Input value={item.category_name} disabled placeholder="Category" />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const value = e.target.value
                            // Allow empty string while typing
                            if (value === '') {
                              handleQtyChange(index, '')
                            } else {
                              const numValue = parseInt(value)
                              if (!isNaN(numValue) && numValue >= 1) {
                                handleQtyChange(index, numValue)
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Set to 1 if empty when user leaves the field
                            if (e.target.value === '' || parseInt(e.target.value) < 1) {
                              handleQtyChange(index, 1)
                            }
                          }}
                          disabled={loading}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          disabled={loading || lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Inbound"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddPartModal
        open={showAddPart}
        onClose={() => setShowAddPart(false)}
        onSuccess={() => {
          fetchParts()
          setShowAddPart(false)
        }}
      />
    </>
  )
}
