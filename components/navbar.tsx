"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Menu, X, FileText, History, LogOut, User } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isLoggedIn, user, logout } = useAuth()

  // Don't show navbar on auth pages
  if (
    !isLoggedIn ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return null
  }

  // Get display name from user
  const getDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    } else if (user?.email) {
      return user.email.split("@")[0] // Use part before @ as name
    } else {
      return "User"
    }
  }

  const displayName = getDisplayName()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="h-6 w-auto sm:h-8" />
              <span className="ml-2 text-base sm:text-lg font-semibold text-green-800 truncate">Rumah Sehat</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/"
                    ? "border-green-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Invoice Generator
              </Link>
              <Link
                href="/history"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/history"
                    ? "border-green-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <History className="mr-2 h-4 w-4" />
                Riwayat Invoice
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <User className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">Hi, {displayName}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
          <div className="-mr-1 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === "/"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Invoice Generator
              </span>
            </Link>
            <Link
              href="/history"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === "/history"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                Riwayat Invoice
              </span>
            </Link>
            <div className="border-t border-gray-200 pt-3 pb-2">
              <div className="flex items-center px-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-1" />
                    Hi, {displayName}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-gray-100"
                >
                  <span className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
