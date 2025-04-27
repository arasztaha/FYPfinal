import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Task, TaskState } from './types';
import { getUserTasks, addTask, updateTask, deleteTask } from '../data/tasks';
import { useAuth } from './authContext';

interface TaskContextType extends TaskState {
  addNewTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => void;
  updateExistingTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => void;
  deleteExistingTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [taskState, setTaskState] = useState<TaskState>({
    tasks: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (user) {
      // In a real app, this would be an API call
      try {
        const tasks = getUserTasks(user.id);
        setTaskState({
          tasks,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setTaskState({
          tasks: [],
          isLoading: false,
          error: 'Failed to load tasks',
        });
      }
    } else {
      setTaskState({
        tasks: [],
        isLoading: false,
        error: null,
      });
    }
  }, [user]);

  const addNewTask = (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    try {
      const newTask = addTask({
        ...task,
        userId: user.id,
      });

      setTaskState(prevState => ({
        ...prevState,
        tasks: [...prevState.tasks, newTask],
      }));
    } catch (error) {
      setTaskState(prevState => ({
        ...prevState,
        error: 'Failed to add task',
      }));
    }
  };

  const updateExistingTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => {
    try {
      const updatedTask = updateTask(id, updates);

      if (updatedTask) {
        setTaskState(prevState => ({
          ...prevState,
          tasks: prevState.tasks.map(task =>
            task.id === id ? updatedTask : task
          ),
        }));
      }
    } catch (error) {
      setTaskState(prevState => ({
        ...prevState,
        error: 'Failed to update task',
      }));
    }
  };

  const deleteExistingTask = (id: string) => {
    try {
      const success = deleteTask(id);

      if (success) {
        setTaskState(prevState => ({
          ...prevState,
          tasks: prevState.tasks.filter(task => task.id !== id),
        }));
      }
    } catch (error) {
      setTaskState(prevState => ({
        ...prevState,
        error: 'Failed to delete task',
      }));
    }
  };

  const toggleTaskComplete = (id: string) => {
    const task = taskState.tasks.find(t => t.id === id);
    if (task) {
      updateExistingTask(id, { completed: !task.completed });
    }
  };

  return (
    <TaskContext.Provider
      value={{
        ...taskState,
        addNewTask,
        updateExistingTask,
        deleteExistingTask,
        toggleTaskComplete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
