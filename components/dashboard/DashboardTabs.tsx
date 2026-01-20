import React from 'react';
import { Package, Settings, MapPin, LucideIcon } from 'lucide-react';

export type TabId = 'orders' | 'profile' | 'addresses';

export interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export const dashboardTabs: Tab[] = [
  { id: 'orders', label: 'ההזמנות שלי', icon: Package },
  { id: 'profile', label: 'פרטים אישיים', icon: Settings },
  { id: 'addresses', label: 'ניהול כתובות', icon: MapPin },
];

interface DashboardTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
      {dashboardTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === tab.id 
            ? 'border-secondary text-secondary' 
            : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <tab.icon size={20} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default DashboardTabs;
