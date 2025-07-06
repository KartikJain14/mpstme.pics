import { type NextRequest, NextResponse } from "next/server";
import { dummyClubs, dummyAlbums, dummyPhotos } from "@/lib/dummy-data";
import type { ApiResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubSlug: string; albumSlug: string }> }
) {
  try {
    const { clubSlug, albumSlug } = await params;
    const club = dummyClubs.find((c) => c.slug === clubSlug);

    if (!club) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Club not found",
        },
        { status: 404 }
      );
    }

    const album = dummyAlbums.find(
      (a) => a.clubId === club.id && a.slug === albumSlug && a.isPublic
    );

    if (!album) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Album not found or not public",
        },
        { status: 404 }
      );
    }

    const publicPhotos = dummyPhotos.filter(
      (p) => p.albumId === album.id && p.isPublic
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        club,
        album,
        photos: publicPhotos,
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch album data",
      },
      { status: 500 }
    );
  }
}
