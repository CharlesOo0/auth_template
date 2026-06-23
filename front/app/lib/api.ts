import i18next from "i18next";
import { getAccessToken, getRefreshToken, setTokens, clearAuthData } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAccessToken();
  const language = i18next.language || "fr";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": language,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Don't try to refresh on login/token endpoints to avoid loops
      const isAuthEndpoint = 
        endpoint.includes("/login/") || 
        endpoint.includes("/token/refresh/") || 
        endpoint.includes("/registration/");

      if (isAuthEndpoint) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw errorData;
        }
        return response.json();
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthData();
        if (typeof window !== "undefined") window.location.href = "/auth/login";
        throw new Error("No refresh token available");
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setTokens(data.access, data.refresh || refreshToken);
            isRefreshing = false;
            onTokenRefreshed(data.access);
          } else {
            isRefreshing = false;
            clearAuthData();
            if (typeof window !== "undefined") window.location.href = "/auth/login";
            throw new Error("Refresh token expired");
          }
        } catch (error) {
          isRefreshing = false;
          clearAuthData();
          if (typeof window !== "undefined") window.location.href = "/auth/login";
          throw error;
        }
      }

      // Wait for token refresh
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      // Retry the original request
      return apiFetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
}
