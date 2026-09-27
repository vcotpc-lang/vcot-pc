import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  Flame,
  Calendar as CalendarIcon,
  Plus,
  Layers,
} from 'lucide-react';
import { Task, TaskStatus } from '../services/taskService';

interface OverviewProps {
  tasks: Task[];
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    pending: number;
    highPriority: number;
    completionPercentage: number;
  };
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenAddModal: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  tasks,
  stats,
  onEditTask,
  onStatusChange,
  onOpenAddModal,
}) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.completionPercentage / 100) * circumference;

  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' && t.status !== 'done');
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'done' && t.dueDate !== null)
    .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
    .slice(0, 6);

  const pendingTasks = tasks.filter((t) => t.status !== 'done').slice(0, 6);
  const completedTasks = tasks.filter((t) => t.status === 'done').slice(0, 6);

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      subtext: `${stats.pending} active in workflow`,
      icon: <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40',
    },
    {
      label: 'To Do',
      value: stats.todo,
      subtext: 'Tasks waiting to start',
      icon: <Circle className="w-5 h-5 text-rose-500" />,
      bg: 'bg-[#FFF1F2]/80 dark:bg-rose-950/25 border-[#FFE4E6] dark:border-rose-900/40',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      subtext: 'Currently being worked on',
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      bg: 'bg-[#FEF9C3]/70 dark:bg-amber-950/25 border-[#FEF08A] dark:border-amber-900/40',
    },
    {
      label: 'Completed',
      value: stats.done,
      subtext: `${stats.completionPercentage}% completion rate`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-[#DCFCE7]/75 dark:bg-emerald-950/25 border-[#BBF7D0] dark:border-emerald-900/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Overview</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your completion rate, high-priority deliverables, and upcoming deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl p-5 border ${card.bg} transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {card.label}
              </span>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 tabular-nums font-mono-num">
              {card.value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Circular Progress Visual + High-Priority & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Your Progress Visual Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Completion Analytics
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Your Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {stats.done} of {stats.total} tasks completed
            </p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-blue-600 dark:text-blue-400 transition-all duration-300"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white tabular-nums font-mono-num">
                  {stats.completionPercentage}%
                </span>
                <span className="text-[11px] text-slate-400">Completed</span>
              </div>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">To Do</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums font-mono-num">
                {stats.todo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">In Progress</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums font-mono-num">
                {stats.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Done</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono-num">
                {stats.done}
              </span>
            </div>
          </div>
        </div>

        {/* High Priority & Upcoming Deadlines */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Priority Tasks */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  High-Priority Tasks
                </h3>
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums font-mono-num">
                {highPriorityTasks.length}
              </span>
            </div>

            {highPriorityTasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <p className="text-xs text-slate-400">No pending high-priority tasks.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {highPriorityTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-start justify-between gap-2 group cursor-pointer"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {task.status === 'in-progress' ? 'In Progress' : 'To Do'}
                        {task.dueDate &&
                          ` · Due ${task.dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, 'done');
                      }}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Deadlines
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 tabular-nums font-mono-num">
                {upcomingDeadlines.length}
              </span>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <p className="text-xs text-slate-400">No scheduled deadlines pending.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {upcomingDeadlines.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {task.title}
                    </p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums font-mono-num shrink-0">
                      {task.dueDate?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Tasks vs Completed Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Tasks</h3>
            <span className="text-xs text-slate-400 tabular-nums font-mono-num">
              {stats.pending} active
            </span>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All tasks are completed!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-700/30 px-2 rounded-xl transition-colors"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {task.status === 'in-progress' ? 'In Progress' : 'To Do'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Completed Tasks</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums font-mono-num">
              {stats.done} done
            </span>
          </div>
          {completedTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Complete a task on the board to see it here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-700/30 px-2 rounded-xl transition-colors"
                >
                  <span className="text-xs font-medium text-slate-400 line-through truncate">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
                    Done
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
