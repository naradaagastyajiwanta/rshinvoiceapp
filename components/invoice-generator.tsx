"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { pdf } from "@react-pdf/renderer"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { InvoicePDF } from "@/components/invoice-pdf"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FileDown, Printer, RefreshCw, Save } from "lucide-react"
import type { InvoiceData, PaymentDetail } from "@/lib/types"
import { generateInvoiceNumber, saveInvoice } from "@/lib/invoice-utils"

export function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("form")
  const { toast } = useToast()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([])
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    clientName: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    items: [{ id: 1, description: "", quantity: 1, price: 0, discount: 0 }],
    paymentStatus: "LUNAS",
    paymentDetailId: undefined,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    // Load payment details from localStorage
    const savedDetails = localStorage.getItem('paymentDetails')
    if (savedDetails) {
      const details = JSON.parse(savedDetails)
      setPaymentDetails(details)
      
      // Set default payment detail if not already set
      if (!invoiceData.paymentDetailId) {
        const defaultDetail = details.find((d: PaymentDetail) => d.is_default)
        if (defaultDetail) {
          setInvoiceData(prev => ({ ...prev, paymentDetailId: defaultDetail.id }))
        }
      }
    }
  }, [])

  const form = useForm<InvoiceData>({
    defaultValues: invoiceData,
  })

  const handleFormSubmit = (data: InvoiceData) => {
    setIsGenerating(true)

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setInvoiceData(data)
      setActiveTab("preview")
      setIsGenerating(false)

      toast({
        title: "Invoice berhasil dibuat! 🎉",
        description: "Invoice telah dibuat dan siap untuk diunduh.",
        duration: 3000,
      })
    }, 800)
  }

  const handlePrint = () => {
    setIsPrinting(true)

    toast({
      title: "Menyiapkan Print",
      description: "Halaman print sedang disiapkan...",
      duration: 2000,
    })

    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 1000)
  }

  const handleSaveInvoice = async () => {
    if (!invoiceData.clientName) {
      toast({
        title: "Error",
        description: "Nama klien harus diisi sebelum menyimpan invoice",
        duration: 3000,
      })
      return
    }

    setIsSaving(true)

    const result = await saveInvoice(invoiceData)

    if (result.success) {
      toast({
        title: "Invoice berhasil disimpan! 🎉",
        description: "Invoice telah disimpan ke database.",
        duration: 3000,
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal menyimpan invoice",
        duration: 3000,
      })
    }

    setIsSaving(false)
  }

  const handleNewInvoice = () => {
    form.reset({
      ...invoiceData,
      invoiceNumber: generateInvoiceNumber(),
      clientName: "",
      items: [{ id: 1, description: "", quantity: 1, price: 0, discount: 0 }],
    })
    setActiveTab("form")
  }

  // Fungsi untuk mengunduh PDF
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)

      toast({
        title: "Menyiapkan PDF",
        description: "PDF sedang dipersiapkan untuk diunduh...",
        duration: 2000,
      })

      // Get selected payment detail
      const selectedPaymentDetail = paymentDetails.find(detail => detail.id === invoiceData.paymentDetailId)

      // Buat dokumen PDF
      const blob = await pdf(<InvoicePDF data={invoiceData} paymentDetail={selectedPaymentDetail} />).toBlob()

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
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Gagal menghasilkan PDF. Silakan coba lagi.",
        duration: 3000,
      })
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-0 sm:px-6">
      <Card className="shadow-xl border-0 overflow-hidden bg-white rounded-lg sm:rounded-xl">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -mb-20 -ml-20"></div>

          <h2 className="text-xl sm:text-3xl font-bold relative z-10">Buat Invoice Baru</h2>
          <p className="text-green-100 mt-1 sm:mt-2 relative z-10 max-w-lg text-xs sm:text-base">
            Buat invoice profesional untuk klien Rumah Sehat Holistik Satu Bumi
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-3 sm:p-6">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 rounded-lg bg-green-50 p-1">
            <TabsTrigger
              value="form"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg py-1.5 sm:py-3 text-xs sm:text-base"
            >
              Form Invoice
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg py-1.5 sm:py-3 text-xs sm:text-base"
            >
              Preview Invoice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-0 border-0 p-0">
            <div className="bg-white rounded-lg">
              <InvoiceForm form={form} onSubmit={handleFormSubmit} isSubmitting={isGenerating} />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0 border-0 p-0 pb-20">
            <div className="mb-4 sm:mb-6 bg-white rounded-lg overflow-hidden shadow-lg">
              <InvoicePreview 
                data={invoiceData} 
                paymentDetail={paymentDetails.find(detail => detail.id === invoiceData.paymentDetailId)} 
              />
            </div>
          </TabsContent>
        </Tabs>

        {activeTab === "preview" && invoiceData.clientName && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50">
            <div className="container mx-auto max-w-5xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  <span className="flex items-center">
                    <FileDown className="mr-1.5 h-4 w-4" />
                    {isDownloading ? "Menyiapkan..." : "Download PDF"}
                  </span>
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="outline"
                  disabled={isPrinting}
                  className="border-green-600 text-green-700 hover:bg-green-50 w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  <span className="flex items-center">
                    <Printer className="mr-1.5 h-4 w-4" />
                    {isPrinting ? "Menyiapkan..." : "Print Invoice"}
                  </span>
                </Button>

                <Button
                  onClick={handleSaveInvoice}
                  variant="outline"
                  disabled={isSaving}
                  className="border-blue-600 text-blue-700 hover:bg-blue-50 w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  <span className="flex items-center">
                    <Save className="mr-1.5 h-4 w-4" />
                    {isSaving ? "Menyimpan..." : "Simpan Invoice"}
                  </span>
                </Button>

                <Button
                  onClick={handleNewInvoice}
                  variant="secondary"
                  className="w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  <span className="flex items-center">
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Buat Baru
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
