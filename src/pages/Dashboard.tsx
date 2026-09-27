import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  ArrowUpDown,
  ClipboardList,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../services/taskService';
import { ProgressCard } from '../components/ProgressCard';
import { TaskColumn } from '../components/TaskColumn';

interface DashboardProps {
  tasks: Task[];
  loading: boolean;
  seedingDemo: boolean;
  searchQuery: string;
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    completionPercentage: number;
  };
  onOpenAddModal: (initialTitle?: string, initialStatus?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onLoadDemoTasks: () => void;
}

type SortOption = 'newest' | 'dueDate' | 'priority';

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  loading,
  seedingDemo,
  searchQuery,
  stats,
  onOpenAddModal,
  onEditTask,
  onDeleteRequest,
  onStatusChange,
  onPriorityChange,
  onLoadDemoTasks,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenAddModal(quickTitle.trim(), 'todo');
    setQuickTitle('');
  };

  const filteredAndSortedTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const priorityRank: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };

    return tasks
      .filter((task) => {
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }
        if (!q) return true;
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityRank[b.priority] - priorityRank[a.priority];
        }
        if (sortBy === 'dueDate') {
          const aTime = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
          const bTime = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }, [tasks, searchQuery, priorityFilter, sortBy]);

  const todoTasks = useMemo(
    () => filteredAndSortedTasks.filter((t) => t.status === 'todo'),
    [filteredAndSortedTasks]
  );
  const inProgressTasks = useMemo(
    () => filteredAndSortedTasks.filter((t) => t.status === 'in-progress'),
    [filteredAndSortedTasks]
  );
  const doneTasks = useMemo(
    () => filteredAndSortedTasks.filter((t) => t.status === 'done'),
    [filteredAndSortedTasks]
  );

  const handleDragStartTask = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const existing = tasks.find((t) => t.id === taskId);
    if (existing && existing.status !== targetStatus) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Progress & Motivational Row */}
      <ProgressCard
        completed={stats.done}
        total={stats.total}
        percentage={stats.completionPercentage}
      />

      {/* Task Creation Input Bar + Filter/Sort Controls */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-5 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs space-y-4">
        <form onSubmit={handleQuickAddSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Add a new task..."
            aria-label="Add a new task"
            className="flex-1 px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </form>

        {/* Interactive Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {(
              [
                { id: 'all', label: 'All Tasks' },
                { id: 'high', label: 'High' },
                { id: 'medium', label: 'Medium' },
                { id: 'low', label: 'Low' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPriorityFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  priorityFilter === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="dashboard-sort" className="text-xs text-slate-500 dark:text-slate-400">
              Sort by:
            </label>
            <select
              id="dashboard-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-transparent focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest created</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((col) => (
            <div
              key={col}
              className="rounded-3xl p-5 bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 h-[420px] animate-pulse space-y-4"
            >
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-3 w-48 bg-slate-200/70 dark:bg-slate-700/60 rounded-lg" />
              <div className="h-24 bg-slate-200/80 dark:bg-slate-700/70 rounded-2xl" />
              <div className="h-24 bg-slate-200/80 dark:bg-slate-700/70 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-10 text-center border border-slate-200/70 dark:border-slate-700/70 shadow-2xs max-w-xl mx-auto my-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tasks yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Add your first task and start making progress, or load the starter demo tasks to explore the board.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenAddModal('', 'todo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
            <button
              type="button"
              onClick={onLoadDemoTasks}
              disabled={seedingDemo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{seedingDemo ? 'Loading Demo Tasks...' : 'Load Demo Tasks'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Three-Column Kanban Task Board */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <TaskColumn
            status="todo"
            title="TO DO"
            subtitle="Tasks you need to do"
            tasks={todoTasks}
            onEditTask={onEditTask}
            onDeleteRequest={onDeleteRequest}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onAddClick={(st) => onOpenAddModal('', st)}
            onDropTask={handleDropTask}
            onDragStartTask={handleDragStartTask}
          />

          <TaskColumn
            status="in-progress"
            title="IN PROGRESS"
            subtitle="Tasks you are currently working on"
            tasks={inProgressTasks}
            onEditTask={onEditTask}
            onDeleteRequest={onDeleteRequest}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onAddClick={(st) => onOpenAddModal('', st)}
            onDropTask={handleDropTask}
            onDragStartTask={handleDragStartTask}
          />

          <TaskColumn
            status="done"
            title="DONE"
            subtitle="Tasks you have completed"
            tasks={doneTasks}
            onEditTask={onEditTask}
            onDeleteRequest={onDeleteRequest}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onAddClick={(st) => onOpenAddModal('', st)}
            onDropTask={handleDropTask}
            onDragStartTask={handleDragStartTask}
          />
        </div>
      )}
    </div>
  );
};
