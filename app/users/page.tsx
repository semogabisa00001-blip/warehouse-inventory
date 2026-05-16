"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, User as UserIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface User {
  id: string
  email: string
  username: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'administrator') {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page",
        variant: "destructive",
      })
      router.push('/dashboard')
      return
    }

    setCurrentUserRole(profile.role)
    setCurrentUserId(user.id)
    fetchUsers()
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleUserRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) {
      toast({
        title: "Error",
        description: "You cannot change your own role",
        variant: "destructive",
      })
      return
    }

    const newRole = currentRole === 'administrator' ? 'user' : 'administrator'
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
        variant: "success",
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (currentUserRole !== 'administrator') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage user roles and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'administrator' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'administrator' ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <UserIcon className="w-3 h-3 mr-1" />
                            )}
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          {user.id !== currentUserId && (
                            <Button
                              size="sm"
                              variant={user.role === 'administrator' ? 'destructive' : 'default'}
                              onClick={() => toggleUserRole(user.id, user.role)}
                            >
                              {user.role === 'administrator' ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                          )}
                          {user.id === currentUserId && (
                            <span className="text-sm text-gray-500">You</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Role Permissions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Administrator:</strong> Can add, edit, and delete all data (categories, parts, inbound, outbound). Can manage user roles.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>User:</strong> Can only add new transactions (inbound, outbound). Cannot edit or delete existing data.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
