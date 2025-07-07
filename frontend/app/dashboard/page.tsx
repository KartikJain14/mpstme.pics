"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === "superadmin") {
        router.replace("/dashboard/superadmin");
      } else if (user.role === "clubadmin") {
        router.replace("/dashboard/clubadmin");
      }
    } else if (!loading && !user) {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show loading while determining user role and redirecting
  if (loading || user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Dashboard...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should rarely be shown since we redirect to login
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to access the dashboard.</p>
        </CardContent>
      </Card>
    </div>
  );
}
