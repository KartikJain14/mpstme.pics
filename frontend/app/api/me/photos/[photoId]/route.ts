import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dummyPhotos } from "@/lib/dummy-data";
import type { ApiResponse, Photo } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const authResult = requireAuth(request, "clubadmin");
  if (authResult instanceof Response) return authResult;

  const user = authResult;
  const { photoId } = await params;

  try {
    const updates = await request.json();
    const photoIndex = dummyPhotos.findIndex(
      (p) => p.id === photoId && p.clubId === user.clubId
    );

    if (photoIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Photo not found",
        },
        { status: 404 }
      );
    }

    dummyPhotos[photoIndex] = {
      ...dummyPhotos[photoIndex],
      ...updates,
    };

    return NextResponse.json<ApiResponse<Photo>>({
      success: true,
      data: dummyPhotos[photoIndex],
      message: "Photo updated successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update photo",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const authResult = requireAuth(request, "clubadmin");
  if (authResult instanceof Response) return authResult;

  const user = authResult;
  const { photoId } = await params;

  try {
    const photoIndex = dummyPhotos.findIndex(
      (p) => p.id === photoId && p.clubId === user.clubId
    );

    if (photoIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Photo not found",
        },
        { status: 404 }
      );
    }

    dummyPhotos.splice(photoIndex, 1);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete photo",
      },
      { status: 500 }
    );
  }
}
