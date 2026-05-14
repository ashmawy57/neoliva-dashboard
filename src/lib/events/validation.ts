import { EventMetadataSchemas } from './schemas';
import { logger } from '../logger';

export function validateEvent(eventType: string, metadata: any): { success: boolean; error?: string } {
  const schema = EventMetadataSchemas[eventType];
  
  // If no schema defined, we allow it (soft validation for now)
  if (!schema) {
    return { success: true };
  }

  try {
    schema.parse(metadata);
    return { success: true };
  } catch (err: any) {
    const errorMessage = err.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || err.message;
    logger.warn('Event validation failed', { eventType, metadata, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}
