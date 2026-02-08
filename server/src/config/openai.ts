import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('OpenAI client initialized successfully');
