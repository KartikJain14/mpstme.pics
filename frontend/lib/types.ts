export interface User {
  id: number;
  email: string;
  role: "superadmin" | "clubadmin";
  clubId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Club {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  bio?: string;
  storageQuotaMb: number;
  createdAt: string;
  // Computed fields that may be added by frontend or backend
  logo?: string;
  quota?: number;
  quotaUsed?: number;
  storageUsedMb?: number;
  memberCount?: number;
  updatedAt?: string;
  albumCount?: number;
}

export interface Album {
  id: number;
  clubId?: number;
  name: string;
  slug: string;
  isPublic?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Optional computed fields that may be added by backend
  description?: string;
  coverImage?: string;
  photoCount?: number;
}

export interface Photo {
  id: number;
  albumId?: number;
  fileName: string;
  fileKey?: string;
  sizeInBytes?: number;
  s3Url?: string;
  isPublic?: boolean;
  deleted?: boolean;
  uploadedAt: string;
}

export interface AuditLog {
  id: number;
  actorId: number;
  action: string;
  targetTable: string;
  targetId: number;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
