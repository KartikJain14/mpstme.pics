"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { Folder, Calendar, ImageIcon, Users, Globe, Instagram, Linkedin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import type { Club, Album } from "@/lib/types";

export default function ClubPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { club: clubSlug } = use(params);
  const [coverPhotos, setCoverPhotos] = useState<Record<number, string>>({});
  const [photoCount, setPhotoCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await api.getPublicClub(clubSlug);
        if (response.success && response.data) {
          setClub(response.data.club);
          setAlbums(response.data.publicAlbums || []);

          // Calculate total photo count for this club
          const totalPhotos = response.data.publicAlbums?.reduce((total, album) => {
            return total + (album.photoCount || 0);
          }, 0) || 0;
          setPhotoCount(totalPhotos);

          if (response.data.publicAlbums?.length) {
            const photoMap: Record<number, string> = {};
            await Promise.all(
              response.data.publicAlbums.map(async (album: Album) => {
                if (album.firstImage != null) {
                  try {
                    const photoUrl = await api.getPublicPhoto(
                      clubSlug,
                      album.slug,
                      album.firstImage
                    );
                    if (photoUrl) {
                      photoMap[album.id] = photoUrl;
                    }
                  } catch (err) {
                    // Error fetching photo, skip
                  }
                }
              })
            );
            setCoverPhotos(photoMap);
          }
        } else {
          setError("Club not found");
        }
      } catch (err) {
        setError("Failed to load club data");
      } finally {
        setLoading(false);
      }
    };
    fetchClubData();
  }, [clubSlug]);

  // Remove the separate photo count effect since we calculate it from album data
  // useEffect(() => {
  //   api.getPhotoCount().then((res) => {
  //     if (res.success && typeof res.data?.count === "number") {
  //       setPhotoCount(res.data.count);
  //     }
  //   });
  // }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Club Not Found
          </h1>
          <p className="text-neutral-600 mb-4">
            {error || "The requested club could not be found."}
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
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
            <span className="text-foreground font-medium">
              {club.name.toUpperCase()}
            </span>
          </nav>
        </div>
      </div>

      {/* Club Header */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="max-w-4xl space-y-12">
          {/* Title Section */}
          <div className="space-y-8">
            <div className="flex items-start gap-8">
              <div className="w-20 h-20 bg-foreground text-background flex items-center justify-center text-2xl font-mono font-medium rounded-none flex-shrink-0">
                {club.logoUrl ? (
                  <img
                    className="w-full h-full object-cover rounded-none"
                    src={api.getLogo(clubSlug)}
                    alt={`${club.name} logo`}
                  />
                ) : (
                  <></>
                )}
              </div>
              <div className="space-y-6 flex-1">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-none">
                    {club.name}
                  </h1>
                  <div className="w-16 h-px bg-blue-300"></div>
                </div>
                <p className="text-xl font-light text-muted-foreground leading-relaxed max-w-2xl">
                  {club.bio}
                </p>
                {(club.website || club.instagram || club.linkedin && (
                  <div className="flex gap-4 pt-4">
                    {club.website && (
                      <a href={club.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </a>
                    )}
                    {club.instagram && (
                      <a href={club.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-5 h-5 text-pink-500 hover:text-pink-700" />
                      </a>
                    )}
                    {club.linkedin && (
                      <a href={club.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-5 h-5 text-blue-700 hover:text-blue-900" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t border-border/40 pt-8">
            <div className="grid grid-cols-3 gap-8 font-mono text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground">ALBUMS</div>
                <div className="text-2xl font-medium text-blue-600">
                  {albums.length.toString().padStart(2, "0")}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">PHOTOS</div>
                <div className="text-2xl font-medium text-purple-600">
                  {photoCount !== null
                    ? photoCount.toString().padStart(2, "0")
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Albums Section */}
      <div className="border-t bg-blue-50/30">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-light tracking-tight">
                Photo Albums
              </h2>
              <div className="w-12 h-px bg-blue-300"></div>
              <p className="text-muted-foreground font-light">
                A curated collection of institutional memories
              </p>
            </div>

            {albums.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                  <Folder className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-light">No albums published</h3>
                  <p className="text-muted-foreground text-sm font-mono">
                    This collection is currently empty
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album, index) => (
                  <Link
                    key={album.id}
                    href={`/${clubSlug}/${album.slug}`}
                    className="group bg-zinc-50 hover:bg-zinc-100 transition-colors duration-200 rounded-lg shadow-sm border border-zinc-200"
                  >
                    <div className="p-6 space-y-6">
                      {/* Image */}
                      <div className="aspect-[4/3] bg-zinc-200 relative overflow-hidden rounded-md">
                        {album.firstImage ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/club/${clubSlug}/${album.slug}/photo/${album.firstImage}`}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-md"
                          />
                        ) : (
                          <img
                            src="/placeholder.jpg"
                            alt="Placeholder Cover"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-md"
                          />
                        )}
                        <div className="absolute top-4 left-4">
                          <div className="text-xs font-mono text-white bg-blue-600/80 px-2 py-1 rounded font-medium">
                            {(index + 1).toString().padStart(2, "0")}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium leading-tight group-hover:text-blue-700 transition-colors">
                            {album.name}
                          </h3>
                          <p className="text-sm text-zinc-500 leading-relaxed font-light">
                            {album.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between font-mono text-xs">
                          <div className="flex items-center gap-4">
                            <span className="text-blue-600">PHOTOS</span>
                          </div>
                          <span className="text-zinc-400">
                            {new Date(album.createdAt as string).getFullYear()}
                          </span>
                        </div>

                        {/* Footer indicator */}
                        <div className="pt-4 border-t border-zinc-200">
                          <div className="flex items-center justify-between">
                            <div className="w-4 h-px bg-zinc-200 group-hover:bg-blue-300 transition-colors"></div>
                            <div className="text-xs font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-blue-600">
                              VIEW →
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
