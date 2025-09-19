"use client"

import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer"
import type { InvoiceData, PaymentDetail } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/utils"

interface InvoicePDFProps {
  data: InvoiceData
  paymentDetail?: PaymentDetail
}

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 0,
  },
  header: {
    backgroundColor: "#15803d",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  logo: {
    width: 50,
    height: 50,
  },
  invoiceDetails: {
    backgroundColor: "#1f2937",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "white",
  },
  invoiceDetailsLeft: {
    flexDirection: "row",
  },
  invoiceDetailsRight: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    marginRight: 15,
  },
  clientName: {
    fontWeight: "bold",
  },
  tableContainer: {
    padding: 20,
    backgroundColor: "white",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableHeader: {
    borderTopWidth: 0,
  },
  tableCol1: {
    width: "5%",
    padding: 8,
  },
  tableCol2: {
    width: "45%",
    padding: 8,
  },
  tableCol3: {
    width: "10%",
    padding: 8,
    textAlign: "center",
  },
  tableCol4: {
    width: "20%",
    padding: 8,
    textAlign: "right",
  },
  tableCol5: {
    width: "20%",
    padding: 8,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeftLunas: {
    backgroundColor: "#16a34a",
    padding: 10,
    color: "white",
    fontWeight: "bold",
    width: "30%",
    textAlign: "center",
  },
  footerLeftBelumLunas: {
    backgroundColor: "#ef4444",
    padding: 10,
    color: "white",
    fontWeight: "bold",
    width: "30%",
    textAlign: "center",
  },
  footerRight: {
    backgroundColor: "#16a34a",
    padding: 10,
    color: "white",
    fontWeight: "bold",
    width: "30%",
    textAlign: "center",
  },
  paymentSection: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  paymentDetails: {
    width: "50%",
  },
  contactDetails: {
    width: "40%",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  signatureBox: {
    width: "30%",
  },
  signatureName: {
    marginTop: 8,
  },
  discount: {
    color: "#16a34a",
    fontSize: 8,
  },
  signature: {
    width: 120,
    height: 50,
    marginBottom: 5,
  },
})

interface InvoicePDFProps {
  data: InvoiceData
  paymentDetail?: PaymentDetail
}

export function InvoicePDF({ data, paymentDetail }: InvoicePDFProps) {
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

  // Menentukan ukuran halaman berdasarkan jumlah item
  const getPageHeight = () => {
    // Tinggi dasar untuk header, detail invoice, footer, dll.
    const baseHeight = 500
    // Tinggi tambahan per item
    const itemHeight = 40
    // Tinggi total = tinggi dasar + (jumlah item * tinggi per item)
    return baseHeight + data.items.length * itemHeight
  }

  return (
    <Document>
      <Page size={[595.28, getPageHeight()]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>INVOICE</Text>
            <Text style={styles.headerSubtitle}>Rumah Sehat Holistik Satu Bumi</Text>
          </View>
          <Image src="/images/logo.png" style={styles.logo} />
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceDetailsLeft}>
            <Text style={styles.invoiceLabel}>Invoice to:</Text>
            <View>
              <Text style={styles.clientName}>Nama Klien</Text>
              <Text>{data.clientName || "Nama"}</Text>
            </View>
          </View>
          <View style={styles.invoiceDetailsRight}>
            <Text style={{ fontWeight: "bold" }}>Invoice No: {data.invoiceNumber}</Text>
            <Text>Invoice Date: {formatDate(data.invoiceDate)}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 4 }}>Total: {formatCurrency(calculateTotal())}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol1}>No.</Text>
              <Text style={styles.tableCol2}>DESKRIPSI</Text>
              <Text style={styles.tableCol3}>QTY</Text>
              <Text style={styles.tableCol4}>HARGA</Text>
              <Text style={styles.tableCol5}>JUMLAH</Text>
            </View>

            {/* Table Rows */}
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{index + 1}.</Text>
                <Text style={styles.tableCol2}>{item.description || "-"}</Text>
                <Text style={styles.tableCol3}>{item.quantity}</Text>
                <View style={styles.tableCol4}>
                  <Text>{formatCurrency(item.price)}</Text>
                  {item.discount > 0 && <Text style={styles.discount}>Diskon: {item.discount}%</Text>}
                </View>
                <Text style={styles.tableCol5}>
                  {formatCurrency(calculateItemTotal(item.price, item.quantity, item.discount))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={data.paymentStatus === "LUNAS" ? styles.footerLeftLunas : styles.footerLeftBelumLunas}>
            <Text>{data.paymentStatus}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text>Total: {formatCurrency(calculateTotal())}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentDetails}>
            <Text style={styles.sectionTitle}>Detail Pembayaran</Text>
            <View style={{ flexDirection: "row", marginBottom: 3 }}>
              <Text style={{ width: 80 }}>Bank</Text>
              <Text>: {paymentDetail?.bank_name || "BCA"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 3 }}>
              <Text style={{ width: 80 }}>No. Rek</Text>
              <Text>: {paymentDetail?.account_number || "5050096370"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 3 }}>
              <Text style={{ width: 80 }}>Atas Nama</Text>
              <Text>: {paymentDetail?.account_name || "Siti Rohmah"}</Text>
            </View>
          </View>

          <View style={styles.contactDetails}>
            <Text style={styles.sectionTitle}>Hubungi Kami</Text>
            <Text>+62 816 677 225</Text>
            <Text>rshsatubumi@gmail.com</Text>
            <Text>Website: rshsatubumi.id</Text>
            <Text>Instagram: @rshsatubumi</Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Image src="/images/signature.png" style={styles.signature} />
            <Text>IR. Dyah Retnowati</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
