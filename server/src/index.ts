// Touch for dev server restart — Gemini model discovery added
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolves __dirname in ES modules and loads .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate environment variables before any other initialization
import { validateAndLogEnvironment } from './config/validateEnv';
validateAndLogEnvironment();

import mongoose from 'mongoose';
import { seedData } from './seed';
import { initializeScheduler } from './services/schedulerService';
import { discoverBestFlashModel, generateCompletion, getLastGenerationDiagnostic, runAIStartupHealthCheck } from './services/aiService';
import app from './app';

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT: number = Number(process.env.PORT) || 5000;
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/my_db';
const isProduction = process.env.NODE_ENV === 'production';

// ─── DB + Server Bootstrap ────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    const connectOptions: Record<string, unknown> = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    if (isProduction) {
      connectOptions.autoIndex = false;
    }

    await mongoose.connect(MONGO_URI, connectOptions);
    console.log('[DB] Connected to MongoDB');

    // Discover best available Gemini Flash model at runtime (before seeding)
    await discoverBestFlashModel();

    // Run seeders
    await seedData();

    // ─── AI Provider Health Check ──────────────────────────────────────────
    // Runs BEFORE the self-test to provide detailed diagnostic information
    // about which providers are available and why resolution may fail.
    await runAIStartupHealthCheck();

    // ─── AI Self-Test ──────────────────────────────────────────────────────
    // Runs automatically at startup so diagnostics are always visible in logs.
    try {
      console.log('[AI-SELF-TEST] ╔══════════════════════════════════════════╗');
      console.log('[AI-SELF-TEST] ║   Startup AI Self-Test                 ║');
      console.log('[AI-SELF-TEST] ╚══════════════════════════════════════════╝');
      console.log('[AI-SELF-TEST] Running test generation...');

      const selfTestStart = Date.now();
      const response = await generateCompletion('Reply with exactly: OK', { maxTokens: 10 });
      const selfTestDuration = Date.now() - selfTestStart;

      const diag = getLastGenerationDiagnostic();

      console.log('[AI-SELF-TEST] ✓ SUCCESS');
      console.log(`[AI-SELF-TEST]   Provider:     ${diag?.resolvedProvider ?? 'unknown'}`);
      console.log(`[AI-SELF-TEST]   Model:        ${diag?.resolvedModel ?? 'unknown'}`);
      console.log(`[AI-SELF-TEST]   Key source:   ${diag?.keySource ?? 'unknown'}`);
      console.log(`[AI-SELF-TEST]   Key prefix:   ${diag?.keyPrefix ?? 'N/A'}****`);
      console.log(`[AI-SELF-TEST]   Response:     "${response.trim()}"`);
      console.log(`[AI-SELF-TEST]   Duration:     ${(selfTestDuration / 1000).toFixed(2)}s`);
      console.log('[AI-SELF-TEST] AI is operational.');
    } catch (selfTestErr) {
      const diag = getLastGenerationDiagnostic();
      console.error('[AI-SELF-TEST] ✗ FAILED');
      console.error(`[AI-SELF-TEST]   Provider:       ${diag?.resolvedProvider ?? 'unknown'}`);
      console.error(`[AI-SELF-TEST]   Model:          ${diag?.resolvedModel ?? 'unknown'}`);
      console.error(`[AI-SELF-TEST]   Key source:     ${diag?.keySource ?? 'unknown'}`);
      console.error(`[AI-SELF-TEST]   Key prefix:     ${diag?.keyPrefix ?? 'N/A'}****`);
      console.error(`[AI-SELF-TEST]   Error message:  ${selfTestErr instanceof Error ? selfTestErr.message : String(selfTestErr)}`);

      if (selfTestErr && typeof selfTestErr === 'object') {
        const errObj = selfTestErr as Record<string, unknown>;
        if ('httpStatus' in errObj) console.error(`[AI-SELF-TEST]   HTTP status:    ${errObj.httpStatus}`);
        if ('category' in errObj) console.error(`[AI-SELF-TEST]   Error category: ${errObj.category}`);
      }

      if (diag && diag.errorDetails.length > 0) {
        console.error(`[AI-SELF-TEST]   Fallback chain (${diag.providersTried.length} provider(s) tried):`);
        diag.errorDetails.forEach((detail, idx) => {
          console.error(`[AI-SELF-TEST]     ${idx + 1}. ${detail.provider}: [${detail.category}] HTTP ${detail.httpStatus ?? 'N/A'} — ${detail.message.slice(0, 150)}`);
        });
      } else {
        console.error(`[AI-SELF-TEST]   Providers tried: ${diag?.providersTried?.join(', ') ?? 'none'}`);
      }

      console.error('[AI-SELF-TEST] AI is NOT operational — tool generation will fail until this is resolved.');
    }

    // Initialize scheduled audits
    await initializeScheduler();

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
    });
  } catch (err) {
    console.error('[STARTUP] Failed to start server:', err);
    process.exit(1);
  }
}

start();
