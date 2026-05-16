import { getFirebaseAuth, getFirebaseDb } from "./firebase"
import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, serverTimestamp } from "firebase/firestore"
import type { InvoiceData, InvoiceItem } from "./types"

export function generateInvoiceNumber(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const dateStr = `${year}${month}${day}`
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `INV-${dateStr}-${randomNum}`
}

export function calculateInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price
    const discountAmount = (item.discount / 100) * itemTotal
    return sum + (itemTotal - discountAmount)
  }, 0)
}

async function getCurrentUserId(): Promise<string> {
  const firebaseAuth = getFirebaseAuth()
  if (firebaseAuth?.currentUser) return firebaseAuth.currentUser.uid
  throw new Error("User tidak terautentikasi")
}

export async function saveInvoice(invoice: InvoiceData): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const firebaseDb = getFirebaseDb()
    if (!firebaseDb) throw new Error("Database belum dikonfigurasi")
    const totalAmount = calculateInvoiceTotal(invoice.items)
    const userId = await getCurrentUserId()

    const invoiceRef = await addDoc(collection(firebaseDb, "invoices"), {
      invoice_number: invoice.invoiceNumber,
      client_name: invoice.clientName,
      invoice_date: invoice.invoiceDate,
      payment_status: invoice.paymentStatus,
      total_amount: totalAmount,
      user_id: userId,
      created_at: serverTimestamp(),
    })

    const itemsData = invoice.items.map((item) => ({
      invoice_id: invoiceRef.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
    }))

    await Promise.all(itemsData.map((item) => addDoc(collection(firebaseDb, "invoice_items"), item)))

    return { success: true, id: invoiceRef.id }
  } catch (error: any) {
    console.error("Error saving invoice:", error)
    return {
      success: false,
      error: error.message || "Gagal menyimpan invoice. Periksa koneksi internet Anda dan coba lagi.",
    }
  }
}

export async function getInvoices(): Promise<{ invoices: any[]; error?: string; source?: string }> {
  try {
    const firebaseDb = getFirebaseDb()
    if (!firebaseDb) throw new Error("Database belum dikonfigurasi")
    const userId = await getCurrentUserId()

    const q = query(
      collection(firebaseDb, "invoices"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
    )

    const snapshot = await getDocs(q)
    const invoices = snapshot.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        invoice_number: data.invoice_number,
        client_name: data.client_name,
        invoice_date: data.invoice_date,
        payment_status: data.payment_status,
        total_amount: data.total_amount,
        user_id: data.user_id,
        created_at: data.created_at?.toDate?.()?.toISOString() ?? data.created_at,
      }
    })

    return { invoices, source: "firebase" }
  } catch (error: any) {
    console.error("Error fetching invoices:", error)
    return {
      invoices: [],
      error: error.message || "Gagal mengambil data invoice.",
      source: "none",
    }
  }
}

export async function getInvoiceDetails(
  invoiceId: string,
): Promise<{ invoice?: any; items?: any[]; error?: string; source?: string }> {
  try {
    const firebaseDb = getFirebaseDb()
    if (!firebaseDb) throw new Error("Database belum dikonfigurasi")
    if (!invoiceId) throw new Error("ID invoice tidak valid")

    const invoiceDoc = await getDoc(doc(firebaseDb, "invoices", invoiceId))

    if (!invoiceDoc.exists()) {
      throw new Error("Invoice tidak ditemukan")
    }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() }

    const itemsQuery = query(collection(firebaseDb, "invoice_items"), where("invoice_id", "==", invoiceId))
    const itemsSnapshot = await getDocs(itemsQuery)
    const items = itemsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    return { invoice, items, source: "firebase" }
  } catch (error: any) {
    console.error("Error fetching invoice details:", error)
    return {
      error: error.message || "Gagal mengambil detail invoice",
      source: "none",
    }
  }
}
