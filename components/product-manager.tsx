"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus, Package, Tag } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  is_active: boolean
  user_id: string
}

interface ProductManagerProps {
  onProductChange?: (products: Product[]) => void
}

export default function ProductManager({ onProductChange }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    is_active: true
  })

  // Popular categories
  const categories = [
    "Konsultasi", "Pemeriksaan", "Terapi", "Program", "Paket", "Herbal", "Lainnya"
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      // For now, load from localStorage until backend is ready
      const savedProducts = localStorage.getItem('products')
      if (savedProducts) {
        const products = JSON.parse(savedProducts)
        setProducts(products)
        onProductChange?.(products)
      } else {
        // Set default products
        const defaultProducts: Product[] = [
          {
            id: '1',
            name: 'Sehat Dalam Sekejap',
            description: 'Program kesehatan cepat dan efektif',
            price: 300000,
            category: 'Konsultasi',
            is_active: true,
            user_id: 'default'
          },
          {
            id: '2',
            name: 'Quantum Scan',
            description: 'Pemeriksaan kesehatan dengan teknologi quantum',
            price: 180000,
            category: 'Pemeriksaan',
            is_active: true,
            user_id: 'default'
          },
          {
            id: '3',
            name: 'Program 7 Hari Menuju Sehat Raga & Jiwa',
            description: 'Program holistik 7 hari untuk kesehatan optimal',
            price: 6300000,
            category: 'Program',
            is_active: true,
            user_id: 'default'
          },
          {
            id: '4',
            name: 'Konsultasi Kesehatan',
            description: 'Konsultasi langsung dengan ahli kesehatan',
            price: 250000,
            category: 'Konsultasi',
            is_active: true,
            user_id: 'default'
          },
          {
            id: '5',
            name: 'Terapi Holistik',
            description: 'Terapi kesehatan secara menyeluruh',
            price: 350000,
            category: 'Terapi',
            is_active: true,
            user_id: 'default'
          },
          {
            id: '6',
            name: 'Paket Detox',
            description: 'Program detoksifikasi tubuh alami',
            price: 500000,
            category: 'Program',
            is_active: true,
            user_id: 'default'
          },
          {
            id: '7',
            name: 'Herbal Treatment',
            description: 'Pengobatan dengan ramuan herbal alami',
            price: 275000,
            category: 'Terapi',
            is_active: true,
            user_id: 'default'
          }
        ]
        setProducts(defaultProducts)
        localStorage.setItem('products', JSON.stringify(defaultProducts))
        onProductChange?.(defaultProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Gagal memuat produk')
    }
  }

  const saveProducts = (products: Product[]) => {
    localStorage.setItem('products', JSON.stringify(products))
    onProductChange?.(products)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.price <= 0) {
      toast.error('Nama produk dan harga harus diisi dengan benar')
      return
    }

    let updatedProducts: Product[]

    if (editingProduct) {
      // Update existing product
      updatedProducts = products.map(product => 
        product.id === editingProduct.id 
          ? { ...product, ...formData, price: Number(formData.price) }
          : product
      )
      toast.success('Produk berhasil diupdate')
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formData,
        price: Number(formData.price),
        user_id: 'default'
      }
      updatedProducts = [...products, newProduct]
      toast.success('Produk berhasil ditambahkan')
    }

    setProducts(updatedProducts)
    saveProducts(updatedProducts)
    
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category || "",
      is_active: product.is_active
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id)
    setProducts(updatedProducts)
    saveProducts(updatedProducts)
    toast.success('Produk berhasil dihapus')
  }

  const toggleActive = (id: string) => {
    const updatedProducts = products.map(product => ({
      ...product,
      is_active: product.id === id ? !product.is_active : product.is_active
    }))
    setProducts(updatedProducts)
    saveProducts(updatedProducts)
    toast.success('Status produk berhasil diubah')
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      is_active: true
    })
    setEditingProduct(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Lainnya'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Produk/Layanan *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Harga *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Produk aktif</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-green-600" />
              {category}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryProducts.map((product) => (
                <Card key={product.id} className={!product.is_active ? "opacity-60" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {!product.is_active && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.description && (
                        <p className="text-sm text-gray-600">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-semibold text-lg text-green-600">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                          onClick={() => toggleActive(product.id)}
                        >
                          {product.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Belum ada produk</h3>
            <p className="text-gray-500 mb-4">
              Tambahkan produk atau layanan untuk digunakan dalam invoice
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}