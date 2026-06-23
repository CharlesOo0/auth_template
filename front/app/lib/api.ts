const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && endpoint !== "/login/") {
    localStorage.removeItem("access_token");
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data;
}
