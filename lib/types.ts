export interface Product {
  id: number
  name: string
  price: number
}

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  discount: number
}

export interface InvoiceData {
  invoiceNumber: string
  clientName: string
  invoiceDate: string
  items: InvoiceItem[]
  paymentStatus: "LUNAS" | "BELUM LUNAS"
}
