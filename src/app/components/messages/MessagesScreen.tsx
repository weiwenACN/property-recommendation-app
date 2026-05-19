import { MessageCircle } from 'lucide-react';

/**
 * MessagesScreen — placeholder for the full conversations list.
 * Conversations started from Spark or property detail will be listed here
 * once the messaging backend is integrated.
 */
export function MessagesScreen() {
  return (
    <div className="flex flex-col h-full bg-[#F7F6FB]">
      {/* Header */}
      <div className="bg-[#0F0C2E] px-6 pb-8 header-pt-lg">
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <p className="text-gray-300 mt-1 text-sm">Your agent conversations</p>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e5e7eb] w-full max-w-xs">
          <div className="bg-[#EEEDFE] rounded-2xl p-5 w-fit mx-auto mb-5">
            <MessageCircle className="w-10 h-10 text-[#3C3489]" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-[#0F0C2E] mb-2">No messages yet</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            When you contact an agent about a property, your conversation will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
