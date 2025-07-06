import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dummyAlbums } from "@/lib/dummy-data"
import type { ApiResponse, Album } from "@/lib/types"

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, "clubadmin")
  if (authResult instanceof Response) return authResult

  const user = authResult

  try {
    const albums = dummyAlbums.filter((a) => a.clubId === user.clubId)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: albums,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch albums",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, "clubadmin")
  if (authResult instanceof Response) return authResult

  const user = authResult

  try {
    const { name, description } = await request.json()

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      clubId: user.clubId!,
      name,
      slug,
      description,
      isPublic: false,
      photoCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dummyAlbums.push(newAlbum)

    return NextResponse.json<ApiResponse<Album>>({
      success: true,
      data: newAlbum,
      message: "Album created successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create album",
      },
      { status: 500 },
    )
  }
}
