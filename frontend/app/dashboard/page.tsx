"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ImageIcon, Eye, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Club, Album } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [clubResponse, albumsResponse] = await Promise.all([
          api.getMyClub(),
          api.getMyAlbums(),
        ]);

        if (clubResponse.success && clubResponse.data) {
          setClub(clubResponse.data);
        }

        if (albumsResponse.success && albumsResponse.data) {
          setAlbums(albumsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const totalPhotos = albums.reduce((sum, album) => sum + album.photoCount, 0);
  const publicAlbums = albums.filter((album) => album.isPublic).length;
  const privateAlbums = albums.filter((album) => !album.isPublic).length;

  const stats = [
    {
      title: "Total Albums",
      value: albums.length.toString(),
      icon: FolderOpen,
      description: `${publicAlbums} public, ${privateAlbums} private`,
      trend: "+2 this month",
      trendUp: true,
    },
    {
      title: "Total Photos",
      value: totalPhotos.toString(),
      icon: ImageIcon,
      description: "Across all albums",
      trend: "+156 this month",
      trendUp: true,
    },
    {
      title: "Storage Used",
      value: club
        ? `${Math.round((club.quotaUsed / 1024) * 100) / 100} GB`
        : "0 GB",
      icon: Eye,
      description: club
        ? `of ${Math.round((club.quota / 1024) * 100) / 100} GB quota`
        : "No quota info",
      trend: club
        ? `${Math.round((club.quotaUsed / club.quota) * 100)}% used`
        : "0% used",
      trendUp: false,
    },
    {
      title: "Club Members",
      value: club?.memberCount.toString() || "0",
      icon: Users,
      description: "Active members",
      trend: "+8 this month",
      trendUp: true,
    },
  ];

  const recentAlbums = albums
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp
                  className={`h-3 w-3 ${
                    stat.trendUp ? "text-green-600" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    stat.trendUp ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Albums */}
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent Albums
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlbums.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No albums created yet.
                </p>
              ) : (
                recentAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {album.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {album.photoCount} photos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={
                          album.isPublic ? "bg-green-50 text-green-700" : ""
                        }
                      >
                        {album.isPublic ? "public" : "private"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Club Info */}
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Club Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {club ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold rounded-lg">
                    {club.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {club.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {club.memberCount} members
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {club.bio}
                </p>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage Usage</span>
                    <span className="font-medium text-foreground">
                      {Math.round((club.quotaUsed / 1024) * 100) / 100} GB /{" "}
                      {Math.round((club.quota / 1024) * 100) / 100} GB
                    </span>
                  </div>
                  <div className="mt-2 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (club.quotaUsed / club.quota) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Loading club information...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
