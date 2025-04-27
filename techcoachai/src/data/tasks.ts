import type { Task } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

export const sampleTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Complete Python Basics',
    description: 'Finish all Python basic problems in the practice section',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    createdAt: new Date().toISOString(),
    userId: '1',
  },
  {
    id: uuidv4(),
    title: 'Review Algorithms',
    description: 'Go through algorithm problems and review solutions',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    createdAt: new Date().toISOString(),
    userId: '1',
  },
  {
    id: uuidv4(),
    title: 'Practice FizzBuzz',
    description: 'Solve the FizzBuzz problem and understand the solution thoroughly',
    completed: true,
    priority: 'low',
    createdAt: new Date().toISOString(),
    userId: '1',
  },
];

// Function to get tasks for a specific user
export function getUserTasks(userId: string): Task[] {
  // In a real application, this would fetch from an API or database
  return sampleTasks.filter(task => task.userId === userId);
}

// Function to add a new task
export function addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  sampleTasks.push(newTask);
  return newTask;
}

// Function to update a task
export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>): Task | null {
  const taskIndex = sampleTasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return null;
  }

  sampleTasks[taskIndex] = {
    ...sampleTasks[taskIndex],
    ...updates,
  };

  return sampleTasks[taskIndex];
}

// Function to delete a task
export function deleteTask(id: string): boolean {
  const taskIndex = sampleTasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return false;
  }

  sampleTasks.splice(taskIndex, 1);
  return true;
}

// Function to get task by ID
export function getTaskById(id: string): Task | undefined {
  return sampleTasks.find(task => task.id === id);
}
