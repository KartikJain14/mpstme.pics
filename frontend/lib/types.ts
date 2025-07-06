export interface User {
  id: string
  email: string
  role: "superadmin" | "clubadmin"
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface Club {
  id: string
  name: string
  slug: string
  logo: string
  bio: string
  quota: number // in MB
  quotaUsed: number // in MB
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface Album {
  id: string
  clubId: string
  name: string
  slug: string
  description?: string
  isPublic: boolean
  photoCount: number
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  albumId: string
  clubId: string
  filename: string
  originalName: string
  size: number // in bytes
  mimeType: string
  isPublic: boolean
  caption?: string
  uploadedAt: string
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  targetId: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
