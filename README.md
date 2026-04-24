# The Project - Audio Transcription App

## Setup Instructions

### 1. Start PostgreSQL

- Ensure PostgreSQL is running on `localhost:5432`
- Create database `the_project`
- Update `.env` with your connection string

### 2. Run Database Setup
```bash
npx prisma db push
```

### 3. Seed Admin User
```bash
npx tsx prisma/seed.ts
```

### 4. Configure Gemini API
Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key
```

### 5. Start Application
```bash
npm run dev
```

## Login Credentials
- **Username**: `admin`
- **Password**: `transcribe2024`

## API Endpoints
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/transcribe` - Upload and transcribe audio
- `GET /api/transcripts` - List all transcripts