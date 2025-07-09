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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building2, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Club } from "@/lib/types";

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClub, setNewClub] = useState({
    name: "",
    bio: "",
    storageQuotaMb: 500,
    logoFile: undefined as File | undefined,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editClub, setEditClub] = useState<Club | null>(null);
  const [editClubForm, setEditClubForm] = useState({
    name: "",
    slug: "",
    storageQuotaMb: 500,
    logoFile: undefined as File | undefined,
  });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.getAllClubs();
        if (response.success && response.data) {
          setClubs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "superadmin") {
      fetchClubs();
    }
  }, [user]);

  const handleCreateClub = async () => {
    if (!newClub.name.trim()) return;

    try {
      const response = await api.createClub(newClub);
      if (response.success && response.data) {
        setClubs([...clubs, response.data]);
        setIsCreateDialogOpen(false);
        setNewClub({ name: "", bio: "", storageQuotaMb: 500, logoFile: undefined });
      }
    } catch (error) {
      console.error("Failed to create club:", error);
    }
  };

  const handleEditClub = async (e: React.FormEvent) => {
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
      setClubs(clubs.map((c) => (c.id === editClub.id ? res.data : c)));
      setIsEditDialogOpen(false);
      setEditClub(null);
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
        <div className="text-neutral-600">Loading clubs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Clubs</h1>
          <p className="text-neutral-600 mt-1">
            Manage all clubs in the system
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
              <Plus className="w-4 h-4 mr-2" />
              Create club
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Club</DialogTitle>
              <DialogDescription>
                Add a new club to the system. Club admins can be assigned later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {newClub.logoFile && (
                <img
                  src={URL.createObjectURL(newClub.logoFile)}
                  alt="Preview"
                  className="h-20 rounded mt-2"
                />
              )}

              <div>
                <Label htmlFor="logo">Club Logo (Max 100 KB)</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const maxSize = 100 * 1024; // 100 KB
                    if (file.size > maxSize) {
                      alert("File is too large. Maximum size is 100 KB.");
                      e.target.value = ""; // Reset file input
                      return;
                    }

                    setNewClub({ ...newClub, logoFile: file });
                  }}
                />
              </div>

              <div>
                <Label htmlFor="name">Club Name</Label>
                <Input
                  id="name"
                  value={newClub.name}
                  onChange={(e) =>
                    setNewClub({ ...newClub, name: e.target.value })
                  }
                  placeholder="Enter club name"
                />
              </div>
              <div>
                <Label htmlFor="bio">Description</Label>
                <Textarea
                  id="bio"
                  value={newClub.bio}
                  onChange={(e) =>
                    setNewClub({ ...newClub, bio: e.target.value })
                  }
                  placeholder="Enter club description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="quota">Storage Quota (MB)</Label>
                <Input
                  id="quota"
                  type="number"
                  value={newClub.storageQuotaMb}
                  onChange={(e) =>
                    setNewClub({
                      ...newClub,
                      storageQuotaMb: parseInt(e.target.value) || 500,
                    })
                  }
                  placeholder="Storage quota in MB"
                />
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
                onClick={handleCreateClub}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Create club
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clubs Grid */}
      {clubs.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No clubs yet
          </h3>
          <p className="text-neutral-600 mb-4">
            Create your first club to start organizing photos.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first club
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="border-neutral-200 bg-white overflow-hidden group hover:shadow-sm transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold rounded-lg">
                      {club.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-neutral-900">
                        {club.name}
                      </CardTitle>
                      <p className="text-sm text-neutral-500 mt-1">
                        /{club.slug}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{club.storageQuotaMb}MB</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.bio && (
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {club.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{club.memberCount || 0} members</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setEditClub(club);
                      setEditClubForm({
                        name: club.name,
                        slug: club.slug,
                        storageQuotaMb: club.storageQuotaMb,
                        logoFile: undefined,
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
                    onClick={() => handleDeleteClub(club.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Club Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>Update club details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditClub} className="space-y-4">
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
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
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
