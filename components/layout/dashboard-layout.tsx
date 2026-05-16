"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
        <footer className="bg-white border-t py-4 px-6">
          <p className="text-center text-sm text-gray-600">
            © 2026 HerruRistian.dev. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}
