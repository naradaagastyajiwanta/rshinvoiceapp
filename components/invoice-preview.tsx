import type { InvoiceData } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/utils"
import Image from "next/image"

interface InvoicePreviewProps {
  data: InvoiceData
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const calculateItemTotal = (price: number, quantity: number, discount: number) => {
    const total = price * quantity
    const discountAmount = (discount / 100) * total
    return total - discountAmount
  }

  const calculateTotal = () => {
    return data.items.reduce((sum, item) => {
      return sum + calculateItemTotal(item.price, item.quantity, item.discount)
    }, 0)
  }

  return (
    <div className="print-invoice">
      {/* Header with green background */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 sm:p-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -mb-20 -ml-20"></div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white">INVOICE</h1>
            <p className="text-white mt-0.5 text-xs sm:text-sm">Rumah Sehat Holistik Satu Bumi</p>
          </div>
          <div className="w-10 h-10 sm:w-16 sm:h-16 relative">
            <Image src="/images/logo.png" alt="Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Invoice details section with dark background */}
      <div className="bg-gray-800 text-white p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <p className="mr-0 sm:mr-4 text-xs sm:text-sm">Invoice to:</p>
            <div>
              <p className="font-semibold text-xs sm:text-sm">Nama Klien</p>
              <p className="text-xs sm:text-sm">{data.clientName || "Nama"}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-semibold text-xs sm:text-sm">Invoice No: {data.invoiceNumber}</p>
            <p className="text-xs sm:text-sm">Invoice Date: {formatDate(data.invoiceDate)}</p>
            <p className="font-semibold mt-0.5 text-xs sm:text-sm">Total: {formatCurrency(calculateTotal())}</p>
          </div>
        </div>
      </div>

      {/* Table section with white background */}
      <div className="bg-white p-2 sm:p-4 overflow-x-auto">
        <div className="min-w-[400px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-green-100">
                <th className="py-1.5 sm:py-2 text-left text-[10px] sm:text-xs">No.</th>
                <th className="py-1.5 sm:py-2 text-left text-[10px] sm:text-xs">DESKRIPSI</th>
                <th className="py-1.5 sm:py-2 text-center text-[10px] sm:text-xs">QTY</th>
                <th className="py-1.5 sm:py-2 text-right text-[10px] sm:text-xs">HARGA</th>
                <th className="py-1.5 sm:py-2 text-right text-[10px] sm:text-xs">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-green-50 transition-colors duration-150">
                  <td className="py-1.5 sm:py-2 text-[10px] sm:text-xs">{index + 1}.</td>
                  <td className="py-1.5 sm:py-2 text-[10px] sm:text-xs">{item.description || "-"}</td>
                  <td className="py-1.5 sm:py-2 text-center text-[10px] sm:text-xs">{item.quantity}</td>
                  <td className="py-1.5 sm:py-2 text-right text-[10px] sm:text-xs">
                    {formatCurrency(item.price)}
                    {item.discount > 0 && (
                      <span className="text-green-600 text-[8px] sm:text-[10px] block">Diskon: {item.discount}%</span>
                    )}
                  </td>
                  <td className="py-1.5 sm:py-2 text-right font-medium text-[10px] sm:text-xs">
                    {formatCurrency(calculateItemTotal(item.price, item.quantity, item.discount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with status and total */}
      <div className="flex justify-between">
        <div
          className={`${
            data.paymentStatus === "LUNAS"
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-red-500 to-red-600"
          } text-white font-bold py-1.5 sm:py-2.5 px-3 sm:px-6 rounded-br-lg text-[10px] sm:text-xs`}
        >
          {data.paymentStatus}
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-1.5 sm:py-2.5 px-3 sm:px-6 rounded-bl-lg text-[10px] sm:text-xs">
          Total: {formatCurrency(calculateTotal())}
        </div>
      </div>

      {/* Payment details and contact */}
      <div className="bg-white p-3 sm:p-5 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
          <div className="mb-0 md:mb-0">
            <h3 className="font-bold mb-1.5 text-green-800 border-b border-green-200 pb-1 text-xs sm:text-sm">
              Detail Pembayaran
            </h3>
            <table className="text-[10px] sm:text-xs">
              <tbody>
                <tr>
                  <td className="pr-2 sm:pr-4 py-0.5 sm:py-1 text-gray-600">Bank Name</td>
                  <td>: Bank Mandiri</td>
                </tr>
                <tr>
                  <td className="pr-2 sm:pr-4 py-0.5 sm:py-1 text-gray-600">Account Name</td>
                  <td>: Eka Venusia Anandari / Dyah Retnowati</td>
                </tr>
                <tr>
                  <td className="pr-2 sm:pr-4 py-0.5 sm:py-1 text-gray-600">Account No</td>
                  <td>: 1660022778898</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-left md:text-right">
            <h3 className="font-bold mb-1.5 text-green-800 border-b border-green-200 pb-1 text-xs sm:text-sm">
              Hubungi Kami
            </h3>
            <p className="text-[10px] sm:text-xs">+62 816 677 225</p>
            <p className="text-[10px] sm:text-xs">rshsatubumi@gmail.com</p>
            <p className="text-[10px] sm:text-xs">Website: rshsatubumi.id</p>
            <p className="text-[10px] sm:text-xs">Instagram: @rshsatubumi</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex justify-between items-center">
          <div className="w-1/3">
            <div className="relative w-[150px] h-[60px]">
              <Image
                src="/images/signature.png"
                alt="Signature"
                width={150}
                height={60}
                className="max-h-10 sm:max-h-16 object-contain"
              />
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs">IR. Dyah Retnowati</p>
          </div>
        </div>
      </div>
    </div>
  )
}
