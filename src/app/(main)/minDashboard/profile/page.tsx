"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  History,
  Lock,
  LogOut,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.push("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // Implement delete account functionality
    toast.error("Delete account feature coming soon!");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleRideHistory = () => {
    router.push("/rides");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/minDashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="w-full bg-white shadow-lg">
          <CardContent className="">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {userData?.name || "tanmay63"}
              </h2>

              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Member since January 2024
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">
                    {userData?.email || "tanmaypendse63@gmail.com"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">
                    {userData?.phoneNumber || userData?.mobile || "8407929172"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRideHistory}
                className="w-full flex items-center justify-between p-4 bg-white border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700 font-medium">
                    See Your Ride History
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </button>

              <button
                onClick={handleForgotPassword}
                className="w-full flex items-center justify-between p-4 bg-white border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700 font-medium">
                    Forgot Password?
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </button>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 bg-white border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700 font-medium">
                    {loading ? "Logging Out..." : "Log Out"}
                  </span>
                </div>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                )}
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    Delete Account
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
