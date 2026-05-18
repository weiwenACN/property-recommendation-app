import { Search, Bookmark, ArrowLeftRight, User } from 'lucide-react';

export type BottomNavTab = 'search' | 'bookmarks' | 'compare' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'bookmarks' as const, icon: Bookmark, label: 'Bookmarks' },
    { id: 'compare' as const, icon: ArrowLeftRight, label: 'Compare' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 pb-safe">
      <div className="grid grid-cols-4 gap-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-1 py-2 transition-colors min-h-[44px]"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-[#ff6b35]' : 'text-gray-600'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && tab.id === 'bookmarks' ? 'currentColor' : 'none'}
              />
              <span
                className={`text-xs ${
                  isActive ? 'text-[#ff6b35] font-medium' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
