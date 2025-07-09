"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Photo, Album } from "@/lib/types";
import Image from "next/image";

export default function PhotosPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [clubSlug, setClubSlug] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsResponse] = await Promise.all([api.getMyAlbums()]);

        if (albumsResponse.success && albumsResponse.data) {
          setAlbums(albumsResponse.data.albums);
          setClubSlug(albumsResponse.data.clubSlug || "");

          // Fetch photos from all albums
          const allPhotos: Photo[] = [];
          for (const album of albumsResponse.data.albums) {
            const photosResponse = await api.getAlbumPhotos(album.id);
            if (photosResponse.success && photosResponse.data) {
              allPhotos.push(...photosResponse.data);
            }
          }
          setPhotos(allPhotos);
          setFilteredPhotos(allPhotos);
        }
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = photos;
    if (searchTerm) {
      filtered = filtered.filter(
        (photo) =>
          photo.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedAlbum && selectedAlbum !== "all") {
      filtered = filtered.filter((photo) => photo.albumId === Number(selectedAlbum));
    }
    setFilteredPhotos(filtered);
  }, [photos, searchTerm, selectedAlbum]);

  const handleUpdatePhoto = async (
    photoId: number,
    updates: Partial<Photo>
  ) => {
    try {
      const response = await api.updatePhoto(photoId, updates);
      if (response.success) {
        setPhotos(
          photos.map((p) => (p.id === photoId ? { ...p, ...updates } : p))
        );
        setIsEditDialogOpen(false);
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error("Failed to update photo:", error);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await api.deletePhoto(photoId);
      if (response.success) {
        setPhotos(photos.filter((p) => p.id !== photoId));
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const getAlbumName = (albumId: number | undefined) => {
    if (albumId === undefined) return "Unknown Album";
    const album = albums.find((a) => a.id === albumId);
    return album?.name || "Unknown Album";
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!albums.length) return;
    // Ask user to select album if not filtered
    let albumId = selectedAlbum;
    if (!albumId || albumId === "all") {
      albumId = albums[0].id.toString();
    }
    setUploading(true);
    try {
      const fileArr = Array.from(files);
      const response = await api.uploadPhotos(Number(albumId), fileArr);
      if (response.success) {
        // Refresh photos for the album
        const photosResponse = await api.getAlbumPhotos(Number(albumId));
        if (photosResponse.success && photosResponse.data) {
          setPhotos((prev) => {
            // Remove old photos from this album, add new
            const filtered = prev.filter((p) => p.albumId !== Number(albumId));
            return [...filtered, ...(photosResponse.data || [])];
          });
        }
      }
    } catch (err) {
      console.error("Failed to upload photos", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Photos</h1>
          <p className="text-neutral-600 mt-1">
            Manage all photos across your albums ({filteredPhotos.length} of {photos.length} photos)
          </p>
        </div>
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800" onClick={handleUploadClick} disabled={uploading || albums.length === 0}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </>
      </div>

      {/* Filters */}
      <Card className="border-neutral-200 bg-white">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <Input
                  placeholder="Search photos by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id.toString()}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <Card className="border-neutral-200 bg-white">
          <CardContent className="p-12 text-center">
            <div className="text-neutral-600">
              {photos.length === 0
                ? "No photos uploaded yet."
                : "No photos match your filters."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => {
            const album = albums.find((a) => a.id === photo.albumId);
            const albumSlug = album?.slug;
            // Use public photo endpoint for preview
            const previewUrl =
              clubSlug && albumSlug && photo.id
                ? `${process.env.NEXT_PUBLIC_API_URL}/club/${clubSlug}/${albumSlug}/photo/${photo.id}`
                : "/placeholder.jpg";
            return (
              <Card
                key={photo.id}
                className="border-neutral-200 bg-white overflow-hidden group"
              >
                <div className="aspect-square relative bg-neutral-100">
                  <Image
                    src={previewUrl}
                    alt={photo.fileName || "Photo"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-medium text-neutral-900 truncate"
                        title={photo.fileName || "Photo"}
                      >
                        {photo.fileName || "Photo"}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={
                          photo.isPublic
                            ? "bg-green-50 text-green-700"
                            : "bg-neutral-100 text-neutral-600"
                        }
                      >
                        {photo.isPublic ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">
                      {getAlbumName(photo.albumId)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(photo.sizeInBytes)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Photo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
            <DialogDescription>
              Update photo visibility settings.
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={!!selectedPhoto.isPublic}
                  onChange={(e) =>
                    setSelectedPhoto({
                      ...selectedPhoto,
                      isPublic: e.target.checked,
                    })
                  }
                  className="rounded border-neutral-300"
                />
                <Label htmlFor="isPublic">Make this photo public</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedPhoto &&
                handleUpdatePhoto(selectedPhoto.id, {
                  isPublic: selectedPhoto.isPublic,
                })
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
