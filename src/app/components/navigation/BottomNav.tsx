import { Search, Bookmark, ArrowLeftRight, Clock, User } from 'lucide-react';

export type BottomNavTab = 'search' | 'bookmarks' | 'compare' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  /** Optional unread / "needs attention" badge count per tab. */
  badges?: Partial<Record<BottomNavTab, number>>;
}

export function BottomNav({ activeTab, onTabChange, badges }: BottomNavProps) {
  const tabs = [
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'bookmarks' as const, icon: Bookmark, label: 'Saved' },
    { id: 'compare' as const, icon: ArrowLeftRight, label: 'Compare' },
    { id: 'history' as const, icon: Clock, label: 'History' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-2 pb-safe">
      <div className="grid grid-cols-5 gap-0.5 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = badges?.[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label + (badge ? `, ${badge} unread` : '')}
              className="relative flex flex-col items-center gap-0.5 py-1.5 transition-colors min-h-[48px]"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#ff6b35]' : 'text-gray-600'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive && tab.id === 'bookmarks' ? 'currentColor' : 'none'}
                />
                {badge && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#ff3b30] text-[9px] font-bold text-white flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] leading-none ${
                  isActive ? 'text-[#ff6b35] font-semibold' : 'text-gray-600'
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
