import type { User, Club, Album, Photo, ApiResponse } from "./types";

const API_BASE = "/api"; // Use Next.js proxy instead of direct backend URL

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
    let headers: Record<string, string> = {};
    // Only set Content-Type if not sending FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (options.headers) {
      headers = { ...headers, ...(options.headers as Record<string, string>) };
    }
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
      localStorage.setItem("user", JSON.stringify(response.data.user));
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
    return userStr ? JSON.parse(userStr) : null;
  }

  // Public routes
  async getAllPublicClubs() {
    return this.request<Club[]>("/clubs");
  }

  async getPublicClub(clubSlug: string) {
    return this.request<{ club: Club; albums: Album[] }>(`/club/${clubSlug}`);
  }

  async getPublicAlbum(clubSlug: string, albumSlug: string) {
    return this.request<{ club: Club; album: Album; photos: Photo[] }>(
      `/club/${clubSlug}/${albumSlug}`
    );
  }

  getPublicPhoto(clubSlug: string, albumSlug: string, photoId: number) {
    return `/api/club/${clubSlug}/${albumSlug}/photo/${photoId}`;
  }

  async getPhotoCount() {
    return this.request<{ count: number }>("/photoCount");
  }

  // Club admin routes
  async getMyClub() {
    return this.request<Club>("/me/club");
  }

  async getMyAlbums() {
    return this.request<{ albums: Album[]; clubSlug: string }>("/me/albums");
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

  async deletePhoto(photoId: number) {
    return this.request(`/photos/${photoId}`, {
      method: "DELETE",
    });
  }

  async getAlbum(albumId: number) {
    return this.request<Album>(`/me/albums/${albumId}`);
  }
  getLogo(clubSlug: string) {
    return `/api/club/${clubSlug}/logo`;
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
    logoFile?: File;
    bio?: string;
    storageQuotaMb: number;
  }) {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.bio) formData.append("bio", data.bio);
    formData.append("storageQuotaMb", data.storageQuotaMb.toString());
    if (data.logoFile) formData.append("logo", data.logoFile);

    return this.request<Club>("/admin/clubs", {
      method: "POST",
      body: formData,
      headers: {},
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
