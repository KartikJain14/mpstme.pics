import type { User, Club, Album, Photo, ApiResponse } from "./types"

const API_BASE = "/api"

class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()
    return data
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      this.token = response.data.token
      localStorage.setItem("auth_token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }

    return response
  }

  logout() {
    this.token = null
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }

  // Public routes
  async getPublicClub(clubSlug: string) {
    return this.request<{ club: Club; albums: Album[] }>(`/${clubSlug}`)
  }

  async getPublicAlbum(clubSlug: string, albumSlug: string) {
    return this.request<{ club: Club; album: Album; photos: Photo[] }>(`/${clubSlug}/${albumSlug}`)
  }

  // Club admin routes
  async getMyClub() {
    return this.request<Club>("/me/club")
  }

  async getMyAlbums() {
    return this.request<Album[]>("/me/albums")
  }

  async createAlbum(data: { name: string; description?: string }) {
    return this.request<Album>("/me/albums", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAlbum(albumId: string, data: Partial<Album>) {
    return this.request<Album>(`/me/albums/${albumId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteAlbum(albumId: string) {
    return this.request(`/me/albums/${albumId}`, {
      method: "DELETE",
    })
  }

  async getAlbumPhotos(albumId: string) {
    return this.request<Photo[]>(`/me/albums/${albumId}/photos`)
  }

  async uploadPhotos(albumId: string, files: File[]) {
    // Simulate file upload - in production, use FormData
    return this.request<Photo[]>(`/me/albums/${albumId}/photos`, {
      method: "POST",
      body: JSON.stringify({ files: files.map((f) => f.name) }),
    })
  }

  async updatePhoto(photoId: string, data: Partial<Photo>) {
    return this.request<Photo>(`/me/photos/${photoId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deletePhoto(photoId: string) {
    return this.request(`/me/photos/${photoId}`, {
      method: "DELETE",
    })
  }

  // Admin routes
  async getAdminStats() {
    return this.request("/admin/stats")
  }

  async getUsers() {
    return this.request("/admin/users")
  }

  async createClub(data: { name: string; slug: string; logo: string; bio: string; quota: number }) {
    return this.request<Club>("/admin/clubs", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
