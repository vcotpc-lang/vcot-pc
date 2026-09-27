import React from 'react';
import {
  CheckSquare,
  PieChart,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Sparkles,
  X,
  LogOut,
} from 'lucide-react';

export type NavTab = 'tasks' | 'overview' | 'calendar' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  completedCount: number;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onLogout,
  completedCount,
  totalCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand & nav */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => handleNavClick('tasks')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <CheckSquare className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                TaskFlow
              </span>
            </button>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'tasks' && totalCount > 0 && (
                    <span
                      className={`text-xs tabular-nums font-mono-num ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {completedCount}/{totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Motivational Card & Sign out */}
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/70 to-sky-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border border-blue-100/80 dark:border-slate-700/70">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1.5">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold tracking-tight">Stay consistent</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Progress, not perfection. Small daily steps compound into meaningful results.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
