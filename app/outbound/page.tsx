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
import { AddOutboundModal } from "@/components/modals/add-outbound-modal"
import { EditOutboundModal } from "@/components/modals/edit-outbound-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import { exportOutboundToPDF, exportOutboundToXLSX } from "@/lib/export-utils"
import { toast } from "@/hooks/use-toast"
import { Edit, Trash2 } from "lucide-react"

interface OutboundTransaction {
  id: string
  outbound_number: string
  outbound_date: string
  destination: string
  outbound_user: string
  items: any[]
}

export default function OutboundPage() {
  const [transactions, setTransactions] = useState<OutboundTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<OutboundTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<OutboundTransaction | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const itemsPerPage = 20
  const supabase = createClient()

  useEffect(() => {
    checkUserRole()
    fetchTransactions()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outbound_headers' }, fetchTransactions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outbound_details' }, fetchTransactions)
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
        .from('outbound_headers')
        .select(`
          *,
          outbound_details (
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
        outbound_number: header.outbound_number,
        outbound_date: header.outbound_date,
        destination: header.destination,
        outbound_user: header.outbound_user,
        items: header.outbound_details?.map((detail: any) => ({
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
      t.outbound_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.outbound_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    exportOutboundToPDF(transaction)
  }

  const handleExportXLSX = (transaction: any) => {
    exportOutboundToXLSX(transaction)
  }

  const handleEdit = (transaction: OutboundTransaction) => {
    setSelectedTransaction(transaction)
    setShowEditModal(true)
  }

  const handleDeleteClick = (transaction: OutboundTransaction) => {
    setSelectedTransaction(transaction)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return

    setDeleteLoading(true)

    try {
      // Delete details first
      const { error: detailsError } = await supabase
        .from('outbound_details')
        .delete()
        .eq('outbound_header_id', selectedTransaction.id)

      if (detailsError) throw detailsError

      // Delete header
      const { error: headerError } = await supabase
        .from('outbound_headers')
        .delete()
        .eq('id', selectedTransaction.id)

      if (headerError) throw headerError

      toast({
        title: "Success",
        description: "Outbound transaction deleted successfully",
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
            <h1 className="text-3xl font-bold text-gray-900">Outbound Transactions</h1>
            <p className="text-gray-500 mt-1">Manage outgoing inventory</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Outbound
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Outbound Transactions</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by outbound number, destination, part number..."
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
                <p>No outbound transactions found</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Outbound
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Outbound Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Destination</TableHead>
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
                              <TableCell rowSpan={row.rowSpan} className="font-medium text-green-600">
                                {row.outbound_number}
                              </TableCell>
                              <TableCell rowSpan={row.rowSpan}>{formatDate(row.outbound_date)}</TableCell>
                              <TableCell rowSpan={row.rowSpan}>{row.destination}</TableCell>
                              <TableCell rowSpan={row.rowSpan}>{row.outbound_user}</TableCell>
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

      <AddOutboundModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchTransactions}
      />

      {selectedTransaction && (
        <EditOutboundModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedTransaction(null)
          }}
          onSuccess={fetchTransactions}
          outboundData={selectedTransaction}
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
          title="Delete Outbound Transaction"
          description="Are you sure you want to delete this outbound transaction? This will affect stock calculations."
          itemName={selectedTransaction.outbound_number}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  )
}
