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
import { AddSupplierModal } from "@/components/modals/add-supplier-modal"
import { EditSupplierModal } from "@/components/modals/edit-supplier-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Supplier {
  id: string
  supplier_name: string
  created_at: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const itemsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUserRole()
    fetchSuppliers()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('suppliers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, fetchSuppliers)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterSuppliers()
  }, [searchTerm, suppliers])

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

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('supplier_name')

      if (error) throw error

      setSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSuppliers = () => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers)
      return
    }

    const filtered = suppliers.filter(s =>
      s.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSuppliers(filtered)
    setCurrentPage(1)
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowEditModal(true)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return

    setDeleteLoading(true)

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', selectedSupplier.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier deleted successfully",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setSelectedSupplier(null)
      fetchSuppliers()
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

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex)

  if (userRole !== 'administrator') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suppliers Management</h1>
            <p className="text-gray-500 mt-1">Manage all suppliers in the system</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Suppliers</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by supplier name..."
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
            ) : currentSuppliers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No suppliers found</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Supplier
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier Name</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSuppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                          <TableCell>{formatDate(supplier.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(supplier)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(supplier)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers
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

      <AddSupplierModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchSuppliers}
      />

      {selectedSupplier && (
        <EditSupplierModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedSupplier(null)
          }}
          onSuccess={fetchSuppliers}
          supplierData={selectedSupplier}
        />
      )}

      {selectedSupplier && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setSelectedSupplier(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Supplier"
          description="Are you sure you want to delete this supplier? This may affect existing inbound transactions."
          itemName={selectedSupplier.supplier_name}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  )
}
