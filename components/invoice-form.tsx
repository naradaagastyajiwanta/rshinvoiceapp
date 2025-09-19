"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, FileText, Calendar, User, CreditCard, Tag, Percent, CheckCircle2 } from "lucide-react"
import type { InvoiceData } from "@/lib/types"
import { products } from "@/lib/products"
import type { UseFormReturn } from "react-hook-form"

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceData>
  onSubmit: (data: InvoiceData) => void
  isSubmitting?: boolean
}

export function InvoiceForm({ form, onSubmit, isSubmitting = false }: InvoiceFormProps) {
  const { control, handleSubmit, watch, setValue } = form
  const items = watch("items")

  const addItem = () => {
    if (items.length < 3) {
      setValue("items", [...items, { id: items.length + 1, description: "", quantity: 1, price: 0, discount: 0 }])
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setValue(
        "items",
        items.filter((_, i) => i !== index),
      )
    }
  }

  const handleProductSelect = (value: string, index: number) => {
    const selectedProduct = products.find((p) => p.name === value)
    if (selectedProduct) {
      const updatedItems = [...items]
      updatedItems[index] = {
        ...updatedItems[index],
        description: selectedProduct.name,
        price: selectedProduct.price,
      }
      setValue("items", updatedItems)
    }
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price
      const discountAmount = (item.discount / 100) * itemTotal
      return sum + (itemTotal - discountAmount)
    }, 0)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-4">
            <FormField
              control={control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
                      <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      Nomor Invoice
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input readOnly {...field} className="bg-gray-50 text-xs sm:text-sm h-8 sm:h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 sm:space-y-4">
            <FormField
              control={control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
                      <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      Nama Klien
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama klien" {...field} className="text-xs sm:text-sm h-8 sm:h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-4">
            <FormField
              control={control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
                      <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      Tanggal Invoice
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="text-xs sm:text-sm h-8 sm:h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-medium text-gray-800">
              <span className="flex items-center">
                <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                Daftar Produk/Layanan
              </span>
            </h3>
            {items.length < 3 && (
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50 text-xs h-7 px-2"
              >
                <span className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  <span>Tambah</span>
                </span>
              </Button>
            )}
          </div>

          {items.map((item, index) => (
            <Card key={index} className="p-2 sm:p-4 border border-green-100 shadow-sm">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h4 className="font-medium text-green-800 text-xs sm:text-sm">
                  <span className="flex items-center">
                    <Tag className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Item #{index + 1}
                  </span>
                </h4>
                {items.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor={`product-${index}`} className="mb-1 block text-xs text-gray-700">
                    Produk/Layanan
                  </Label>
                  <Select onValueChange={(value) => handleProductSelect(value, index)} value={item.description}>
                    <SelectTrigger id={`product-${index}`} className="text-xs h-8 sm:h-9">
                      <SelectValue placeholder="Pilih produk/layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name} className="text-xs">
                          {product.name} - Rp {product.price.toLocaleString("id-ID")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`quantity-${index}`} className="mb-1 block text-xs text-gray-700">
                    Jumlah
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 1
                      const updatedItems = [...items]
                      updatedItems[index] = {
                        ...updatedItems[index],
                        quantity: value,
                      }
                      setValue("items", updatedItems)
                    }}
                    className="text-xs h-8 sm:h-9"
                  />
                </div>

                <div>
                  <Label htmlFor={`price-${index}`} className="mb-1 block text-xs text-gray-700">
                    <span className="flex items-center">
                      <CreditCard className="mr-1 h-3 w-3 text-green-600" />
                      Harga (Rp)
                    </span>
                  </Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 0
                      const updatedItems = [...items]
                      updatedItems[index] = {
                        ...updatedItems[index],
                        price: value,
                      }
                      setValue("items", updatedItems)
                    }}
                    className="text-xs h-8 sm:h-9"
                  />
                </div>

                <div>
                  <Label htmlFor={`discount-${index}`} className="mb-1 block text-xs text-gray-700">
                    <span className="flex items-center">
                      <Percent className="mr-1 h-3 w-3 text-green-600" />
                      Diskon (%)
                    </span>
                  </Label>
                  <Input
                    id={`discount-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 0
                      const updatedItems = [...items]
                      updatedItems[index] = {
                        ...updatedItems[index],
                        discount: value,
                      }
                      setValue("items", updatedItems)
                    }}
                    className="text-xs h-8 sm:h-9"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-green-50 p-3 sm:p-4 rounded-lg shadow-inner">
          <FormField
            control={control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
                    <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Status Pembayaran
                  </span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-xs h-8 sm:h-9">
                      <SelectValue placeholder="Pilih status pembayaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LUNAS" className="text-xs">
                      LUNAS
                    </SelectItem>
                    <SelectItem value="BELUM LUNAS" className="text-xs">
                      BELUM LUNAS
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg shadow-inner">
          <p className="text-base sm:text-lg font-semibold text-green-800 flex items-center justify-center">
            Total: <span className="ml-2">Rp {calculateTotal().toLocaleString("id-ID")}</span>
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-lg shadow-md hover:shadow-lg text-sm sm:text-base h-auto w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Generate Invoice
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
