/**
 * Performance tracking utility for the Health Appointment System
 * Provides a simple way to measure and log execution times
 */

import { logInfo } from './logger';

/**
 * Interface for the object returned by trackPerformance
 */
export interface PerformanceTracker {
  /**
   * Stops the performance tracking and logs the duration
   * @param additionalData Optional data to include in the log
   * @returns The duration in milliseconds
   */
  stop: (additionalData?: Record<string, unknown>) => number;
}

/**
 * Tracks the performance of an operation
 * @param label A descriptive label for the operation being tracked
 * @param context Optional context to include in the log (e.g., 'DatabaseService')
 * @returns An object with a stop() method to end tracking and log the duration
 */
export const trackPerformance = (
  label: string,
  context?: string
): PerformanceTracker => {
  // Use performance.now() for high-resolution timing
  const startTime = performance.now();
  
  return {
    stop: (additionalData?: Record<string, unknown>): number => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log the performance data using the logger
      logInfo({
        message: `${label} took ${duration.toFixed(2)} ms`,
        context: context || 'PERF',
        data: {
          duration,
          label,
          ...additionalData
        }
      });
      
      return duration;
    }
  };
};

/**
 * Default export for convenient importing
 */
export default {
  trackPerformance
};
