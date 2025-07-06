import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dummyAlbums } from "@/lib/dummy-data";
import type { ApiResponse, Album } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const authResult = requireAuth(request, "clubadmin");
  if (authResult instanceof Response) return authResult;

  const user = authResult;
  const { albumId } = await params;

  try {
    const updates = await request.json();
    const albumIndex = dummyAlbums.findIndex(
      (a) => a.id === albumId && a.clubId === user.clubId
    );

    if (albumIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Album not found",
        },
        { status: 404 }
      );
    }

    dummyAlbums[albumIndex] = {
      ...dummyAlbums[albumIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<Album>>({
      success: true,
      data: dummyAlbums[albumIndex],
      message: "Album updated successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update album",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const authResult = requireAuth(request, "clubadmin");
  if (authResult instanceof Response) return authResult;

  const user = authResult;
  const { albumId } = await params;

  try {
    const albumIndex = dummyAlbums.findIndex(
      (a) => a.id === albumId && a.clubId === user.clubId
    );

    if (albumIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Album not found",
        },
        { status: 404 }
      );
    }

    dummyAlbums.splice(albumIndex, 1);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete album",
      },
      { status: 500 }
    );
  }
}
