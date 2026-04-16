import React from 'react';
import { Task, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditTaskDialog } from './EditTaskDialog';
import { DeleteTaskDialog } from './DeleteTaskDialog';

const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  BACKLOG: 'bg-slate-100 text-slate-700 border-slate-200',
  TODO: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  DONE: 'bg-green-50 text-green-700 border-green-200',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="group shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 hover:border-slate-300 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug break-words text-slate-900">{task.title}</p>
            {task.description && (
              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{task.description}</p>
            )}
          </div>
          <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <EditTaskDialog task={task} />
            <DeleteTaskDialog task={task} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 font-medium border ${STATUS_BADGE_CLASSES[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </Badge>
          <span className="text-xs text-slate-500 font-medium">{formatDate(task.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
