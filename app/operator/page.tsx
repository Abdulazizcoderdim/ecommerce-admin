"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { StatsCard } from "@/components/stats-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE_URL, authService } from "@/lib/auth";
import { CheckCircle, Clock, Package, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface Order {
  _id: string;
  status: "pending" | "confirmed" | "delivered";
  totalAmount?: number;
  products: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

export default function OperatorDashboard() {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await authService.makeAuthenticatedRequest(
          API_BASE_URL + "/operator/my-orders?limit=5"
        );

        setMyOrders(response.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingOrders = myOrders.filter(
    (order) => order.status === "pending"
  ).length;
  const confirmedOrders = myOrders.filter(
    (order) => order.status === "confirmed"
  ).length;
  const deliveredOrders = myOrders.filter(
    (order) => order.status === "delivered"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Operator Dashboard"
        description="Manage your assigned orders and tasks"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-6">
        <StatsCard
          title="My Orders"
          value={myOrders.length}
          description="Total assigned orders"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Pending"
          value={pendingOrders}
          description="Orders awaiting action"
          icon={Clock}
        />
        <StatsCard
          title="Confirmed"
          value={confirmedOrders}
          description="Orders confirmed"
          icon={Package}
        />
        <StatsCard
          title="Delivered"
          value={deliveredOrders}
          description="Successfully delivered"
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 px-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your most recently assigned orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No orders assigned yet
                </p>
              ) : (
                myOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
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
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border">
              <div className="font-medium text-sm">View All My Orders</div>
              <div className="text-xs text-muted-foreground">
                See all assigned orders
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border">
              <div className="font-medium text-sm">Update Order Status</div>
              <div className="text-xs text-muted-foreground">
                Mark orders as confirmed or delivered
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border">
              <div className="font-medium text-sm">Manage Products</div>
              <div className="text-xs text-muted-foreground">
                View and edit product information
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
