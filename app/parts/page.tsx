"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react"
import { AddPartModal } from "@/components/modals/add-part-modal"
import { EditPartModal } from "@/components/modals/edit-part-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Part {
  id: string
  part_number: string
  description: string
  category_id: string | null
  categories: {
    category_name: string
  } | null
  created_at: string
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const itemsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUserRole()
    fetchParts()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('parts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, fetchParts)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterParts()
  }, [searchTerm, parts])

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUserRole(profile.role)
        // Redirect if not administrator
        if (profile.role !== 'administrator') {
          router.push('/dashboard')
          toast({
            title: "Access Denied",
            description: "Only administrators can access this page",
            variant: "destructive",
          })
        }
      }
    }
  }

  const fetchParts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('parts')
        .select('*, categories(category_name)')
        .order('part_number')

      if (error) throw error

      setParts(data || [])
    } catch (error) {
      console.error('Error fetching parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterParts = () => {
    if (!searchTerm) {
      setFilteredParts(parts)
      return
    }

    const filtered = parts.filter(p =>
      p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categories?.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredParts(filtered)
    setCurrentPage(1)
  }

  const handleEdit = (part: Part) => {
    setSelectedPart(part)
    setShowEditModal(true)
  }

  const handleDeleteClick = (part: Part) => {
    setSelectedPart(part)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPart) return

    setDeleteLoading(true)

    try {
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', selectedPart.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Part deleted successfully",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setSelectedPart(null)
      fetchParts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentParts = filteredParts.slice(startIndex, endIndex)

  if (userRole !== 'administrator') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parts Management</h1>
            <p className="text-gray-500 mt-1">Manage all parts in the system</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Part
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Parts</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by part number, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : currentParts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No parts found</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Part
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentParts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.part_number}</TableCell>
                          <TableCell>{part.description}</TableCell>
                          <TableCell>{part.categories?.category_name || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(part)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(part)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredParts.length)} of {filteredParts.length} parts
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddPartModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchParts}
      />

      {selectedPart && (
        <EditPartModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPart(null)
          }}
          onSuccess={fetchParts}
          partData={selectedPart}
        />
      )}

      {selectedPart && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setSelectedPart(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Part"
          description="Are you sure you want to delete this part? This will affect all related transactions."
          itemName={`${selectedPart.part_number} - ${selectedPart.description}`}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  )
}
