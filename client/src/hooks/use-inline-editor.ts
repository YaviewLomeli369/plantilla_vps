import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

interface UseInlineEditorProps {
  endpoint: string;
  queryKeys: string[];
  id: string;
}

export function useInlineEditor({ endpoint, queryKeys, id }: UseInlineEditorProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if user is superuser
  const isSuperuser = user?.role === 'superuser';

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest(`${endpoint}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
  });

  const updateField = async (field: string, value: any) => {
    if (!isSuperuser) {
      throw new Error("Only superusers can perform inline editing");
    }
    
    return updateMutation.mutateAsync({ [field]: value });
  };

  return {
    updateField,
    isSuperuser,
    isLoading: updateMutation.isPending,
    error: updateMutation.error,
  };
}