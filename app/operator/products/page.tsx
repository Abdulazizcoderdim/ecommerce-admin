"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductForm } from "@/components/product-form"
import { type Product, apiService } from "@/lib/api"
import { Plus, Edit, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OperatorProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const response = await apiService.getProducts(page, 10)
      setProducts(response.data)
      setCurrentPage(page)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCreateProduct = async (formData: FormData) => {
    try {
      await apiService.createProduct(formData)
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      setShowForm(false)
      fetchProducts(currentPage)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return

    try {
      await apiService.updateProduct(editingProduct._id, formData)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      setEditingProduct(null)
      setShowForm(false)
      fetchProducts(currentPage)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showForm) {
    return (
      <div className="p-6">
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Products" description="Manage product information" />

      <div className="px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Management</CardTitle>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {product.images[0] && (
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-muted-foreground">{product.description.substring(0, 50)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">${product.price}</span>
                            {product.oldPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${product.oldPrice}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.countInStock}</TableCell>
                        <TableCell>
                          <Badge variant={product.stockStatus ? "default" : "destructive"}>
                            {product.stockStatus ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product)
                              setShowForm(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
