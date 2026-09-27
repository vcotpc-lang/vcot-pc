import React from 'react';
import { Sparkles } from 'lucide-react';

interface ProgressCardProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ completed, total, percentage }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Your Progress circular card */}
      <div className="md:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            Daily Momentum
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Your Progress
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono-num">
              {completed}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono-num">
              {total}
            </span>{' '}
            tasks completed
          </p>
        </div>

        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-100 dark:text-slate-700"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-blue-600 dark:text-blue-400 transition-all duration-300"
            />
          </svg>
          <span className="absolute text-sm font-bold text-slate-900 dark:text-white tabular-nums font-mono-num">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Motivational Card from Reference */}
      <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-blue-100">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium">Daily Focus</span>
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-bold tracking-tight">Stay consistent</h3>
          <p className="text-sm text-blue-100 mt-0.5">Progress, not perfection.</p>
        </div>
      </div>
    </div>
  );
};
