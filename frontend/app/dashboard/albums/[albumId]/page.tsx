"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Album, Photo } from "@/lib/types";
import { AuthenticatedImage } from "@/components/authenticated-image";

interface AlbumDetailPageProps {
  params: {
    albumId: string;
  };
}

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const albumId = parseInt(params.albumId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch album details and photos in parallel
        const [albumResponse, photosResponse] = await Promise.all([
          api.getAlbum(albumId),
          api.getAlbumPhotos(albumId),
        ]);

        if (albumResponse.success && albumResponse.data) {
          setAlbum(albumResponse.data);
          setEditForm({
            name: albumResponse.data.name,
            description: albumResponse.data.description || "",
          });
        }

        if (photosResponse.success && photosResponse.data) {
          console.log("Photos data:", photosResponse.data); // Debug log
          setPhotos(photosResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch album data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [albumId]);

  const handleUpdateAlbum = async () => {
    if (!album || !editForm.name.trim()) return;

    try {
      const response = await api.updateAlbum(album.id, {
        name: editForm.name,
        description: editForm.description,
      });

      if (response.success && response.data) {
        setAlbum(response.data);
        setIsEditingAlbum(false);
      }
    } catch (error) {
      console.error("Failed to update album:", error);
    }
  };

  const handleToggleAlbumVisibility = async (isPublic: boolean) => {
    if (!album) return;

    try {
      const response = await api.updateAlbum(album.id, { isPublic });
      if (response.success && response.data) {
        setAlbum(response.data);
      }
    } catch (error) {
      console.error("Failed to update album visibility:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const response = await api.uploadPhotos(albumId, Array.from(files));
      if (response.success && response.data) {
        setPhotos([...photos, ...response.data]);
      }
    } catch (error) {
      console.error("Failed to upload photos:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTogglePhotoVisibility = async (photoId: number) => {
    try {
      const response = await api.togglePhotoVisibility(photoId);
      if (response.success && response.data) {
        setPhotos(
          photos.map((photo) =>
            photo.id === photoId ? { ...photo, ...response.data } : photo
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle photo visibility:", error);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const response = await api.deletePhoto(photoId);
      if (response.success) {
        setPhotos(photos.filter((photo) => photo.id !== photoId));
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;

    try {
      const response = await api.deleteAlbum(album.id);
      if (response.success) {
        router.push("/dashboard/albums");
      }
    } catch (error) {
      console.error("Failed to delete album:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading album...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Album not found
        </h3>
        <p className="text-neutral-600 mb-4">
          The album you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Link href="/dashboard/albums">
          <Button>Back to Albums</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/albums">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Albums
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {album.name}
            </h1>
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
          {album.description && (
            <p className="text-neutral-600 mt-1">{album.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${user?.clubId}/${album.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingAlbum(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Album
          </Button>
        </div>
      </div>

      {/* Album Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {photos.length}
                </p>
                <p className="text-sm text-neutral-600">Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {album.createdAt
                    ? new Date(album.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-sm text-neutral-600">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-semibold text-neutral-900">
                  {album.isPublic ? "Public" : "Private"}
                </p>
                <p className="text-sm text-neutral-600">Visibility</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Album Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Album Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-neutral-900">
                Public visibility
              </Label>
              <p className="text-sm text-neutral-600">
                Allow anyone to view this album
              </p>
            </div>
            <Switch
              checked={album.isPublic}
              onCheckedChange={handleToggleAlbumVisibility}
              className="data-[state=checked]:bg-neutral-900"
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Album
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Album</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this album? This action
                    cannot be undone and will also delete all photos in this
                    album.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAlbum}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Album
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Photos Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Photos ({photos.length})</CardTitle>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Photos"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No photos yet
              </h3>
              <p className="text-neutral-600 mb-4">
                Upload your first photos to get started.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative bg-neutral-100 rounded-lg overflow-hidden aspect-square"
                >
                  <AuthenticatedImage
                    photoId={photo.id}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                    onError={(error) => {
                      console.log("Image load error for photo:", photo, error);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePhotoVisibility(photo.id)}
                        className="text-white hover:bg-white/20"
                      >
                        {photo.isPublic ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this photo? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Photo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={photo.isPublic ? "default" : "secondary"}
                      className={`text-xs ${
                        photo.isPublic
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {photo.isPublic ? "public" : "private"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Album Dialog */}
      <Dialog open={isEditingAlbum} onOpenChange={setIsEditingAlbum}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
            <DialogDescription>
              Update the album name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Album title</Label>
              <Input
                id="edit-title"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Enter album title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter album description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingAlbum(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAlbum}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
