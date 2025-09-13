"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { StatsCard } from "@/components/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE_URL, authService } from "@/lib/auth";
import {
  AlertCircle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    delivered: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authService.makeAuthenticatedRequest(
          API_BASE_URL + "/operator/admin/stats"
        );

        setStats(response);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        title="Dashboard Overview"
        description="Welcome to your Hamar-Hadiya admin panel"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-6">
        <StatsCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || "0"}`}
          description="Total sales revenue"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          description="All time orders"
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          description="Products in inventory"
          icon={Package}
          trend={{ value: -2.1, isPositive: false }}
        />
        <StatsCard
          title="Active Operators"
          value="12"
          description="Currently active"
          icon={Users}
          trend={{ value: 5.4, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Order Status Overview
            </CardTitle>
            <CardDescription>
              Current order distribution by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Orders</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.ordersByStatus?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confirmed Orders</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.ordersByStatus?.confirmed || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivered Orders</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.ordersByStatus?.delivered || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Add New Product</div>
              <div className="text-xs text-muted-foreground">
                Create a new product listing
              </div>
            </button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Manage Orders</div>
              <div className="text-xs text-muted-foreground">
                View and update order status
              </div>
            </button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium text-sm">View Analytics</div>
              <div className="text-xs text-muted-foreground">
                Check detailed reports
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
