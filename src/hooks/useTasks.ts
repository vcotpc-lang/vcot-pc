import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
  UpdateTaskInput,
  subscribeToUserTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskDueDate,
  deleteTask,
  seedDemoTasks,
} from '../services/taskService';
import { useAuth } from './useAuth';

export function useTasks() {
  const { user, profile, authReady, updatePreferences } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seedingDemo, setSeedingDemo] = useState<boolean>(false);

  useEffect(() => {
    if (!authReady || !user || !profile) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load tasks from Cloud Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, user, profile?.uid]);

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!user) throw new Error('Must be signed in to add a task');
      return await createTask(user.uid, input);
    },
    [user]
  );

  const editTask = useCallback(async (taskId: string, input: UpdateTaskInput) => {
    await updateTask(taskId, input);
  }, []);

  const changeStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
  }, []);

  const changePriority = useCallback(async (taskId: string, priority: TaskPriority) => {
    await updateTaskPriority(taskId, priority);
  }, []);

  const changeDueDate = useCallback(async (taskId: string, dueDate: Date | null) => {
    await updateTaskDueDate(taskId, dueDate);
  }, []);

  const removeTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId);
  }, []);

  const loadDemoTasks = useCallback(async () => {
    if (!user || seedingDemo || tasks.length > 0) return;
    setSeedingDemo(true);
    try {
      await seedDemoTasks(user.uid);
      await updatePreferences({ demoSeeded: true });
    } finally {
      setSeedingDemo(false);
    }
  }, [user, seedingDemo, tasks.length, updatePreferences]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;
    const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      todo,
      inProgress,
      done,
      pending: todo + inProgress,
      highPriority,
      completionPercentage,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    seedingDemo,
    stats,
    addTask,
    editTask,
    changeStatus,
    changePriority,
    changeDueDate,
    removeTask,
    loadDemoTasks,
  };
}
