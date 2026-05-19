import { Home, Flame, Heart, MessageCircle, User } from 'lucide-react';

export type BottomNavTab = 'home' | 'spark' | 'favourites' | 'messages' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  /** Optional unread badge count per tab. */
  badges?: Partial<Record<BottomNavTab, number>>;
}

const TABS: { id: BottomNavTab; icon: React.ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>; label: string }[] = [
  { id: 'home',       icon: Home,          label: 'Home'      },
  { id: 'spark',      icon: Flame,         label: 'Spark'     },
  { id: 'favourites', icon: Heart,         label: 'Saved'     },
  { id: 'messages',   icon: MessageCircle, label: 'Messages'  },
  { id: 'profile',    icon: User,          label: 'Profile'   },
];

export function BottomNav({ activeTab, onTabChange, badges }: BottomNavProps) {
  return (
    /* Floating pill container — sits 16 px above the home indicator */
    <div
      className="fixed bottom-0 left-0 right-0 z-[800] flex justify-center pointer-events-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow:
            '0 8px 32px rgba(15, 12, 46, 0.18), 0 2px 8px rgba(15, 12, 46, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = badges?.[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label + (badge ? `, ${badge} unread` : '')}
              className="relative flex items-center justify-center rounded-full transition-all min-h-[44px] min-w-[44px]"
              style={{
                gap: isActive ? '6px' : 0,
                paddingLeft: isActive ? '14px' : '12px',
                paddingRight: isActive ? '14px' : '12px',
                backgroundColor: isActive ? '#EEEDFE' : 'transparent',
                /* Spring-style transition for the pill expand */
                transition: 'background-color 0.25s ease, padding 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), gap 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Badge dot */}
              {badge != null && badge > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E5917A] text-[9px] font-semibold text-white flex items-center justify-center z-10"
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}

              <Icon
                className="flex-shrink-0 transition-colors duration-200"
                style={{
                  width: '20px',
                  height: '20px',
                  color: isActive ? '#3C3489' : '#6b7280',
                  strokeWidth: isActive ? 2.5 : 2,
                  fill:
                    isActive && (tab.id === 'favourites' || tab.id === 'spark')
                      ? 'currentColor'
                      : 'none',
                }}
              />

              {/* Label — present in DOM but zero-width when inactive to keep pill at minimum tap size */}
              <span
                className="text-xs font-semibold text-[#3C3489] overflow-hidden whitespace-nowrap"
                style={{
                  maxWidth: isActive ? '64px' : '0px',
                  opacity: isActive ? 1 : 0,
                  transition:
                    'max-width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
