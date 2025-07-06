import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dummyUsers } from "@/lib/dummy-data";
import type { ApiResponse, User } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const authResult = requireAuth(request, "superadmin");
  if (authResult instanceof Response) return authResult;

  try {
    const { clubId } = await params;
    const { email } = await request.json();

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      role: "clubadmin",
      clubId: clubId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dummyUsers.push(newUser);

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: newUser,
      message: "Club admin created successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create club admin",
      },
      { status: 500 }
    );
  }
}
