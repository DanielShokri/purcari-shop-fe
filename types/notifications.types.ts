// Notification Types

export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ORDER = 'order',
  SYSTEM = 'system'
}

export interface Notification {
  $id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  icon?: string; // Material icon name
  createdAt: string;
}
