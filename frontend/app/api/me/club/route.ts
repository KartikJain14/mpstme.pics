import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dummyClubs } from "@/lib/dummy-data"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, "clubadmin")
  if (authResult instanceof Response) return authResult

  const user = authResult

  try {
    if (!user.clubId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not associated with any club",
        },
        { status: 400 },
      )
    }

    const club = dummyClubs.find((c) => c.id === user.clubId)

    if (!club) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Club not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: club,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch club info",
      },
      { status: 500 },
    )
  }
}
