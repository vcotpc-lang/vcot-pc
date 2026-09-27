/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { CheckSquare, AlertTriangle } from 'lucide-react';
import { isFirebaseConfigured } from './firebase';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from './services/taskService';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AddTaskModal } from './components/AddTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Notification, ToastMessage } from './components/Notification';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Overview } from './pages/Overview';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';

function WorkspaceApp() {
  const { user, profile, authReady, logout, updatePreferences } = useAuth();
  const {
    tasks,
    loading,
    error,
    seedingDemo,
    stats,
    addTask,
    editTask,
    changeStatus,
    changePriority,
    removeTask,
    loadDemoTasks,
  } = useTasks();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<NavTab>('tasks');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addInitialTitle, setAddInitialTitle] = useState('');
  const [addInitialStatus, setAddInitialStatus] = useState<TaskStatus>('todo');
  const [addInitialDate, setAddInitialDate] = useState<Date | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      if (profile && !profile.notificationsEnabled && type !== 'error') {
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
    },
    [profile]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Firebase Configuration Required</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            TaskFlow requires Firebase Authentication and Cloud Firestore credentials. Configure the
            following environment variables in your <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">.env</code> file or{' '}
            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">firebase-applet-config.json</code>:
          </p>
          <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
          </pre>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm animate-pulse">
          <CheckSquare className="w-6 h-6 stroke-[2.5]" />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading TaskFlow workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const handleOpenAddModal = (
    initialTitle = '',
    initialStatus: TaskStatus = 'todo',
    initialDate: Date | null = null
  ) => {
    setAddInitialTitle(initialTitle);
    setAddInitialStatus(initialStatus);
    setAddInitialDate(initialDate);
    setAddModalOpen(true);
  };

  const handleCreateTask = async (input: CreateTaskInput) => {
    await addTask(input);
    pushToast('success', 'Task created', `"${input.title}" added to your board.`);
  };

  const handleSaveTask = async (taskId: string, input: UpdateTaskInput) => {
    await editTask(taskId, input);
    pushToast('success', 'Task updated', `"${input.title}" changes saved.`);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await changeStatus(taskId, newStatus);
      const label =
        newStatus === 'done' ? 'Done' : newStatus === 'in-progress' ? 'In Progress' : 'To Do';
      pushToast('info', `Moved to ${label}`);
    } catch {
      pushToast('error', 'Failed to update status');
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      await changePriority(taskId, newPriority);
      pushToast('info', `Priority set to ${newPriority}`);
    } catch {
      pushToast('error', 'Failed to update priority');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      const deletedTitle = deletingTask.title;
      await removeTask(deletingTask.id);
      setDeletingTask(null);
      pushToast('info', 'Task deleted', `"${deletedTitle}" was removed.`);
    } catch {
      pushToast('error', 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoadDemo = async () => {
    try {
      await loadDemoTasks();
      pushToast('success', 'Demo tasks loaded', '8 starter tasks added to your Kanban board.');
    } catch {
      pushToast('error', 'Failed to load demo tasks');
    }
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && activeTab !== 'tasks') {
      setActiveTab('tasks');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex text-slate-900 dark:text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogout={logout}
        completedCount={stats.done}
        totalCount={stats.total}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          profile={profile}
          userPhotoUrl={user.photoURL}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSelectTab={setActiveTab}
          onLogout={logout}
          tasks={tasks}
        />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {activeTab === 'tasks' && (
            <Dashboard
              tasks={tasks}
              loading={loading}
              seedingDemo={seedingDemo}
              searchQuery={searchQuery}
              stats={stats}
              onOpenAddModal={(title, status) => handleOpenAddModal(title, status, null)}
              onEditTask={(t) => setEditingTask(t)}
              onDeleteRequest={(t) => setDeletingTask(t)}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onLoadDemoTasks={handleLoadDemo}
            />
          )}

          {activeTab === 'overview' && (
            <Overview
              tasks={tasks}
              stats={stats}
              onEditTask={(t) => setEditingTask(t)}
              onStatusChange={handleStatusChange}
              onOpenAddModal={() => handleOpenAddModal('', 'todo', null)}
            />
          )}

          {activeTab === 'calendar' && (
            <Calendar
              tasks={tasks}
              onEditTask={(t) => setEditingTask(t)}
              onOpenAddForDate={(date) => handleOpenAddModal('', 'todo', date)}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              profile={profile}
              userPhotoUrl={user.photoURL}
              taskCount={stats.total}
              seedingDemo={seedingDemo}
              onSavePreferences={async (updates) => {
                await updatePreferences(updates);
                pushToast('success', 'Settings saved', 'Your workspace preferences were updated.');
              }}
              onLoadDemoTasks={handleLoadDemo}
              onLogout={logout}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={addModalOpen}
        initialTitle={addInitialTitle}
        initialStatus={addInitialStatus}
        initialDueDate={addInitialDate}
        onClose={() => setAddModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDeleteRequest={(t) => setDeletingTask(t)}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        title="Delete Task?"
        message={
          deletingTask
            ? `Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTask(null)}
      />

      {/* Toast Notifications */}
      <Notification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceApp />
    </AuthProvider>
  );
}
