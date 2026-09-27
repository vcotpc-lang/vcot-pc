import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, VALIDATION_CONSTANTS } from '../firebase';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
}

export interface UpdateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
}

function sanitizeTitle(title: string): string {
  const trimmed = title.trim();
  const safe = trimmed.length > 0 ? trimmed : 'Untitled Task';
  return safe.slice(0, VALIDATION_CONSTANTS.TASK_TITLE_MAX_LENGTH);
}

function sanitizeDescription(description: string): string {
  return description.trim().slice(0, VALIDATION_CONSTANTS.TASK_DESCRIPTION_MAX_LENGTH);
}

function parseTimestamp(val: unknown): Date {
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  if (val instanceof Date) {
    return val;
  }
  return new Date();
}

function parseNullableTimestamp(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  if (val instanceof Date) {
    return val;
  }
  return null;
}

export function subscribeToUserTasks(
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const items: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          title: data.title || 'Untitled Task',
          description: data.description || '',
          status:
            data.status === 'in-progress' || data.status === 'done' ? data.status : 'todo',
          priority:
            data.priority === 'low' || data.priority === 'high' ? data.priority : 'medium',
          dueDate: parseNullableTimestamp(data.dueDate),
          createdAt: parseTimestamp(data.createdAt),
          updatedAt: parseTimestamp(data.updatedAt),
        };
      });

      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onTasks(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      } catch (formattedErr) {
        if (onError && formattedErr instanceof Error) {
          onError(formattedErr);
        }
      }
    }
  );
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<string> {
  const payload = {
    userId,
    title: sanitizeTitle(input.title),
    description: sanitizeDescription(input.description),
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'tasks'), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'tasks');
  }
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
  const taskPath = `tasks/${taskId}`;
  const taskRef = doc(db, 'tasks', taskId);

  const payload = {
    title: sanitizeTitle(input.title),
    description: sanitizeDescription(input.description),
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(taskRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, taskPath);
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const taskPath = `tasks/${taskId}`;
  const taskRef = doc(db, 'tasks', taskId);

  try {
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, taskPath);
  }
}

export async function updateTaskPriority(taskId: string, priority: TaskPriority): Promise<void> {
  const taskPath = `tasks/${taskId}`;
  const taskRef = doc(db, 'tasks', taskId);

  try {
    await updateDoc(taskRef, {
      priority,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, taskPath);
  }
}

export async function updateTaskDueDate(taskId: string, dueDate: Date | null): Promise<void> {
  const taskPath = `tasks/${taskId}`;
  const taskRef = doc(db, 'tasks', taskId);

  try {
    await updateDoc(taskRef, {
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, taskPath);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const taskPath = `tasks/${taskId}`;
  const taskRef = doc(db, 'tasks', taskId);

  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, taskPath);
  }
}

export async function seedDemoTasks(userId: string): Promise<void> {
  const now = new Date();
  const addDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(17, 0, 0, 0);
    return d;
  };

  const demoItems: CreateTaskInput[] = [
    // TO DO
    {
      title: 'Prepare lesson plan',
      description: 'Outline learning objectives, interactive activities, and key discussion questions for the upcoming module.',
      status: 'todo',
      priority: 'high',
      dueDate: addDays(1),
    },
    {
      title: 'Read chapter 2',
      description: 'Review core concepts in Chapter 2 and highlight key takeaways for the study group summary.',
      status: 'todo',
      priority: 'medium',
      dueDate: addDays(2),
    },
    {
      title: 'Organize study materials',
      description: 'Sort lecture notes, reference PDFs, and practice worksheets into structured digital folders.',
      status: 'todo',
      priority: 'low',
      dueDate: addDays(4),
    },
    // IN PROGRESS
    {
      title: 'Create presentation slides',
      description: 'Design clean visual slides with clear diagrams and concise talking points for the weekly review.',
      status: 'in-progress',
      priority: 'high',
      dueDate: addDays(0),
    },
    {
      title: 'Build the app',
      description: 'Implement responsive Kanban columns, real-time Firestore listeners, and drag-and-drop task transitions.',
      status: 'in-progress',
      priority: 'high',
      dueDate: addDays(3),
    },
    // DONE
    {
      title: 'Send email to students',
      description: 'Share the updated syllabus schedule and reading list links with all enrolled students.',
      status: 'done',
      priority: 'medium',
      dueDate: addDays(-1),
    },
    {
      title: 'Finish report draft',
      description: 'Complete the executive summary and compile performance metrics for the quarterly progress report.',
      status: 'done',
      priority: 'high',
      dueDate: addDays(-2),
    },
    {
      title: 'Plan next week',
      description: 'Prioritize top deliverables, block deep-work sessions on the calendar, and review upcoming deadlines.',
      status: 'done',
      priority: 'low',
      dueDate: addDays(0),
    },
  ];

  try {
    const batch = writeBatch(db);
    for (const item of demoItems) {
      const newTaskRef = doc(collection(db, 'tasks'));
      batch.set(newTaskRef, {
        userId,
        title: sanitizeTitle(item.title),
        description: sanitizeDescription(item.description),
        status: item.status,
        priority: item.priority,
        dueDate: item.dueDate ? Timestamp.fromDate(item.dueDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      demoSeeded: true,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'tasks');
  }
}
