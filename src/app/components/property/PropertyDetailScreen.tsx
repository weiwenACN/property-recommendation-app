import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ArrowLeftRight,
  Phone,
  Bed,
  Bath,
  Maximize,
  Train,
  GraduationCap,
  ShoppingCart,
  Check,
  X,
} from 'lucide-react';
import type { Property } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { categoryIconFor } from '../../data/categories';
import { preferenceOptionById } from '../../data/preferences';

interface PropertyDetailScreenProps {
  property: Property;
  searchMode: SearchMode;
  onBack: () => void;
  onFavorite: () => void;
  onCompare: () => void;
  onContactAgentSent: (property: Property) => void;
  isFavorited: boolean;
}

const propertyImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1502672260066-6bc2614030a5?w=800',
];

const amenities = [
  { icon: Train, label: 'Nearest station', distance: 'Short walk' },
  { icon: GraduationCap, label: 'Primary school', distance: '10 min walk' },
  { icon: ShoppingCart, label: 'Supermarket', distance: '3 min walk' },
];

type ContactStage = 'idle' | 'sheet' | 'confirmation';

const AGENT = {
  name: 'Sarah Chen',
  branch: 'Canary Wharf Branch',
};

export function PropertyDetailScreen({
  property,
  searchMode,
  onBack,
  onFavorite,
  onCompare,
  onContactAgentSent,
  isFavorited,
}: PropertyDetailScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactStage, setContactStage] = useState<ContactStage>('idle');
  const CategoryIcon = categoryIconFor(property.propertyType);
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${property.title} at ${property.address}. Could you share more details?`,
  );

  useEffect(() => {
    setContactStage('idle');
  }, [property.id]);

  const openContactSheet = () => setContactStage('sheet');
  const closeContactSheet = () => setContactStage('idle');

  const handleSend = () => {
    if (!message.trim()) return;
    setContactStage('confirmation');
    onContactAgentSent(property);
  };

  const handleBackToProperty = () => setContactStage('idle');

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* Image Carousel */}
      <div className="relative h-80">
        <img
          src={propertyImages[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a2332]" />
        </button>

        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-xs font-medium text-[#1a2332] flex items-center gap-1.5 shadow-lg">
          <CategoryIcon className="w-3.5 h-3.5" />
          {property.propertyType}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {propertyImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="px-6 py-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-[#1a2332] mb-1">{property.title}</h1>
                <p className="text-gray-600">{property.address}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1a2332]">{priceFor(searchMode, property)}</p>
                <p className="text-sm text-gray-600">
                  {searchMode === 'rent' ? 'per month' : 'for sale'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#e5e7eb] mb-6">
            <div className="text-center">
              <Bed className="w-6 h-6 text-[#ff6b35] mx-auto mb-2" />
              <p className="text-sm text-gray-600">Bedrooms</p>
              <p className="font-bold text-[#1a2332]">{property.bedrooms}</p>
            </div>
            <div className="text-center">
              <Bath className="w-6 h-6 text-[#ff6b35] mx-auto mb-2" />
              <p className="text-sm text-gray-600">Bathrooms</p>
              <p className="font-bold text-[#1a2332]">{property.bathrooms}</p>
            </div>
            <div className="text-center">
              <Maximize className="w-6 h-6 text-[#ff6b35] mx-auto mb-2" />
              <p className="text-sm text-gray-600">Size</p>
              <p className="font-bold text-[#1a2332]">850 sqft</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1a2332] mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              This stunning {property.propertyType.toLowerCase()} offers modern living in the heart of the city.
              With high-quality finishes throughout and excellent transport links, this property provides
              the perfect blend of style and convenience.
            </p>
          </div>

          {property.preferenceTags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1a2332] mb-3">Matches your priorities</h2>
              <div className="flex flex-wrap gap-2">
                {property.preferenceTags.map((id) => {
                  const opt = preferenceOptionById(id);
                  if (!opt) return null;
                  const Icon = opt.icon;
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#fff5f2] border border-[#ff6b35]/30 text-[#ff6b35] text-sm font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      {opt.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1a2332] mb-4">Amenities Nearby</h2>
            <div className="space-y-3">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-xl">
                    <div className="bg-[#ff6b35] rounded-full p-2">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1a2332]">{amenity.label}</p>
                      <p className="text-sm text-gray-600">{amenity.distance}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-lg">
        <div className="flex gap-3">
          <button
            onClick={onFavorite}
            aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all ${
              isFavorited
                ? 'bg-[#fff5f2] text-[#ff6b35] border-2 border-[#ff6b35]'
                : 'bg-[#f9fafb] text-[#1a2332] border-2 border-transparent hover:border-[#e5e7eb]'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onCompare}
            aria-label="Compare property"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#f9fafb] text-[#1a2332] rounded-xl hover:bg-[#f5f5f7] transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <button
            onClick={openContactSheet}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#1a2332] text-white rounded-xl hover:bg-[#0f1620] transition-colors shadow-lg shadow-[#1a2332]/20"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">Contact Agent</span>
          </button>
        </div>
      </div>

      {/* Contact Agent Bottom Sheet */}
      {contactStage === 'sheet' && (
        <>
          <div
            onClick={closeContactSheet}
            className="absolute inset-0 bg-black/40 z-40 animate-in fade-in"
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom">
            <div className="px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
              <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1a2332]">Contact agent</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {AGENT.name} &middot; {AGENT.branch}
                  </p>
                </div>
                <button
                  onClick={closeContactSheet}
                  aria-label="Close"
                  className="p-2 -mr-2 text-gray-500 hover:text-[#1a2332]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <label htmlFor="agent-message" className="block text-sm font-medium text-[#1a2332] mb-2">
                Message
              </label>
              <textarea
                id="agent-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                placeholder="Say hello and ask any questions..."
              />

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-full mt-4 bg-[#ff6b35] text-white py-4 rounded-xl hover:bg-[#ff5722] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#ff6b35]/20"
              >
                Send inquiry
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation overlay */}
      {contactStage === 'confirmation' && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 animate-in fade-in">
          <div className="bg-[#fff5f2] rounded-full p-6 mb-6">
            <Check className="w-12 h-12 text-[#ff6b35]" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2332] mb-3 text-center">Inquiry sent</h2>
          <p className="text-center text-gray-600 max-w-xs">
            Agent <span className="font-medium text-[#1a2332]">{AGENT.name}</span> from{' '}
            <span className="font-medium text-[#1a2332]">{AGENT.branch}</span> will be in touch.
          </p>
          <button
            onClick={handleBackToProperty}
            className="mt-8 w-full max-w-xs bg-[#1a2332] text-white py-4 rounded-xl hover:bg-[#0f1620] transition-colors font-medium"
          >
            Back to property
          </button>
        </div>
      )}
    </div>
  );
}
