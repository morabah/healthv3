import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Notification, NotificationType } from '../../../../src/types/notification';
import { logInfo, logError } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Creates a new notification in Firestore
 * @param data Notification data
 * @returns Promise resolving to the created notification
 */
export const createNotification = async (
  data: Notification
): Promise<Notification> => {
  // Log function start
  logInfo({
    message: 'Creating notification',
    context: 'notificationManagement',
    data: { userId: data.userId, type: data.type, title: data.title }
  });

  // Track performance
  const perfTracker = trackPerformance('createNotification', 'notificationManagement');

  try {
    // Validate required fields
    if (!data.userId || !data.title || !data.message) {
      throw new Error('userId, title, and message are required for notification');
    }

    // Set defaults if not provided
    const notificationWithDefaults = {
      ...data,
      isRead: data.isRead !== undefined ? data.isRead : false,
      createdAt: data.createdAt || Timestamp.now() as any,
      type: data.type || NotificationType.SYSTEM,
      relatedId: data.relatedId || null
    };

    // Create document reference
    const notificationRef = admin.firestore().collection('notifications').doc();
    const notificationWithId = { ...notificationWithDefaults, id: notificationRef.id };

    // Save to Firestore
    await notificationRef.set(notificationWithId);

    // Log success
    logInfo({
      message: 'Notification created successfully',
      context: 'notificationManagement',
      data: { notificationId: notificationRef.id, userId: data.userId }
    });

    // Stop performance tracking
    perfTracker.stop({ notificationId: notificationRef.id });

    return notificationWithId;
  } catch (error) {
    // Log error
    logError({
      message: 'Error creating notification',
      context: 'notificationManagement',
      data: { userId: data.userId, error }
    });

    // Stop performance tracking with error info
    perfTracker.stop({ userId: data.userId, error: true });

    // Re-throw the error for the caller to handle
    throw error;
  }
};
