"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { InvoicePreview } from "@/components/invoice-preview"
import { InvoicePDF } from "@/components/invoice-pdf"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getInvoiceDetails } from "@/lib/invoice-utils"
import { FileDown, Printer, ArrowLeft, AlertTriangle, RefreshCw, HardDrive } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import type { InvoiceData, InvoiceItem } from "@/lib/types"

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"firebase" | "local" | "none">("none")

  const fetchInvoiceDetails = async () => {
    if (!params.id) {
      setError("ID invoice tidak valid")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching invoice with ID:", params.id)
      const { invoice, items, error, source } = await getInvoiceDetails(params.id as string)

      if (error) {
        console.error("Error from getInvoiceDetails:", error)
        setError(error)
        toast({
          title: "Error",
          description: error || "Gagal mengambil detail invoice",
          duration: 5000,
        })
        return
      }

      if (!invoice) {
        console.error("No invoice returned")
        setError("Invoice tidak ditemukan")
        toast({
          title: "Error",
          description: "Invoice tidak ditemukan",
          duration: 5000,
        })
        return
      }

      if (!items || items.length === 0) {
        console.warn("No items found for invoice")
        toast({
          title: "Peringatan",
          description: "Invoice tidak memiliki item",
          duration: 5000,
        })
        // Tetap lanjutkan dengan array kosong
      }

      console.log(`Successfully fetched invoice (${source}):`, invoice)
      console.log("Items:", items?.length || 0)
      setDataSource(source as any)

      if (source === "local") {
        toast({
          title: "Mode Offline",
          description: "Menampilkan data dari penyimpanan lokal",
          duration: 3000,
        })
      }

      // Convert database format to InvoiceData format
      const invoiceData: InvoiceData = {
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        invoiceDate: invoice.invoice_date,
        paymentStatus: invoice.payment_status,
        items: (items || []).map(
          (item: any): InvoiceItem => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
          }),
        ),
      }

      setInvoiceData(invoiceData)

      // Cek apakah ada parameter print=true di URL
      if (searchParams.get("print") === "true") {
        // Tunggu sebentar agar konten dirender dengan benar
        setTimeout(() => {
          handlePrint()
        }, 1000)
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setError(err.message || "Terjadi kesalahan yang tidak diketahui")
      toast({
        title: "Error",
        description: err.message || "Terjadi kesalahan yang tidak diketahui",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoiceDetails()
  }, [params.id, searchParams])

  const handlePrint = () => {
    if (!invoiceData) return

    setIsPrinting(true)

    toast({
      title: "Menyiapkan Print",
      description: "Halaman print sedang disiapkan...",
      duration: 2000,
    })

    // Gunakan setTimeout untuk memastikan toast muncul sebelum print dialog
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 500)
  }

  const handleDownloadPDF = async () => {
    if (!invoiceData) return

    try {
      setIsDownloading(true)

      toast({
        title: "Menyiapkan PDF",
        description: "PDF sedang dipersiapkan untuk diunduh...",
        duration: 2000,
      })

      // Buat dokumen PDF
      const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob()

      // Buat URL untuk blob
      const url = URL.createObjectURL(blob)

      // Buat elemen a untuk mengunduh
      const link = document.createElement("a")
      link.href = url
      link.download = `Invoice-${invoiceData.clientName.replace(/\s+/g, "-")}.pdf`
      document.body.appendChild(link)
      link.click()

      // Bersihkan
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)

      setIsDownloading(false)
    } catch (error: any) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Gagal menghasilkan PDF. Silakan coba lagi.",
        duration: 3000,
      })
      setIsDownloading(false)
    }
  }

  const handleBackToHistory = () => {
    router.push("/history")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 sm:py-12 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHistory}
              className="text-green-700 border-green-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>

            {invoiceData && (
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading || !invoiceData}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {isDownloading ? "Menyiapkan..." : "Download PDF"}
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="outline"
                  disabled={isPrinting || !invoiceData}
                  size="sm"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {isPrinting ? "Menyiapkan..." : "Print"}
                </Button>
              </div>
            )}
          </div>

          {dataSource === "local" && invoiceData && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center print:hidden">
              <HardDrive className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                Mode Offline: Menampilkan data dari penyimpanan lokal. Beberapa fitur mungkin tidak tersedia.
              </p>
            </div>
          )}

          <Card className="shadow-xl border-0 overflow-hidden bg-white rounded-lg sm:rounded-xl print:shadow-none print:border-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <div className="flex space-x-3">
                    <Button onClick={fetchInvoiceDetails} className="bg-green-600 hover:bg-green-700">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Coba Lagi
                    </Button>
                    <Button onClick={handleBackToHistory} variant="outline" className="border-green-600 text-green-700">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>
                  </div>
                </div>
              </div>
            ) : invoiceData ? (
              <div className="invoice-preview">
                <InvoicePreview data={invoiceData} />
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Invoice Tidak Ditemukan</h3>
                  <p className="text-gray-600 mb-4">Invoice yang Anda cari tidak ditemukan atau telah dihapus.</p>
                  <Button onClick={handleBackToHistory} className="bg-green-600 hover:bg-green-700">
                    Kembali ke Riwayat Invoice
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
