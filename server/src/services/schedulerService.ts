/**
 * Scheduler Service — Manages scheduled audits using setInterval-based scheduling.
 * Maintains an in-memory schedule map and fires audits at the configured times.
 */

import AuditSchedule from '../models/AuditSchedule';
import * as auditService from './auditService';

// In-memory map of active timers: projectId -> intervalId
const activeTimers = new Map<string, ReturnType<typeof setInterval>>();

const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

/**
 * Calculate the next run time for a schedule.
 */
function calculateNextRun(frequency: string, dayOfWeek: number | null, dayOfMonth: number | null): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(3, 0, 0, 0); // Run at 3 AM

  if (frequency === 'weekly' && dayOfWeek !== null) {
    const currentDay = now.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    next.setDate(now.getDate() + daysUntil);
  } else if (frequency === 'monthly' && dayOfMonth !== null) {
    const currentMonthDay = now.getDate();
    if (currentMonthDay >= dayOfMonth) {
      next.setMonth(now.getMonth() + 1);
    }
    next.setDate(dayOfMonth);
  }

  return next;
}

/**
 * Projects whose seeded audit data must remain immutable.
 * Scheduled audits are skipped for these projects so the fixed audit
 * record is never overwritten with freshly computed values.
 */
const IMMUTABLE_AUDIT_PROJECT_URLS = ['techtimize.co'];

/**
 * Execute a scheduled audit for a project.
 */
async function executeScheduledAudit(projectId: string): Promise<void> {
  try {
    // Guard: skip scheduled audits for projects with immutable seeded audit data
    const Project = (await import('../models/Project')).default;
    const project = await Project.findById(projectId).lean();
    if (project) {
      const normalizedUrl = (project.url || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
      if (IMMUTABLE_AUDIT_PROJECT_URLS.some((u) => normalizedUrl.includes(u))) {
        console.log(`[scheduler] Skipping scheduled audit for immutable project ${projectId} (${project.name})`);
        return;
      }
    }

    console.log(`[scheduler] Running scheduled audit for project ${projectId}`);
    await auditService.createAudit(projectId);

    // Update last run and next run
    const schedule = await AuditSchedule.findOne({ projectId });
    if (schedule) {
      schedule.lastRunAt = new Date();
      schedule.nextRunAt = calculateNextRun(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth);
      await schedule.save();
    }

    console.log(`[scheduler] Scheduled audit triggered for project ${projectId}`);
  } catch (err) {
    console.error(`[scheduler] Failed to run scheduled audit for project ${projectId}:`, err);
  }
}

/**
 * Register a schedule timer for a project.
 */
function registerSchedule(projectId: string, frequency: string, dayOfWeek: number | null, dayOfMonth: number | null): void {
  // Clear existing timer if any
  const existing = activeTimers.get(projectId);
  if (existing) clearInterval(existing);

  const nextRun = calculateNextRun(frequency, dayOfWeek, dayOfMonth);
  const msUntilNext = nextRun.getTime() - Date.now();

  console.log(`[scheduler] Next audit for project ${projectId}: ${nextRun.toISOString()} (in ${Math.round(msUntilNext / 60000)} min)`);

  // Set a timeout for the first run, then use interval
  const timerId = setTimeout(() => {
    executeScheduledAudit(projectId);

    // After first run, set up recurring interval
    const intervalMs = frequency === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const intervalId = setInterval(() => {
      executeScheduledAudit(projectId);
    }, intervalMs);

    activeTimers.set(projectId, intervalId);
  }, Math.max(0, msUntilNext));

  activeTimers.set(projectId, timerId as unknown as ReturnType<typeof setInterval>);
}

/**
 * Initialize scheduler on server startup — load all active schedules from DB.
 */
export async function initializeScheduler(): Promise<void> {
  try {
    const schedules = await AuditSchedule.find({ isActive: true }).lean();
    console.log(`[scheduler] Loading ${schedules.length} active schedules...`);

    // Pre-load project URLs so we can filter out immutable projects
    const Project = (await import('../models/Project')).default;
    const projectIds = schedules.map((s) => s.projectId.toString());
    const projects = projectIds.length > 0
      ? await Project.find({ _id: { $in: projectIds } }, { url: 1, name: 1 }).lean()
      : [];
    const projectUrlMap = new Map(projects.map((p) => [String(p._id), (p.url || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')]));

    let skipped = 0;
    for (const schedule of schedules) {
      const pid = schedule.projectId.toString();
      const normalizedUrl = projectUrlMap.get(pid) || '';
      if (IMMUTABLE_AUDIT_PROJECT_URLS.some((u) => normalizedUrl.includes(u))) {
        console.log(`[scheduler] Skipping schedule for immutable project ${pid} (${schedule.projectId})`);
        skipped++;
        continue;
      }
      registerSchedule(
        pid,
        schedule.frequency,
        schedule.dayOfWeek,
        schedule.dayOfMonth,
      );
    }

    console.log(`[scheduler] Initialized with ${schedules.length - skipped} active schedules (${skipped} skipped — immutable)`);
  } catch (err) {
    console.error('[scheduler] Failed to initialize:', err);
  }
}

/**
 * Create or update a schedule for a project.
 */
export async function upsertSchedule(
  projectId: string,
  frequency: 'weekly' | 'monthly',
  dayOfWeek?: number,
  dayOfMonth?: number,
): Promise<any> {
  const mongoose = await import('mongoose');
  const pid = new mongoose.default.Types.ObjectId(projectId);

  const nextRunAt = calculateNextRun(frequency, dayOfWeek ?? null, dayOfMonth ?? null);

  const schedule = await AuditSchedule.findOneAndUpdate(
    { projectId: pid },
    {
      $set: {
        projectId: pid,
        frequency,
        dayOfWeek: dayOfWeek ?? null,
        dayOfMonth: dayOfMonth ?? null,
        isActive: true,
        nextRunAt,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  // Register the timer
  registerSchedule(projectId, frequency, dayOfWeek ?? null, dayOfMonth ?? null);

  return schedule;
}

/**
 * Get schedule for a project.
 */
export async function getSchedule(projectId: string) {
  const mongoose = await import('mongoose');
  const pid = new mongoose.default.Types.ObjectId(projectId);
  return AuditSchedule.findOne({ projectId: pid }).lean();
}

/**
 * Deactivate a schedule.
 */
export async function deactivateSchedule(projectId: string): Promise<void> {
  const mongoose = await import('mongoose');
  const pid = new mongoose.default.Types.ObjectId(projectId);

  await AuditSchedule.findOneAndUpdate(
    { projectId: pid },
    { $set: { isActive: false } },
  );

  // Clear timer
  const timer = activeTimers.get(projectId);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(projectId);
  }
}

/**
 * Delete a schedule.
 */
export async function deleteSchedule(projectId: string): Promise<void> {
  const mongoose = await import('mongoose');
  const pid = new mongoose.default.Types.ObjectId(projectId);

  await AuditSchedule.deleteOne({ projectId: pid });

  // Clear timer
  const timer = activeTimers.get(projectId);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(projectId);
  }
}
