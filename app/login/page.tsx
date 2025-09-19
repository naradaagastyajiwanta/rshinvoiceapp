"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authHelpers } from "@/lib/supabase"
import { Eye, EyeOff, Mail, Lock, LogIn, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email dan password harus diisi",
        duration: 3000,
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Format email tidak valid",
        duration: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authHelpers.signIn(email, password)

      if (error) {
        console.error("Login error:", error)

        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login gagal",
            description: "Email atau password salah",
            duration: 3000,
          })
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email belum dikonfirmasi",
            description: "Silakan cek email Anda dan klik link konfirmasi",
            duration: 5000,
          })
        } else if (error.message.includes("not available") || error.message.includes("Failed to fetch")) {
          toast({
            title: "Koneksi Bermasalah",
            description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
            duration: 5000,
          })
        } else {
          toast({
            title: "Login gagal",
            description: error.message || "Terjadi kesalahan saat login",
            duration: 3000,
          })
        }
        return
      }

      if (data.user) {
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
          duration: 3000,
        })

        // Router akan otomatis redirect melalui AuthProvider
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login. Periksa koneksi internet Anda.",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg p-4 sm:p-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={70}
              height={70}
              className="rounded-full bg-white p-1.5 sm:p-2"
            />
          </div>
          <CardTitle className="text-center text-xl sm:text-2xl">Rumah Sehat Holistik</CardTitle>
          <CardDescription className="text-center text-green-100 text-xs sm:text-sm">
            Login untuk mengakses Invoice Generator
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-xs sm:text-sm flex items-center">
                <Mail className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="border-gray-300 text-xs sm:text-sm h-8 sm:h-10"
                required
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-xs sm:text-sm flex items-center">
                <Lock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="border-gray-300 text-xs sm:text-sm h-8 sm:h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </span>
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-700">
                  <strong>Akses Terbatas:</strong> Hanya pengguna yang telah terdaftar yang dapat mengakses sistem ini.
                </p>
                <p className="text-xs text-amber-600 mt-1">Hubungi administrator jika Anda memerlukan akses.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
