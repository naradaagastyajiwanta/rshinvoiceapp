"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus, Building2 } from "lucide-react"
import { toast } from "sonner"

interface PaymentDetail {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_default: boolean
  user_id: string
}

interface PaymentDetailsManagerProps {
  onPaymentDetailChange?: (paymentDetails: PaymentDetail[]) => void
}

export default function PaymentDetailsManager({ onPaymentDetailChange }: PaymentDetailsManagerProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState<PaymentDetail | null>(null)
  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    is_default: false
  })

  // Popular banks in Indonesia
  const popularBanks = [
    "BCA", "BRI", "BNI", "Bank Mandiri", "CIMB Niaga", "Bank Danamon", 
    "Bank BTN", "Bank Permata", "Bank OCBC NISP", "Bank Maybank", "Bank Mega"
  ]

  useEffect(() => {
    loadPaymentDetails()
  }, [])

  const loadPaymentDetails = async () => {
    try {
      // For now, load from localStorage until backend is ready
      const savedDetails = localStorage.getItem('paymentDetails')
      if (savedDetails) {
        const details = JSON.parse(savedDetails)
        setPaymentDetails(details)
        onPaymentDetailChange?.(details)
      } else {
        // Set default BCA payment detail
        const defaultDetail: PaymentDetail = {
          id: '1',
          bank_name: 'BCA',
          account_number: '5050096370',
          account_name: 'Siti Rohmah',
          is_default: true,
          user_id: 'default'
        }
        const defaultDetails = [defaultDetail]
        setPaymentDetails(defaultDetails)
        localStorage.setItem('paymentDetails', JSON.stringify(defaultDetails))
        onPaymentDetailChange?.(defaultDetails)
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
      toast.error('Gagal memuat detail pembayaran')
    }
  }

  const savePaymentDetails = (details: PaymentDetail[]) => {
    localStorage.setItem('paymentDetails', JSON.stringify(details))
    onPaymentDetailChange?.(details)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.bank_name || !formData.account_number || !formData.account_name) {
      toast.error('Semua field harus diisi')
      return
    }

    let updatedDetails: PaymentDetail[]

    if (editingDetail) {
      // Update existing detail
      updatedDetails = paymentDetails.map(detail => 
        detail.id === editingDetail.id 
          ? { ...detail, ...formData }
          : detail
      )
    } else {
      // Add new detail
      const newDetail: PaymentDetail = {
        id: Date.now().toString(),
        ...formData,
        user_id: 'default'
      }
      updatedDetails = [...paymentDetails, newDetail]
    }

    // If this is set as default, remove default from others
    if (formData.is_default) {
      updatedDetails = updatedDetails.map(detail => ({
        ...detail,
        is_default: detail.id === (editingDetail?.id || Date.now().toString())
      }))
    }

    setPaymentDetails(updatedDetails)
    savePaymentDetails(updatedDetails)
    
    toast.success(editingDetail ? 'Detail pembayaran berhasil diupdate' : 'Detail pembayaran berhasil ditambahkan')
    
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (detail: PaymentDetail) => {
    setEditingDetail(detail)
    setFormData({
      bank_name: detail.bank_name,
      account_number: detail.account_number,
      account_name: detail.account_name,
      is_default: detail.is_default
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedDetails = paymentDetails.filter(detail => detail.id !== id)
    
    // If we deleted the default, make the first remaining one default
    if (updatedDetails.length > 0 && !updatedDetails.some(d => d.is_default)) {
      updatedDetails[0].is_default = true
    }
    
    setPaymentDetails(updatedDetails)
    savePaymentDetails(updatedDetails)
    toast.success('Detail pembayaran berhasil dihapus')
  }

  const setAsDefault = (id: string) => {
    const updatedDetails = paymentDetails.map(detail => ({
      ...detail,
      is_default: detail.id === id
    }))
    setPaymentDetails(updatedDetails)
    savePaymentDetails(updatedDetails)
    toast.success('Detail pembayaran default berhasil diubah')
  }

  const resetForm = () => {
    setFormData({
      bank_name: "",
      account_number: "",
      account_name: "",
      is_default: false
    })
    setEditingDetail(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kelola Detail Pembayaran</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Detail Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDetail ? 'Edit Detail Pembayaran' : 'Tambah Detail Pembayaran'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bank_name">Nama Bank</Label>
                <Select 
                  value={formData.bank_name} 
                  onValueChange={(value) => setFormData({...formData, bank_name: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="account_number">Nomor Rekening</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  placeholder="Masukkan nomor rekening"
                />
              </div>
              
              <div>
                <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  placeholder="Masukkan nama pemilik rekening"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                />
                <Label htmlFor="is_default">Jadikan sebagai default</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingDetail ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {paymentDetails.map((detail) => (
          <Card key={detail.id} className={detail.is_default ? "border-blue-500" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <CardTitle className="text-lg">{detail.bank_name}</CardTitle>
                  {detail.is_default && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(detail)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!detail.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(detail.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">No. Rekening:</span> {detail.account_number}
                </div>
                <div>
                  <span className="font-medium">Atas Nama:</span> {detail.account_name}
                </div>
                {!detail.is_default && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => setAsDefault(detail.id)}
                  >
                    Jadikan sebagai default
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentDetails.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Belum ada detail pembayaran</h3>
            <p className="text-gray-500 mb-4">
              Tambahkan detail pembayaran untuk digunakan dalam invoice
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}