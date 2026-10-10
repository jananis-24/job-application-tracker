# Job Application Tracker

A local-first, modern web application for tracking your job search journey. Built entirely with frontend technologies, your data never leaves your browser.

## Features

- **Dashboard**: Get a quick overview of your job search progress, including live counts of applications in various stages and a recent activity feed.
- **Applications Management**: Add, edit, and organize job applications. Filter by status (Wishlist, Applied, Interviewing, Offer, Rejected), search by company or role, and sort by date or alphabetically.
- **Detailed Tracking**: Keep track of job links, application dates, work types, locations, and personal notes.
- **Status History**: Automatically records when you move an application from one stage to another, creating a timeline of your progress.
- **Settings & Data Management**: Switch between Light and Dark mode, export your data as a JSON backup, import backups, or clear all data.
- **Privacy First**: Built using Dexie.js (IndexedDB). No backend, no accounts, and no data tracking.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Dexie.js (IndexedDB wrapper)
- **Routing**: React Router v7

## How to Run Locally

1. Clone or download this repository.
2. Install dependencies using `npm install`.
3. Start the development server with `npm run dev`.
4. Open the provided `localhost` link in your browser.

## Future Version 2 Idea

In the future, this application can be easily migrated to use a real backend API. The data layer is completely decoupled inside the `src/db/` directory, meaning the UI components won't need to be rewritten to support cloud syncing, authentication, or cross-device usage.
