/**
 * Phase 0 Security Test Specification for TaskFlow Firestore Rules.
 * Verifies that all Dirty Dozen payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Task Create',
    collectionPath: '/tasks/task_spoof_1',
    operation: 'create',
    authUid: 'attacker_uid',
    payload: {
      userId: 'victim_user_123',
      title: 'Spoofed Task',
      description: '',
      status: 'todo',
      priority: 'low',
      dueDate: null,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Orphaned Task Create without User Profile',
    collectionPath: '/tasks/task_orphan_2',
    operation: 'create',
    authUid: 'unregistered_uid',
    payload: {
      userId: 'unregistered_uid',
      title: 'Orphan Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Task Create',
    collectionPath: '/tasks/task_shadow_3',
    operation: 'create',
    authUid: 'user_1',
    payload: {
      userId: 'user_1',
      title: 'Valid Title',
      description: '',
      status: 'todo',
      priority: 'low',
      dueDate: null,
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Task Update',
    collectionPath: '/tasks/task_1',
    operation: 'update',
    authUid: 'user_1',
    payload: {
      status: 'done',
      isVerified: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Ownership Transfer Attack on Task Update',
    collectionPath: '/tasks/task_1',
    operation: 'update',
    authUid: 'user_1',
    payload: {
      userId: 'other_user',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immortal Field Mutation on Task Update',
    collectionPath: '/tasks/task_1',
    operation: 'update',
    authUid: 'user_1',
    payload: {
      title: 'Edited',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Client Timestamp on Create',
    collectionPath: '/tasks/task_time_7',
    operation: 'create',
    authUid: 'user_1',
    payload: {
      userId: 'user_1',
      title: 'Forged Timestamp',
      description: '',
      status: 'todo',
      priority: 'low',
      dueDate: null,
      createdAt: '2099-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial-of-Wallet Oversized Title (>200 chars)',
    collectionPath: '/tasks/task_oversize_8',
    operation: 'create',
    authUid: 'user_1',
    payload: {
      userId: 'user_1',
      title: 'A'.repeat(205),
      description: '',
      status: 'todo',
      priority: 'low',
      dueDate: null,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Invalid Enum Value Poisoning',
    collectionPath: '/tasks/task_1',
    operation: 'update',
    authUid: 'user_1',
    payload: {
      status: 'archived',
      priority: 'critical',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Cross-User PII Read on /users/{victimId}/private/info',
    collectionPath: '/users/victim_uid/private/info',
    operation: 'get',
    authUid: 'attacker_uid',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unfiltered List Scraping on /tasks',
    collectionPath: '/tasks',
    operation: 'list',
    authUid: 'attacker_uid',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Path ID Poisoning with Invalid Characters',
    collectionPath: '/tasks/invalid$id!with@spaces',
    operation: 'create',
    authUid: 'user_1',
    payload: {
      userId: 'user_1',
      title: 'Bad ID',
      description: '',
      status: 'todo',
      priority: 'low',
      dueDate: null,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
