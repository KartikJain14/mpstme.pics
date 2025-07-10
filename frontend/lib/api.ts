import type { User, Club, Album, Photo, ApiResponse } from "./types";

const API_BASE = "/api"; // Use Next.js proxy instead of direct backend URL

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
      };
      const cookieToken = getCookie("auth_token");

      // Use token from either source
      this.token = token || cookieToken || null;

      // Ensure both storage methods have the token
      if (this.token) {
        localStorage.setItem("auth_token", this.token);
        document.cookie = `auth_token=${this.token}; path=/; max-age=86400; SameSite=Strict`;
      }
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

    // Always get the freshest token from both localStorage and cookies
    const token = localStorage.getItem("auth_token");
    if (token) {
      this.token = token;
      headers["Authorization"] = `Bearer ${token}`;
      // Ensure cookie is set
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    }
    const response = await fetch(url, {
      ...options,
      headers,
    });
    const data = await response.json();
    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data) {
      // Store token in memory
      this.token = response.data.token;

      // Store in localStorage
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Store in cookie for server-side auth
      document.cookie = `auth_token=${response.data.token}; path=/; max-age=86400; SameSite=Strict`;

      // Force reload the page to ensure everything is in sync
      window.location.reload();
    }

    return response;
  }

  logout() {
    this.token = null;

    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // Clear cookie
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

    // Force reload to clear any cached state
    window.location.href = "/";
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");

    // If we have both token and user data, great!
    if (token && userStr) {
      // Ensure cookie is set
      const cookieExists = document.cookie.includes("auth_token=");
      if (!cookieExists) {
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
      }
      return JSON.parse(userStr);
    }

    // If we have a token but no user data, try to decode the token
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());
        localStorage.setItem("user", JSON.stringify(decoded));
        return decoded;
      } catch (err) {
        console.error("Failed to decode token:", err);
        // Clear invalid token
        this.logout();
      }
    }

    return null;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;

    // Try to get token from localStorage
    const tokenFromStorage = localStorage.getItem("auth_token");
    if (tokenFromStorage) return tokenFromStorage;

    // If not in localStorage, try to get from cookie
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    return getCookieValue("auth_token");
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
