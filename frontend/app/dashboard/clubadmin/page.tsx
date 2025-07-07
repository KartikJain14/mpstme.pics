"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  FolderOpen,
  ImageIcon,
  Eye,
  TrendingUp,
  Upload,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Club, Album } from "@/lib/types";

export default function ClubAdminDashboard() {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <div className="text-xl font-semibold text-neutral-900 mb-2">
          No Club Assigned
        </div>
        <p className="text-neutral-600">
          Please contact a super admin to assign you to a club.
        </p>
      </div>
    );
  }

  const totalAlbums = albums.length;
  const publicAlbums = albums.filter((album) => album.isPublic).length;
  const privateAlbums = totalAlbums - publicAlbums;
  const storageUsed = club.storageUsedMb || 0;
  const storageQuota = club.storageQuotaMb || 500;
  const storagePercentage = (storageUsed / storageQuota) * 100;

  const stats = [
    {
      title: "Total Albums",
      value: totalAlbums.toString(),
      icon: FolderOpen,
      description: `${publicAlbums} public, ${privateAlbums} private`,
      trend: "+2 this week",
      trendUp: true,
    },
    {
      title: "Storage Used",
      value: `${storageUsed.toFixed(1)} MB`,
      icon: Upload,
      description: `${storageQuota} MB total`,
      trend: `${storagePercentage.toFixed(1)}% used`,
      trendUp: storagePercentage > 80,
    },
    {
      title: "Total Photos",
      value: "—", // TODO: Add photo count from API
      icon: ImageIcon,
      description: "Across all albums",
      trend: "+12 this week",
      trendUp: true,
    },
    {
      title: "Monthly Views",
      value: "—", // TODO: Add analytics from API
      icon: Eye,
      description: "Public album views",
      trend: "+15% from last month",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            {club.name} Dashboard
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage your club's albums and photos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Club Admin
          </Badge>
          <Link href={`/${club.slug}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Club Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-neutral-900">
                {club.name}
              </h3>
              <p className="text-neutral-600 text-sm max-w-2xl">
                {club.bio || "No bio available for this club."}
              </p>
              <div className="text-xs text-neutral-500">
                Slug:{" "}
                <code className="bg-white/60 px-2 py-1 rounded">
                  /{club.slug}
                </code>
              </div>
            </div>
            {club.logoUrl && (
              <img
                src={club.logoUrl}
                alt={`${club.name} logo`}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Storage Usage */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Storage Usage</span>
              <span className="font-medium">
                {storageUsed.toFixed(1)} MB / {storageQuota} MB
              </span>
            </div>
            <Progress
              value={storagePercentage}
              className={`h-2 ${
                storagePercentage > 90
                  ? "bg-red-100"
                  : storagePercentage > 80
                  ? "bg-yellow-100"
                  : "bg-green-100"
              }`}
            />
            {storagePercentage > 80 && (
              <p className="text-xs text-amber-600">
                ⚠️ Storage is{" "}
                {storagePercentage > 90 ? "almost full" : "running low"}.
                Consider deleting unused photos.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-1">
                {stat.description}
              </p>
              <div
                className={`text-xs flex items-center ${
                  stat.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`w-3 h-3 mr-1 ${
                    !stat.trendUp ? "rotate-180" : ""
                  }`}
                />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/albums/new">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <FolderOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">
                Create Album
              </h3>
              <p className="text-sm text-neutral-600">
                Start organizing your photos into new albums
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/albums">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <ImageIcon className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">
                Manage Albums
              </h3>
              <p className="text-sm text-neutral-600">
                View, edit, and organize your existing albums
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">
                View Analytics
              </h3>
              <p className="text-sm text-neutral-600">
                Track views and engagement for your albums
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Albums */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Albums</CardTitle>
            <Link href="/dashboard/albums">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {albums.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No albums yet
              </h3>
              <p className="text-neutral-600 mb-4">
                Create your first album to start organizing your photos.
              </p>
              <Link href="/dashboard/albums/new">
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  Create Album
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.slice(0, 6).map((album) => (
                <Link key={album.id} href={`/dashboard/albums/${album.id}`}>
                  <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-neutral-900 truncate">
                          {album.name}
                        </h4>
                        <Badge
                          variant={album.isPublic ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {album.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                        {album.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{album.photoCount || 0} photos</span>
                        <span>
                          {album.createdAt
                            ? new Date(album.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
