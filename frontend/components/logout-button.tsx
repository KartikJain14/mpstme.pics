"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  showIcon?: boolean
  className?: string
}

export function LogoutButton({ variant = "ghost", size = "sm", showIcon = true, className = "" }: LogoutButtonProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 ${className}`}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      Sign out
    </Button>
  )
}
