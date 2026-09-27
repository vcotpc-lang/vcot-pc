# TaskFlow — Modern Cloud-Synced Task Management

TaskFlow is a responsive Kanban task-management web application built with **React**, **TypeScript**, **Tailwind CSS**, **Firebase Authentication**, and **Cloud Firestore**.

---

## Features

- **Firebase Authentication**: Supports Email/Password registration & login as well as 1-click Google Sign-In, with isolated user workspaces and persistent sessions.
- **Real-Time Kanban Task Board**: Three pastel workflow columns (**To Do**, **In Progress**, **Done**) with HTML5 drag-and-drop status transitions, priority indicators, and due date tracking.
- **Full Firestore CRUD**: Create, read, edit, filter, sort, search, and delete tasks with real-time `onSnapshot` listeners.
- **Overview Analytics**: Circular progress ring, completion percentage, high-priority task focus list, and upcoming deadline reminders.
- **Interactive Calendar**: Monthly calendar view mapping tasks by due date with 1-click task scheduling for any selected day.
- **Account Settings & Theme Support**: Customize display name, toggle Light/Dark mode, and manage notification preferences stored in Firestore.

---

## Firebase Setup & Deployment Guide

### 1. How to Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** (or select an existing Google Cloud project).
3. Enter a project name (e.g., `taskflow-app`) and complete the setup wizard.

### 2. How to Enable Email/Password & Google Authentication
1. In the Firebase Console left sidebar, navigate to **Build → Authentication**.
2. Click **Get started**, then select the **Sign-in method** tab.
3. Click **Email/Password**, toggle **Enable** on, and click **Save**.
4. (Optional) Click **Google**, toggle **Enable** on, select a support email, and click **Save**.

### 3. How to Create a Cloud Firestore Database
1. In the Firebase Console sidebar, navigate to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose a Cloud Firestore location near your users and start in **Production mode**.

### 4. How to Add the Web Application to Firebase
1. Go to **Project Overview → Project settings** (gear icon).
2. Scroll down to **Your apps** and click the **Web (`</>`)** icon.
3. Register your app nickname (e.g., `TaskFlow Web`) and copy the `firebaseConfig` values.

### 5. Where to Put Environment Variables
Create a `.env` file in the project root (or configure `firebase-applet-config.json`) with your Firebase project values:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```

### 6. How to Deploy Firestore Security Rules
The repository includes hardened zero-trust security rules in `firestore.rules` that isolate `/users/{userId}`, `/users/{userId}/private/{docId}`, and `/tasks/{taskId}` by `request.auth.uid`.

To validate and deploy:
```bash
# Validate rules with ESLint
npx eslint firestore.rules

# Deploy using Firebase CLI
firebase deploy --only firestore:rules
```

### 7. How to Run the Project Locally
```bash
npm install
npm run dev
```
The development server will start at `http://localhost:3000`.

### 8. How to Build the Project
```bash
npm run lint
npm run build
```
This compiles TypeScript and bundles optimized static assets into the `dist/` directory.

### 9. How to Deploy the Application
You can deploy the production build (`dist/`) to **Firebase Hosting**, **Google Cloud Run**, or any static hosting provider:
```bash
npm run build
firebase deploy --only hosting
```
