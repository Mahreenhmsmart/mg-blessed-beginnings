/**
 * One-off script to update the primary Google provider's model to gemini-3.5-flash-lite.
 * 
 * Usage: npx tsx server/src/scripts/updateModel.ts
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Updates the primary Google provider's modelName to "gemini-3.5-flash-lite"
 * 3. Disconnects and exits
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Load environment variables from project root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function updateGoogleProviderModel(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI not found in environment variables');
    process.exit(1);
  }

  console.log('[UPDATE MODEL] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('[UPDATE MODEL] Connected successfully');

  try {
    // Import the model after connection is established
    const AIProviderConfig = (await import('../models/AIProviderConfig')).default;

    // Find all Google providers
    const googleProviders = await AIProviderConfig.find({ provider: 'google' });
    
    if (googleProviders.length === 0) {
      console.log('[UPDATE MODEL] No Google providers found in database');
      return;
    }

    console.log(`[UPDATE MODEL] Found ${googleProviders.length} Google provider(s)`);

    // Update each Google provider to use gemini-3.5-flash-lite
    for (const provider of googleProviders) {
      const oldModel = provider.modelName;
      
      // Only update if currently using gemini-2.5-flash or similar deprecated models
      if (oldModel.includes('gemini-2.5-flash') || oldModel.includes('gemini-2.0-flash')) {
        console.log(`[UPDATE MODEL] Updating provider ${provider._id}: ${oldModel} → gemini-3.5-flash-lite`);
        
        await AIProviderConfig.findByIdAndUpdate(provider._id, {
          $set: { modelName: 'gemini-3.5-flash-lite' }
        });
        
        console.log(`[UPDATE MODEL] ✓ Successfully updated provider ${provider._id}`);
      } else if (oldModel === 'gemini-3.5-flash-lite') {
        console.log(`[UPDATE MODEL] Provider ${provider._id} already using gemini-3.5-flash-lite`);
      } else {
        console.log(`[UPDATE MODEL] Skipping provider ${provider._id} (model: ${oldModel})`);
      }
    }

    // Verify the update
    const updatedProviders = await AIProviderConfig.find({ 
      provider: 'google',
      modelName: 'gemini-3.5-flash-lite'
    });
    
    console.log(`[UPDATE MODEL] Verification: ${updatedProviders.length} Google provider(s) now using gemini-3.5-flash-lite`);
    
    if (updatedProviders.length > 0) {
      const primary = updatedProviders.find(p => p.isPrimary);
      if (primary) {
        console.log(`[UPDATE MODEL] ✓ Primary Google provider is now using gemini-3.5-flash-lite`);
      }
    }

  } catch (err) {
    console.error('[UPDATE MODEL] Error during update:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log('[UPDATE MODEL] Disconnected from MongoDB');
  }
}

// Run the update
updateGoogleProviderModel()
  .then(() => {
    console.log('[UPDATE MODEL] Script completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[UPDATE MODEL] Script failed:', err);
    process.exit(1);
  });
