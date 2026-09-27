import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Sun,
  Moon,
  Bell,
  LogOut,
  Save,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../services/userService';
import { VALIDATION_CONSTANTS } from '../firebase';
import defaultAvatar from '../assets/images/avatar_executive_user_1790486880876.jpg';

interface SettingsProps {
  profile: UserProfile | null;
  userPhotoUrl?: string | null;
  taskCount: number;
  seedingDemo: boolean;
  onSavePreferences: (
    updates: Partial<Pick<UserProfile, 'displayName' | 'theme' | 'notificationsEnabled'>>
  ) => Promise<void>;
  onLoadDemoTasks: () => Promise<void>;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  profile,
  userPhotoUrl,
  taskCount,
  seedingDemo,
  onSavePreferences,
  onLoadDemoTasks,
  onLogout,
}) => {
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [theme, setTheme] = useState<'light' | 'dark'>(profile?.theme || 'light');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    profile?.notificationsEnabled ?? true
  );
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setTheme(profile.theme);
      setNotificationsEnabled(profile.notificationsEnabled);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await onSavePreferences({
        displayName: displayName.trim(),
        theme,
        notificationsEnabled,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile, workspace theme, and notification preferences.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs space-y-6"
      >
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
          {!avatarError ? (
            <img
              src={userPhotoUrl || defaultAvatar}
              alt={profile?.displayName || 'User avatar'}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {(profile?.displayName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {profile?.displayName || 'TaskFlow User'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{profile?.email}</p>
          </div>
        </div>

        {/* Display Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="settings-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Display Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="settings-name"
                type="text"
                required
                maxLength={VALIDATION_CONSTANTS.DISPLAY_NAME_MAX_LENGTH}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="settings-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="settings-email"
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Appearance Theme
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Notification Preference */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Deadline & Task Notifications
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Show toast alerts and header reminders for upcoming due dates.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            aria-label="Toggle deadline notifications"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          {taskCount === 0 ? (
            <button
              type="button"
              onClick={onLoadDemoTasks}
              disabled={seedingDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200/80 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{seedingDemo ? 'Loading Demo Tasks...' : 'Load Starter Demo Tasks'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Sign out section */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign Out</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sign out of your TaskFlow account on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
