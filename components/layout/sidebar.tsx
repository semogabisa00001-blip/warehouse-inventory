"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Package, 
  LogOut,
  Warehouse,
  Users,
  Shield,
  Box,
  Tag,
  Truck,
  MapPin
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inbound",
    href: "/inbound",
    icon: ArrowDownToLine,
  },
  {
    title: "Outbound",
    href: "/outbound",
    icon: ArrowUpFromLine,
  },
  {
    title: "Stock Monitor",
    href: "/stock-monitor",
    icon: Package,
  },
]

const adminMenuItems = [
  {
    title: "Parts Management",
    href: "/parts",
    icon: Box,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tag,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Destinations",
    href: "/destinations",
    icon: MapPin,
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Success",
        description: "Logged out successfully",
        variant: "success",
      })
      router.push('/login')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mini Warehouse</h1>
            <p className="text-xs text-gray-500">Inventory System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}

        {/* Admin Menu */}
        {userRole === 'administrator' && (
          <>
            <div className="pt-4 pb-2">
              <div className="flex items-center space-x-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                <Shield className="h-4 w-4" />
                <span>Administration</span>
              </div>
            </div>
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
