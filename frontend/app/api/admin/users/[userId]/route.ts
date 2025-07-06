import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dummyUsers } from "@/lib/dummy-data";
import type { ApiResponse, User } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = requireAuth(request, "superadmin");
  if (authResult instanceof Response) return authResult;

  try {
    const { userId } = await params;
    const updates = await request.json();
    const userIndex = dummyUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    dummyUsers[userIndex] = {
      ...dummyUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: dummyUsers[userIndex],
      message: "User updated successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = requireAuth(request, "superadmin");
  if (authResult instanceof Response) return authResult;

  try {
    const { userId } = await params;
    const userIndex = dummyUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    dummyUsers.splice(userIndex, 1);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
