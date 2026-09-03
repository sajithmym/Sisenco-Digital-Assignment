import axios from "axios";
import { API_SETTINGS, AUTH_SETTINGS } from "@/lib/settings";

const apiClient = axios.create({
  baseURL: API_SETTINGS.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_SETTINGS.accessTokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(AUTH_SETTINGS.refreshTokenKey);
        if (refreshToken) {
          const { data } = await axios.post(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          // Backend wraps every response in ApiResponse — unwrap the payload.
          const tokens = data.data;
          localStorage.setItem(AUTH_SETTINGS.accessTokenKey, tokens.accessToken);
          localStorage.setItem(AUTH_SETTINGS.refreshTokenKey, tokens.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(AUTH_SETTINGS.accessTokenKey);
        localStorage.removeItem(AUTH_SETTINGS.refreshTokenKey);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
