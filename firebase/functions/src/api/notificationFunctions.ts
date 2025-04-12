/**
 * Notification API Functions
 * Callable functions for notification management
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Notification } from '../../../../src/types/notification';
import { logInfo, logError, logWarn } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Gets notifications for the authenticated user
 * @param data Optional filters
 * @param context Function call context
 * @returns List of notifications
 */
export const getMyNotifications = functions.https.onCall(async (data: {
  limit?: number,
  unreadOnly?: boolean
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('getMyNotifications', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to view your notifications'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Get my notifications function called',
      context: 'getMyNotifications',
      data: { 
        userId: context.auth.uid,
        limit: data.limit,
        unreadOnly: data.unreadOnly
      }
    });
    
    // Set default limit
    const limit = data.limit || 50;
    
    // Build query
    let query = admin.firestore().collection('notifications')
      .where('userId', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    // Apply unread filter if requested
    if (data.unreadOnly) {
      query = admin.firestore().collection('notifications')
        .where('userId', '==', context.auth.uid)
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(limit);
    }
    
    // Execute query
    const notificationsSnapshot = await query.get();
    const notifications: Notification[] = [];
    
    notificationsSnapshot.forEach(doc => {
      const notification = doc.data() as Notification;
      notification.id = doc.id;
      notifications.push(notification);
    });
    
    // Log success
    logInfo({
      message: 'Notifications retrieved successfully',
      context: 'getMyNotifications',
      data: { 
        userId: context.auth.uid,
        count: notifications.length
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      count: notifications.length
    });
    
    return {
      success: true,
      notifications
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error retrieving notifications',
      context: 'getMyNotifications',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while retrieving notifications',
      error
    );
  }
});

/**
 * Marks a notification as read
 * @param data Notification ID
 * @param context Function call context
 * @returns Updated notification
 */
export const markNotificationRead = functions.https.onCall(async (data: {
  notificationId: string
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('markNotificationRead', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to update notifications'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Mark notification read function called',
      context: 'markNotificationRead',
      data: { 
        userId: context.auth.uid,
        notificationId: data.notificationId
      }
    });
    
    // Validate input
    if (!data.notificationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Notification ID is required'
      );
    }
    
    // Get the notification
    const notificationRef = admin.firestore().collection('notifications').doc(data.notificationId);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Notification not found'
      );
    }
    
    const notification = notificationDoc.data() as Notification;
    
    // Check if user owns this notification
    if (notification.userId !== context.auth.uid) {
      logWarn({
        message: 'Unauthorized attempt to mark notification as read',
        context: 'markNotificationRead',
        data: { 
          userId: context.auth.uid,
          notificationId: data.notificationId,
          notificationUserId: notification.userId
        }
      });
      
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only update your own notifications'
      );
    }
    
    // Check if already read
    if (notification.isRead) {
      return {
        success: true,
        notification
      };
    }
    
    // Update the notification
    await notificationRef.update({
      isRead: true
    });
    
    // Get updated notification
    const updatedNotificationDoc = await notificationRef.get();
    const updatedNotification = {
      ...updatedNotificationDoc.data() as Notification,
      id: updatedNotificationDoc.id
    };
    
    // Log success
    logInfo({
      message: 'Notification marked as read successfully',
      context: 'markNotificationRead',
      data: { 
        userId: context.auth.uid,
        notificationId: data.notificationId
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      notificationId: data.notificationId
    });
    
    return {
      success: true,
      notification: updatedNotification
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error marking notification as read',
      context: 'markNotificationRead',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while updating the notification',
      error
    );
  }
});

/**
 * Marks all notifications as read for the authenticated user
 * @param data Empty object
 * @param context Function call context
 * @returns Success status
 */
export const markAllNotificationsRead = functions.https.onCall(async (data, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('markAllNotificationsRead', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to update notifications'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Mark all notifications read function called',
      context: 'markAllNotificationsRead',
      data: { userId: context.auth.uid }
    });
    
    // Get unread notifications for the user
    const notificationsQuery = admin.firestore().collection('notifications')
      .where('userId', '==', context.auth.uid)
      .where('isRead', '==', false);
    
    const notificationsSnapshot = await notificationsQuery.get();
    
    if (notificationsSnapshot.empty) {
      // No unread notifications
      logInfo({
        message: 'No unread notifications found',
        context: 'markAllNotificationsRead',
        data: { userId: context.auth.uid }
      });
      
      // Stop performance tracking
      perfTracker.stop({ count: 0 });
      
      return {
        success: true,
        count: 0
      };
    }
    
    // Update all notifications in a batch
    const batch = admin.firestore().batch();
    
    notificationsSnapshot.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    
    // Log success
    logInfo({
      message: 'All notifications marked as read successfully',
      context: 'markAllNotificationsRead',
      data: { 
        userId: context.auth.uid,
        count: notificationsSnapshot.size
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      count: notificationsSnapshot.size
    });
    
    return {
      success: true,
      count: notificationsSnapshot.size
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error marking all notifications as read',
      context: 'markAllNotificationsRead',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while updating notifications',
      error
    );
  }
});
