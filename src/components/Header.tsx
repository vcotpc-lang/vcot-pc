import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  Settings as SettingsIcon,
  LogOut,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { UserProfile } from '../services/userService';
import { Task } from '../services/taskService';
import { NavTab } from './Sidebar';
import defaultAvatar from '../assets/images/avatar_executive_user_1790486880876.jpg';

interface HeaderProps {
  profile: UserProfile | null;
  userPhotoUrl?: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu: () => void;
  onSelectTab: (tab: NavTab) => void;
  onLogout: () => void;
  tasks: Task[];
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  userPhotoUrl,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onSelectTab,
  onLogout,
  tasks,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'done' && t.dueDate)
    .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
    .slice(0, 4);

  const firstName = profile?.displayName?.split(' ')[0] || 'there';

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-8 py-5 sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Greeting Section */}
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden mt-1 sm:mt-0 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Good morning, {firstName}! 👋
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              Let&apos;s get things done
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Organize your tasks, stay focused and make progress every day.
            </p>
          </div>
        </div>

        {/* Right: Search Bar, Notification Icon & User Avatar Menu */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks by title or description"
              className="w-full pl-10 pr-8 py-2.5 text-sm rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {upcomingTasks.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2.5" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Upcoming Deadlines
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums font-mono-num">
                    {upcomingTasks.length} active
                  </span>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      You&apos;re all caught up! No pending deadlines.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-1">
                    {upcomingTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab('calendar');
                        }}
                        className="w-full text-left py-2.5 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-xl px-2 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-400 tabular-nums font-mono-num mt-0.5">
                            Due{' '}
                            {task.dueDate?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2.5 p-1 pr-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
              aria-label="Open user menu"
            >
              {!avatarError ? (
                <img
                  src={userPhotoUrl || defaultAvatar}
                  alt={profile?.displayName || 'User profile'}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="w-8 h-8 rounded-xl object-cover border border-white dark:border-slate-700 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {(profile?.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                {profile?.displayName || 'TaskFlow User'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xl py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {profile?.displayName || 'TaskFlow User'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {profile?.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSelectTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
