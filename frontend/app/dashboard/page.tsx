"use client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Redirect based on user role using window.location.href

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "superadmin") {
        window.location.href = "/dashboard/superadmin";
      } else if (user.role === "clubadmin") {
        window.location.href = "/dashboard/clubadmin";
      }
    } else if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
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
