"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { User, Club } from "@/lib/types";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    clubId: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    email: "",
    password: "",
    clubId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, clubsResponse] = await Promise.all([
          api.getUsers(),
          api.getAllClubs(),
        ]);

        if (usersResponse.success && Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data as User[]);
        }
        if (clubsResponse.success && clubsResponse.data) {
          setClubs(clubsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "superadmin") {
      fetchData();
    }
  }, [user]);

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.password.trim() || !newUser.clubId)
      return;

    try {
      const response = await api.createUser(parseInt(newUser.clubId), {
        email: newUser.email,
        password: newUser.password,
      });

      if (response.success && response.data && (response.data as User).id) {
        setUsers([...users, response.data as User]);
        setIsCreateDialogOpen(false);
        setNewUser({ email: "", password: "", clubId: "" });
      }
    } catch (error) {
      console.error("Failed to create user:", error);
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
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    const update: any = { email: editUserForm.email };
    if (editUserForm.password) update.password = editUserForm.password;
    if (editUserForm.clubId) update.clubId = parseInt(editUserForm.clubId);
    const res = await api.updateUser(editUser.id, update);
    if (res.success && res.data) {
      setUsers(
        users.map((u) =>
          editUser && u.id === editUser.id ? (res.data as User) : u
        )
      );
      setIsEditDialogOpen(false);
      setEditUser(null);
    }
  };

  const getClubName = (clubId?: number) => {
    if (!clubId) return "No Club";
    const club = clubs.find((c) => c.id === clubId);
    return club?.name || "Unknown Club";
  };

  if (user?.role !== "superadmin") {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Access Denied
        </h3>
        <p className="text-neutral-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Users</h1>
          <p className="text-neutral-600 mt-1">
            Manage club administrators and their access
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
              <Plus className="w-4 h-4 mr-2" />
              Create user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new club administrator. They will be able to manage
                their club's albums and photos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter user email"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="club">Assign to Club</Label>
                <Select
                  value={newUser.clubId}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, clubId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id.toString()}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Create user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No users yet
          </h3>
          <p className="text-neutral-600 mb-4">
            Create your first club administrator to start managing clubs.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first user
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((userItem) => (
            <Card
              key={userItem.id}
              className="border-neutral-200 bg-white overflow-hidden group hover:shadow-sm transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold rounded-lg">
                      {userItem.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-neutral-900 truncate">
                        {userItem.email}
                      </CardTitle>
                      <p className="text-sm text-neutral-500 mt-1">
                        {getClubName(userItem.clubId)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      userItem.role === "superadmin"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {userItem.role === "superadmin"
                      ? "Super Admin"
                      : "Club Admin"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{userItem.email}</span>
                  </div>
                </div>

                <div className="text-xs text-neutral-400">
                  Created {new Date(userItem.createdAt).toLocaleDateString()}
                </div>

                {userItem.role !== "superadmin" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setEditUser(userItem);
                        setEditUserForm({
                          email: userItem.email,
                          password: "",
                          clubId: userItem.clubId
                            ? userItem.clubId.toString()
                            : "",
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(userItem.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                value={editUserForm.email}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-user-password">Password</Label>
              <Input
                id="edit-user-password"
                type="password"
                value={editUserForm.password}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, password: e.target.value })
                }
                placeholder="Leave blank to keep unchanged"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-club">Assign to Club</Label>
              <Select
                value={editUserForm.clubId}
                onValueChange={(value) =>
                  setEditUserForm({ ...editUserForm, clubId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id.toString()}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
