export interface User {
  id: number;
  username: string;
  email: string;
  language: string;
  is_customer: boolean;
  is_administrator: boolean;
}

export const clearAuthData = () => {
  localStorage.removeItem("user");
};

export const getUser = (): User | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const setUser = (user: User | null) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

/**
 * setTokens is now a dummy function because tokens are handled via HttpOnly cookies.
 * We keep it for backward compatibility in the code.
 */
export const setTokens = (access?: string, refresh?: string) => {
  // Les tokens sont maintenant gérés par les cookies HttpOnly
  if (typeof window !== "undefined") {
    console.log("Tokens are managed by HttpOnly cookies");
  }
};
