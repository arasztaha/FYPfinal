import { useState, useMemo } from 'react';
import { useTask } from '../lib/taskContext';
import { TaskItem } from './TaskItem';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function TaskList() {
  const { tasks, isLoading, error } = useTask();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];

      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by due date if available
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // Tasks with due dates come before those without
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // Finally sort by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [filteredTasks]);

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4">
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as 'all' | 'active' | 'completed')}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tasks available
            </div>
          ) : (
            sortedTasks.map(task => <TaskItem key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No active tasks
            </div>
          ) : (
            sortedTasks.map(task => <TaskItem key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No completed tasks
            </div>
          ) : (
            sortedTasks.map(task => <TaskItem key={task.id} task={task} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
