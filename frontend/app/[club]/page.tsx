"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { Folder, Calendar, ImageIcon, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Club, Album } from "@/lib/types";
import { use } from "react";

export default function ClubPage({ params }: { params: { club: string } }) {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { club: clubSlug } = use(params);
  const [coverPhotos, setCoverPhotos] = useState<Record<number, string>>({});


  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await api.getPublicClub(clubSlug);
        if (response.success && response.data) {
          setClub(response.data.club);
          console.log("Club data:", response.data.club);
          setAlbums(response.data.publicAlbums || []);
          console.log("Albums data:", response.data);
          if (response.data.publicAlbums?.length) {
            const photoMap: Record<number, string> = {};

            await Promise.all(
              response.data.publicAlbums.map(async (album: Album) => {
                if (album.firstImage != null) {
                  try {
                    console.log("Fetching photo for album:", album.slug);
                    // Fetch the first image for the album
                    console.log("Album firstImage ID:", album.firstImage);
                    const photo = await api.getPublicPhoto(clubSlug, album.slug, album.firstImage);
                    console.log("Fetched photo for album:", album.slug, photo);
                    if (photo?.success && photo?.data?.url) {
                      photoMap[album.id] = photo.data.url;
                    }
                  } catch (err) {
                    console.error("Error fetching photo for album:", album.slug, err);
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
                  <img className="w-full h-full object-cover rounded-none" src={api.getLogo(clubSlug)} alt={`${club.name} logo`} />) : <></>}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                {albums.map((album, index) => (
                  <Link
                    key={album.id}
                    href={`/${clubSlug}/${album.slug}`}
                    className="group bg-background hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <div className="p-8 space-y-6">
                      {/* Image */}
                      <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                        <img
                          src=
                          {`${process.env.NEXT_PUBLIC_API_URL}/club/${clubSlug}/${album.slug}/photo/${album.firstImage}`}

                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="text-xs font-mono text-white bg-black/40 px-2 py-1 backdrop-blur-sm">
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
                          <p className="text-sm text-muted-foreground leading-relaxed font-light">
                            {album.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between font-mono text-xs">
                          <div className="flex items-center gap-4">
                            <span className="text-blue-600">
                              PHOTOS
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(album.createdAt as string).getFullYear()}
                          </span>
                        </div>

                        {/* Footer indicator */}
                        <div className="pt-4 border-t border-border/20">
                          <div className="flex items-center justify-between">
                            <div className="w-4 h-px bg-muted-foreground/20 group-hover:bg-blue-300 transition-colors"></div>
                            <div className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-blue-600">
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

      {/* Footer */}
      <div className="border-t bg-secondary/10">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div>© 2025 MPSTME.PICS</div>
            <div className="flex items-center gap-4">
              <span>SYSTEM STATUS: OPERATIONAL</span>
              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
