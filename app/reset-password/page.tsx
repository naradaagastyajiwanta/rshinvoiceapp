"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authHelpers } from "@/lib/supabase"
import { Eye, EyeOff, Lock, Save, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Check if we have the required tokens in URL
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken && refreshToken) {
      setIsValidToken(true)
    } else {
      toast({
        title: "Link tidak valid",
        description: "Link reset password tidak valid atau sudah kedaluwarsa",
        duration: 5000,
      })
    }
  }, [searchParams, toast])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password harus diisi",
        duration: 3000,
      })
      return
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        duration: 3000,
      })
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak sama",
        duration: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authHelpers.updatePassword(password)

      if (error) {
        console.error("Update password error:", error)

        if (error.message.includes("not available")) {
          toast({
            title: "Mode Offline",
            description: "Update password tidak tersedia dalam mode offline",
            duration: 5000,
          })
        } else {
          toast({
            title: "Error",
            description: error.message || "Terjadi kesalahan saat mengupdate password",
            duration: 3000,
          })
        }
        return
      }

      toast({
        title: "Password berhasil diubah! 🎉",
        description: "Password Anda telah berhasil diubah. Silakan login dengan password baru.",
        duration: 5000,
      })

      // Redirect to login page
      router.push("/login")
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengubah password",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-3 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-center text-xl sm:text-2xl">Link Tidak Valid</CardTitle>
            <CardDescription className="text-center text-red-100 text-xs sm:text-sm">
              Link reset password tidak valid atau sudah kedaluwarsa
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8 px-8 text-center">
            <p className="text-gray-600 mb-6">
              Link reset password yang Anda gunakan tidak valid atau sudah kedaluwarsa. Silakan minta link reset
              password yang baru.
            </p>

            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full bg-green-600 hover:bg-green-700">Minta Link Reset Baru</Button>
              </Link>

              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-center text-xl sm:text-2xl">Reset Password</CardTitle>
          <CardDescription className="text-center text-green-100 text-xs sm:text-sm">
            Masukkan password baru Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8">
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-xs sm:text-sm flex items-center">
                <Lock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru (min. 6 karakter)"
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

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-xs sm:text-sm flex items-center">
                <Lock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="border-gray-300 text-xs sm:text-sm h-8 sm:h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                  Mengubah Password...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Ubah Password
                </span>
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-xs sm:text-sm text-green-600 hover:text-green-700 hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Kembali ke Login
              </Link>
            </div>
          </form>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 text-center">
              <strong>Tips:</strong> Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
