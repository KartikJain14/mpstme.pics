"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Share2,
  Calendar,
  HardDrive,
  Users,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Club, Album, Photo } from "@/lib/types";

interface AnalyticsData {
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  viewsThisMonth: number;
  downloadsThisMonth: number;
  sharesThisMonth: number;
  topAlbums: Array<{ album: Album; views: number; downloads: number }>;
  topPhotos: Array<{ photo: Photo; views: number; downloads: number }>;
  monthlyStats: Array<{
    month: string;
    views: number;
    downloads: number;
    uploads: number;
  }>;
  storageBreakdown: Array<{
    albumName: string;
    size: number;
    photoCount: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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

        if (
          albumsResponse.success &&
          albumsResponse.data &&
          Array.isArray(albumsResponse.data)
        ) {
          setAlbums(albumsResponse.data);

          // Fetch photos from all albums
          const allPhotos: Photo[] = [];
          for (const album of albumsResponse.data) {
            const photosResponse = await api.getAlbumPhotos(album.id);
            if (
              photosResponse &&
              photosResponse.success &&
              Array.isArray(photosResponse.data)
            ) {
              allPhotos.push(...photosResponse.data);
            }
          }
          setPhotos(allPhotos);

          // Generate mock analytics data
          const mockAnalytics: AnalyticsData = {
            totalViews: Math.floor(Math.random() * 10000) + 5000,
            totalDownloads: Math.floor(Math.random() * 1000) + 500,
            totalShares: Math.floor(Math.random() * 500) + 200,
            viewsThisMonth: Math.floor(Math.random() * 2000) + 800,
            downloadsThisMonth: Math.floor(Math.random() * 200) + 100,
            sharesThisMonth: Math.floor(Math.random() * 100) + 50,
            topAlbums: (albumsResponse.data as Album[])
              .slice(0, 5)
              .map((album: Album) => ({
                album: {
                  ...album,
                  isPublic: album.isPublic ?? true,
                  photoCount: album.photoCount ?? 0,
                },
                views: Math.floor(Math.random() * 1000) + 100,
                downloads: Math.floor(Math.random() * 100) + 20,
              }))
              .sort((a, b) => b.views - a.views),
            topPhotos: allPhotos
              .slice(0, 5)
              .map((photo: Photo) => ({
                photo: {
                  ...photo,
                  isPublic: photo.isPublic ?? true,
                },
                views: Math.floor(Math.random() * 500) + 50,
                downloads: Math.floor(Math.random() * 50) + 10,
              }))
              .sort((a, b) => b.views - a.views),
            monthlyStats: Array.from({ length: 6 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              return {
                month: date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                }),
                views: Math.floor(Math.random() * 1000) + 200,
                downloads: Math.floor(Math.random() * 100) + 20,
                uploads: Math.floor(Math.random() * 50) + 5,
              };
            }).reverse(),
            storageBreakdown: (albumsResponse.data as Album[]).map(
              (album: Album) => ({
                albumName: album.name,
                size: Math.floor(Math.random() * 500) + 50, // MB
                photoCount: album.photoCount ?? 0,
              })
            ),
          };

          setAnalytics(mockAnalytics);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Failed to load analytics data.</div>
      </div>
    );
  }

  const engagementStats = [
    {
      title: "Total Views",
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      thisMonth: analytics.viewsThisMonth,
      change: calculatePercentageChange(
        analytics.viewsThisMonth,
        analytics.totalViews / 6
      ),
      trend: true,
    },
    {
      title: "Downloads",
      value: analytics.totalDownloads.toLocaleString(),
      icon: Download,
      thisMonth: analytics.downloadsThisMonth,
      change: calculatePercentageChange(
        analytics.downloadsThisMonth,
        analytics.totalDownloads / 6
      ),
      trend: true,
    },
    {
      title: "Shares",
      value: analytics.totalShares.toLocaleString(),
      icon: Share2,
      thisMonth: analytics.sharesThisMonth,
      change: calculatePercentageChange(
        analytics.sharesThisMonth,
        analytics.totalShares / 6
      ),
      trend: true,
    },
  ];

  const contentStats = [
    {
      title: "Total Albums",
      value: albums.length.toString(),
      icon: FolderOpen,
      description: `${albums.filter((a) => a.isPublic).length} public`,
    },
    {
      title: "Total Photos",
      value: photos.length.toString(),
      icon: ImageIcon,
      description: `${photos.filter((p) => p.isPublic).length} public`,
    },
    {
      title: "Storage Used",
      value: club ? formatFileSize(club.quotaUsed ?? 0) : "0 MB",
      icon: HardDrive,
      description: club
        ? `of ${formatFileSize(club.quota ?? 0)} quota`
        : "No quota",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Analytics</h1>
        <p className="text-neutral-600 mt-1">
          Insights into your club's photo gallery performance
        </p>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Engagement Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {engagementStats.map((stat) => (
            <Card key={stat.title} className="border-neutral-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-neutral-600 mb-2">
                  {stat.thisMonth} this month
                </p>
                <div className="flex items-center gap-1">
                  {stat.trend ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change > 0 ? "+" : ""}
                    {stat.change.toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Overview */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Content Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentStats.map((stat) => (
            <Card key={stat.title} className="border-neutral-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-neutral-600">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Albums */}
        <Card className="border-neutral-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Top Performing Albums
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topAlbums.length === 0 ? (
                <p className="text-neutral-600 text-sm">
                  No album data available.
                </p>
              ) : (
                analytics.topAlbums.map((item, index) => (
                  <div
                    key={item.album.id}
                    className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {item.album.name}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {item.album.photoCount} photos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.views} views
                      </p>
                      <p className="text-xs text-neutral-600">
                        {item.downloads} downloads
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Breakdown */}
        <Card className="border-neutral-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Storage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.storageBreakdown.length === 0 ? (
                <p className="text-neutral-600 text-sm">
                  No storage data available.
                </p>
              ) : (
                analytics.storageBreakdown.map((item) => (
                  <div
                    key={item.albumName}
                    className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {item.albumName}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {item.photoCount} photos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">
                        {formatFileSize(item.size)}
                      </p>
                      <div className="mt-1 bg-neutral-200 rounded-full h-1.5 w-16">
                        <div
                          className="bg-neutral-900 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              (item.size / (club?.quotaUsed || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="border-neutral-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-900">
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyStats.map((month) => (
              <div
                key={month.month}
                className="grid grid-cols-4 gap-4 py-3 border-b border-neutral-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {month.month}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-900">
                    {month.views}
                  </p>
                  <p className="text-xs text-neutral-600">views</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-900">
                    {month.downloads}
                  </p>
                  <p className="text-xs text-neutral-600">downloads</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-900">
                    {month.uploads}
                  </p>
                  <p className="text-xs text-neutral-600">uploads</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
