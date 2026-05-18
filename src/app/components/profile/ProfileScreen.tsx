import { useEffect, useState } from 'react';
import { Check, Edit3 } from 'lucide-react';
import { preferenceOptions } from '../../data/preferences';

interface ProfileScreenProps {
  preferences: string[];
  onUpdatePreferences: (preferences: string[]) => void;
}

export function ProfileScreen({ preferences, onUpdatePreferences }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(preferences);

  useEffect(() => {
    if (!isEditing) setDraft(preferences);
  }, [preferences, isEditing]);

  const togglePreference = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const startEditing = () => {
    setDraft(preferences);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdatePreferences(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(preferences);
    setIsEditing(false);
  };

  const selectedOptions = preferenceOptions.filter((o) => preferences.includes(o.id));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 py-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-300 mt-1">Your saved preferences and account</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#1a2332]">Lifestyle priorities</h2>
            {!isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 text-[#ff6b35] font-medium text-sm hover:underline"
              >
                <Edit3 className="w-4 h-4" />
                {preferences.length === 0 ? 'Add' : 'Edit'}
              </button>
            )}
          </div>

          {!isEditing ? (
            selectedOptions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#f9fafb] text-center">
                <p className="text-sm text-gray-600">
                  No priorities set yet. Tap <span className="font-medium text-[#1a2332]">Add</span> to choose what matters to you.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#fff5f2] border border-[#ff6b35] text-[#ff6b35] text-sm font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Pick anything that matters — we'll match areas accordingly.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {preferenceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = draft.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => togglePreference(option.id)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#ff6b35] bg-[#fff5f2]'
                          : 'border-[#e5e7eb] bg-white hover:border-[#ffa07a]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#ff6b35] rounded-full p-1">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <Icon className={`w-7 h-7 mb-2 ${isSelected ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`} />
                      <div className={`text-sm font-medium ${isSelected ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`}>
                        {option.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handleCancel}
                  className="w-full bg-white border-2 border-[#e5e7eb] text-[#1a2332] py-3 rounded-xl hover:bg-[#f9fafb] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="w-full bg-[#ff6b35] text-white py-3 rounded-xl hover:bg-[#ff5722] transition-colors font-medium shadow-lg shadow-[#ff6b35]/20"
                >
                  Save{draft.length > 0 ? ` (${draft.length})` : ''}
                </button>
              </div>
            </>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1a2332] mb-3">Account</h2>
          <div className="rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb]">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone number</span>
              <span className="text-sm font-medium text-[#1a2332]">Connected</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Notifications</span>
              <span className="text-sm font-medium text-[#1a2332]">On</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
