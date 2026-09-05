import axios from "axios";
import { API_SETTINGS, AUTH_SETTINGS, ROUTES } from "@/lib/settings";

let accessToken: string | null = null;
let refreshRequest: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function clearSession() {
  accessToken = null;
}

const apiClient = axios.create({
  baseURL: API_SETTINGS.baseUrl,
  headers: {
    "Content-Type": "application/json",
    [AUTH_SETTINGS.csrfHeaderName]: AUTH_SETTINGS.csrfHeaderValue,
  },
  withCredentials: true,
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

    const sessionRecoveryExclusions: ReadonlySet<string> = new Set([
      API_SETTINGS.authEndpoints.login,
      API_SETTINGS.authEndpoints.register,
      API_SETTINGS.authEndpoints.refresh,
      API_SETTINGS.authEndpoints.logout,
    ]);
    const doesNotRequireSessionRecovery = sessionRecoveryExclusions.has(
      originalRequest?.url ?? "",
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !doesNotRequireSessionRecovery
    ) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearSession();
        if (typeof window !== "undefined" && window.location.pathname !== ROUTES.login) {
          window.location.assign(ROUTES.login);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = axios
      .post(`${apiClient.defaults.baseURL}${API_SETTINGS.authEndpoints.refresh}`, undefined, {
        withCredentials: true,
        headers: { [AUTH_SETTINGS.csrfHeaderName]: AUTH_SETTINGS.csrfHeaderValue },
      })
      .then(({ data }) => {
        const token = data.data.accessToken as string;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

export default apiClient;
