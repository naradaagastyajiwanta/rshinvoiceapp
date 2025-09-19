"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { authHelpers } from "@/lib/supabase"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Redirect ke login karena registrasi tidak diizinkan
    router.replace("/login")
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const { name, email, password, confirmPassword } = formData

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
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
      const { data, error } = await authHelpers.signUp(email, password, {
        name: name,
      })

      if (error) {
        console.error("Register error:", error)

        if (error.message.includes("User already registered")) {
          toast({
            title: "Registrasi gagal",
            description: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
            duration: 3000,
          })
        } else if (error.message.includes("not available")) {
          toast({
            title: "Mode Offline",
            description: "Registrasi tidak tersedia dalam mode offline. Silakan coba lagi nanti.",
            duration: 5000,
          })
        } else {
          toast({
            title: "Registrasi gagal",
            description: error.message || "Terjadi kesalahan saat registrasi",
            duration: 3000,
          })
        }
        return
      }

      if (data.user) {
        toast({
          title: "Registrasi berhasil! 🎉",
          description: "Silakan cek email Anda untuk konfirmasi akun",
          duration: 5000,
        })

        // Redirect to login page
        router.push("/login")
      }
    } catch (error: any) {
      console.error("Register error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat registrasi",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return null
}
