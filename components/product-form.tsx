"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Category, type Product, apiService } from "@/lib/api";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colours, setColours] = useState<string[]>(product?.colours || []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [newColour, setNewColour] = useState("");
  const [newSize, setNewSize] = useState("");
  const [stockStatus, setStockStatus] = useState(product?.stockStatus ?? true);
  const [freeDelivery, setFreeDelivery] = useState(
    product?.deliveryOptions?.freeDelivery ?? false
  );
  const [returnDelivery, setReturnDelivery] = useState(
    product?.deliveryOptions?.returnDelivery ?? false
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();

        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      // Add colours and sizes as multiple entries
      colours.forEach((colour) => formData.append("colours", colour));
      sizes.forEach((size) => formData.append("sizes", size));

      formData.set("stockStatus", stockStatus.toString());
      formData.set("freeDelivery", freeDelivery.toString());
      formData.set("returnDelivery", returnDelivery.toString());

      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const addColour = () => {
    if (newColour && !colours.includes(newColour)) {
      setColours([...colours, newColour]);
      setNewColour("");
    }
  };

  const removeColour = (colour: string) => {
    setColours(colours.filter((c) => c !== colour));
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Create New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Mahsulot Nomi</Label>
              <Input
                id="title"
                name="title"
                defaultValue={product?.title}
                required
                placeholder="Enter product title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={product?.category._id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              required
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Narxi (UZS)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product?.price}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oldPrice">Eski Narxi (UZS)</Label>
              <Input
                id="oldPrice"
                name="oldPrice"
                type="number"
                step="0.01"
                defaultValue={product?.oldPrice}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countInStock">Stock Count</Label>
              <Input
                id="countInStock"
                name="countInStock"
                type="number"
                defaultValue={product?.countInStock}
                required
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                defaultValue={product?.rating}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numReviews">Number of Reviews</Label>
              <Input
                id="numReviews"
                name="numReviews"
                type="number"
                defaultValue={product?.numReviews}
                placeholder="0"
              />
            </div>
          </div>

          {/* Colours */}
          <div className="space-y-2">
            <Label>Colours</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {colours.map((colour) => (
                <Badge
                  key={colour}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {colour}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeColour(colour)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newColour}
                onChange={(e) => setNewColour(e.target.value)}
                placeholder="Add colour"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addColour())
                }
              />
              <Button type="button" onClick={addColour} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Label>Sizes</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {sizes.map((size) => (
                <Badge
                  key={size}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {size}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSize(size)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Add size"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSize())
                }
              />
              <Button type="button" onClick={addSize} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Mahsulot Rasmlari</Label>
            <Input
              id="images"
              name="images"
              type="file"
              multiple
              accept="image/*"
            />
            <p className="text-sm text-muted-foreground">
              Mahsulot uchun bir nechta rasmni tanlang
            </p>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stockStatus"
                checked={stockStatus}
                onCheckedChange={(val) => setStockStatus(!!val)}
              />
              <Label htmlFor="stockStatus">In Stock</Label>
            </div>

            {/* Free Delivery */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="freeDelivery"
                checked={freeDelivery}
                onCheckedChange={(val) => setFreeDelivery(!!val)}
              />
              <Label htmlFor="freeDelivery">Free Delivery</Label>
            </div>

            {/* Return Delivery */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="returnDelivery"
                checked={returnDelivery}
                onCheckedChange={(val) => setReturnDelivery(!!val)}
              />
              <Label htmlFor="returnDelivery">Return Delivery</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
