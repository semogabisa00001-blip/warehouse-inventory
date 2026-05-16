"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react"
import { getAllPartsWithStock, getPartTransactionHistory } from "@/lib/stock-utils"
import { exportStockToPDF, exportStockToXLSX, exportPartHistoryToPDF, exportPartHistoryToXLSX } from "@/lib/export-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface StockItem {
  id: string
  part_number: string
  description: string
  category_name: string
  total_inbound: number
  total_outbound: number
  current_stock: number
}

export default function StockMonitorPage() {
  const [stockData, setStockData] = useState<StockItem[]>([])
  const [filteredStock, setFilteredStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [partHistory, setPartHistory] = useState<any[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const itemsPerPage = 20
  const supabase = createClient()

  useEffect(() => {
    fetchStockData()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('stock-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_details' }, fetchStockData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outbound_details' }, fetchStockData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, fetchStockData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterStock()
  }, [searchTerm, stockData])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      const data = await getAllPartsWithStock(supabase)
      setStockData(data)
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStock = () => {
    if (!searchTerm) {
      setFilteredStock(stockData)
      return
    }

    const filtered = stockData.filter(item =>
      item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredStock(filtered)
    setCurrentPage(1)
  }

  const handleViewHistory = async (part: StockItem) => {
    setSelectedPart(part)
    setShowHistoryModal(true)
    
    const history = await getPartTransactionHistory(supabase, part.id)
    setPartHistory(history)
  }

  const handleExportStockPDF = () => {
    exportStockToPDF(filteredStock)
  }

  const handleExportStockXLSX = () => {
    exportStockToXLSX(filteredStock)
  }

  const handleExportHistoryPDF = () => {
    if (selectedPart) {
      exportPartHistoryToPDF(selectedPart, partHistory)
    }
  }

  const handleExportHistoryXLSX = () => {
    if (selectedPart) {
      exportPartHistoryToXLSX(selectedPart, partHistory)
    }
  }

  const totalPages = Math.ceil(filteredStock.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStock = filteredStock.slice(startIndex, endIndex)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Monitor</h1>
            <p className="text-gray-500 mt-1">Real-time inventory levels</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportStockPDF} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleExportStockXLSX} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export XLSX
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by part number, description, category..."
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
            ) : currentStock.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No parts found</p>
                <p className="text-sm mt-2">Add parts and create inbound transactions to see stock levels</p>
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
                        <TableHead className="text-right">Total Inbound</TableHead>
                        <TableHead className="text-right">Total Outbound</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <button
                              onClick={() => handleViewHistory(item)}
                              className="text-green-600 hover:text-green-700 hover:underline"
                            >
                              {item.part_number}
                            </button>
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.category_name || '-'}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            +{item.total_inbound}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            -{item.total_outbound}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-bold ${
                              item.current_stock > 0 ? 'text-green-600' : 
                              item.current_stock === 0 ? 'text-gray-600' : 
                              'text-red-600'
                            }`}>
                              {item.current_stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewHistory(item)}
                            >
                              View History
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredStock.length)} of {filteredStock.length} parts
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

      {/* Part History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent onClose={() => setShowHistoryModal(false)} className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Transaction History - {selectedPart?.part_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPart && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Part Number</p>
                  <p className="font-semibold text-gray-900">{selectedPart.part_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Description</p>
                  <p className="font-semibold text-gray-900">{selectedPart.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Category</p>
                  <p className="font-semibold text-gray-900">{selectedPart.category_name || '-'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExportHistoryPDF} variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button onClick={handleExportHistoryXLSX} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export XLSX
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-900 font-semibold">Transaction #</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Type</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Reference</TableHead>
                      <TableHead className="text-right text-gray-900 font-semibold">Debit (-)</TableHead>
                      <TableHead className="text-right text-gray-900 font-semibold">Credit (+)</TableHead>
                      <TableHead className="text-right text-gray-900 font-semibold">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      partHistory.map((txn, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-gray-900">{txn.transaction_number}</TableCell>
                          <TableCell className="text-gray-900">{txn.date}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                              txn.type === 'Inbound' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {txn.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-900">{txn.reference}</TableCell>
                          <TableCell className="text-right text-red-600">
                            {txn.debit || '-'}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {txn.credit || '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-gray-900">
                            {txn.balance}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
