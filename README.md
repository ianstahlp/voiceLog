# AI Voice Log 🎤

[![CI](https://github.com/YOUR_USERNAME/voiceLog/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/voiceLog/actions/workflows/ci.yml)
[![Deploy Railway](https://github.com/YOUR_USERNAME/voiceLog/actions/workflows/deploy-railway.yml/badge.svg)](https://github.com/YOUR_USERNAME/voiceLog/actions/workflows/deploy-railway.yml)
[![Deploy Vercel](https://github.com/YOUR_USERNAME/voiceLog/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/YOUR_USERNAME/voiceLog/actions/workflows/deploy-vercel.yml)
![Tech Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-purple)
![Tests](https://img.shields.io/badge/Tests-19%20passing-brightgreen)

> An AI-powered voice logging application for tracking food intake and exercise

This is a full-stack TypeScript application that allows users to speak naturally about their meals and workouts, with GPT-4 extracting structured data (calories, macros, exercise duration) into a local SQLite database. Built as a portfolio project showcasing modern web development with AI integration.

## ✨ Features

- 🎤 **Voice Input** - Speak naturally using your browser's Web Speech API
- 🤖 **AI Data Extraction** - GPT-4 function calling extracts structured data from natural language
- 📊 **Calorie Tracking** - Automatic calorie estimates for food and exercise
- ✏️ **Editable Entries** - Modify logged values after AI processing
- 📅 **Daily Tracker** - View daily summaries with total calories in/out
- 📱 **Responsive Design** - Works beautifully on desktop, tablet, and mobile

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────▶│  Express API │─────▶│  OpenAI API │
│ (React + TS)│      │  (Node + TS) │      │   (GPT-4)   │
└─────────────┘      └──────────────┘      └─────────────┘
      │                      │
      │                      │
      ▼                      ▼
┌─────────────┐      ┌──────────────┐
│ Web Speech  │      │    SQLite    │
│     API     │      │   Database   │
└─────────────┘      └──────────────┘
```

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast development
- **React Router** for navigation
- **React Query** for server state management
- **Zustand** for client state management
- **Axios** for API calls
- **Lucide React** for beautiful icons
- **date-fns** for date manipulation
- **React Hot Toast** for notifications

### Backend
- **Node.js 20+** with TypeScript
- **Express.js** for the REST API
- **Better-SQLite3** for local data persistence
- **OpenAI SDK** for GPT-4 function calling
- **Zod** for runtime validation
- **CORS** for cross-origin requests

### AI Integration
- **GPT-4 Function Calling** for structured data extraction
- Custom prompts optimized for nutrition and fitness data

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed ([Download here](https://nodejs.org/))
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Chrome, Edge, or Firefox** (for Web Speech API support)

## ⚙️ Installation

### 1. Clone the Repository

```bash
cd ~/portfolio/voiceLog
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-api-key-here
PORT=3001
NODE_ENV=development
DATABASE_PATH=./server/data/voicelog.db
CLIENT_URL=http://localhost:5173
```

## 🎯 Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Run Separately

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## 📖 Usage

### Logging Food

1. Click the microphone button
2. Say something like:
   - "I ate two scrambled eggs and a banana"
   - "I had a chicken salad with olive oil for lunch"
   - "I just had a protein shake with 30 grams of protein"

3. The AI will extract:
   - Food items
   - Quantities and units
   - Calorie estimates
   - Macros (protein, carbs, fat)

### Logging Exercise

1. Click the microphone button
2. Say something like:
   - "I ran for 30 minutes"
   - "I did an hour of yoga"
   - "I went swimming for 45 minutes at moderate intensity"

3. The AI will extract:
   - Activity type
   - Duration
   - Intensity level
   - Calories burned estimate

### Editing Entries

1. Click the edit button (pencil icon) on any entry
2. Modify calories, quantities, macros, or duration
3. Click "Save Changes"

### Viewing Daily Summary

1. Click "View All" or navigate to the Daily Log page
2. Use the date navigation to browse different days
3. View total calories consumed, burned, and net balance

## 🗂️ Project Structure

```
voiceLog/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── VoiceInput.tsx
│   │   │   ├── LogEntry.tsx
│   │   │   ├── EditModal.tsx
│   │   │   └── DailySummary.tsx
│   │   ├── pages/           # Route pages
│   │   │   ├── HomePage.tsx
│   │   │   └── DailyLogPage.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useVoiceRecording.ts
│   │   │   └── useLogEntries.ts
│   │   ├── services/        # API client
│   │   │   └── api.ts
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/         # Database and OpenAI setup
│   │   │   ├── database.ts
│   │   │   └── openai.ts
│   │   ├── routes/         # API routes
│   │   │   ├── voice.routes.ts
│   │   │   └── logs.routes.ts
│   │   ├── services/       # Business logic
│   │   │   ├── ai.service.ts
│   │   │   └── logs.service.ts
│   │   └── index.ts       # Express app entry
│   └── package.json
│
├── shared/                 # Shared types
│   └── types.ts
│
├── claude.md              # Project context for Claude
├── .env                   # Environment variables
├── .gitignore
└── README.md
```

## 🔧 API Endpoints

### Voice Processing
```http
POST /api/voice/process
Content-Type: application/json

{
  "transcript": "I ate two scrambled eggs",
  "date": "2026-02-07" (optional)
}
```

### Get Daily Logs
```http
GET /api/logs?date=2026-02-07
```

### Update Entry
```http
PUT /api/logs/:id
Content-Type: application/json

{
  "items": [...]
}
```

### Delete Entry
```http
DELETE /api/logs/:id
```

## 🗄️ Database Schema

### log_entries
- Main log records with date, timestamp, type (food|exercise), raw transcript

### food_items
- Linked to log_entries
- Fields: name, quantity, unit, calories, protein, carbs, fat

### exercise_activities
- Linked to log_entries
- Fields: activity_type, duration_minutes, intensity, calories_burned, distance

## 🧪 Testing

### Automated Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Visual test UI
npm run test:ui
```

**Current Coverage:**
- ✅ **19 passing tests** for calorie estimation utility
- ✅ Duration-based calculations (walking, running, boxing, ballet)
- ✅ Distance-based calculations (miles for running/walking)
- ✅ All intensity levels (light, moderate, intense)
- ✅ Edge cases and validation

### Manual Testing Checklist

- [ ] Voice recording works in Chrome
- [ ] AI correctly classifies food vs exercise
- [ ] Multiple items in one transcript are parsed
- [ ] Edit modal saves changes to database
- [ ] Daily totals calculate correctly
- [ ] Date navigation loads correct entries
- [ ] Delete entry works and updates totals

### Example Test Flow

1. Start the application
2. Say: "I ate two scrambled eggs and a banana"
3. Verify entry appears with ~245 calories
4. Click edit and change banana calories to 120
5. Navigate to daily log
6. Verify totals update correctly
7. Say: "I ran for 30 minutes"
8. Verify exercise entry with ~300 calories burned
9. Check net calories calculation

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration and deployment.

### Continuous Integration

On every push and pull request:
- ✅ **Run Tests** - All tests for server and client
- ✅ **Type Check** - TypeScript compilation verification
- ✅ **Lint Code** - ESLint checks for code quality
- ✅ **Build Verification** - Ensure production build succeeds
- ✅ **Test Coverage** - Generate and report coverage

### Continuous Deployment

On push to `main` branch:
- 🚀 **Auto-deploy Server** to Railway
- 🚀 **Auto-deploy Client** to Vercel

### GitHub Secrets Required

For automated deployment, add these secrets to your GitHub repository:

**Railway (Backend):**
- `RAILWAY_TOKEN` - Get from [Railway dashboard](https://railway.app/account/tokens)
- `RAILWAY_SERVICE_ID` - Get from Railway project settings

**Vercel (Frontend):**
- `VERCEL_TOKEN` - Get from [Vercel dashboard](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - Found in `.vercel/project.json` after first deployment
- `VERCEL_PROJECT_ID` - Found in `.vercel/project.json` after first deployment

## 🚀 Deployment

### Prerequisites
- GitHub repository
- Railway account
- Vercel account
- OpenAI API key

### Backend Deployment (Railway)

1. **Create Railway Project**
   - Visit [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository and the `server` directory

2. **Configure Environment Variables**
   ```
   OPENAI_API_KEY=your_openai_key
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-domain.vercel.app
   PORT=3001
   ```

3. **Deploy**
   ```bash
   # Automatic via GitHub Actions
   git push origin main

   # Or manual deployment
   npm install -g @railway/cli
   railway login
   cd server
   railway up
   ```

4. **Get your Railway URL**: `https://your-service.railway.app`

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Link Project**
   ```bash
   cd client
   vercel login
   vercel link
   ```

3. **Configure Environment Variable**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL=https://your-railway-url.railway.app/api`

4. **Deploy**
   ```bash
   # Automatic via GitHub Actions
   git push origin main

   # Or manual deployment
   vercel --prod
   ```

5. **Get your Vercel URL**: `https://your-project.vercel.app`

### Post-Deployment

1. Update `CLIENT_URL` in Railway to match your Vercel domain
2. Test the deployed application
3. Update README badges with your GitHub username
4. Share your portfolio project! 🎉

## 🐛 Troubleshooting

### Voice Input Not Working

- **Issue**: Microphone button disabled or error message
- **Solution**:
  - Use Chrome, Edge, or Firefox (Safari has limited support)
  - Grant microphone permissions when prompted
  - Check browser console for errors

### OpenAI API Errors

- **Issue**: "Failed to process transcript"
- **Solution**:
  - Verify your API key in `.env`
  - Check you have credits in your OpenAI account
  - Ensure you're not rate-limited

### Database Errors

- **Issue**: Cannot read/write to database
- **Solution**:
  - Check that `server/data/` directory exists
  - Verify file permissions
  - Delete `voicelog.db` to reset (will lose data)

### Port Already in Use

- **Issue**: `EADDRINUSE` error
- **Solution**:
  ```bash
  # Find process using port 3001
  lsof -i :3001

  # Kill the process
  kill -9 <PID>
  ```

## 🎨 Customization

### Changing Colors

Edit [client/src/App.css](client/src/App.css):

```css
.app {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Adjusting AI Prompts

Edit [server/src/services/ai.service.ts](server/src/services/ai.service.ts#L74):

```typescript
const systemPrompt = `Your custom prompt here...`;
```

## 📝 Future Enhancements

- [ ] Weekly/monthly statistics with charts
- [ ] Meal photos with GPT-4 Vision analysis
- [ ] Nutrition goals and progress tracking
- [ ] Export data to CSV
- [ ] Multi-user support with authentication
- [ ] Mobile app (React Native)
- [ ] Barcode scanner for packaged foods

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [OpenAI GPT-4](https://openai.com/)
- Icons by [Lucide](https://lucide.dev/)
- Voice input powered by Web Speech API

---

**Made with ❤️ as a portfolio project**

For questions or feedback, feel free to open an issue!
