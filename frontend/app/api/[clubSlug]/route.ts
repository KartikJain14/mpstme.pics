import { type NextRequest, NextResponse } from "next/server";
import { dummyClubs, dummyAlbums } from "@/lib/dummy-data";
import type { ApiResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubSlug: string }> }
) {
  try {
    const { clubSlug } = await params;
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

    const publicAlbums = dummyAlbums.filter(
      (a) => a.clubId === club.id && a.isPublic
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        club,
        albums: publicAlbums,
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch club data",
      },
      { status: 500 }
    );
  }
}
