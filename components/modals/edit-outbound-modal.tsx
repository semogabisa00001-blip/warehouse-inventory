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
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { getPartStock, validateOutboundQty } from "@/lib/stock-utils"

interface LineItem {
  id: string
  part_id: string
  part_number: string
  description: string
  category_name: string
  qty: number
  available_stock: number
  original_qty: number
}

interface EditOutboundModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  outboundData: any
}

export function EditOutboundModal({ open, onClose, onSuccess, outboundData }: EditOutboundModalProps) {
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [username, setUsername] = useState("")
  const [formData, setFormData] = useState({
    outbound_number: "",
    outbound_date: "",
    destination: ""
  })
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (open && outboundData) {
      fetchPartsWithStock()
      fetchDestinations()
      fetchUsername()
      loadOutboundData()
    }
  }, [open, outboundData])

  const loadOutboundData = async () => {
    setFormData({
      outbound_number: outboundData.outbound_number,
      outbound_date: outboundData.outbound_date,
      destination: outboundData.destination
    })

    // Fetch original details with part_id
    const { data: details } = await supabase
      .from('outbound_details')
      .select('*, parts(*)')
      .eq('outbound_header_id', outboundData.id)

    if (details) {
      const items = await Promise.all(
        details.map(async (detail: any, index: number) => {
          const stock = await getPartStock(supabase, detail.part_id)
          return {
            id: `${index}`,
            part_id: detail.part_id,
            part_number: detail.parts?.part_number || '',
            description: detail.parts?.description || '',
            category_name: detail.parts?.categories?.category_name || '',
            qty: detail.qty,
            available_stock: stock + detail.qty, // Add back the original qty
            original_qty: detail.qty
          }
        })
      )
      setLineItems(items)
    }
  }

  const fetchPartsWithStock = async () => {
    const { data, error } = await supabase
      .from('parts')
      .select('*, categories(category_name)')
      .order('part_number')

    if (!error && data) {
      const partsWithStock = await Promise.all(
        data.map(async (part) => {
          const stock = await getPartStock(supabase, part.id)
          return {
            ...part,
            current_stock: stock
          }
        })
      )
      setParts(partsWithStock)
    }
  }

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('destination_name')

    if (!error && data) {
      setDestinations(data)
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

  const handlePartChange = async (index: number, partId: string) => {
    const selectedPart = parts.find(p => p.id === partId)
    if (selectedPart) {
      const stock = await getPartStock(supabase, partId)
      const newItems = [...lineItems]
      newItems[index] = {
        ...newItems[index],
        part_id: partId,
        part_number: selectedPart.part_number,
        description: selectedPart.description,
        category_name: selectedPart.categories?.category_name || '',
        available_stock: stock,
        original_qty: 0
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
      { id: Date.now().toString(), part_id: '', part_number: '', description: '', category_name: '', qty: 1, available_stock: 0, original_qty: 0 }
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.outbound_number.trim() || !formData.destination.trim()) {
      toast({
        title: "Error",
        description: "Outbound number and destination are required",
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

    // Validate stock for all items (considering original qty)
    for (const item of validItems) {
      const availableForEdit = item.available_stock
      if (item.qty > availableForEdit) {
        toast({
          title: "Stock Validation Error",
          description: `${item.part_number}: Insufficient stock! Available: ${availableForEdit}`,
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)

    try {
      // Update header
      const { error: headerError } = await supabase
        .from('outbound_headers')
        .update({
          outbound_number: formData.outbound_number.trim(),
          outbound_date: formData.outbound_date,
          destination: formData.destination.trim(),
        })
        .eq('id', outboundData.id)

      if (headerError) throw headerError

      // Delete old details
      const { error: deleteError } = await supabase
        .from('outbound_details')
        .delete()
        .eq('outbound_header_id', outboundData.id)

      if (deleteError) throw deleteError

      // Insert new details
      const { error: detailsError } = await supabase
        .from('outbound_details')
        .insert(
          validItems.map(item => ({
            outbound_header_id: outboundData.id,
            part_id: item.part_id,
            qty: item.qty
          }))
        )

      if (detailsError) throw detailsError

      toast({
        title: "Success",
        description: "Outbound transaction updated successfully",
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
      <DialogContent onClose={onClose} className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Outbound Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outbound_number">Outbound Number *</Label>
                <Input
                  id="outbound_number"
                  value={formData.outbound_number}
                  onChange={(e) => setFormData({ ...formData, outbound_number: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outbound_date">Outbound Date *</Label>
                <Input
                  id="outbound_date"
                  type="date"
                  value={formData.outbound_date}
                  onChange={(e) => setFormData({ ...formData, outbound_date: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <SearchableSelect
                  options={destinations.map(d => ({ value: d.destination_name, label: d.destination_name }))}
                  value={formData.destination}
                  onChange={(value) => setFormData({ ...formData, destination: value })}
                  placeholder="Select destination..."
                  searchPlaceholder="Search destination..."
                  emptyText="No destination found."
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>User</Label>
                <Input value={outboundData?.outbound_user || username} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Items *</Label>
              <div className="border rounded-lg p-4 space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <SearchableSelect
                          options={parts.map(p => ({ 
                            value: p.id, 
                            label: `${p.part_number} (Stock: ${p.current_stock})` 
                          }))}
                          value={item.part_id}
                          onChange={(value) => handlePartChange(index, value)}
                          placeholder="Select part..."
                          searchPlaceholder="Search part..."
                          emptyText="No part found."
                          disabled={loading}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input value={item.description} disabled placeholder="Description" />
                      </div>
                      <div className="col-span-2">
                        <Input value={item.category_name} disabled placeholder="Category" />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          max={item.available_stock}
                          value={item.qty}
                          onChange={(e) => {
                            const value = e.target.value
                            // Allow empty string while typing
                            if (value === '') {
                              handleQtyChange(index, '')
                            } else {
                              const numValue = parseInt(value)
                              if (!isNaN(numValue) && numValue >= 1 && numValue <= item.available_stock) {
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
                          disabled={loading || !item.part_id}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input value={item.available_stock} disabled placeholder="Stock" className="text-center" />
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
                    {item.part_id && item.qty > item.available_stock && (
                      <p className="text-xs text-red-600 ml-1">
                        Insufficient stock! Available: {item.available_stock}
                      </p>
                    )}
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
              {loading ? "Updating..." : "Update Outbound"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
