import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: {
      id: string;
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      priority: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.createTask(
        task.id,
        task.title,
        task.description,
        task.dueDate,
        task.dueTime,
        task.priority,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: {
      id: string;
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      priority: string;
      completed: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateTask(
        task.id,
        task.title,
        task.description,
        task.dueDate,
        task.dueTime,
        task.priority,
        task.completed,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteTask(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
