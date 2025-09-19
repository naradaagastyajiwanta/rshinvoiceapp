import { createServerSupabaseClient } from "./supabase"

export async function setupDatabase() {
  try {
    const supabase = createServerSupabaseClient()

    // Periksa apakah tabel invoices sudah ada
    const { data: invoicesExists, error: checkInvoicesError } = await supabase.from("invoices").select("id").limit(1)

    // Jika terjadi error, kemungkinan tabel belum ada
    if (checkInvoicesError) {
      console.log("Creating invoices table...")

      // Buat tabel invoices
      const { error: createInvoicesError } = await supabase.rpc("create_invoices_table")

      if (createInvoicesError) {
        throw createInvoicesError
      }
    }

    // Periksa apakah tabel invoice_items sudah ada
    const { data: itemsExists, error: checkItemsError } = await supabase.from("invoice_items").select("id").limit(1)

    // Jika terjadi error, kemungkinan tabel belum ada
    if (checkItemsError) {
      console.log("Creating invoice_items table...")

      // Buat tabel invoice_items
      const { error: createItemsError } = await supabase.rpc("create_invoice_items_table")

      if (createItemsError) {
        throw createItemsError
      }
    }

    console.log("Database setup complete")
    return { success: true }
  } catch (error) {
    console.error("Error setting up database:", error)
    return { success: false, error }
  }
}
