"use client"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

import { logout } from "@/lib/actions/auth";

export default function UserMenu({ userName }: { userName: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span>{userName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <button
          onClick={() => logout()}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
        >
          Logout
        </button>
      </PopoverContent>
    </Popover>
  )
}
