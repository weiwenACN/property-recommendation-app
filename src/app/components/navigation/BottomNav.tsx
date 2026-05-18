import { Search, Heart, ArrowLeftRight, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'search' | 'favourites' | 'compare' | 'profile';
  onTabChange: (tab: 'search' | 'favourites' | 'compare' | 'profile') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'favourites' as const, icon: Heart, label: 'Favourites' },
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
              className="flex flex-col items-center gap-1 py-2 transition-colors"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-[#ff6b35]' : 'text-gray-600'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
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
