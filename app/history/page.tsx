"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getInvoices } from "@/lib/invoice-utils"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Eye, Printer, Search, AlertTriangle, RefreshCw, WifiOff, Database, HardDrive } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function HistoryPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isNetworkError, setIsNetworkError] = useState(false)
  const [dataSource, setDataSource] = useState<"firebase" | "local" | "hybrid" | "none">("none")
  const { toast } = useToast()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setIsLoading(true)
    setError(null)
    setIsNetworkError(false)

    try {
      console.log("Fetching invoices...")
      const { invoices, error, source } = await getInvoices()

      if (error) {
        console.error("Error from getInvoices:", error)
        // Cek apakah ini error jaringan
        if (error.includes("Failed to fetch") || error.includes("network") || error.includes("connect")) {
          setIsNetworkError(true)
        }

        setError(error)
        toast({
          title: "Error",
          description: "Gagal mengambil data invoice",
          duration: 3000,
        })
      } else {
        console.log(`Invoices loaded (${source}):`, invoices.length)
        setInvoices(invoices)
        setDataSource(source as any)

        if (source === "local") {
          toast({
            title: "Mode Offline",
            description: "Menampilkan data dari penyimpanan lokal karena tidak dapat terhubung ke server",
            duration: 5000,
          })
        }
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)

      // Cek apakah ini error jaringan
      if (
        err.message &&
        (err.message.includes("Failed to fetch") || err.message.includes("network") || err.message.includes("connect"))
      ) {
        setIsNetworkError(true)
      }

      setError(err.message || "Terjadi kesalahan yang tidak diketahui")
      toast({
        title: "Error",
        description: err.message || "Terjadi kesalahan yang tidak diketahui",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    console.log("Viewing invoice with ID:", invoiceId)
    router.push(`/invoice/${invoiceId}`)
  }

  const handlePrint = (invoiceId: string) => {
    console.log("Printing invoice with ID:", invoiceId)
    router.push(`/invoice/${invoiceId}?print=true`)
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 sm:py-12 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2 sm:mb-3">Riwayat Invoice</h1>
            <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-2 sm:mb-4 rounded-full"></div>
          </div>

          {dataSource === "local" && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
              <HardDrive className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                Mode Offline: Menampilkan data dari penyimpanan lokal. Beberapa fitur mungkin tidak tersedia.
              </p>
            </div>
          )}

          {dataSource === "hybrid" && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <Database className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-xs text-blue-700">Mode Hybrid: Menampilkan data dari server dan penyimpanan lokal.</p>
            </div>
          )}

          <Card className="shadow-xl border-0 overflow-hidden bg-white rounded-lg sm:rounded-xl mb-6 sm:mb-8">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 p-3 sm:p-6 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg sm:text-xl">Daftar Invoice</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchInvoices}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="mb-4 sm:mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Cari berdasarkan nama klien atau nomor invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-8 sm:h-10"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-700"></div>
                  <p className="mt-2 text-gray-600 text-xs sm:text-sm">Memuat data invoice...</p>
                </div>
              ) : error ? (
                <div className="text-center py-6 sm:py-8 bg-red-50 rounded-lg">
                  {isNetworkError ? (
                    <>
                      <WifiOff className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h3 className="text-base font-medium text-gray-800 mb-1">Masalah Koneksi</h3>
                      <p className="text-red-600 text-xs sm:text-sm mb-4">
                        Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h3 className="text-base font-medium text-gray-800 mb-1">Terjadi Kesalahan</h3>
                      <p className="text-red-600 text-xs sm:text-sm mb-4">{error}</p>
                    </>
                  )}
                  <Button onClick={fetchInvoices} className="mt-2 bg-green-600 hover:bg-green-700">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Coba Lagi
                  </Button>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-xs sm:text-sm">Tidak ada invoice yang ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              No. Invoice
                            </th>
                            <th
                              scope="col"
                              className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Nama Klien
                            </th>
                            <th
                              scope="col"
                              className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Tanggal
                            </th>
                            <th
                              scope="col"
                              className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Total
                            </th>
                            <th
                              scope="col"
                              className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-xs font-medium text-gray-900">
                                <div className="flex items-center">
                                  {invoice.is_local && (
                                    <HardDrive className="h-3 w-3 text-yellow-500 mr-1 flex-shrink-0" />
                                  )}
                                  {invoice.invoice_number}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-xs text-gray-500">
                                {invoice.client_name}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-xs text-gray-500">
                                {formatDate(invoice.invoice_date)}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                <span
                                  className={`px-1.5 sm:px-2 py-0.5 inline-flex text-[8px] sm:text-[10px] leading-5 font-semibold rounded-full ${
                                    invoice.payment_status === "LUNAS"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {invoice.payment_status}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[10px] sm:text-xs text-gray-500">
                                {formatCurrency(invoice.total_amount)}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-[10px] sm:text-xs font-medium">
                                <div className="flex justify-end space-x-1 sm:space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50 h-6 w-6 p-0 sm:h-7 sm:w-7"
                                    onClick={() => handleViewInvoice(invoice.id)}
                                  >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 h-6 w-6 p-0 sm:h-7 sm:w-7"
                                    onClick={() => handlePrint(invoice.id)}
                                  >
                                    <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
