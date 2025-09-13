"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const operatorNavItems = [
  {
    title: "Dashboard",
    href: "/operator",
    icon: LayoutDashboard,
  },
  {
    title: "My Orders",
    href: "/operator/orders",
    icon: ShoppingCart,
  },
];

export function OperatorSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Operator Panel
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {operatorNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="mb-3 p-2 bg-sidebar-accent rounded-lg">
            <p className="text-sm font-medium text-sidebar-foreground">
              {user.username}
            </p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">
              {user.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            isCollapsed && "px-2"
          )}
        >
          <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}
