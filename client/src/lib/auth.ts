import { User } from "@shared/schema";

const AUTH_TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function hasRole(user: User | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

export function requireAuth(): { headers: Record<string, string> } {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
