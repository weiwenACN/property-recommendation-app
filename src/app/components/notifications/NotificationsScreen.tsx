import { ArrowLeft, BellRing, Home } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'agent-confirmation' | 'new-listing';
  title: string;
  body: string;
  propertyId?: string;
  timestamp: number;
  read: boolean;
}

interface NotificationsScreenProps {
  notifications: Notification[];
  onBack: () => void;
  onNotificationTap: (notification: Notification) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsScreen({
  notifications,
  onBack,
  onNotificationTap,
}: NotificationsScreenProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-[#ff6b35] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="bg-[#f9fafb] rounded-full p-6 mb-4">
              <BellRing className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1a2332] mb-2">No notifications</h2>
            <p className="text-gray-600">You're all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#e5e7eb]">
            {notifications.map((n) => {
              const Icon = n.type === 'agent-confirmation' ? BellRing : Home;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => onNotificationTap(n)}
                    className={`w-full px-6 py-4 flex items-start gap-3 text-left transition-colors hover:bg-[#f9fafb] ${
                      n.read ? '' : 'bg-[#fff5f2]/40'
                    }`}
                  >
                    <div className="bg-[#ff6b35] rounded-full p-2 flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#1a2332] text-sm truncate">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#ff6b35] flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{n.body}</p>
                      <p className="text-xs text-gray-500">{relativeTime(n.timestamp)}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
