"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Plus, FileText, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { AddInboundModal } from "@/components/modals/add-inbound-modal"
import { EditInboundModal } from "@/components/modals/edit-inbound-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import { exportInboundToPDF, exportInboundToXLSX } from "@/lib/export-utils"
import { toast } from "@/hooks/use-toast"
import { Edit, Trash2 } from "lucide-react"

interface InboundTransaction {
  id: string
  inbound_number: string
  inbound_date: string
  supplier: string
  inbound_user: string
  items: any[]
}

export default function InboundPage() {
  const [transactions, setTransactions] = useState<InboundTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<InboundTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const itemsPerPage = 20
  const supabase = createClient()

  useEffect(() => {
    checkUserRole()
    fetchTransactions()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('inbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_headers' }, fetchTransactions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_details' }, fetchTransactions)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
      }
    }
  }

  useEffect(() => {
    filterTransactions()
  }, [searchTerm, transactions])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('inbound_headers')
        .select(`
          *,
          inbound_details (
            *,
            parts (
              part_number,
              description,
              categories (category_name)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = data?.map((header: any) => ({
        id: header.id,
        inbound_number: header.inbound_number,
        inbound_date: header.inbound_date,
        supplier: header.supplier,
        inbound_user: header.inbound_user,
        items: header.inbound_details?.map((detail: any) => ({
          part_number: detail.parts?.part_number || '',
          description: detail.parts?.description || '',
          category_name: detail.parts?.categories?.category_name || '',
          qty: detail.qty
        })) || []
      })) || []

      setTransactions(formatted)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    if (!searchTerm) {
      setFilteredTransactions(transactions)
      return
    }

    const filtered = transactions.filter(t =>
      t.inbound_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.inbound_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.items.some(item => 
        item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const handleExportPDF = (transaction: any) => {
    exportInboundToPDF(transaction)
  }

  const handleExportXLSX = (transaction: any) => {
    exportInboundToXLSX(transaction)
  }

  const handleEdit = (transaction: InboundTransaction) => {
    setSelectedTransaction(transaction)
    setShowEditModal(true)
  }

  const handleDeleteClick = (transaction: InboundTransaction) => {
    setSelectedTransaction(transaction)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return

    setDeleteLoading(true)

    try {
      // Delete details first
      const { error: detailsError } = await supabase
        .from('inbound_details')
        .delete()
        .eq('inbound_header_id', selectedTransaction.id)

      if (detailsError) throw detailsError

      // Delete header
      const { error: headerError } = await supabase
        .from('inbound_headers')
        .delete()
        .eq('id', selectedTransaction.id)

      if (headerError) throw headerError

      toast({
        title: "Success",
        description: "Inbound transaction deleted successfully",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setSelectedTransaction(null)
      fetchTransactions()
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

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Flatten transactions for table display
  const flattenedData = currentTransactions.flatMap(txn =>
    txn.items.map((item, idx) => ({
      ...txn,
      ...item,
      isFirstRow: idx === 0,
      rowSpan: txn.items.length
    }))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inbound Transactions</h1>
            <p className="text-gray-500 mt-1">Manage incoming inventory</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Inbound
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Inbound Transactions</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by inbound number, supplier, part number..."
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
            ) : flattenedData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No inbound transactions found</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Inbound
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Inbound Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flattenedData.map((row, index) => (
                        <TableRow key={`${row.id}-${index}`}>
                          {row.isFirstRow && (
                            <>
                              <TableCell rowSpan={row.rowSpan} className="font-medium">
                                <button
                                  onClick={() => setSelectedTransaction(transactions.find(t => t.id === row.id))}
                                  className="text-green-600 hover:text-green-700 hover:underline"
                                >
                                  {row.inbound_number}
                                </button>
                              </TableCell>
                              <TableCell rowSpan={row.rowSpan}>{formatDate(row.inbound_date)}</TableCell>
                              <TableCell rowSpan={row.rowSpan}>{row.supplier}</TableCell>
                              <TableCell rowSpan={row.rowSpan}>{row.inbound_user}</TableCell>
                            </>
                          )}
                          <TableCell>{row.part_number}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell>{row.category_name || '-'}</TableCell>
                          <TableCell>{row.qty}</TableCell>
                          {row.isFirstRow && (
                            <TableCell rowSpan={row.rowSpan}>
                              <div className="flex gap-2">
                                {userRole === 'administrator' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(transactions.find(t => t.id === row.id)!)}
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteClick(transactions.find(t => t.id === row.id)!)}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportPDF(transactions.find(t => t.id === row.id))}
                                  title="Export PDF"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportXLSX(transactions.find(t => t.id === row.id))}
                                  title="Export Excel"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

      <AddInboundModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchTransactions}
      />

      {selectedTransaction && (
        <EditInboundModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedTransaction(null)
          }}
          onSuccess={fetchTransactions}
          inboundData={selectedTransaction}
        />
      )}

      {selectedTransaction && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setSelectedTransaction(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Inbound Transaction"
          description="Are you sure you want to delete this inbound transaction? This will affect stock calculations."
          itemName={selectedTransaction.inbound_number}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  )
}
