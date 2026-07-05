import type { User } from "./types";

const STORAGE_KEY = "user";

// Only a UI-convenience cache for SSR-safe initial render - tokens
// themselves are HttpOnly cookies set by the backend and never touched
// here. Guarded for SSR since AuthProvider's initializer runs server-side too.
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearStoredUser() {
  setStoredUser(null);
}
