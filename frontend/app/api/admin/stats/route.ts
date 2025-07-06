import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dummyClubs, dummyPhotos, dummyAlbums } from "@/lib/dummy-data"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, "superadmin")
  if (authResult instanceof Response) return authResult

  try {
    const totalClubs = dummyClubs.length
    const totalPhotos = dummyPhotos.length
    const totalAlbums = dummyAlbums.length
    const totalStorageUsed = dummyClubs.reduce((sum, club) => sum + club.quotaUsed, 0)
    const totalStorageQuota = dummyClubs.reduce((sum, club) => sum + club.quota, 0)

    const recentUploads = dummyPhotos
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 10)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalClubs,
        totalPhotos,
        totalAlbums,
        totalStorageUsed,
        totalStorageQuota,
        storageUsagePercentage: (totalStorageUsed / totalStorageQuota) * 100,
        recentUploads,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch stats",
      },
      { status: 500 },
    )
  }
}
