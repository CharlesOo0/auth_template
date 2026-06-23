import i18next from "i18next";
import { clearAuthData } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const language = i18next.language || "fr";
  const csrfToken = getCookie("csrftoken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": language,
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    ...(options.headers as Record<string, string>),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  // On inclut les credentials (cookies) pour toutes les requêtes
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials || "include",
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      // Pour HttpOnly, le refresh est géré côté backend si on utilise dj-rest-auth correctement
      // ou on doit appeler explicitement /token/refresh/ qui renverra de nouveaux cookies.
      
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

      // Tentative de refresh automatique
      try {
        const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
          },
          credentials: "include",
        });

        if (refreshResponse.ok) {
          // On réessaie la requête initiale
          return apiFetch(endpoint, options);
        } else {
          clearAuthData();
          if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/")) {
            window.location.href = "/auth/login";
          }
          throw new Error("Session expired");
        }
      } catch (error) {
        clearAuthData();
        throw error;
      }
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
