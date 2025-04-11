import { Timestamp } from 'firebase/firestore';

/**
 * Notification Types
 * Common notification types used in the system
 */
export enum NotificationType {
  APPOINTMENT = 'appointment',
  VERIFICATION = 'verification',
  SYSTEM = 'system',
  MESSAGE = 'message',
  REMINDER = 'reminder'
}

/**
 * Notification Interface
 * Represents a notification sent to a user
 */
export interface Notification {
  /** Firestore document ID (optional for new notifications) */
  id?: string;
  
  /** Reference to the recipient's UserProfile.id */
  userId: string;
  
  /** Notification title */
  title: string;
  
  /** Notification message content */
  message: string;
  
  /** Whether the notification has been read by the user */
  isRead: boolean;
  
  /** Timestamp when the notification was created */
  createdAt: Timestamp;
  
  /** Type of notification (e.g., 'appointment', 'verification', 'system') */
  type: string;
  
  /** Reference to related entity ID (e.g., appointment ID) */
  relatedId: string | null;
}

/**
 * Creates a new notification with default values
 * @param userId Reference to the recipient's UserProfile.id
 * @param title Notification title
 * @param message Notification message content
 * @param type Type of notification
 * @param data Additional partial notification data
 * @returns A complete Notification object with defaults applied
 */
export function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string = NotificationType.SYSTEM,
  data: Partial<Omit<Notification, 'userId' | 'title' | 'message' | 'type' | 'isRead' | 'createdAt'>> = {}
): Notification {
  return {
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: Timestamp.now(),
    relatedId: null,
    ...data
  };
}

/**
 * Marks a notification as read
 * @param notification The notification to mark as read
 * @returns A new Notification object with isRead set to true
 */
export function markNotificationAsRead(notification: Notification): Notification {
  return {
    ...notification,
    isRead: true
  };
}
