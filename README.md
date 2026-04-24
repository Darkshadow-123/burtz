# The Project - Audio Transcription App

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Configure local `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/the_project
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_actual_api_key
```

3. Run database setup:
```bash
npm run db:push
```

4. Seed admin user:
```bash
npm run db:seed
```

5. Start app:
```bash
npm run dev
```

## Railway Deployment

### 1) Push code to GitHub
Railway will deploy from your connected GitHub repository.

### 2) Create Railway services
- Create a new **Project**
- Add a **PostgreSQL** service
- Add a **GitHub Repo** service for this Next.js app

### 3) Set required app variables in Railway
In your app service, set:

- `DATABASE_URL` = value from Railway PostgreSQL service
- `BETTER_AUTH_SECRET` = long random string (32+ chars)
- `BETTER_AUTH_URL` = your Railway app URL (example: `https://your-app.up.railway.app`)
- `NEXT_PUBLIC_APP_URL` = same Railway app URL
- `GEMINI_API_KEY` = your Google Gemini API key

### 4) Build/start commands
Railway should auto-detect Next.js, but explicitly use:

- Build command:
```bash
npm install && npm run db:push && npm run build
```

- Start command:
```bash
npm run start
```

### 5) Redeploy and verify
- Trigger deploy
- Open app URL
- Sign in with your seeded admin account
- Upload an audio file and verify transcript saves

## API Endpoints
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/transcribe` - Upload and transcribe audio
- `GET /api/transcripts` - List all transcripts

## Security Notes
- Do not commit real API keys/secrets.
- Rotate secrets immediately if they were exposed at any point.