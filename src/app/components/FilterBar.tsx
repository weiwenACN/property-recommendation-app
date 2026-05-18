import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';

export interface Filters {
  budget: string;
  bedrooms: string;
  propertyType: string;
  amenities: string[];
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const budgetOptions = [
    { value: 'all', label: 'Any Budget' },
    { value: 'under-500k', label: 'Under £500k' },
    { value: '500k-750k', label: '£500k - £750k' },
    { value: '750k-1m', label: '£750k - £1m' },
    { value: 'over-1m', label: 'Over £1m' },
  ];

  const bedroomOptions = [
    { value: 'all', label: 'Any' },
    { value: '1', label: '1 Bed' },
    { value: '2', label: '2 Beds' },
    { value: '3', label: '3 Beds' },
    { value: '4+', label: '4+ Beds' },
  ];

  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'penthouse', label: 'Penthouse' },
  ];

  const amenityOptions = [
    { value: 'parks', label: 'Parks' },
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'schools', label: 'Schools' },
    { value: 'transport', label: 'Transport' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'gyms', label: 'Gyms' },
  ];

  const updateFilter = (key: keyof Filters, value: string | string[]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    updateFilter('amenities', updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      budget: 'all',
      bedrooms: 'all',
      propertyType: 'all',
      amenities: [],
    });
  };

  const activeFilterCount = [
    filters.budget !== 'all',
    filters.bedrooms !== 'all',
    filters.propertyType !== 'all',
    filters.amenities.length > 0,
  ].filter(Boolean).length;

  return (
    <>
      <div className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative flex-shrink-0">
              <select
                value={filters.budget}
                onChange={(e) => updateFilter('budget', e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {budgetOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
            </div>

            <div className="relative flex-shrink-0">
              <select
                value={filters.bedrooms}
                onChange={(e) => updateFilter('bedrooms', e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {bedroomOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
            </div>

            <div className="relative flex-shrink-0">
              <select
                value={filters.propertyType}
                onChange={(e) => updateFilter('propertyType', e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {propertyTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap flex-shrink-0"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div>
                <h3 className="mb-3 text-gray-900">Budget Range</h3>
                <div className="space-y-2">
                  {budgetOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('budget', option.value)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        filters.budget === option.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-gray-900">Bedrooms</h3>
                <div className="grid grid-cols-5 gap-2">
                  {bedroomOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('bedrooms', option.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        filters.bedrooms === option.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-gray-900">Property Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('propertyType', option.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        filters.propertyType === option.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-gray-900">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleAmenity(option.value)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        filters.amenities.includes(option.value)
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
