import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dummyUsers, dummyClubs } from "@/lib/dummy-data"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, "superadmin")
  if (authResult instanceof Response) return authResult

  try {
    const usersWithClubs = dummyUsers.map((user) => ({
      ...user,
      club: user.clubId ? dummyClubs.find((c) => c.id === user.clubId) : null,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: usersWithClubs,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 },
    )
  }
}
