import { MessageCircle, Flame, ChevronRight } from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';

interface MessagesScreenProps {
  /** Navigate to the Spark tab to start swiping and contacting agents. */
  onStartConversation?: () => void;
}

/**
 * MessagesScreen — placeholder for the full conversations list.
 * Conversations started from Spark or property detail will appear here
 * once the messaging backend is integrated.
 */
export function MessagesScreen({ onStartConversation }: MessagesScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[#F7F6FB]">
      {/* Dark hero header */}
      <div className="bg-[#0F0C2E] px-6 pb-8 header-pt-lg rounded-b-[32px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <StarHomesLogo variant="light" size="sm" className="mb-4" />
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-gray-300 mt-1 text-sm">Your agent conversations</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Illustration card */}
        <div className="w-full max-w-xs bg-white rounded-3xl p-8 shadow-sm border border-[#f1f3f5] text-center mb-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #EEEDFE 0%, #dbd8fc 100%)' }}
          >
            <MessageCircle className="w-10 h-10 text-[#3C3489]" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-[#0F0C2E] mb-2">No messages yet</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            When you contact an agent about a property, your conversation will appear here.
          </p>
        </div>

        {/* CTA */}
        {onStartConversation && (
          <button
            onClick={onStartConversation}
            className="flex items-center gap-3 bg-[#0F0C2E] text-white px-6 py-4 rounded-2xl hover:bg-[#1a1650] transition-colors shadow-lg shadow-[#0F0C2E]/20 w-full max-w-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">Browse with Spark</p>
              <p className="text-white/60 text-xs">Swipe to find & contact agents</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50 flex-shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
