export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  is_active: boolean
  user_id: string
}

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  discount: number
  product_id?: string
}

export interface PaymentDetail {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_default: boolean
  user_id: string
}

export interface InvoiceData {
  invoiceNumber: string
  clientName: string
  invoiceDate: string
  items: InvoiceItem[]
  paymentStatus: "LUNAS" | "BELUM LUNAS"
  paymentDetailId?: string
}
