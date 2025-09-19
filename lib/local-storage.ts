import type { InvoiceData } from "./types"

// Kunci untuk menyimpan data di localStorage
const INVOICES_KEY = "rumah_sehat_invoices"
const INVOICE_ITEMS_KEY = "rumah_sehat_invoice_items"

// Fungsi untuk menyimpan invoice ke localStorage
export function saveInvoiceToLocalStorage(invoice: InvoiceData): string {
  try {
    // Generate ID lokal
    const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Ambil data yang sudah ada
    const existingInvoices = getInvoicesFromLocalStorage()

    // Tambahkan invoice baru
    const newInvoice = {
      id,
      invoice_number: invoice.invoiceNumber,
      client_name: invoice.clientName,
      invoice_date: invoice.invoiceDate,
      payment_status: invoice.paymentStatus,
      total_amount: calculateTotal(invoice.items),
      user_id: localStorage.getItem("username") || "unknown",
      created_at: new Date().toISOString(),
      is_local: true, // Tandai sebagai data lokal
    }

    existingInvoices.push(newInvoice)

    // Simpan kembali ke localStorage
    localStorage.setItem(INVOICES_KEY, JSON.stringify(existingInvoices))

    // Simpan item invoice
    const existingItems = getInvoiceItemsFromLocalStorage()
    const newItems = invoice.items.map((item, index) => ({
      id: `${id}_item_${index}`,
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
      is_local: true, // Tandai sebagai data lokal
    }))

    existingItems.push(...newItems)
    localStorage.setItem(INVOICE_ITEMS_KEY, JSON.stringify(existingItems))

    console.log("Invoice saved to localStorage with ID:", id)
    return id
  } catch (error) {
    console.error("Error saving invoice to localStorage:", error)
    return ""
  }
}

// Fungsi untuk mengambil semua invoice dari localStorage
export function getInvoicesFromLocalStorage(): any[] {
  try {
    const data = localStorage.getItem(INVOICES_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting invoices from localStorage:", error)
    return []
  }
}

// Fungsi untuk mengambil detail invoice dari localStorage
export function getInvoiceDetailsFromLocalStorage(id: string): { invoice?: any; items?: any[] } {
  try {
    // Ambil invoice
    const invoices = getInvoicesFromLocalStorage()
    const invoice = invoices.find((inv) => inv.id === id)

    if (!invoice) {
      return {}
    }

    // Ambil item invoice
    const allItems = getInvoiceItemsFromLocalStorage()
    const items = allItems.filter((item) => item.invoice_id === id)

    return { invoice, items }
  } catch (error) {
    console.error("Error getting invoice details from localStorage:", error)
    return {}
  }
}

// Fungsi untuk mengambil semua item invoice dari localStorage
function getInvoiceItemsFromLocalStorage(): any[] {
  try {
    const data = localStorage.getItem(INVOICE_ITEMS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting invoice items from localStorage:", error)
    return []
  }
}

// Fungsi untuk menghitung total invoice
function calculateTotal(items: any[]): number {
  return items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price
    const discountAmount = (item.discount / 100) * itemTotal
    return sum + (itemTotal - discountAmount)
  }, 0)
}
