import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dummyClubs } from "@/lib/dummy-data"
import type { ApiResponse, Club } from "@/lib/types"

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, "superadmin")
  if (authResult instanceof Response) return authResult

  try {
    const { name, slug, logo, bio, quota } = await request.json()

    const newClub: Club = {
      id: `club-${Date.now()}`,
      name,
      slug,
      logo,
      bio,
      quota,
      quotaUsed: 0,
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production, save to database
    dummyClubs.push(newClub)

    return NextResponse.json<ApiResponse<Club>>({
      success: true,
      data: newClub,
      message: "Club created successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create club",
      },
      { status: 500 },
    )
  }
}
