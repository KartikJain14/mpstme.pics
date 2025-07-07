import type { User, Club, Album, Photo, ApiResponse } from "./types";

const API_BASE = "/api"; // Use Next.js proxy

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem("auth_token", response.data.token);

      // Ensure user data exists before storing
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        console.error("Login response missing user data:", response);
      }
    }

    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");

    if (!userStr || userStr === "undefined" || userStr === "null") {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      // Clear invalid data
      localStorage.removeItem("user");
      return null;
    }
  }

  // Public routes
  async getAllPublicClubs() {
    return this.request<Club[]>("/clubs");
  }

  async getPublicClub(clubSlug: string) {
    return this.request<{ club: Club; publicAlbums: Album[] }>(
      `/club/${clubSlug}`
    );
  }

  async getPublicAlbum(clubSlug: string, albumSlug: string) {
    return this.request<{ album: Album; photos: Photo[] }>(
      `/club/${clubSlug}/${albumSlug}`
    );
  }

  async getPublicPhoto(clubSlug: string, albumSlug: string, photoId: number) {
    return this.request<any>(`/club/${clubSlug}/${albumSlug}/photo/${photoId}`);
  }

  // Helper function to generate photo URL for direct image access
  getPhotoUrl(clubSlug: string, albumSlug: string, photoId: number): string {
    return `${API_BASE}/club/${clubSlug}/${albumSlug}/photo/${photoId}`;
  }

  // Helper function to generate admin photo URL for authenticated access
  getAdminPhotoUrl(photoId: number): string {
    const token = this.token || localStorage.getItem("auth_token");
    if (token) {
      return `${API_BASE}/photos/${photoId}?token=${encodeURIComponent(token)}`;
    }
    return `${API_BASE}/photos/${photoId}`;
  }

  // Club admin routes
  async getMyClub() {
    return this.request<Club>("/me/club");
  }

  async getMyAlbums() {
    return this.request<Album[]>("/me/albums");
  }

  async createAlbum(data: { name: string; description?: string }) {
    return this.request<Album>("/me/albums", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAlbum(albumId: number, data: Partial<Album>) {
    return this.request<Album>(`/me/albums/${albumId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAlbum(albumId: number) {
    return this.request(`/me/albums/${albumId}`, {
      method: "DELETE",
    });
  }

  async getAlbum(albumId: number) {
    return this.request<Album>(`/me/albums/${albumId}`);
  }

  async getAlbumPhotos(albumId: number) {
    return this.request<Photo[]>(`/albums/${albumId}/photos`);
  }

  async uploadPhotos(albumId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    const url = `${API_BASE}/albums/${albumId}/photos`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    return response.json();
  }

  async updatePhoto(photoId: number, data: Partial<Photo>) {
    return this.request<Photo>(`/photos/${photoId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async togglePhotoVisibility(photoId: number) {
    return this.request<Photo>(`/photos/${photoId}`, {
      method: "PATCH",
    });
  }

  async deletePhoto(photoId: number) {
    return this.request(`/photos/${photoId}`, {
      method: "DELETE",
    });
  }

  // Admin routes
  async getAdminStats() {
    return this.request("/admin/stats");
  }

  async getAuditLogs() {
    return this.request("/admin/audit-logs");
  }

  async getUsers() {
    return this.request("/admin/users");
  }

  async getAllClubs() {
    return this.request<Club[]>("/admin/clubs");
  }

  async createClub(data: {
    name: string;
    logoUrl?: string;
    bio?: string;
    storageQuotaMb: number;
  }) {
    return this.request<Club>("/admin/clubs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClub(clubId: number, data: Partial<Club>) {
    return this.request<Club>(`/admin/clubs/${clubId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteClub(clubId: number) {
    return this.request(`/admin/clubs/${clubId}`, {
      method: "DELETE",
    });
  }

  async createUser(clubId: number, data: { email: string; password: string }) {
    return this.request(`/admin/clubs/${clubId}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(userId: number, data: Partial<User>) {
    return this.request<User>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: number) {
    return this.request(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
