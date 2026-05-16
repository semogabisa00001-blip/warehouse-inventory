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
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { EditCategoryModal } from "@/components/modals/edit-category-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Category {
  id: string
  category_name: string
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const itemsPerPage = 20
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUserRole()
    fetchCategories()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterCategories()
  }, [searchTerm, categories])

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

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name')

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(categories)
      return
    }

    const filtered = categories.filter(c =>
      c.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
    setCurrentPage(1)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowEditModal(true)
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return

    setDeleteLoading(true)

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setSelectedCategory(null)
      fetchCategories()
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

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCategories = filteredCategories.slice(startIndex, endIndex)

  if (userRole !== 'administrator') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-500 mt-1">Manage all categories in the system</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by category name..."
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
            ) : currentCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No categories found</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Category
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.category_name}</TableCell>
                          <TableCell>{formatDate(category.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(category)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} categories
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

      <AddCategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchCategories}
      />

      {selectedCategory && (
        <EditCategoryModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCategory(null)
          }}
          onSuccess={fetchCategories}
          categoryData={selectedCategory}
        />
      )}

      {selectedCategory && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setSelectedCategory(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          description="Are you sure you want to delete this category? This will affect all parts using this category."
          itemName={selectedCategory.category_name}
          loading={deleteLoading}
        />
      )}
    </DashboardLayout>
  )
}
