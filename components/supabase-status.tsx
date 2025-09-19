"use client"

import { useState, useEffect } from "react"
import { DatabaseDiagnostics } from "./database-diagnostics"

export function SupabaseStatus() {
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  useEffect(() => {
    // Tampilkan diagnostik secara otomatis jika ada masalah
    const timer = setTimeout(() => {
      setShowDiagnostics(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!showDiagnostics) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <DatabaseDiagnostics />
    </div>
  )
}
