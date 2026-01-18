// Analytics Types

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  USER_ACTION = 'user_action',
}

export interface AnalyticsEvent {
  $id: string;
  type: AnalyticsEventType | string;
  userId?: string;
  productId?: string;
  $createdAt: string;
  $updatedAt: string;
}

export type AnalyticsInterval = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsSummary {
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  topProducts: Array<{
    productId: string;
    productName: string;
    views: number;
  }>;
  retention: {
    week1: number; // % returning after 1 day
    week7: number; // % returning after 7 days
    week30: number; // % returning after 30 days
  };
}

export interface TimeSeriesDataPoint {
  name: string;
  value: number;
}
