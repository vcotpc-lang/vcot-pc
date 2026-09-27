# TaskFlow Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Master Source of Truth

1. **Global Default Deny**: Every path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Master Identity Source (`/users/{userId}`)**:
   - A user profile document can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId`.
   - `userId` path variable must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` chars.
   - `uid` inside the payload must match `request.auth.uid` and is immutable on update.
   - `createdAt` must equal `request.time` on create and remain immutable (`incoming().createdAt == existing().createdAt`) on update.
   - `updatedAt` must equal `request.time` on both create and update.
   - Listing `/users` is strictly forbidden (`allow list: if false;`).
3. **PII Split Collection (`/users/{userId}/private/{docId}`)**:
   - Stores user `email` isolated from `/users/{userId}`.
   - Relational Master Gate: Requires `exists(/databases/$(database)/documents/users/$(userId))` on read/update and `existsAfter(/databases/$(database)/documents/users/$(userId))` on create.
   - Strictly accessible only when `request.auth.uid == userId`.
4. **Task Ownership & Relational Integrity (`/tasks/{taskId}`)**:
   - Every task must belong to an existing user profile (`existsAfter(/databases/$(database)/documents/users/$(incoming().userId))` on create).
   - `incoming().userId == request.auth.uid` on create, and `existing().userId == request.auth.uid && incoming().userId == existing().userId` on update.
   - Secure List Queries (Pillar 8): `allow list` enforces `resource.data.userId == request.auth.uid` with zero `get()`/`exists()` calls to prevent O(n) read cost attacks.
   - Strict Schema & Size Validation:
     - `title`: string, `1 <= size() <= 200`
     - `description`: string, `0 <= size() <= 2000`
     - `status`: `'todo' | 'in-progress' | 'done'`
     - `priority`: `'low' | 'medium' | 'high'`
     - `dueDate`: `null` or `timestamp`
     - `createdAt`, `updatedAt`: server `timestamp` (`request.time`)

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Identity Spoofing on Task Create)**:
   `{ "userId": "victim_user_123", "title": "Spoofed Task", "description": "", "status": "todo", "priority": "low", "dueDate": null, "createdAt": "<SERVER_TIME>", "updatedAt": "<SERVER_TIME>" }` (Sent by `attacker_uid`) -> `PERMISSION_DENIED`
2. **Payload 2 (Orphaned Task Create without User Profile)**:
   `{ "userId": "unregistered_uid", "title": "Orphan Task", "description": "", "status": "todo", "priority": "medium", "dueDate": null, "createdAt": "<SERVER_TIME>", "updatedAt": "<SERVER_TIME>" }` (Where `/users/unregistered_uid` does not exist) -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection on Task Create)**:
   `{ "userId": "user_1", "title": "Valid", "description": "", "status": "todo", "priority": "low", "dueDate": null, "createdAt": "<SERVER_TIME>", "updatedAt": "<SERVER_TIME>", "isAdmin": true }` -> `PERMISSION_DENIED`
4. **Payload 4 (Shadow Field Injection on Task Update)**:
   Updating `/tasks/task_1` with `{ "status": "done", "updatedAt": "<SERVER_TIME>", "isVerified": true }` -> `PERMISSION_DENIED`
5. **Payload 5 (Ownership Transfer Attack on Task Update)**:
   Updating `/tasks/task_1` with `{ "userId": "other_user", "updatedAt": "<SERVER_TIME>" }` -> `PERMISSION_DENIED`
6. **Payload 6 (Immortal Field Mutation on Task Update)**:
   Updating `/tasks/task_1` with `{ "title": "Edited", "createdAt": "<NEW_TIME>", "updatedAt": "<SERVER_TIME>" }` -> `PERMISSION_DENIED`
7. **Payload 7 (Forged Client Timestamp on Create)**:
   Creating `/tasks/task_1` with `createdAt` set to a past/future timestamp instead of `request.time` -> `PERMISSION_DENIED`
8. **Payload 8 (Denial-of-Wallet Oversized Title)**:
   Creating `/tasks/task_1` with `title` length of 201 characters (`maxLength: 200`) -> `PERMISSION_DENIED`
9. **Payload 9 (Invalid Enum Value Poisoning)**:
   Updating `/tasks/task_1` with `{ "status": "archived", "updatedAt": "<SERVER_TIME>" }` or `{ "priority": "critical", "updatedAt": "<SERVER_TIME>" }` -> `PERMISSION_DENIED`
10. **Payload 10 (Cross-User PII Read on `/users/{victimId}/private/info`)**:
    Authenticated user `attacker_uid` attempting `get` on `/users/victim_uid/private/info` -> `PERMISSION_DENIED`
11. **Payload 11 (Unfiltered List Scraping on `/tasks`)**:
    Authenticated user `attacker_uid` executing `getDocs(collection(db, 'tasks'))` without `where('userId', '==', 'attacker_uid')` -> `PERMISSION_DENIED`
12. **Payload 12 (Path ID Poisoning)**:
    Creating `/tasks/invalid$id!with@spaces` -> `PERMISSION_DENIED`
