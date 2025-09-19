"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/hooks/formatPrice";
import { useToast } from "@/hooks/use-toast";
import { type Operator, type Order, apiService } from "@/lib/api";
import { Calendar, DollarSign, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate: () => void;
  isAdmin?: boolean;
}

export function OrderDetailsModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdate,
  isAdmin = false,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails();
      if (isAdmin) {
        fetchOperators();
      }
    }
  }, [orderId, isOpen, isAdmin]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderData = await apiService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    try {
      const operatorData = await apiService.getOperators();
      setOperators(operatorData);
    } catch (error) {
      console.error("Failed to fetch operators:", error);
    }
  };

  const handleStatusUpdate = async (
    newStatus: "pending" | "confirmed" | "delivered"
  ) => {
    if (!order) return;

    try {
      setUpdating(true);
      await apiService.updateOrderStatus(order._id, newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      onOrderUpdate();
      fetchOrderDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignOperator = async (operatorId: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      await apiService.assignOrder(order._id, operatorId);
      toast({
        title: "Success",
        description: "Order assigned successfully",
      });
      onOrderUpdate();
      fetchOrderDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign order",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading order details...</div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{order._id.slice(-6)}</span>
                  <OrderStatusBadge status={order.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      $
                      {order.totalAmount ||
                        order.products.reduce(
                          (sum, p) => sum + p.price * p.quantity,
                          0
                        )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {order.user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.user.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {product.product.images?.[0] && (
                          <img
                            src={
                              product.product.images[0] || "/placeholder.svg"
                            }
                            alt={product.product.title || "Product"}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {product.product.title ||
                              `Product ${product.product}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {product.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.price}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatPrice(product.price * product.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operator Information */}
            {order.operator && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Operator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {order.operator.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.operator.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Update Status:</label>
                <Select
                  value={order.status}
                  onValueChange={handleStatusUpdate}
                  disabled={updating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdmin && (
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">
                    Assign to Operator:
                  </label>
                  <Select
                    value={order.operator?._id || ""}
                    onValueChange={handleAssignOperator}
                    disabled={updating}
                  >
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((operator) => (
                        <SelectItem key={operator._id} value={operator._id}>
                          {operator.username} ({operator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Order not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
