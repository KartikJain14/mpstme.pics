"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect users to their appropriate dashboard
      if (user.role === "superadmin") {
        router.replace("/dashboard/superadmin");
      } else if (user.role === "clubadmin") {
        router.replace("/dashboard/clubadmin");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-xl font-semibold text-neutral-900 mb-2">
          Not Authenticated
        </div>
        <p className="text-neutral-600">
          Please log in to access the dashboard.
        </p>
      </div>
    );
  }

  // This should not be reached due to the redirect above, but just in case
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}
