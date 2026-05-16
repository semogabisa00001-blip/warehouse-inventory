"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Shield } from "lucide-react"

export function Header() {
  const [username, setUsername] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUsername(profile.username)
          setUserRole(profile.role)
        }
      }
    }
    getProfile()
  }, [supabase])

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Warehouse Management</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          {userRole === 'administrator' ? (
            <Shield className="h-5 w-5 text-green-700" />
          ) : (
            <User className="h-5 w-5 text-green-700" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-700">{username || "User"}</span>
            <span className="text-xs text-green-600 capitalize">{userRole || "user"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
