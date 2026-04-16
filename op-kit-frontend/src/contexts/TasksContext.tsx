import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from '@/types';

interface TasksContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: number, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  applySocketUpdate: (taskId: number, status: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Task[]>('/tasks');
      setTasks(data);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Could not load tasks. Make sure the server is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', payload);
    setTasks((prev) => [...prev, data]);
    return data;
  }, []);

  const updateTask = useCallback(async (id: number, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const applySocketUpdate = useCallback((taskId: number, status: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: status as TaskStatus } : t))
    );
  }, []);

  return (
    <TasksContext.Provider
      value={{ tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, applySocketUpdate }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
