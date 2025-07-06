import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dummyPhotos, dummyAlbums } from "@/lib/dummy-data";
import type { ApiResponse, Photo } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const authResult = requireAuth(request, "clubadmin");
  if (authResult instanceof Response) return authResult;

  const user = authResult;
  const { albumId } = await params;

  try {
    const album = dummyAlbums.find(
      (a) => a.id === albumId && a.clubId === user.clubId
    );

    if (!album) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Album not found",
        },
        { status: 404 }
      );
    }

    const photos = dummyPhotos.filter((p) => p.albumId === albumId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: photos,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch photos",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const authResult = requireAuth(request, "clubadmin");
  if (authResult instanceof Response) return authResult;

  const user = authResult;
  const { albumId } = await params;

  try {
    const album = dummyAlbums.find(
      (a) => a.id === albumId && a.clubId === user.clubId
    );

    if (!album) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Album not found",
        },
        { status: 404 }
      );
    }

    // Simulate file upload - in production, handle multipart/form-data
    const uploadedPhotos: Photo[] = [
      {
        id: `photo-${Date.now()}`,
        albumId: albumId,
        clubId: user.clubId!,
        filename: `photo-${Date.now()}.jpg`,
        originalName: "uploaded-photo.jpg",
        size: 2048576,
        mimeType: "image/jpeg",
        isPublic: album.isPublic,
        uploadedAt: new Date().toISOString(),
      },
    ];

    dummyPhotos.push(...uploadedPhotos);

    // Update album photo count
    const albumIndex = dummyAlbums.findIndex((a) => a.id === albumId);
    if (albumIndex !== -1) {
      dummyAlbums[albumIndex].photoCount += uploadedPhotos.length;
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: uploadedPhotos,
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to upload photos",
      },
      { status: 500 }
    );
  }
}
