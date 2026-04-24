# The Project - Audio Transcription App

Next.js app with Better Auth username login, PostgreSQL + Prisma persistence, and Gemini-powered audio transcription.

## Quick Start

```bash
npm install
npm run db:init
npm run dev
```

Open `http://localhost:3000` and log in with:
- Username: `admin`
- Password: `transcribe2024`

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Better Auth
- Prisma + PostgreSQL
- Gemini API (`@google/generative-ai`)

## Prerequisites

- Node.js 22+
- npm 10+
- PostgreSQL (local for development, Railway PostgreSQL for production)
- Gemini API key

## Environment Variables

Create a `.env` file in project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/the_project
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_actual_api_key
```

Notes:
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match your app URL in each environment.
- Do not include a trailing slash in URL values.

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Push schema to database:
```bash
npm run db:push
```

3. Seed admin user:
```bash
npm run db:seed
```

4. Run development server:
```bash
npm run dev
```

5. Open:
`http://localhost:3000`

Default seeded login:
- Username: `admin`
- Password: `transcribe2024`

## Available Scripts

- `npm run dev` - Run Next.js dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Apply Prisma schema to DB
- `npm run db:seed` - Seed/reset admin account using Better Auth
- `npm run db:init` - Run `db:push` + `db:seed`
- `npm run start:railway` - Run `db:push` then `start`

## Railway Deployment Guide

### 1) Push repository to GitHub
Railway deploys from your GitHub repository.

### 2) Create Railway services
In one Railway project:
- Add a **PostgreSQL** service
- Add a **GitHub Repo** service for this app

### 3) Configure app environment variables
In the app service, set:

- `DATABASE_URL` -> from Railway PostgreSQL service
- `BETTER_AUTH_SECRET` -> long random value (32+ characters)
- `BETTER_AUTH_URL` -> your Railway app URL (example: `https://burtz-production.up.railway.app`)
- `NEXT_PUBLIC_APP_URL` -> same Railway app URL
- `GEMINI_API_KEY` -> your Gemini API key

### 4) Configure run commands
Recommended:
- Build command: `npm run build`
- Start command: `npm run start:railway`

Why: `start:railway` ensures schema is synced before app starts.

### 5) First deploy (one-time bootstrap)
After first successful deploy, open Railway app shell and run:

```bash
npm run db:init
```

This creates tables and seeds admin credentials.

### 6) Verify deployment
- Open app URL
- Log in with seeded admin credentials
- Upload an audio file
- Confirm transcript is saved and appears in dashboard list

## Common Railway Issues

### `Base URL could not be determined` warning
Set both:
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
to the public Railway app URL.

### Browser tries `http://localhost:3000` in production
`NEXT_PUBLIC_APP_URL` is missing or incorrect. Set it to Railway URL and redeploy.

### `P2021 table public.user does not exist`
Schema not applied to current DB. Run:
```bash
npm run db:push
```

### `401 Unauthorized` with `Invalid password`
Admin record exists with mismatched/old credentials. Rerun:
```bash
npm run db:seed
```

## API Endpoints

- `POST /api/auth/sign-in/username` - Username/password login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Current session
- `POST /api/transcribe` - Upload and transcribe audio
- `GET /api/transcripts` - List current user's transcripts

## Security Notes

- Never commit real `.env` values.
- Rotate any key that was exposed in logs, screenshots, or commits.
- Use a strong `BETTER_AUTH_SECRET` in production.