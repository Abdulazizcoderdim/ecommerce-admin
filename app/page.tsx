"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  console.log("user", user);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (user?.role === "admin") {
          router.push("/dashboard");
        } else if (user?.role === "operator") {
          router.push("/operator");
        } else {
          router.push("/dashboard"); // Default fallback
        }
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return null;
}
