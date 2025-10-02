// app/(protected)/layout.tsx
"use client"

import { ReactNode } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const userName = "John Doe" // replace with session.user.name from next-auth

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Brand */}
          <h1 className="text-xl font-bold text-blue-600">MyTimesheet</h1>

          {/* User + Logout */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <span>{userName}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <button
                onClick={() => console.log("logout")} // replace with next-auth signOut()
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-6 py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto text-center py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} MyTimesheet. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
