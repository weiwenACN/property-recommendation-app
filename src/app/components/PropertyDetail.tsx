import { useState } from 'react';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Phone, Mail, Calendar, Heart, Share2 } from 'lucide-react';
import { Property } from './PropertyList';

interface PropertyDetailProps {
  property: Property;
  areaName: string;
  onBack: () => void;
}

export function PropertyDetail({ property, areaName, onBack }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="relative h-80">
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <button
              onClick={onBack}
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900'
                }`}
              />
            </button>
            <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
              <Share2 className="w-6 h-6 text-gray-900" />
            </button>
          </div>
          {property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full mb-2">
                {property.type}
              </span>
              <h1 className="text-2xl mb-2 text-gray-900">{property.title}</h1>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl text-gray-900">{property.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bed className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Bedrooms</p>
              <p className="text-gray-900">{property.bedrooms}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bath className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Bathrooms</p>
              <p className="text-gray-900">{property.bathrooms}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Maximize className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="text-gray-900">{property.sqft} sqft</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl mb-3 text-gray-900">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description}. This exceptional property offers modern living in the heart of {areaName}.
              With high-quality finishes throughout and excellent transport links, this home provides the perfect
              blend of style and convenience. The property benefits from natural light and has been recently refurbished
              to the highest standard.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl mb-3 text-gray-900">Key Features</h2>
            <div className="grid grid-cols-2 gap-2">
              {property.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h3 className="mb-3 text-gray-900">About {areaName}</h3>
            <p className="text-sm text-gray-700">
              A highly sought-after area of London with excellent schools, transport links, and local amenities.
              Perfect for families and professionals alike.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <button className="flex flex-col items-center gap-1 py-3 px-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Phone className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-700">Call</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-3 px-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Mail className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-700">Email</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-3 px-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Book Viewing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
