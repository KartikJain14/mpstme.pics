"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LogoutButton } from "@/components/logout-button";
import { useState, useEffect, use } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Club, Album, Photo } from "@/lib/types";

export default function AlbumPage({
  params,
}: {
  params: Promise<{ club: string; album: string }>;
}) {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { club: clubSlug, album: albumSlug } = use(params);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const response = await api.getPublicAlbum(clubSlug, albumSlug);
        console.log(response);
        if (response.success && response.data) {
          // Create a minimal club object from the slug since backend doesn't return club data
          setClub({
            id: 0,
            name: clubSlug,
            slug: clubSlug,
            storageQuotaMb: 0,
            createdAt: new Date().toISOString(),
          });
          setAlbum(response.data.album);
          setPhotos(response.data.photos);
        } else {
          setError("Album not found");
        }
      } catch (err) {
        setError("Failed to load album data");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [clubSlug, albumSlug]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          navigatePhoto("prev");
          break;
        case "ArrowRight":
          e.preventDefault();
          navigatePhoto("next");
          break;
        case "Escape":
          e.preventDefault();
          closeLightbox();
          break;
      }
    };

    if (selectedPhoto !== null) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [selectedPhoto, photos.length]);

  const openLightbox = (photoIndex: number) => {
    setSelectedPhoto(photoIndex);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (selectedPhoto === null) return;

    if (direction === "prev") {
      setSelectedPhoto(
        selectedPhoto > 0 ? selectedPhoto - 1 : photos.length - 1
      );
    } else {
      setSelectedPhoto(
        selectedPhoto < photos.length - 1 ? selectedPhoto + 1 : 0
      );
    }
  };

  const selectedPhotoData =
    selectedPhoto !== null ? photos[selectedPhoto] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm">
          LOADING...
        </div>
      </div>
    );
  }

  if (error || !club || !album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-light tracking-tight">
              Album Not Found
            </h1>
            <p className="text-muted-foreground font-light">
              {error || "The requested album could not be found."}
            </p>
          </div>
          <Link href={`/${clubSlug}`}>
            <Button variant="ghost" className="font-mono text-xs">
              ← BACK TO CLUB
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <Link
              href="/"
              className="font-mono text-xl font-medium tracking-wide"
            >
              mpstme.pics
            </Link>
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-8 px-3 font-mono text-xs"
                    >
                      DASHBOARD
                    </Button>
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-8 px-3 font-mono text-xs"
                  >
                    LOGIN
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="border-b bg-blue-50/50">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <nav className="text-sm font-mono">
            <Link
              href="/"
              className="text-muted-foreground hover:text-blue-600 transition-colors"
            >
              HOME
            </Link>
            <span className="mx-3 text-muted-foreground/40">/</span>
            <Link
              href={`/${clubSlug}`}
              className="text-muted-foreground hover:text-blue-600 transition-colors"
            >
              {club.name.toUpperCase()}
            </Link>
            <span className="mx-3 text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">
              {album.name.toUpperCase()}
            </span>
          </nav>
        </div>
      </div>

      {/* Album Header */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="max-w-4xl space-y-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-none">
                {album.name}
              </h1>
              <div className="w-16 h-px bg-blue-300"></div>
              {album.description && (
                <p className="text-xl font-light text-muted-foreground leading-relaxed max-w-2xl">
                  {album.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t border-border/40 pt-8">
            <div className="flex items-center gap-12 font-mono text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground">PHOTOS</div>
                <div className="text-2xl font-medium text-blue-600">
                  {photos.length.toString().padStart(3, "0")}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">CREATED</div>
                <div className="text-lg font-medium text-purple-600">
                  {album.createdAt
                    ? new Date(album.createdAt).getFullYear()
                    : new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="border-t bg-blue-50/30">
        <div className="max-w-6xl mx-auto px-8 py-20">
          {photos.length === 0 ? (
            <div className="text-center py-20 space-y-6">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-light">No photos uploaded</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  This album is currently empty
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="aspect-square bg-background hover:bg-blue-50/50 transition-colors duration-200 group relative overflow-hidden border border-border/20 hover:border-border/40"
                >
                  <Image
                    src={
                      api.getPublicPhoto(clubSlug, albumSlug, photo.id) ||
                      "/placeholder.svg?height=400&width=400&text=Loading..."
                    }
                    alt={`Photo ${index + 1}`}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = `/placeholder.svg?height=400&width=400&text=${
                        index + 1
                      }`;
                    }}
                  />
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs font-mono text-white bg-black/60 px-2 py-1 backdrop-blur-sm rounded">
                      {(index + 1).toString().padStart(3, "0")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedPhoto !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl w-full h-[95vh] p-0 border-none bg-background rounded-none overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center bg-muted/5">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-20 w-10 h-10 bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:border-foreground/20 flex items-center justify-center transition-all duration-200"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            {/* Download Button */}
            {selectedPhotoData && (
              <a
                href={
                  api.getPublicPhoto(
                    clubSlug,
                    albumSlug,
                    selectedPhotoData.id
                  ) || "/placeholder.svg"
                }
                download={`photo_${((selectedPhoto || 0) + 1)
                  .toString()
                  .padStart(3, "0")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-6 right-20 z-20 w-10 h-10 bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:border-foreground/20 flex items-center justify-center transition-all duration-200"
                title="Download photo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
              </a>
            )}

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:border-foreground/20 flex items-center justify-center transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>

                <button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:border-foreground/20 flex items-center justify-center transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}

            {/* Photo Container with Fixed Height */}
            {selectedPhotoData && (
              <div className="w-full h-full flex items-center justify-center p-20">
                <div className="relative w-full h-[70vh] flex items-center justify-center">
                  <Image
                    src={api.getPublicPhoto(
                      clubSlug,
                      albumSlug,
                      selectedPhotoData.id
                    )}
                    alt={`Photo ${(selectedPhoto || 0) + 1}`}
                    width={1600}
                    height={1200}
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: "70vh" }}
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = `/placeholder.svg?height=1200&width=1200&text=${
                        (selectedPhoto || 0) + 1
                      }`;
                    }}
                  />
                </div>
              </div>
            )}

            {/* Photo Info */}
            {selectedPhotoData && (
              <div className="absolute bottom-8 left-8 right-8 bg-background/90 backdrop-blur-sm border border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-light text-foreground">
                      Photo {(selectedPhoto || 0) + 1}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      Uploaded{" "}
                      {new Date(
                        selectedPhotoData.uploadedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {((selectedPhoto || 0) + 1).toString().padStart(3, "0")} /{" "}
                    {photos.length.toString().padStart(3, "0")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
