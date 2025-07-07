"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Plus,
  ImageIcon,
  BarChart3,
  Users,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Navigation for Club Admins
const clubAdminNavigation = [
  { name: "Overview", href: "/dashboard/clubadmin", icon: LayoutDashboard },
  { name: "Albums", href: "/dashboard/albums", icon: FolderOpen },
  { name: "Photos", href: "/dashboard/photos", icon: ImageIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Navigation for Super Admins
const superAdminNavigation = [
  { name: "Overview", href: "/dashboard/superadmin", icon: LayoutDashboard },
  { name: "Clubs", href: "/dashboard/clubs", icon: Building2 },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get navigation based on user role
  const navigation =
    user?.role === "superadmin" ? superAdminNavigation : clubAdminNavigation;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Club Header */}
        <div className="p-6 border-b border-border/50">
          <Link
            href="/"
            className="text-lg font-semibold text-foreground mb-4 block"
          >
            mpstme.pics
          </Link>
          {user?.role === "superadmin" ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center text-sm font-semibold rounded-lg">
                  SA
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Super Admin</h2>
                  <p className="text-xs text-muted-foreground">
                    System Administrator
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant="secondary"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  Super Admin
                </Badge>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold rounded-lg">
                  {user?.clubId ? "CA" : "??"}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Club Admin</h2>
                  <p className="text-xs text-muted-foreground">
                    Club Management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Active
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.role === "superadmin" ? "Super Admin" : "Club Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <LogoutButton className="w-full justify-start" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {user?.role === "superadmin"
                  ? "Admin Dashboard"
                  : "Club Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.role === "superadmin"
                  ? "Manage clubs, users, and system settings"
                  : "Manage your club's photo gallery and content"}
              </p>
            </div>
            {user?.role === "clubadmin" && (
              <Link href="/dashboard/albums/new">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create album
                </Button>
              </Link>
            )}
            {user?.role === "superadmin" && (
              <div className="flex gap-2">
                <Link href="/dashboard/clubs/new">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Club
                  </Button>
                </Link>
                <Link href="/dashboard/users/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New User
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
