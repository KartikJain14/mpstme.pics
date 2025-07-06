import { type NextRequest, NextResponse } from "next/server"
import { dummyUsers } from "@/lib/dummy-data"
import { generateToken } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple password check - in production, use proper hashing
    const user = dummyUsers.find((u) => u.email === email)

    if (!user || password !== "password123") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    const token = generateToken(user)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          clubId: user.clubId,
        },
        token,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
