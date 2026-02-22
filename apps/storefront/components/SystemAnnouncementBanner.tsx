import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import { Info, AlertTriangle, CheckCircle, XCircle, Wrench, X } from 'lucide-react';
import { SystemAnnouncementType } from '@shared/types';

const DISMISSED_ANNOUNCEMENTS_KEY = 'purcari_dismissed_announcements';

// Type-based styling — use inline styles to avoid Tailwind v4 purging dynamic class strings
const typeConfig: Record<SystemAnnouncementType | string, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  stripeColor: string;
}> = {
  info: {
    bg: '#eff6ff',        // blue-50
    border: '#bfdbfe',    // blue-200
    iconBg: '#dbeafe',    // blue-100
    iconColor: '#2563eb', // blue-600
    textColor: '#1e40af', // blue-800
    stripeColor: '#3b82f6', // blue-500
  },
  warning: {
    bg: '#fffbeb',        // amber-50
    border: '#fde68a',    // amber-200
    iconBg: '#fef3c7',    // amber-100
    iconColor: '#d97706', // amber-600
    textColor: '#92400e', // amber-800
    stripeColor: '#f59e0b', // amber-500
  },
  success: {
    bg: '#ecfdf5',        // emerald-50
    border: '#a7f3d0',    // emerald-200
    iconBg: '#d1fae5',    // emerald-100
    iconColor: '#059669', // emerald-600
    textColor: '#065f46', // emerald-800
    stripeColor: '#10b981', // emerald-500
  },
  error: {
    bg: '#fef2f2',        // red-50
    border: '#fecaca',    // red-200
    iconBg: '#fee2e2',    // red-100
    iconColor: '#dc2626', // red-600
    textColor: '#991b1b', // red-800
    stripeColor: '#ef4444', // red-500
  },
  maintenance: {
    bg: '#fff7ed',        // orange-50
    border: '#fed7aa',    // orange-200
    iconBg: '#ffedd5',    // orange-100
    iconColor: '#ea580c', // orange-600
    textColor: '#9a3412', // orange-800
    stripeColor: '#f97316', // orange-500
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

  const cfg = typeConfig[activeAnnouncement.type] || typeConfig.info;
  const IconComponent = typeIcons[activeAnnouncement.type] || Info;

  return (
    <div
      dir="rtl"
      style={{
        backgroundColor: cfg.bg,
        borderBottom: `1px solid ${cfg.border}`,
      }}
      className="w-full"
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="relative flex items-center gap-3">
          {/* Colored stripe on right edge (RTL) */}
          <div
            className="absolute top-0 end-0 w-1 h-full rounded-full"
            style={{ backgroundColor: cfg.stripeColor }}
          />

          {/* Icon circle */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: cfg.iconBg }}
          >
            <IconComponent size={16} style={{ color: cfg.iconColor }} />
          </div>

          {/* Title and message */}
          <div className="flex-grow min-w-0">
            <span className="font-bold text-sm" style={{ color: cfg.textColor }}>
              {activeAnnouncement.title}
            </span>
            {activeAnnouncement.title !== activeAnnouncement.message && (
              <span className="text-sm opacity-80 me-2" style={{ color: cfg.textColor }}>
                {' — '}{activeAnnouncement.message}
              </span>
            )}
          </div>

          {/* Close button - only if dismissible */}
          {activeAnnouncement.isDismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
              style={{ color: cfg.iconColor }}
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
