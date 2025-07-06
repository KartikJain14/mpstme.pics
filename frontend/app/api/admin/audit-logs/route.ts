import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dummyAuditLogs } from "@/lib/dummy-data"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, "superadmin")
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedLogs = dummyAuditLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(startIndex, endIndex)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: dummyAuditLogs.length,
          totalPages: Math.ceil(dummyAuditLogs.length / limit),
        },
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch audit logs",
      },
      { status: 500 },
    )
  }
}
