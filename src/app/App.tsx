import { useState } from 'react';
import { Map, List, Home } from 'lucide-react';
import { FilterBar, Filters } from './components/FilterBar';
import { MapView, Amenity } from './components/MapView';
import { PropertyListView } from './components/PropertyListView';
import { Property } from './components/PropertyList';
import { PropertyDetail } from './components/PropertyDetail';

type View = 'map' | 'list';
type Screen = 'browse' | 'detail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('browse');
  const [currentView, setCurrentView] = useState<View>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<Filters>({
    budget: 'all',
    bedrooms: 'all',
    propertyType: 'all',
    amenities: [],
  });

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentScreen('detail');
  };

  const handleBackToBrowse = () => {
    setCurrentScreen('browse');
    setSelectedProperty(null);
  };

  return (
    <div className="size-full flex flex-col bg-white">
      {currentScreen === 'browse' && (
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 rounded-lg p-2">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg text-gray-900">Star Homes</h1>
                  <p className="text-xs text-gray-600">Find your perfect London home</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar filters={filters} onFiltersChange={setFilters} />

          {/* View Toggle */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('map')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors ${
                  currentView === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setCurrentView('list')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors ${
                  currentView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'map' ? (
              <MapView
                properties={[]}
                amenities={[]}
                onPropertySelect={handlePropertySelect}
                showAmenities={filters.amenities}
              />
            ) : (
              <PropertyListView
                properties={[]}
                onSelectProperty={handlePropertySelect}
              />
            )}
          </div>
        </>
      )}

      {currentScreen === 'detail' && selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          areaName="London"
          onBack={handleBackToBrowse}
        />
      )}
    </div>
  );
}