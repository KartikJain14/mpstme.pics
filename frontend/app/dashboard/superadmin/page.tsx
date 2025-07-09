"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, Users, Plus, Edit, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Club, User } from "@/lib/types";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  const [newClub, setNewClub] = useState({
    name: "",
    bio: "",
    logoFile: undefined as File | undefined,
    storageQuotaMb: 500,
  });

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
  });

  // Add state for create album dialog in superadmin dashboard
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [albumForm, setAlbumForm] = useState({ name: "", description: "" });
  const [albumError, setAlbumError] = useState<string | null>(null);
  const [albumLoading, setAlbumLoading] = useState(false);

  // Edit Club State
  const [editClub, setEditClub] = useState<Club | null>(null);
  const [editClubForm, setEditClubForm] = useState({
    name: "",
    slug: "",
    storageQuotaMb: 500,
    logoFile: undefined as File | undefined,
  });
  const [isEditClubOpen, setIsEditClubOpen] = useState(false);
  // Edit User State
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    email: "",
    password: "",
    clubId: "",
  });
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubsResponse, usersResponse] = await Promise.all([
          api.getAllClubs(),
          api.getUsers(),
        ]);

        if (clubsResponse.success && clubsResponse.data) {
          setClubs(clubsResponse.data);
        }

        if (
          usersResponse.success &&
          usersResponse.data &&
          Array.isArray(usersResponse.data)
        ) {
          setUsers(usersResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateClub = async () => {
    if (!newClub.name.trim()) return;

    try {
      const response = await api.createClub({
        name: newClub.name,
        bio: newClub.bio,
        logoFile: newClub.logoFile,
        storageQuotaMb: newClub.storageQuotaMb,
      });
      if (response.success && response.data) {
        setClubs([...clubs, response.data]);
        setIsCreateClubOpen(false);
        setNewClub({ name: "", bio: "", logoFile: undefined, storageQuotaMb: 500 });
      }
    } catch (error) {
      console.error("Failed to create club:", error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.password.trim() || !selectedClubId)
      return;

    try {
      const response = await api.createUser(selectedClubId, newUser);
      if (response.success && response.data) {
        setUsers([...users, response.data as any]);
        setIsCreateUserOpen(false);
        setNewUser({ email: "", password: "" });
        setSelectedClubId(null);
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleCreateAlbum = async () => {
    setAlbumLoading(true);
    setAlbumError(null);
    try {
      const res = await api.createAlbum({
        name: albumForm.name.trim(),
        description: albumForm.description.trim() || undefined,
      });
      if (res.success && res.data) {
        setIsCreateAlbumOpen(false);
        setAlbumForm({ name: "", description: "" });
        // Optionally, refresh albums list if you show it here
      } else {
        setAlbumError(res.error || "Failed to create album");
      }
    } catch (err) {
      setAlbumError("An unexpected error occurred");
    } finally {
      setAlbumLoading(false);
    }
  };

  const handleDeleteClub = async (clubId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this club? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.deleteClub(clubId);
      if (response.success) {
        setClubs(clubs.filter((club) => club.id !== clubId));
      }
    } catch (error) {
      console.error("Failed to delete club:", error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const totalClubs = clubs.length;
  const totalUsers = users.length;
  const clubAdmins = users.filter((u) => u.role === "clubadmin").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Super Admin Dashboard
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage clubs, users, and system settings
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          <Shield className="w-3 h-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground">
              Active clubs in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Club Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clubAdmins}</div>
            <p className="text-xs text-muted-foreground">Managing clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Including superadmins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clubs Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clubs Management</CardTitle>
            <Dialog open={isCreateClubOpen} onOpenChange={setIsCreateClubOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Club
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Club</DialogTitle>
                  <DialogDescription>
                    Add a new club to the system. Club admins can be assigned
                    later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="club-name">Club Name</Label>
                    <Input
                      id="club-name"
                      value={newClub.name}
                      onChange={(e) =>
                        setNewClub({ ...newClub, name: e.target.value })
                      }
                      placeholder="Enter club name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="club-bio">Bio</Label>
                    <Textarea
                      id="club-bio"
                      value={newClub.bio}
                      onChange={(e) =>
                        setNewClub({ ...newClub, bio: e.target.value })
                      }
                      placeholder="Enter club description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="club-logo">Logo File</Label>
                    <Input
                      id="club-logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setNewClub({ ...newClub, logoFile: file });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="club-quota">Storage Quota (MB)</Label>
                    <Input
                      id="club-quota"
                      type="number"
                      value={newClub.storageQuotaMb}
                      onChange={(e) =>
                        setNewClub({
                          ...newClub,
                          storageQuotaMb: parseInt(e.target.value) || 500,
                        })
                      }
                      placeholder="500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateClubOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateClub}
                    className="bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    Create Club
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Storage Quota</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                      /{club.slug}
                    </code>
                  </TableCell>
                  <TableCell>{club.storageQuotaMb} MB</TableCell>
                  <TableCell>
                    {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditClub(club);
                        setEditClubForm({
                          name: club.name,
                          slug: club.slug,
                          storageQuotaMb: club.storageQuotaMb,
                          logoFile: undefined,
                        });
                        setIsEditClubOpen(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users Management</CardTitle>
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Club Admin</DialogTitle>
                  <DialogDescription>
                    Create a new club admin and assign them to a club.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-password">Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-club">Assign to Club</Label>
                    <select
                      id="user-club"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={selectedClubId || ""}
                      onChange={(e) =>
                        setSelectedClubId(parseInt(e.target.value) || null)
                      }
                    >
                      <option value="">Select a club</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateUser}
                    className="bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "superadmin" ? "default" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.clubId
                      ? clubs.find((c) => c.id === user.clubId)?.name ||
                      `Club ${user.clubId}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditUser(user);
                        setEditUserForm({
                          email: user.email,
                          password: "",
                          clubId: user.clubId ? user.clubId.toString() : "",
                        });
                        setIsEditUserOpen(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.role !== "superadmin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Club Dialog */}
      <Dialog open={isEditClubOpen} onOpenChange={setIsEditClubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>Update club details below.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editClub) return;
              const formData: any = {
                name: editClubForm.name,
                slug: editClubForm.slug,
                storageQuotaMb: editClubForm.storageQuotaMb,
              };
              if (editClubForm.logoFile) formData.logoFile = editClubForm.logoFile;
              const res = await api.updateClub(editClub.id, formData);
              if (res.success && res.data) {
                setClubs(clubs.map(c => (editClub && c.id === editClub.id ? res.data : c)));
                setIsEditClubOpen(false);
                setEditClub(null);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-club-name">Name</Label>
              <Input id="edit-club-name" value={editClubForm.name} onChange={e => setEditClubForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-club-slug">Slug</Label>
              <Input id="edit-club-slug" value={editClubForm.slug} onChange={e => setEditClubForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-club-quota">Storage Quota (MB)</Label>
              <Input id="edit-club-quota" type="number" value={editClubForm.storageQuotaMb} onChange={e => setEditClubForm(f => ({ ...f, storageQuotaMb: parseInt(e.target.value) || 500 }))} />
            </div>
            <div>
              <Label htmlFor="edit-club-logo">Logo File</Label>
              <Input id="edit-club-logo" type="file" accept="image/*" onChange={e => setEditClubForm(f => ({ ...f, logoFile: e.target.files?.[0] }))} />
              {editClubForm.logoFile && (
                <img
                  src={URL.createObjectURL(editClubForm.logoFile)}
                  alt="Preview"
                  className="h-16 mt-2 rounded"
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditClubOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details below.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editUser) return;
              const update: any = { email: editUserForm.email };
              if (editUserForm.password) update.password = editUserForm.password;
              if (editUserForm.clubId) update.clubId = parseInt(editUserForm.clubId);
              const res = await api.updateUser(editUser.id, update);
              if (res.success && res.data) {
                setUsers(users.map(u => (editUser && u.id === editUser.id ? res.data : u)));
                setIsEditUserOpen(false);
                setEditUser(null);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-user-email">Email</Label>
              <Input id="edit-user-email" value={editUserForm.email} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-user-password">Password</Label>
              <Input id="edit-user-password" type="password" value={editUserForm.password} onChange={e => setEditUserForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep unchanged" />
            </div>
            <div>
              <Label htmlFor="edit-user-club">Assign to Club</Label>
              <select
                id="edit-user-club"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editUserForm.clubId}
                onChange={e => setEditUserForm(f => ({ ...f, clubId: e.target.value }))}
              >
                <option value="">Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
