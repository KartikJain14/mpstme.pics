"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Club } from "@/lib/types";

export default function HomePage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.getAllPublicClubs();
        if (response.success && response.data) {
          // Transform backend data to include computed fields for UI
          const transformedClubs = response.data.map((club, index) => ({
            ...club,
            logo: club.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 4)
              .toUpperCase(),
            quota: club.storageQuotaMb,
            quotaUsed: Math.floor(Math.random() * club.storageQuotaMb * 0.8), // Mock usage data
            albumCount: club.albumCount || 0,
            updatedAt: club.createdAt,
          }));
          setClubs(transformedClubs);
        }
      } catch (error) {
        console.error("Failed to fetch clubs:", error);
        // Fallback to empty array on error
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
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

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-32">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-light tracking-tight leading-none">
              University
              <br />
              <span className="font-mono font-medium text-blue-300">Clubs</span>
            </h1>
            <div className="w-16 h-px bg-blue-300"></div>
            <p className="text-xl font-light text-muted-foreground leading-relaxed max-w-xl">
              A curated collection of photo galleries from university societies.
              Where institutional memory lives.
            </p>
          </div>

          {user && (
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Authenticated as
                </span>
                <code className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">
                  {user.email}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y bg-blue-50/50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between text-sm font-mono">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">CLUBS</span>
                <span className="font-medium text-blue-700">
                  {clubs.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">TOTAL ALBUMS</span>
                <span className="font-medium text-blue-700">
                  {clubs
                    .reduce(
                      (acc, club) =>
                        acc + (club.albumCount || 0),
                      0
                    )
                    .toString()
                    .padStart(3, "0")}
                </span>
              </div>
            </div>
            <div className="text-muted-foreground">UPDATED TODAY</div>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {clubs.map((club, index) => (
            <Link
              key={club.id}
              href={`/${club.slug}`}
              className="group bg-background p-8 hover:bg-blue-50/30 transition-colors duration-200"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-blue-400">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                    <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center font-mono text-lg font-medium group-hover:bg-blue-300 group-hover:text-blue-900 transition-colors">
                      {club.logo || club.name.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">
                      <span className="text-blue-600">
                        {club.albumCount?.toString().padStart(3, "0") || "00"}
                      </span>{" "}
                      Albums
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium leading-tight group-hover:text-blue-700 transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {club.bio || "No description available"}
                  </p>
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
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-secondary/10 mt-20">
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
