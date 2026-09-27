import React, { useState, useRef, useEffect } from 'react';
import {
  Circle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Edit3,
  Trash2,
  ArrowRightLeft,
  Flag,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDeleteRequest,
  onStatusChange,
  onPriorityChange,
  onDragStart,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    onStatusChange(task.id, nextStatus);
  };

  const renderStatusIcon = () => {
    if (task.status === 'done') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (task.status === 'in-progress') {
      return <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />;
    }
    return (
      <Circle className="w-5 h-5 text-rose-400 dark:text-rose-400 hover:text-blue-600 transition-colors shrink-0" />
    );
  };

  const priorityConfig: Record<
    TaskPriority,
    { label: string; textClass: string; dotClass: string }
  > = {
    high: {
      label: 'High priority',
      textClass: 'text-rose-600 dark:text-rose-400 font-medium',
      dotClass: 'bg-rose-500',
    },
    medium: {
      label: 'Medium priority',
      textClass: 'text-amber-600 dark:text-amber-400 font-medium',
      dotClass: 'bg-amber-500',
    },
    low: {
      label: 'Low priority',
      textClass: 'text-emerald-600 dark:text-emerald-400 font-medium',
      dotClass: 'bg-emerald-500',
    },
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  const formattedDate = task.dueDate
    ? task.dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

  const currentPriority = priorityConfig[task.priority];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onEdit(task)}
      className="group relative bg-white dark:bg-slate-800/95 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleToggleComplete}
            className="mt-0.5 focus:outline-none hover:scale-105 transition-transform"
            aria-label={
              task.status === 'done' ? 'Mark task as incomplete' : 'Mark task as completed'
            }
          >
            {renderStatusIcon()}
          </button>

          <div className="min-w-0 flex-1">
            <h4
              className={`text-sm font-semibold leading-snug break-words ${
                task.status === 'done'
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Three-dot menu */}
        <div
          className="relative shrink-0"
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Task options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xl py-1.5 z-40 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit task</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700/70" />
              <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3 h-3" />
                <span>Move status</span>
              </div>
              {(
                [
                  { id: 'todo', label: 'To Do' },
                  { id: 'in-progress', label: 'In Progress' },
                  { id: 'done', label: 'Done' },
                ] as { id: TaskStatus; label: string }[]
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (task.status !== st.id) {
                      onStatusChange(task.id, st.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                    task.status === st.id
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{st.label}</span>
                  {task.status === st.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}

              <div className="my-1 border-t border-slate-100 dark:border-slate-700/70" />
              <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Flag className="w-3 h-3" />
                <span>Change priority</span>
              </div>
              {(
                [
                  { id: 'low', label: 'Low' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'high', label: 'High' },
                ] as { id: TaskPriority; label: string }[]
              ).map((pr) => (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (task.priority !== pr.id) {
                      onPriorityChange(task.id, pr.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                    task.priority === pr.id
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{pr.label}</span>
                  {task.priority === pr.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}

              <div className="my-1 border-t border-slate-100 dark:border-slate-700/70" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteRequest(task);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unboxed Metadata Footer (Priority · Due Date) */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3.5 pl-8 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 ${currentPriority.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dotClass}`} />
          <span>{currentPriority.label}</span>
        </span>

        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          ·
        </span>

        <span
          className={`inline-flex items-center gap-1 tabular-nums font-mono-num ${
            isOverdue
              ? 'text-rose-600 dark:text-rose-400 font-medium'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{isOverdue ? `Overdue (${formattedDate})` : formattedDate}</span>
        </span>
      </div>
    </div>
  );
};
