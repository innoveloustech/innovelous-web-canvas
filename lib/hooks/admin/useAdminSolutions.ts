import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Solution, SolutionFormData } from "@/lib/types/solutions";
import { useState } from "react";

export function useAdminSolutions() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const query = useQuery({
    queryKey: ["admin", "solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      return data as Solution[];
    },
  });

  const { data: solutions, isLoading } = query;

  const createMutation = useMutation({
    mutationFn: async (newSolution: SolutionFormData) => {
      const { data, error } = await supabase
        .from("solutions")
        .insert([newSolution])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: () => {
      setIsPending(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "solutions"] });
    },
    onError: (err: Error) => setError(err),
    onSettled: () => setIsPending(false),
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string; data: Partial<SolutionFormData> }) => {
      const { data, error } = await supabase
        .from("solutions")
        .update(args.data)
        .eq("id", args.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: () => {
      setIsPending(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "solutions"] });
    },
    onError: (err: Error) => setError(err),
    onSettled: () => setIsPending(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("solutions").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: () => {
      setIsPending(true);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "solutions"] });
    },
    onError: (err: Error) => setError(err),
    onSettled: () => setIsPending(false),
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedIds: string[]) => {
      const updates = reorderedIds.map((id, index) => ({
        id,
        order: index,
      }));
      // Using a batch upsert for reordering
      const { error } = await supabase.from("solutions").upsert(updates);
      if (error) throw error;
    },
    onMutate: async (reorderedIds) => {
      setIsPending(true);
      setError(null);
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["admin", "solutions"] });
      const previous = queryClient.getQueryData<Solution[]>(["admin", "solutions"]);
      if (previous) {
        const optimistic = [...previous].sort(
          (a, b) => reorderedIds.indexOf(a.id) - reorderedIds.indexOf(b.id)
        );
        optimistic.forEach((item, index) => (item.order = index));
        queryClient.setQueryData(["admin", "solutions"], optimistic);
      }
      return { previous };
    },
    onError: (err: Error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin", "solutions"], context.previous);
      }
      setError(err);
    },
    onSettled: () => {
      setIsPending(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "solutions"] });
    },
  });

  return {
    solutions,
    isLoading,
    isPending,
    error: error || (query.error as Error | null),
    refetch: query.refetch,
    createSolution: (data: SolutionFormData) => createMutation.mutateAsync(data),
    updateSolution: (id: string, data: Partial<SolutionFormData>) =>
      updateMutation.mutateAsync({ id, data }),
    deleteSolution: (id: string) => deleteMutation.mutateAsync(id),
    reorderSolutions: (ids: string[]) => reorderMutation.mutateAsync(ids),
  };
}
