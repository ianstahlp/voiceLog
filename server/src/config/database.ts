import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/voicelog.db');
const dbDir = path.dirname(dbPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created database directory: ${dbDir}`);
}

// Initialize database connection
const db: Database.Database = new Database(dbPath);
console.log(`Database connected: ${dbPath}`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS log_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('food', 'exercise')),
    meal_type TEXT,
    raw_transcript TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
  CREATE INDEX IF NOT EXISTS idx_log_entries_type ON log_entries(type);

  CREATE TABLE IF NOT EXISTS food_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_entry_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL,
    unit TEXT,
    calories INTEGER NOT NULL,
    protein REAL,
    carbs REAL,
    fat REAL,
    notes TEXT,
    FOREIGN KEY (log_entry_id) REFERENCES log_entries(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_food_items_log_entry ON food_items(log_entry_id);

  CREATE TABLE IF NOT EXISTS exercise_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_entry_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    duration_minutes INTEGER,
    intensity TEXT CHECK(intensity IN ('light', 'moderate', 'intense')),
    calories_burned INTEGER NOT NULL,
    distance REAL,
    notes TEXT,
    FOREIGN KEY (log_entry_id) REFERENCES log_entries(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_exercise_log_entry ON exercise_activities(log_entry_id);
`);

console.log('Database schema initialized successfully');

export default db;
