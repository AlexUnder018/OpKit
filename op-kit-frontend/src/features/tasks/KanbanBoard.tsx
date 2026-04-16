import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTasks } from '@/contexts/TasksContext';
import { TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];

export function KanbanBoard() {
  const { tasks, loading, error, fetchTasks } = useTasks();

  const tasksByStatus = React.useMemo(() => {
    return COLUMNS.reduce<Record<TaskStatus, typeof tasks>>((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    }, {} as Record<TaskStatus, typeof tasks>);
  }, [tasks]);

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">My Tasks</h1>
          <p className="text-sm text-slate-600 mt-1">
            {loading
              ? 'Loading…'
              : error
                ? 'Failed to load tasks'
                : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        {error && (
          <Button variant="outline" size="sm" onClick={fetchTasks} className="shadow-sm border-slate-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-6 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
