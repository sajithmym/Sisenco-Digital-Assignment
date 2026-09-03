import apiClient from "@/lib/api-client";
import type { AuthResponse, User } from "@/types";

export const authApi = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
