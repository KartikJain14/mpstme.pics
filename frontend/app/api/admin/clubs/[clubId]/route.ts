import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dummyClubs } from "@/lib/dummy-data";
import type { ApiResponse, Club } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const authResult = requireAuth(request, "superadmin");
  if (authResult instanceof Response) return authResult;

  try {
    const { clubId } = await params;
    const updates = await request.json();
    const clubIndex = dummyClubs.findIndex((c) => c.id === clubId);

    if (clubIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Club not found",
        },
        { status: 404 }
      );
    }

    dummyClubs[clubIndex] = {
      ...dummyClubs[clubIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<Club>>({
      success: true,
      data: dummyClubs[clubIndex],
      message: "Club updated successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update club",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const authResult = requireAuth(request, "superadmin");
  if (authResult instanceof Response) return authResult;

  try {
    const { clubId } = await params;
    const clubIndex = dummyClubs.findIndex((c) => c.id === clubId);

    if (clubIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Club not found",
        },
        { status: 404 }
      );
    }

    dummyClubs.splice(clubIndex, 1);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Club deleted successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete club",
      },
      { status: 500 }
    );
  }
}
