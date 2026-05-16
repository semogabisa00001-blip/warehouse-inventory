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
import { AddDestinationModal } from "@/components/modals/add-destination-modal"
import { EditDestinationModal } from "@/components/modals/edit-destination-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Destination {
  id: string
  destination_name: string
  created_at: string
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const itemsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUserRole()
    fetchDestinations()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('destinations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destinations' }, fetchDestinations)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterDestinations()
  }, [searchTerm, destinations])

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

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('destination_name')

      if (error) throw error

      setDestinations(data || [])
    } catch (error) {
      console.error('Error fetching destinations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDestinations = () => {
    if (!searchTerm) {
      setFilteredDestinations(destinations)
      return
    }

    const filtered = destinations.filter(d =>
      d.destination_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDestinations(filtered)
    setCurrentPage(1)
  }

  const handleEdit = (destination: Destination) => {
    setSelectedDestination(destination)
    setShowEditModal(true)
  }

  const handleDeleteClick = (destination: Destination) => {
    setSelectedDestination(destination)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDestination) return

    setDeleteLoading(true)

    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', selectedDestination.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Destination deleted successfully",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setSelectedDestination(null)
      fetchDestinations()
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

  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDestinations = filteredDestinations.slice(startIndex, endIndex)

  if (userRole !== 'administrator') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Destinations Management</h1>
            <p className="text-gray-500 mt-1">Manage all destinations in the system</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Destination
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Destinations</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by destination name..."
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
            ) : currentDestinations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No destinations found</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Destination
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Destination Name</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentDestinations.map((destination) => (
                        <TableRow key={destination.id}>
                          <TableCell className="font-medium">{destination.destination_name}</TableCell>
                          <TableCell>{formatDate(destination.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(destination)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(destination)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredDestinations.length)} of {filteredDestinations.length} destinations
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

      <AddDestinationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchDestinations}
      />

      {selectedDestination && (
        <EditDestinationModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedDestination(null)
          }}
          onSuccess={fetchDestinations}
          destinationData={selectedDestination}
        />
      )}

      {selectedDestination && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setSelectedDestination(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Destination"
          description="Are you sure you want to delete this destination? This may affect existing outbound transactions."
          itemName={selectedDestination.destination_name}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  )
}
