import { useState } from 'react';
import { ArrowLeft, Heart, ArrowLeftRight, Phone, Bed, Bath, Maximize, Train, GraduationCap, ShoppingCart, Check } from 'lucide-react';
import { Property } from '../areas/AreaResultsScreen';

interface PropertyDetailScreenProps {
  property: Property;
  onBack: () => void;
  onFavorite: () => void;
  onCompare: () => void;
  isFavorited: boolean;
}

const propertyImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1502672260066-6bc2614030a5?w=800',
];

const amenities = [
  { icon: Train, label: 'Old Street Station', distance: '5 min walk' },
  { icon: GraduationCap, label: 'St. Luke\'s Primary School', distance: '10 min walk' },
  { icon: ShoppingCart, label: 'Tesco Express', distance: '3 min walk' },
];

export function PropertyDetailScreen({
  property,
  onBack,
  onFavorite,
  onCompare,
  isFavorited,
}: PropertyDetailScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const handleContactAgent = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Image Carousel */}
      <div className="relative h-80">
        <img
          src={propertyImages[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a2332]" />
        </button>

        {/* Carousel Indicators */}
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
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-6 py-6">
          {/* Property Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-[#1a2332] mb-1">{property.title}</h1>
                <p className="text-gray-600">{property.address}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1a2332]">{property.price}</p>
                <p className="text-sm text-gray-600">{property.type === 'rent' ? 'per month' : 'for sale'}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
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

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1a2332] mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              This stunning {property.propertyType.toLowerCase()} offers modern living in the heart of the city.
              With high-quality finishes throughout and excellent transport links, this property provides
              the perfect blend of style and convenience. The open-plan living area is perfect for entertaining,
              while the bedrooms offer peaceful retreats.
            </p>
          </div>

          {/* Amenities Nearby */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1a2332] mb-4">Amenities Nearby</h2>
            <div className="space-y-3">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-xl"
                  >
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

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-6 py-4 shadow-lg">
        <div className="flex gap-3">
          <button
            onClick={onFavorite}
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
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#f9fafb] text-[#1a2332] rounded-xl hover:bg-[#f5f5f7] transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleContactAgent}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff5722] transition-colors shadow-lg shadow-[#ff6b35]/20"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">Contact Agent</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#1a2332] text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-top">
          <div className="bg-[#ff6b35] rounded-full p-1">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium">Agent Sarah Johnson from Shoreditch branch will be in touch</p>
          </div>
        </div>
      )}
    </div>
  );
}
