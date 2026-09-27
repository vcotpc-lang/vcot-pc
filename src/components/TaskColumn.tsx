import React, { useState } from 'react';
import { Circle, Clock, CheckCircle2, Plus } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../services/taskService';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  subtitle: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onAddClick: (defaultStatus: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onDragStartTask: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  subtitle,
  tasks,
  onEditTask,
  onDeleteRequest,
  onStatusChange,
  onPriorityChange,
  onAddClick,
  onDropTask,
  onDragStartTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const columnThemes: Record<
    TaskStatus,
    {
      containerBg: string;
      dragRing: string;
      icon: React.ReactNode;
      countText: string;
    }
  > = {
    todo: {
      containerBg:
        'bg-[#FFF1F2]/90 dark:bg-rose-950/20 border border-[#FFE4E6] dark:border-rose-900/40',
      dragRing: 'ring-2 ring-rose-400 bg-rose-100/70 dark:bg-rose-950/40',
      icon: <Circle className="w-5 h-5 text-rose-500 stroke-[2.2]" />,
      countText: 'text-rose-600 dark:text-rose-400',
    },
    'in-progress': {
      containerBg:
        'bg-[#FEF9C3]/75 dark:bg-amber-950/20 border border-[#FEF08A] dark:border-amber-900/40',
      dragRing: 'ring-2 ring-amber-400 bg-amber-100/70 dark:bg-amber-950/40',
      icon: <Clock className="w-5 h-5 text-amber-500 stroke-[2.2]" />,
      countText: 'text-amber-700 dark:text-amber-400',
    },
    done: {
      containerBg:
        'bg-[#DCFCE7]/80 dark:bg-emerald-950/20 border border-[#BBF7D0] dark:border-emerald-900/40',
      dragRing: 'ring-2 ring-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/40',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.2]" />,
      countText: 'text-emerald-700 dark:text-emerald-400',
    },
  };

  const theme = columnThemes[status];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`${title} column`}
      className={`rounded-3xl p-5 flex flex-col min-h-[420px] transition-all duration-150 ${
        theme.containerBg
      } ${isDragOver ? theme.dragRing : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            {theme.icon}
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            <span
              className={`text-xs font-bold tabular-nums font-mono-num ml-1 ${theme.countText}`}
            >
              ({tasks.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => onAddClick(status)}
          className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs transition-colors"
          aria-label={`Add task to ${title}`}
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-3">
        {tasks.length === 0 ? (
          <div className="h-44 rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-700/70 flex flex-col items-center justify-center p-4 text-center bg-white/40 dark:bg-slate-900/20">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No tasks in {title}
            </p>
            <button
              type="button"
              onClick={() => onAddClick(status)}
              className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add a task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDeleteRequest={onDeleteRequest}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              onDragStart={onDragStartTask}
            />
          ))
        )}
      </div>
    </section>
  );
};
