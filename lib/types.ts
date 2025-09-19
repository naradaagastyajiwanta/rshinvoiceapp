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
