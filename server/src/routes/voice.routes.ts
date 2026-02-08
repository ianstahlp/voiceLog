import { Router, Request, Response } from 'express';
import { processVoiceTranscript } from '../services/ai.service.js';
import { createFoodLog, createOrMergeExerciseLog } from '../services/logs.service.js';
import type { ProcessVoiceRequest, LogEntry } from '../shared/types.js';

const router = Router();

/**
 * POST /api/voice/process
 * Process a voice transcript and create log entries (can create multiple if both food and exercise mentioned)
 */
router.post('/process', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcript, date, mergeExercises } = req.body as ProcessVoiceRequest;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      res.status(400).json({ error: 'Transcript is required and must be a non-empty string' });
      return;
    }

    // Process transcript with AI (can return multiple results for food + exercise)
    const processedDataArray = await processVoiceTranscript(transcript);

    // Create log entries for each result
    const logEntries: LogEntry[] = [];

    for (const processedData of processedDataArray) {
      if (processedData.type === 'food') {
        const logEntry = createFoodLog(transcript, processedData.data, date);
        logEntries.push(logEntry);
      } else {
        const logEntry = createOrMergeExerciseLog(transcript, processedData.data, date, mergeExercises);
        logEntries.push(logEntry);
      }
    }

    // Return all created entries
    res.status(201).json({ logEntries });
  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process voice transcript',
    });
  }
});

export default router;
