"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, ImageIcon, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Album } from "@/lib/types";

export default function AlbumsPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await api.getMyAlbums();
        if (response.success && response.data) {
          setAlbums(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch albums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleCreateAlbum = async () => {
    if (!newAlbum.name.trim()) return;

    try {
      const response = await api.createAlbum(newAlbum);
      if (response.success && response.data) {
        setAlbums([...albums, response.data]);
        setIsCreateDialogOpen(false);
        setNewAlbum({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Failed to create album:", error);
    }
  };

  const handleToggleVisibility = async (albumId: number, isPublic: boolean) => {
    try {
      const response = await api.updateAlbum(albumId, { isPublic });
      if (response.success && response.data) {
        setAlbums(
          albums.map((album) =>
            album.id === albumId ? { ...album, isPublic } : album
          )
        );
      }
    } catch (error) {
      console.error("Failed to update album visibility:", error);
    }
  };

  const handleDeleteAlbum = async (albumId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this album? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.deleteAlbum(albumId);
      if (response.success) {
        setAlbums(albums.filter((album) => album.id !== albumId));
      }
    } catch (error) {
      console.error("Failed to delete album:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading albums...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Albums</h1>
          <p className="text-neutral-600 mt-1">
            Manage your photo albums and collections
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
              <Plus className="w-4 h-4 mr-2" />
              Create album
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create new album</DialogTitle>
              <DialogDescription>
                Add a new photo album to your collection. You can upload photos
                after creating the album.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Album title</Label>
                <Input
                  id="title"
                  value={newAlbum.name}
                  onChange={(e) =>
                    setNewAlbum({ ...newAlbum, name: e.target.value })
                  }
                  placeholder="Enter album title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAlbum.description}
                  onChange={(e) =>
                    setNewAlbum({ ...newAlbum, description: e.target.value })
                  }
                  placeholder="Enter album description"
                  rows={3}
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
                onClick={handleCreateAlbum}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Create album
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Albums Grid */}
      {albums.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No albums yet
          </h3>
          <p className="text-neutral-600 mb-4">
            Create your first album to start organizing your photos.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first album
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Card
              key={album.id}
              className="border-neutral-200 bg-white overflow-hidden group hover:shadow-sm transition-shadow duration-200"
            >
              <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                <img
                  src={
                    album.coverImage ||
                    "/placeholder.svg?height=200&width=300&text=Album"
                  }
                  alt={album.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-neutral-900 mb-1">
                      {album.name}
                    </CardTitle>
                    {album.description && (
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge
                    variant={album.isPublic ? "default" : "secondary"}
                    className={
                      album.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-100 text-neutral-600"
                    }
                  >
                    {album.isPublic ? "public" : "private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>{album.photoCount || 0} photos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(album.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">
                    Public visibility
                  </span>
                  <Switch
                    checked={album.isPublic}
                    onCheckedChange={(checked) =>
                      handleToggleVisibility(album.id, checked)
                    }
                    className="data-[state=checked]:bg-neutral-900"
                  />
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/albums/${album.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Link
                    href={`/${user?.clubId}/${album.slug}`}
                    className="flex-1"
                  >
                    <Button variant="ghost" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlbum(album.id)}
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
    </div>
  );
}
