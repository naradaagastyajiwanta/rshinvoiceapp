"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authHelpers } from "@/lib/firebase"
import { Mail, ArrowLeft, Send, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { toast } = useToast()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Email harus diisi",
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
      const { data, error } = await authHelpers.resetPassword(email)

      if (error) {
        console.error("Reset password error:", error)

        if (error.message.includes("not available") || error.message.includes("Failed to fetch")) {
          toast({
            title: "Koneksi Bermasalah",
            description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
            duration: 5000,
          })
        } else {
          toast({
            title: "Error",
            description: error.message || "Terjadi kesalahan saat mengirim email reset password",
            duration: 3000,
          })
        }
        return
      }

      setIsEmailSent(true)
      toast({
        title: "Email terkirim! 📧",
        description: "Silakan cek email Anda untuk link reset password",
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim email reset password",
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
          <CardTitle className="text-center text-xl sm:text-2xl">Lupa Password</CardTitle>
          <CardDescription className="text-center text-green-100 text-xs sm:text-sm">
            Masukkan email Anda untuk reset password
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8">
          {!isEmailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
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
                  placeholder="Masukkan email Anda"
                  className="border-gray-300 text-xs sm:text-sm h-8 sm:h-10"
                  required
                />
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
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Email Reset
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
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Terkirim!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Kami telah mengirim link reset password ke <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  Silakan cek email Anda (termasuk folder spam) dan klik link untuk reset password.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setIsEmailSent(false)}
                  variant="outline"
                  className="w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  Kirim Ulang Email
                </Button>

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full text-xs sm:text-sm h-9 sm:h-10 text-green-600 hover:text-green-700"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-700">
                  <strong>Catatan:</strong> Hanya email yang sudah terdaftar dalam sistem yang dapat melakukan reset
                  password.
                </p>
                <p className="text-xs text-amber-600 mt-1">Hubungi administrator jika Anda memerlukan bantuan.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
