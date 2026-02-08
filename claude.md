# AI Voice Log - Project Context for Claude

## Project Overview

This is an AI-powered voice logging application for tracking food intake and exercise. Users speak naturally about their meals and workouts, and GPT-4 extracts structured data (calories, macros, exercise duration) into a local SQLite database. This is a portfolio project showcasing modern full-stack development with AI integration.

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js 20+ + Express + TypeScript
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenAI GPT-4 with function calling
- **Voice**: Browser Web Speech API
- **State Management**: React Query (server state) + Zustand (client state)
- **Styling**: Plain CSS (no Tailwind - user preference)

## Project Structure

```
voiceLog/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages (HomePage, DailyLogPage)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API client
│   │   └── types/      # TypeScript definitions
│
├── server/              # Node.js backend
│   ├── src/
│   │   ├── config/     # Database and OpenAI setup
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── types/      # TypeScript definitions
│
└── shared/              # Shared types between frontend/backend
```

## Core Features

1. **Voice Input**: Users speak about food eaten or exercise performed
2. **AI Data Extraction**: GPT-4 extracts structured data via function calling
3. **Calorie Estimation**: AI provides calorie approximations
4. **Editable Entries**: Users can modify logged values
5. **Daily Tracker**: View daily summaries with total calories in/out

## Database Schema

### log_entries
Main log records with `id`, `date`, `timestamp`, `type` (food|exercise), `raw_transcript`

### food_items
Linked to log_entries: `name`, `quantity`, `unit`, `calories`, `protein`, `carbs`, `fat`

### exercise_activities
Linked to log_entries: `activity_type`, `duration_minutes`, `intensity`, `calories_burned`

## API Endpoints

- `POST /api/voice/process` - Process voice transcript, extract data, save to DB
- `GET /api/logs?date=YYYY-MM-DD` - Get all entries for a date with totals
- `GET /api/logs/:id` - Get single entry
- `PUT /api/logs/:id` - Update entry
- `DELETE /api/logs/:id` - Delete entry

## Key Implementation Details

### OpenAI Function Calling

The AI service uses GPT-4's function calling to extract structured data from natural language:

**Functions:**
- `log_food_intake` - Extracts food items with calories, macros, portions
- `log_exercise` - Extracts exercise type, duration, intensity, calories burned

**Example:**
User says: "I ate two scrambled eggs and a banana"
→ GPT-4 returns: `{ items: [{ name: "scrambled eggs", quantity: 2, calories: 140, ... }, { name: "banana", quantity: 1, calories: 105, ... }] }`

### Web Speech API

Frontend uses browser's native Web Speech API for voice-to-text conversion. Fallback to text input for unsupported browsers (Safari has limited support).

## Development Guidelines

### Code Style
- **TypeScript**: Strict typing, no `any` usage
- **React**: Functional components, hooks only (no class components)
- **Error Handling**: Always handle errors gracefully with user-friendly messages
- **Naming**: Use clear, descriptive names for variables and functions

### File Organization
- Keep components focused and single-purpose
- Shared types go in `/shared/types.ts`
- API calls belong in service files, not components
- Custom hooks for reusable logic

### Environment Variables
- `OPENAI_API_KEY` - Required for AI functionality
- `PORT` - Backend server port (default: 3001)
- `DATABASE_PATH` - SQLite database location
- `VITE_API_BASE_URL` - Frontend API endpoint

### Running the Project

**Development:**
```bash
npm run dev  # Runs both client and server concurrently
```

**Individual:**
```bash
npm run dev:client  # Frontend only (port 5173)
npm run dev:server  # Backend only (port 3001)
```

## Important Notes

### User Preferences
- **NO Tailwind CSS** - Use plain CSS for styling
- **Single user mode** - No authentication needed
- **Local storage** - SQLite database, no cloud services

### Portfolio Focus
This project demonstrates:
- Modern AI integration (GPT-4 function calling)
- Full-stack TypeScript development
- Clean architecture and separation of concerns
- Production-ready error handling
- Voice interface implementation

## Testing Strategy

### End-to-End Testing Flow
1. Start dev servers
2. Record voice: "I ate two scrambled eggs and a banana"
3. Verify entry appears with ~245 calories
4. Edit entry and verify updates
5. Navigate to daily log, check totals
6. Record exercise: "I ran for 30 minutes"
7. Verify calories burned calculation
8. Delete entry and verify removal

### Database Verification
```bash
sqlite3 server/data/voicelog.db "SELECT * FROM log_entries;"
sqlite3 server/data/voicelog.db "SELECT * FROM food_items;"
```

## Current Implementation Status

✅ Project structure created
✅ Dependencies installed (Node 20+ required)
⏳ Backend foundation (database, OpenAI config) - IN PROGRESS
⏳ Core services (AI, logs, routes)
⏳ Frontend components (voice input, log display, editing)
⏳ Testing and polish

## Next Steps

1. Create database configuration with schema
2. Setup OpenAI client
3. Implement AI service with function calling
4. Build Express routes for voice processing and CRUD
5. Create React components for voice input and log display
6. Test end-to-end functionality
7. Write README for portfolio showcase

## Common Tasks

### Adding a New Feature
1. Update database schema if needed (server/src/config/database.ts)
2. Create/update types in shared/types.ts
3. Implement backend logic in services/
4. Add API routes in routes/
5. Create frontend components and hooks
6. Test thoroughly

### Debugging
- Backend logs: Check server console
- Database inspection: Use sqlite3 CLI
- OpenAI calls: Log requests/responses in ai.service.ts
- Frontend errors: Check browser console and React Query devtools

### Performance Considerations
- Use React Query caching to minimize API calls
- Index database queries by date for fast lookups
- Debounce voice input to avoid excessive processing
- Keep OpenAI responses concise to reduce costs

## Security Notes
- OpenAI API key must be in .env (never commit to git)
- Validate all user input before database insertion
- Sanitize transcript data to prevent injection attacks
- Use parameterized queries for SQLite operations

---

**Last Updated**: February 2026
**Project Type**: Portfolio Project (First Project)
**Status**: In Development
