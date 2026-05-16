"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useState } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4 md:p-6">
          {children}
        </main>
        <footer className="bg-white border-t py-3 px-4 sm:py-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            © 2026 HerruRistian.dev. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}
