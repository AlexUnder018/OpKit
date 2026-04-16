import React from 'react';
import { Task, TaskStatus } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';

const COLUMN_CONFIG: Record<TaskStatus, { label: string; borderColor: string; badgeClass: string; headerBg: string }> = {
  BACKLOG: {
    label: 'Backlog',
    borderColor: 'border-t-slate-500',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    headerBg: 'bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200',
  },
  TODO: {
    label: 'To Do',
    borderColor: 'border-t-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
    headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    borderColor: 'border-t-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
    headerBg: 'bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200',
  },
  DONE: {
    label: 'Done',
    borderColor: 'border-t-green-500',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
    headerBg: 'bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200',
  },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  loading: boolean;
}

export function KanbanColumn({ status, tasks, loading }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];

  return (
    <div className={`flex flex-col rounded-xl border-2 border-t-4 ${config.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow min-h-[400px]`}>
      <div className={`flex items-center justify-between px-4 py-3 ${config.headerBg} rounded-t-xl`}>
        <span className="text-sm font-bold tracking-tight text-slate-900">{config.label}</span>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${config.badgeClass}`}>
          {loading ? '…' : tasks.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 overflow-y-auto bg-slate-50/50">
        {loading ? (
          <>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>

      <div className="px-3 pb-3 bg-slate-50/50">
        <CreateTaskDialog defaultStatus={status} />
      </div>
    </div>
  );
}
