import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          removeAuthToken();
          return null;
        }

        return await response.json();
      } catch {
        removeAuthToken();
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return response;
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; role?: string }) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return response;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    },
    onSuccess: () => {
      removeAuthToken();
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
