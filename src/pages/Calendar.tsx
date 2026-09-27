import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Task, TaskStatus } from '../services/taskService';

interface CalendarProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onOpenAddForDate: (date: Date) => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const Calendar: React.FC<CalendarProps> = ({
  tasks,
  onEditTask,
  onOpenAddForDate,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInGrid = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [year, month]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, selectedDate));
  }, [tasks, selectedDate]);

  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => !t.dueDate && t.status !== 'done');
  }, [tasks]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const statusIcon = (status: TaskStatus) => {
    if (status === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (status === 'in-progress') return <Clock className="w-4 h-4 text-amber-500 shrink-0" />;
    return <Circle className="w-4 h-4 text-rose-500 shrink-0" />;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Task Calendar</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize due dates, inspect daily deliverables, and schedule new tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenAddForDate(selectedDate)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>
            Add Task for{' '}
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200/70 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysInGrid.map((cellDate, idx) => {
              if (!cellDate) {
                return <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-slate-50/40 dark:bg-slate-900/20" />;
              }

              const dayTasks = tasks.filter(
                (t) => t.dueDate && isSameDay(t.dueDate, cellDate)
              );
              const isToday = isSameDay(cellDate, today);
              const isSelected = isSameDay(cellDate, selectedDate);

              return (
                <div
                  key={cellDate.toISOString()}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`h-24 sm:h-28 rounded-2xl p-2 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                      : 'border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center tabular-nums font-mono-num ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cellDate.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400 tabular-nums font-mono-num">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(t);
                        }}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate block ${
                          t.status === 'done'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 line-through'
                            : t.status === 'in-progress'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="block text-[10px] text-slate-400 pl-1 tabular-nums">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Selected Date
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenAddForDate(selectedDate)}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                aria-label="Add task for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {tasksForSelectedDate.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No tasks scheduled for this date.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAddForDate(selectedDate)}
                  className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Schedule a task
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-2">
                {tasksForSelectedDate.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="mt-0.5">{statusIcon(task.status)}</div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          task.status === 'done'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                        {task.priority} priority · {task.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unscheduled tasks box */}
          {unscheduledTasks.length > 0 && (
            <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                Unscheduled Active Tasks ({unscheduledTasks.length})
              </h4>
              <div className="space-y-2">
                {unscheduledTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onEditTask(task)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 truncate transition-colors"
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
