import type { NextRequest } from "next/server"
import { dummyUsers } from "./dummy-data"
import type { User } from "./types"

// Simple JWT simulation - in production, use proper JWT library
export function generateToken(user: User): string {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString("base64")
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    const user = dummyUsers.find((u) => u.id === decoded.id)
    return user || null
  } catch {
    return null
  }
}

export function getAuthUser(request: NextRequest): User | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function requireAuth(request: NextRequest, requiredRole?: "superadmin" | "clubadmin"): User | Response {
  const user = getAuthUser(request)

  if (!user) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "superadmin") {
    return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  return user
}
