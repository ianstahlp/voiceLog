import { Router, Request, Response } from 'express';
import {
  getLogsByDate,
  getLogById,
  updateLogEntry,
  deleteLogEntry,
} from '../services/logs.service.js';
import type { UpdateLogEntryRequest } from '../../../shared/types.js';

const router = Router();

/**
 * GET /api/logs?date=YYYY-MM-DD
 * Get all log entries for a specific date with daily summary
 */
router.get('/', (req: Request, res: Response): void => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date parameter is required (format: YYYY-MM-DD)' });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    const summary = getLogsByDate(date);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch logs',
    });
  }
});

/**
 * GET /api/logs/:id
 * Get a single log entry by ID
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid log ID' });
      return;
    }

    const logEntry = getLogById(id);

    if (!logEntry) {
      res.status(404).json({ error: 'Log entry not found' });
      return;
    }

    res.json(logEntry);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch log',
    });
  }
});

/**
 * PUT /api/logs/:id
 * Update a log entry (food items or exercise activities)
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid log ID' });
      return;
    }

    const { items } = req.body as UpdateLogEntryRequest;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Items array is required' });
      return;
    }

    const updatedEntry = updateLogEntry(id, items);

    if (!updatedEntry) {
      res.status(404).json({ error: 'Log entry not found' });
      return;
    }

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update log',
    });
  }
});

/**
 * DELETE /api/logs/:id
 * Delete a log entry
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid log ID' });
      return;
    }

    const deleted = deleteLogEntry(id);

    if (!deleted) {
      res.status(404).json({ error: 'Log entry not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete log',
    });
  }
});

export default router;
