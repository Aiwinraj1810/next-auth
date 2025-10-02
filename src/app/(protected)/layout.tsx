// app/(protected)/layout.tsx
import { ReactNode } from "react"
import { auth } from "@/auth"
import UserMenu from "./user-menu"

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          {/* Brand */}
          <h1 className="text-xl font-bold">ticktock</h1>

          {/* User + Logout (client component) */}
          <UserMenu userName={session?.user?.name || "Guest"} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-6 py-6 bg-white my-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto text-center py-4 text-sm text-gray-500">
          © 2024 tentwenty. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
