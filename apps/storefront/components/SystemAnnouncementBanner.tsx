import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import { X } from 'lucide-react';
import { SystemAnnouncementType } from '@shared/types';

const DISMISSED_ANNOUNCEMENTS_KEY = 'purcari_dismissed_announcements';

// Solid, bold background colors — standard ecommerce announcement bar style
const typeConfig: Record<SystemAnnouncementType | string, {
  bg: string;
  text: string;
  closeHover: string;
}> = {
  info: {
    bg: '#1e3a5f',       // deep navy — premium, informational
    text: '#ffffff',
    closeHover: 'rgba(255,255,255,0.15)',
  },
  warning: {
    bg: '#b45309',       // rich amber-brown
    text: '#ffffff',
    closeHover: 'rgba(255,255,255,0.15)',
  },
  success: {
    bg: '#065f46',       // deep emerald
    text: '#ffffff',
    closeHover: 'rgba(255,255,255,0.15)',
  },
  error: {
    bg: '#991b1b',       // deep red
    text: '#ffffff',
    closeHover: 'rgba(255,255,255,0.15)',
  },
  maintenance: {
    bg: '#7c2d12',       // deep orange-brown
    text: '#ffffff',
    closeHover: 'rgba(255,255,255,0.15)',
  },
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

  const announcements = useQuery(api.systemAnnouncements.getActive);

  const activeAnnouncement = announcements?.find(
    (a: AnnouncementData) => !dismissedIds.has(a._id)
  );

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

  if (!activeAnnouncement || isHidden) {
    return null;
  }

  const cfg = typeConfig[activeAnnouncement.type] || typeConfig.info;

  return (
    <div
      dir="rtl"
      style={{ backgroundColor: cfg.bg }}
      className="w-full"
    >
      {/* Relative container so the dismiss button can be absolutely pinned to the start edge (RTL = left) */}
      <div className="relative flex items-center justify-center px-10 py-2.5 min-h-[40px]">

        {/* Centered text */}
        <p
          className="text-sm font-medium text-center leading-tight"
          style={{ color: cfg.text }}
        >
          {activeAnnouncement.title}
          {activeAnnouncement.title !== activeAnnouncement.message && (
            <span className="opacity-80">
              {' — '}{activeAnnouncement.message}
            </span>
          )}
        </p>

        {/* Dismiss button — absolute, pinned to start edge (left in RTL) */}
        {activeAnnouncement.isDismissible && (
          <button
            onClick={handleDismiss}
            aria-label="סגור הודעה"
            className="absolute start-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors cursor-pointer"
            style={{ color: cfg.text }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = cfg.closeHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SystemAnnouncementBanner;
