import { getSupabaseClient, authHelpers } from "./supabase"
import type { InvoiceData, InvoiceItem } from "./types"

/**
 * Menghasilkan nomor invoice otomatis dengan format INV-YYYYMMDD-XXXX
 * di mana XXXX adalah angka acak 4 digit
 */
export function generateInvoiceNumber(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const dateStr = `${year}${month}${day}`

  // Menghasilkan angka acak 4 digit
  const randomNum = Math.floor(1000 + Math.random() * 9000)

  return `INV-${dateStr}-${randomNum}`
}

/**
 * Menghitung total invoice
 */
export function calculateInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price
    const discountAmount = (item.discount / 100) * itemTotal
    return sum + (itemTotal - discountAmount)
  }, 0)
}

/**
 * Mendapatkan user ID dari session
 */
async function getCurrentUserId(): Promise<string> {
  try {
    const { data } = await authHelpers.getUser()
    if (data.user) {
      return data.user.id
    }
  } catch (error) {
    console.error("Could not get user from auth:", error)
  }

  throw new Error("User tidak terautentikasi")
}

/**
 * Menyimpan invoice ke database
 */
export async function saveInvoice(invoice: InvoiceData): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = getSupabaseClient()
    const totalAmount = calculateInvoiceTotal(invoice.items)
    const userId = await getCurrentUserId()

    // Simpan invoice ke tabel invoices
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.clientName,
        invoice_date: invoice.invoiceDate,
        payment_status: invoice.paymentStatus,
        total_amount: totalAmount,
        user_id: userId,
      })
      .select("id")
      .single()

    if (invoiceError) {
      console.error("Error saving invoice to Supabase:", invoiceError)
      throw invoiceError
    }

    if (!invoiceData || !invoiceData.id) {
      throw new Error("Gagal mendapatkan ID invoice setelah penyimpanan")
    }

    console.log("Invoice saved to Supabase with ID:", invoiceData.id)

    // Simpan item invoice ke tabel invoice_items
    const invoiceItems = invoice.items.map((item) => ({
      invoice_id: invoiceData.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems)

    if (itemsError) {
      console.error("Error saving invoice items to Supabase:", itemsError)
      throw itemsError
    }

    console.log("Invoice items saved successfully to Supabase")
    return { success: true, id: invoiceData.id }
  } catch (error: any) {
    console.error("Error saving invoice:", error)

    return {
      success: false,
      error: error.message || "Gagal menyimpan invoice. Periksa koneksi internet Anda dan coba lagi.",
    }
  }
}

/**
 * Mengambil daftar invoice dari database
 */
export async function getInvoices(): Promise<{ invoices: any[]; error?: string; source?: string }> {
  try {
    const supabase = getSupabaseClient()
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching invoices from Supabase:", error)
      throw error
    }

    console.log("Fetched invoices from Supabase:", data?.length || 0)

    return { invoices: data || [], source: "supabase" }
  } catch (error: any) {
    console.error("Error fetching invoices:", error)

    return {
      invoices: [],
      error: error.message || "Gagal mengambil data invoice. Periksa koneksi internet Anda dan coba lagi.",
      source: "none",
    }
  }
}

/**
 * Mengambil detail invoice dari database
 */
export async function getInvoiceDetails(
  invoiceId: string,
): Promise<{ invoice?: any; items?: any[]; error?: string; source?: string }> {
  try {
    console.log("Fetching invoice details for ID:", invoiceId)

    if (!invoiceId) {
      throw new Error("ID invoice tidak valid")
    }

    const supabase = getSupabaseClient()

    // Ambil data invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single()

    if (invoiceError) {
      console.error("Error fetching invoice from Supabase:", invoiceError)

      if (invoiceError.code === "PGRST116") {
        throw new Error("Invoice tidak ditemukan")
      }

      throw invoiceError
    }

    if (!invoice) {
      throw new Error("Invoice tidak ditemukan")
    }

    console.log("Invoice data from Supabase:", invoice)

    // Ambil item invoice
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)

    if (itemsError) {
      console.error("Error fetching invoice items from Supabase:", itemsError)
      throw itemsError
    }

    if (!items || items.length === 0) {
      console.warn("No items found for invoice in Supabase:", invoiceId)
    } else {
      console.log("Invoice items from Supabase:", items.length)
    }

    return { invoice, items: items || [], source: "supabase" }
  } catch (error: any) {
    console.error("Error fetching invoice details:", error)

    return {
      error: error.message || "Gagal mengambil detail invoice",
      source: "none",
    }
  }
}
