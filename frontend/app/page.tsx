"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import type { Club } from "@/lib/types";

export default function HomePage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enhanced dummy data with more clubs
    const dummyClubs = [
      {
        id: "club-1",
        name: "Computer Society of India",
        slug: "csi",
        logo: "CSI",
        bio: "Technology and Innovation Club",
        quota: 5000,
        quotaUsed: 1247,
        memberCount: 120,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-03-15T00:00:00Z",
      },
      {
        id: "club-2",
        name: "IEEE Student Branch",
        slug: "ieee",
        logo: "IEEE",
        bio: "Electrical and Electronics Engineering",
        quota: 3000,
        quotaUsed: 892,
        memberCount: 95,
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-02-20T00:00:00Z",
      },
      {
        id: "club-3",
        name: "ACM Student Chapter",
        slug: "acm",
        logo: "ACM",
        bio: "Computing and Programming",
        quota: 2000,
        quotaUsed: 456,
        memberCount: 85,
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",
      },
      {
        id: "club-4",
        name: "Robotics Club",
        slug: "robotics",
        logo: "ROB",
        bio: "Automation and Robotics",
        quota: 4000,
        quotaUsed: 1876,
        memberCount: 67,
        createdAt: "2024-01-04T00:00:00Z",
        updatedAt: "2024-03-10T00:00:00Z",
      },
      {
        id: "club-5",
        name: "Photography Club",
        slug: "photography",
        logo: "PHOTO",
        bio: "Visual Arts and Photography",
        quota: 8000,
        quotaUsed: 3456,
        memberCount: 143,
        createdAt: "2024-01-05T00:00:00Z",
        updatedAt: "2024-03-20T00:00:00Z",
      },
      {
        id: "club-6",
        name: "Drama Society",
        slug: "drama",
        logo: "DRAMA",
        bio: "Theatre and Performing Arts",
        quota: 2500,
        quotaUsed: 789,
        memberCount: 78,
        createdAt: "2024-01-06T00:00:00Z",
        updatedAt: "2024-02-15T00:00:00Z",
      },
      {
        id: "club-7",
        name: "Music Society",
        slug: "music",
        logo: "MUSIC",
        bio: "Harmonizing Talents and Musical Diversity",
        quota: 3500,
        quotaUsed: 1234,
        memberCount: 92,
        createdAt: "2024-01-07T00:00:00Z",
        updatedAt: "2024-03-05T00:00:00Z",
      },
      {
        id: "club-8",
        name: "Literary Society",
        slug: "literary",
        logo: "LIT",
        bio: "Creative Writing and Literature",
        quota: 1500,
        quotaUsed: 234,
        memberCount: 56,
        createdAt: "2024-01-08T00:00:00Z",
        updatedAt: "2024-02-28T00:00:00Z",
      },
    ];

    setClubs(dummyClubs);
    setLoading(false);
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
                      (acc, club) => acc + Math.floor(club.quotaUsed / 100),
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
                      {club.logo}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">
                      <span className="text-blue-600">
                        {Math.floor(club.quotaUsed / 100)
                          .toString()
                          .padStart(2, "0")}
                      </span>{" "}
                      Albums
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      <span className="text-emerald-600">
                        {club.memberCount.toString().padStart(2, "0")}
                      </span>{" "}
                      Members
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium leading-tight group-hover:text-blue-700 transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {club.bio}
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
