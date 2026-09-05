import apiClient, { clearSession, setAccessToken } from "@/lib/api-client";
import { API_SETTINGS } from "@/lib/settings";
import type { AuthResponse, RegistrationResponse, User } from "@/types";

export const authApi = {
  async register(
    data: { name: string; email: string; password: string },
  ): Promise<RegistrationResponse> {
    const response = await apiClient.post(API_SETTINGS.authEndpoints.register, data);
    return response.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post(API_SETTINGS.authEndpoints.login, data);
    setAccessToken(response.data.data.accessToken);
    return response.data.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const response = await apiClient.post(API_SETTINGS.authEndpoints.refresh);
    setAccessToken(response.data.data.accessToken);
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_SETTINGS.authEndpoints.logout);
    } finally {
      clearSession();
    }
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get(API_SETTINGS.authEndpoints.currentUser);
    return response.data.data;
  },
};
