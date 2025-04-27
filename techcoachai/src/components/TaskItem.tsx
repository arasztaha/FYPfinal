import { useState } from 'react';
import type { Task } from '../lib/types';
import { useTask } from '../lib/taskContext';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskComplete, deleteExistingTask } = useTask();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleToggleComplete = () => {
    toggleTaskComplete(task.id);
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      deleteExistingTask(task.id);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-4 mb-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5 mt-1">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <label
                htmlFor={`task-${task.id}`}
                className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
              >
                {task.title}
              </label>
              <p className={`text-sm mt-1 ${task.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {task.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <Badge className={`${getPriorityColor(task.priority)} capitalize`}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="h-8"
            >
              {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
