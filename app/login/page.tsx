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
import { authHelpers, getFirebaseDb, getDoc, doc } from "@/lib/firebase"
import { Eye, EyeOff, Mail, Lock, LogIn, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
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
        const msg = error?.message ?? ""

        if (msg.includes("Invalid login credentials") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
          toast({ title: "Login gagal", description: "Email atau password salah", duration: 3000 })
        } else if (msg.includes("operation-not-allowed")) {
          toast({ title: "Login gagal", description: "Login email belum diaktifkan. Hubungi administrator.", duration: 5000 })
        } else if (msg.includes("Failed to fetch") || msg.includes("network")) {
          toast({ title: "Koneksi Bermasalah", description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.", duration: 5000 })
        } else {
          toast({ title: "Login gagal", description: msg || "Terjadi kesalahan saat login", duration: 3000 })
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
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Terjadi kesalahan saat login. Periksa koneksi internet Anda.",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      const { data, error } = await authHelpers.signInWithGoogle()
      if (error) {
        toast({ title: "Login gagal", description: error.message, duration: 3000 })
        return
      }
      if (!data.user) return

      // Check if email is whitelisted
      const db = getFirebaseDb()
      const email = data.user.email
      if (db && email) {
        const allowedSnap = await getDoc(doc(db, "allowed_users", email))
        if (!allowedSnap.exists()) {
          await authHelpers.signOut()
          toast({
            title: "Akses ditolak",
            description: "Email tidak terdaftar. Hubungi administrator untuk mendapatkan akses.",
            duration: 5000,
          })
          return
        }
      }

      toast({ title: "Login berhasil", description: "Selamat datang!", duration: 3000 })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Terjadi kesalahan saat login dengan Google.", duration: 3000 })
    } finally {
      setIsGoogleLoading(false)
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

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-3 h-9 sm:h-10 text-xs sm:text-sm border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Masuk dengan Google...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </span>
            )}
          </Button>

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
