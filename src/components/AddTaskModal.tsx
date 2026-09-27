import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TaskStatus, TaskPriority, CreateTaskInput } from '../services/taskService';
import { VALIDATION_CONSTANTS } from '../firebase';

interface AddTaskModalProps {
  isOpen: boolean;
  initialTitle?: string;
  initialStatus?: TaskStatus;
  initialDueDate?: Date | null;
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  initialTitle = '',
  initialStatus = 'todo',
  initialDueDate = null,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDateStr, setDueDateStr] = useState(formatDateForInput(initialDueDate));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDescription('');
      setStatus(initialStatus);
      setPriority('medium');
      setDueDateStr(formatDateForInput(initialDueDate));
      setValidationError(null);
    }
  }, [isOpen, initialTitle, initialStatus, initialDueDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Task title is required.');
      return;
    }
    if (trimmedTitle.length > VALIDATION_CONSTANTS.TASK_TITLE_MAX_LENGTH) {
      setValidationError(
        `Title must be ${VALIDATION_CONSTANTS.TASK_TITLE_MAX_LENGTH} characters or fewer.`
      );
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    try {
      const parsedDate = dueDateStr ? new Date(`${dueDateStr}T17:00:00`) : null;
      await onCreate({
        title: trimmedTitle,
        description: description.trim(),
        status,
        priority,
        dueDate: parsedDate,
      });
      onClose();
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Failed to create task. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-modal-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200/80 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2
              id="add-task-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Create New Task
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add details, set priority, and schedule a due date.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-medium">
              {validationError}
            </div>
          )}

          <div>
            <label
              htmlFor="add-task-title"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="add-task-title"
              type="text"
              value={title}
              maxLength={VALIDATION_CONSTANTS.TASK_TITLE_MAX_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Prepare lesson plan"
              autoFocus
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="add-task-description"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="add-task-description"
              rows={3}
              value={description}
              maxLength={VALIDATION_CONSTANTS.TASK_DESCRIPTION_MAX_LENGTH}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes, sub-steps, or context..."
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label
                htmlFor="add-task-status"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Status
              </label>
              <select
                id="add-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="add-task-priority"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Priority
              </label>
              <select
                id="add-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="add-task-duedate"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Due Date
              </label>
              <input
                id="add-task-duedate"
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-colors whitespace-nowrap"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
