import { type NextRequest, NextResponse } from "next/server";
import { dummyClubs, dummyAlbums, dummyPhotos } from "@/lib/dummy-data";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ clubSlug: string; albumSlug: string; photoId: string }>;
  }
) {
  try {
    const { clubSlug, albumSlug, photoId } = await params;
    const club = dummyClubs.find((c) => c.slug === clubSlug);

    if (!club) {
      return new Response("Club not found", { status: 404 });
    }

    const album = dummyAlbums.find(
      (a) => a.clubId === club.id && a.slug === albumSlug && a.isPublic
    );

    if (!album) {
      return new Response("Album not found or not public", { status: 404 });
    }

    const photo = dummyPhotos.find(
      (p) => p.id === photoId && p.albumId === album.id && p.isPublic
    );

    if (!photo) {
      return new Response("Photo not found or not public", { status: 404 });
    }

    // In production, serve the actual image file
    // For now, redirect to placeholder
    return NextResponse.redirect(
      `/placeholder.svg?height=800&width=800&text=${photo.filename}`
    );
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
