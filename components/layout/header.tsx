"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Shield, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
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
    <header className="h-14 sm:h-16 border-b bg-white px-3 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
          Warehouse Management
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg">
          {userRole === 'administrator' ? (
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
          ) : (
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
          )}
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-green-700 truncate max-w-[100px] sm:max-w-none">
              {username || "User"}
            </span>
            <span className="text-[10px] sm:text-xs text-green-600 capitalize">
              {userRole || "user"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
