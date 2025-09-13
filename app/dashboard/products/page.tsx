"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ProductForm } from "@/components/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { type Product, apiService } from "@/lib/api";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(page, 10);
      setProducts(response.data);

      setPagination(response.pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (formData: FormData) => {
    try {
      await apiService.createProduct(formData);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setShowForm(false);

      fetchProducts(pagination.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return;

    try {
      await apiService.updateProduct(editingProduct._id, formData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts(pagination.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiService.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts(pagination.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="p-6">
        <ProductForm
          product={editingProduct ?? undefined}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Products"
        description="Manage your product inventory"
      />

      <div className="px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product List</CardTitle>
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
                      <TableHead>Rating</TableHead>
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
                              <p className="text-sm text-muted-foreground">
                                {product.description.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">
                              ${product.price}
                            </span>
                            {product.oldPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${product.oldPrice}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.countInStock}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.stockStatus ? "default" : "destructive"
                            }
                          >
                            {product.stockStatus ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span>{product.rating}</span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({product.numReviews})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.page > 1)
                        fetchProducts(pagination.page - 1);
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === pagination.page}
                        onClick={(e) => {
                          e.preventDefault();
                          fetchProducts(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                {pagination.page < pagination.pages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page < pagination.pages)
                          fetchProducts(pagination.page + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
