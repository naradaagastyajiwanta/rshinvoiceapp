"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { runDatabaseDiagnostics, setupDatabase, type DiagnosticResult } from "@/lib/database-diagnostics"
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Settings,
  AlertCircle,
  WifiOff,
  HardDrive,
  X,
} from "lucide-react"

export function DatabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    try {
      const results = await runDatabaseDiagnostics()
      setDiagnostics(results)

      const hasErrors = results.some((r) => r.status === "error")
      const hasWarnings = results.some((r) => r.status === "warning")
      const isOffline = results.some((r) => r.status === "offline")

      if (hasErrors) {
        toast({
          title: "Masalah Koneksi Database",
          description: "Ditemukan masalah kritis dengan database. Aplikasi akan menggunakan mode offline.",
          duration: 5000,
        })
      } else if (hasWarnings) {
        toast({
          title: "Peringatan Database",
          description: "Ada masalah koneksi database. Aplikasi akan menggunakan fallback lokal.",
          duration: 4000,
        })
      } else if (isOffline) {
        toast({
          title: "Mode Offline",
          description: "Database tidak tersedia. Menggunakan penyimpanan lokal.",
          duration: 3000,
        })
      } else {
        toast({
          title: "Database OK",
          description: "Semua tes koneksi database berhasil",
          duration: 3000,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menjalankan diagnostik: ${error.message}`,
        duration: 5000,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSetupDatabase = async () => {
    setIsSettingUp(true)
    try {
      const result = await setupDatabase()

      if (result.status === "success") {
        toast({
          title: "Setup Berhasil",
          description: "Database berhasil di-setup. Menjalankan diagnostik ulang...",
          duration: 3000,
        })
        // Jalankan diagnostik ulang setelah setup
        setTimeout(() => {
          runDiagnostics()
        }, 1000)
      } else {
        toast({
          title: "Setup Gagal",
          description: result.message,
          duration: 5000,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal setup database: ${error.message}`,
        duration: 5000,
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "offline":
        return <WifiOff className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "text-green-700 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-700 bg-red-50 border-red-200"
      case "offline":
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const hasErrors = diagnostics.some((d) => d.status === "error")
  const hasWarnings = diagnostics.some((d) => d.status === "warning")
  const isOffline = diagnostics.some((d) => d.status === "offline")
  const canContinue = diagnostics.every((d) => d.canContinue !== false)

  if (!isVisible || (diagnostics.length === 0 && !isRunning)) {
    return null
  }

  return (
    <Card className="mb-6 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between pr-8">
          <CardTitle className="text-lg flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Status Koneksi Database
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={isRunning}
              className="text-xs bg-transparent"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Checking..." : "Refresh"}
            </Button>
            {hasErrors && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetupDatabase}
                disabled={isSettingUp}
                className="text-xs border-green-600 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <Settings className={`mr-1 h-3 w-3 ${isSettingUp ? "animate-spin" : ""}`} />
                {isSettingUp ? "Setting up..." : "Setup Database"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isRunning ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Memeriksa koneksi database...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(diagnostic.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(diagnostic.status)}
                    <span className="ml-2 font-medium text-sm">{diagnostic.test}</span>
                  </div>
                  {diagnostic.details && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-xs h-6 px-2"
                    >
                      {showDetails ? "Hide" : "Details"}
                    </Button>
                  )}
                </div>
                <p className="text-xs mt-1 ml-7">{diagnostic.message}</p>
                {showDetails && diagnostic.details && (
                  <pre className="text-xs mt-2 ml-7 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify(diagnostic.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}

            {hasErrors && !canContinue && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Konfigurasi Database Diperlukan</h4>
                    <p className="text-xs text-red-700 mt-1">
                      Database tidak dikonfigurasi dengan benar. Aplikasi akan menggunakan mode offline penuh.
                    </p>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={handleSetupDatabase}
                        disabled={isSettingUp}
                        className="bg-red-600 hover:bg-red-700 text-xs h-7"
                      >
                        <Settings className={`mr-1 h-3 w-3 ${isSettingUp ? "animate-spin" : ""}`} />
                        {isSettingUp ? "Setting up..." : "Perbaiki Database"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(hasErrors || hasWarnings) && canContinue && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <HardDrive className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Mode Offline Aktif</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Database tidak tersedia. Aplikasi menggunakan penyimpanan lokal dan masih dapat berfungsi normal.
                    </p>
                    {hasErrors && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={handleSetupDatabase}
                          disabled={isSettingUp}
                          className="bg-yellow-600 hover:bg-yellow-700 text-xs h-7"
                        >
                          <Settings className={`mr-1 h-3 w-3 ${isSettingUp ? "animate-spin" : ""}`} />
                          {isSettingUp ? "Setting up..." : "Coba Perbaiki"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isOffline && !hasErrors && !hasWarnings && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <WifiOff className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Mode Offline</h4>
                    <p className="text-xs text-gray-700 mt-1">
                      Database tidak tersedia saat ini. Menggunakan penyimpanan lokal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!hasErrors && !hasWarnings && !isOffline && diagnostics.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Database Terhubung</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Semua tes koneksi database berhasil. Aplikasi siap digunakan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
