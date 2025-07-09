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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import { api } from "@/lib/api";

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

  // Add state for dialogs and forms
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [albumForm, setAlbumForm] = useState({ name: "", description: "" });
  const [clubForm, setClubForm] = useState({
    name: "",
    bio: "",
    storageQuotaMb: 500,
    logoFile: undefined as File | undefined,
  });
  const [userForm, setUserForm] = useState({ email: "", password: "", clubId: "" });
  const [albumError, setAlbumError] = useState<string | null>(null);
  const [clubError, setClubError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [clubLoading, setClubLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

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
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive
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
          {/* Create Album/Club/User Buttons */}
          {user?.role === "clubadmin" && (
            <Button
              className="w-full mt-6"
              onClick={() => setIsCreateAlbumOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Create Album
            </Button>
          )}
          {user?.role === "superadmin" && (
            <>
              <Button
                className="w-full mt-6"
                variant="outline"
                onClick={() => setIsCreateClubOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Create Club
              </Button>
              <Button
                className="w-full mt-2"
                variant="outline"
                onClick={() => setIsCreateUserOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Create User
              </Button>
            </>
          )}
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
                <Button variant="outline" onClick={() => setIsCreateClubOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Club
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsCreateUserOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New User
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* Album Dialog */}
      <Dialog open={isCreateAlbumOpen} onOpenChange={setIsCreateAlbumOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>
              Add a new photo album to your club's gallery.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAlbumLoading(true);
              setAlbumError(null);
              try {
                const res = await api.createAlbum({
                  name: albumForm.name.trim(),
                  description: albumForm.description.trim() || undefined,
                });
                if (res.success) {
                  setIsCreateAlbumOpen(false);
                  setAlbumForm({ name: "", description: "" });
                } else {
                  setAlbumError(res.error || "Failed to create album");
                }
              } catch (err) {
                setAlbumError("An unexpected error occurred");
              } finally {
                setAlbumLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="album-name">Album Name</Label>
              <Input
                id="album-name"
                value={albumForm.name}
                onChange={(e) =>
                  setAlbumForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                minLength={3}
                placeholder="Enter album name"
              />
            </div>
            <div>
              <Label htmlFor="album-description">Description</Label>
              <Textarea
                id="album-description"
                value={albumForm.description}
                onChange={(e) =>
                  setAlbumForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description"
                maxLength={500}
              />
            </div>
            {albumError && (
              <div className="text-destructive text-sm">{albumError}</div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={albumLoading}>
                {albumLoading ? "Creating..." : "Create Album"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Club Dialog */}
      <Dialog open={isCreateClubOpen} onOpenChange={setIsCreateClubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Club</DialogTitle>
            <DialogDescription>Add a new club to the system.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setClubLoading(true);
              setClubError(null);
              try {
                const res = await api.createClub(clubForm);
                if (res.success) {
                  setIsCreateClubOpen(false);
                  setClubForm({
                    name: "",
                    bio: "",
                    storageQuotaMb: 500,
                    logoFile: undefined,
                  });
                } else {
                  setClubError(res.error || "Failed to create club");
                }
              } catch (err) {
                setClubError("An unexpected error occurred");
              } finally {
                setClubLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="club-name">Club Name</Label>
              <Input
                id="club-name"
                value={clubForm.name}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                minLength={2}
                placeholder="Enter club name"
              />
            </div>
            <div>
              <Label htmlFor="club-bio">Bio</Label>
              <Textarea
                id="club-bio"
                value={clubForm.bio}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, bio: e.target.value }))
                }
                placeholder="Optional club bio"
                maxLength={500}
              />
            </div>
            <div>
              <Label htmlFor="club-storage">Storage Quota (MB)</Label>
              <Input
                id="club-storage"
                type="number"
                min={100}
                value={clubForm.storageQuotaMb}
                onChange={(e) =>
                  setClubForm((f) => ({
                    ...f,
                    storageQuotaMb: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="club-logo">Logo (optional)</Label>
              <Input
                id="club-logo"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, logoFile: e.target.files?.[0] }))
                }
              />
              {clubForm.logoFile && (
                <img
                  src={URL.createObjectURL(clubForm.logoFile)}
                  alt="Preview"
                  className="h-16 mt-2 rounded"
                />
              )}
            </div>
            {clubError && (
              <div className="text-destructive text-sm">{clubError}</div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={clubLoading}>
                {clubLoading ? "Creating..." : "Create Club"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Create a new club admin and assign them to a club.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setUserLoading(true);
              setUserError(null);
              try {
                const res = await api.createUser(Number(userForm.clubId), {
                  email: userForm.email,
                  password: userForm.password,
                });
                if (res.success) {
                  setIsCreateUserOpen(false);
                  setUserForm({ email: "", password: "", clubId: "" });
                } else {
                  setUserError(res.error || "Failed to create user");
                }
              } catch (err) {
                setUserError("An unexpected error occurred");
              } finally {
                setUserLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={userForm.email}
                onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                required
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={userForm.password}
                onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                required
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="user-club">Assign to Club (ID)</Label>
              <Input
                id="user-club"
                type="number"
                value={userForm.clubId}
                onChange={e => setUserForm(f => ({ ...f, clubId: e.target.value }))}
                required
                placeholder="Enter club ID"
              />
            </div>
            {userError && <div className="text-destructive text-sm">{userError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={userLoading}>
                {userLoading ? "Creating..." : "Create User"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
