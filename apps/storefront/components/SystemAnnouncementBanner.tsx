import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import { Info, AlertTriangle, CheckCircle, XCircle, Wrench, X } from 'lucide-react';
import { SystemAnnouncementType } from '@shared/types';

const DISMISSED_ANNOUNCEMENTS_KEY = 'purcari_dismissed_announcements';

// Type-based styling configuration
const typeStyles: Record<SystemAnnouncementType | string, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  stripeColor: string;
}> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-900/50',
    iconBg: 'bg-blue-100 dark:bg-blue-800/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    stripeColor: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-800/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-800 dark:text-amber-200',
    stripeColor: 'bg-amber-500',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    stripeColor: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-900/50',
    iconBg: 'bg-red-100 dark:bg-red-800/50',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    stripeColor: 'bg-red-500',
  },
  maintenance: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-900/50',
    iconBg: 'bg-orange-100 dark:bg-orange-800/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    textColor: 'text-orange-800 dark:text-orange-200',
    stripeColor: 'bg-orange-500',
  },
};

// Icon mapping by type
const typeIcons: Record<SystemAnnouncementType | string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  maintenance: Wrench,
};

interface AnnouncementData {
  _id: string;
  title: string;
  message: string;
  type: SystemAnnouncementType | string;
  isDismissible: boolean;
}

const SystemAnnouncementBanner: React.FC = () => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isHidden, setIsHidden] = useState(false);

  // Load dismissed announcement IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
      if (stored) {
        setDismissedIds(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load dismissed announcements:', error);
    }
  }, []);

  // Fetch active announcements
  const announcements = useQuery(api.systemAnnouncements.getActive);

  // Find the first non-dismissed announcement
  const activeAnnouncement = announcements?.find(
    (a: AnnouncementData) => !dismissedIds.has(a._id)
  );

  // Handle dismiss
  const handleDismiss = () => {
    if (!activeAnnouncement?.isDismissible) return;

    const newDismissedIds = new Set(dismissedIds);
    newDismissedIds.add(activeAnnouncement._id);
    setDismissedIds(newDismissedIds);
    setIsHidden(true);

    try {
      localStorage.setItem(
        DISMISSED_ANNOUNCEMENTS_KEY,
        JSON.stringify([...newDismissedIds])
      );
    } catch (error) {
      console.error('Failed to save dismissed announcement:', error);
    }
  };

  // Don't render if no announcement or hidden
  if (!activeAnnouncement || isHidden) {
    return null;
  }

  const styles = typeStyles[activeAnnouncement.type] || typeStyles.info;
  const IconComponent = typeIcons[activeAnnouncement.type] || Info;

  return (
    <div className={`w-full border-b ${styles.bg} ${styles.border}`} dir="rtl">
      <div className="container mx-auto px-4 py-2.5">
        <div className="relative flex items-center gap-3">
          {/* Colored stripe on right edge (RTL) */}
          <div className={`absolute top-0 end-0 w-1 h-full ${styles.stripeColor} rounded-full`} />

          {/* Icon circle */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg}`}>
            <IconComponent size={16} className={styles.iconColor} />
          </div>

          {/* Title and message */}
          <div className="flex-grow min-w-0">
            <span className={`font-bold text-sm ${styles.textColor}`}>
              {activeAnnouncement.title}
            </span>
            {activeAnnouncement.title !== activeAnnouncement.message && (
              <span className={`text-sm ${styles.textColor} opacity-80 me-2`}>
                {' — '}{activeAnnouncement.message}
              </span>
            )}
          </div>

          {/* Close button - only if dismissible */}
          {activeAnnouncement.isDismissible && (
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer ${styles.iconColor}`}
              aria-label="סגור הודעה"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAnnouncementBanner;
