import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  MessageCircle, 
  Navigation, 
  Layers, 
  Check, 
  ChevronRight, 
  Share2, 
  Printer, 
  X, 
  Droplets, 
  Zap, 
  Truck, 
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { FarmListing, User } from '../types';
import { SAMPLE_FARMS } from '../data/sampleFarms';

interface FarmMarketplaceProps {
  currentUser: User | null;
}

export const FarmMarketplace: React.FC<FarmMarketplaceProps> = ({ currentUser }) => {
  const [listings, setListings] = useState<FarmListing[]>(() => {
    const saved = localStorage.getItem('agrisahay_farm_marketplace_listings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading saved farm listings:', e);
      }
    }
    return SAMPLE_FARMS;
  });

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedFarm, setSelectedFarm] = useState<FarmListing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedSizeRange, setSelectedSizeRange] = useState<string>('All');
  const [selectedSoil, setSelectedSoil] = useState<string>('All');

  // New Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState<number>(4500000);
  const [newAcreage, setNewAcreage] = useState<number>(5.0);
  const [newState, setNewState] = useState('Maharashtra');
  const [newDistrict, setNewDistrict] = useState('Pune');
  const [newVillage, setNewVillage] = useState('Baramati');
  const [newCrop, setNewCrop] = useState('Sugarcane & Vegetables');
  const [newSoil, setNewSoil] = useState('Black Cotton Soil');
  const [newWater, setNewWater] = useState('2 Borewells + Canal');
  const [newPhotos, setNewPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80'
  ]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('agrisahay_farm_marketplace_listings', JSON.stringify(listings));
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (item.status !== 'published') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(query) ||
          item.district.toLowerCase().includes(query) ||
          item.state.toLowerCase().includes(query) ||
          item.village.toLowerCase().includes(query) ||
          item.cropType.toLowerCase().includes(query) ||
          item.soilType.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedState !== 'All' && item.state !== selectedState) return false;

      if (selectedSizeRange !== 'All') {
        if (selectedSizeRange === '<3' && item.landSizeAcres >= 3) return false;
        if (selectedSizeRange === '3-6' && (item.landSizeAcres < 3 || item.landSizeAcres > 6)) return false;
        if (selectedSizeRange === '>6' && item.landSizeAcres <= 6) return false;
      }

      if (selectedSoil !== 'All' && !item.soilType.toLowerCase().includes(selectedSoil.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [listings, searchQuery, selectedState, selectedSizeRange, selectedSoil]);

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: FarmListing = {
      id: 'farm_' + Date.now(),
      sellerId: currentUser?.id || 'guest_seller',
      sellerName: currentUser?.name || 'Verified Farmer',
      sellerPhone: currentUser?.phone || '+91 98765 43210',
      title: newTitle || 'Prime Cultivable Agricultural Land',
      description: newDescription || 'Well-maintained fertile farmland with road access and sweet water resources.',
      images: newPhotos.length > 0 ? newPhotos : [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
      ],
      price: newPrice,
      landSizeAcres: newAcreage,
      state: newState,
      district: newDistrict,
      village: newVillage,
      latitude: 18.5204 + (Math.random() - 0.5) * 2,
      longitude: 73.8567 + (Math.random() - 0.5) * 2,
      cropType: newCrop,
      soilType: newSoil,
      waterAvailability: newWater,
      electricityAvailability: '3-Phase Ag Connection',
      roadAccess: 'Paved Approach Road',
      facilities: ['Borewell', 'Fencing', 'Tractor Shed'],
      status: 'published',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setListings([newListing, ...listings]);
    setIsAddModalOpen(false);
    setSelectedFarm(newListing);
  };

  const handleOpenDirections = (farm: FarmListing) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${farm.latitude},${farm.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      
      {/* Marketplace Hero Banner with Real Agricultural Land Photo */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl aspect-[21/9] min-h-[220px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
          alt="Aerial fertile agricultural fields"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-transparent" />
        
        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verified Agricultural Land Exchange</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Agricultural Farmland Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Buy, lease, or explore verified agricultural holdings across India with registered water rights, verified soil tests, and clear 7/12 land titles.
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by state, district, crop (sugarcane, cotton), or soil..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Punjab">Punjab</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          {/* Size Filter */}
          <select
            value={selectedSizeRange}
            onChange={(e) => setSelectedSizeRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All Acreages</option>
            <option value="<3">Under 3 Acres</option>
            <option value="3-6">3 to 6 Acres</option>
            <option value=">6">Over 6 Acres</option>
          </select>

          {/* Grid vs Map Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map View
            </button>
          </div>

          {/* Post Farm Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>List Farm</span>
          </button>

        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((farm) => (
            <div
              key={farm.id}
              className="group flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Large 3:2 Farm Photo with Hover Zoom */}
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100">
                <img
                  src={farm.images[0]}
                  alt={farm.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                
                {/* Asking Price Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/85 text-emerald-400 font-extrabold text-sm backdrop-blur-md shadow-md border border-white/10">
                    {formatPrice(farm.price)}
                  </span>
                </div>

                {/* Acreage Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 font-bold text-xs backdrop-blur-md shadow-sm">
                    {farm.landSizeAcres} Acres
                  </span>
                </div>

                {/* Bottom Overlay with Crop Type */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent">
                  <span className="text-white text-xs font-semibold drop-shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {farm.cropType}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{farm.village}, {farm.district}, {farm.state}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
                    {farm.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {farm.description}
                  </p>
                </div>

                {/* Soil & Water mini specs */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="truncate">
                    <span className="text-slate-400 block font-medium">Soil:</span>
                    <span className="font-bold text-slate-800 truncate block">{farm.soilType.split('(')[0]}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400 block font-medium">Water:</span>
                    <span className="font-bold text-slate-800 truncate block">{farm.waterAvailability}</span>
                  </div>
                </div>

                {/* Action Buttons: View Details & View on Map */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedFarm(farm);
                      setActiveImageIndex(0);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenDirections(farm)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                    <span>View on Map</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 h-[600px] shadow-sm">
          {/* Interactive Map Canvas Simulation with Real Farm Pins */}
          <div className="absolute inset-0 bg-[#E8ECE9] flex items-center justify-center">
            {/* Map styling vector grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15803D_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Geographical Markers for the farms */}
            {filteredListings.map((farm, index) => {
              // Normalized pin coordinates on map canvas
              const topPercent = 20 + ((farm.latitude - 10) / 22) * 60;
              const leftPercent = 20 + ((farm.longitude - 70) / 18) * 60;

              return (
                <div
                  key={farm.id}
                  style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                  onClick={() => {
                    setSelectedFarm(farm);
                    setActiveImageIndex(0);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="px-3 py-1.5 rounded-full bg-slate-950 text-emerald-400 text-xs font-black shadow-lg border border-emerald-400/40 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all whitespace-nowrap">
                      {formatPrice(farm.price)}
                    </div>
                    <div className="w-2.5 h-2.5 bg-emerald-600 rotate-45 -mt-1 shadow-xs" />
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-slate-800 text-xs space-y-1 max-w-xs z-20">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <MapPin className="h-4 w-4" />
                <span>Agricultural Farmland Map</span>
              </div>
              <p className="text-slate-500">
                Click any price pin to inspect acreage, canal rights, soil tests, and direct contact details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Farm Details Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {selectedFarm.state} · {selectedFarm.district}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate max-w-xl">
                  {selectedFarm.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFarm(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Large Image Gallery */}
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={selectedFarm.images[activeImageIndex] || selectedFarm.images[0]}
                    alt={selectedFarm.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 text-emerald-400 text-base font-extrabold backdrop-blur-md shadow-md">
                      {formatPrice(selectedFarm.price)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow-md">
                      {selectedFarm.landSizeAcres} Acres
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {selectedFarm.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedFarm.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx ? 'border-emerald-600 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Land Overview & Details
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedFarm.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Soil Type
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">{selectedFarm.soilType}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Crop Suitability
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">{selectedFarm.cropType}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Water Availability
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">{selectedFarm.waterAvailability}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Electricity Connection
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">{selectedFarm.electricityAvailability}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Road Access
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">{selectedFarm.roadAccess}</span>
                </div>
              </div>

              {/* Facilities */}
              {selectedFarm.facilities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Installed Facilities & Assets
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFarm.facilities.map((fac, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60"
                      >
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Information & Action Buttons */}
              <div className="p-5 rounded-3xl bg-emerald-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-[11px] text-emerald-200 uppercase tracking-wider font-bold">
                    Direct Landowner Contact
                  </span>
                  <h4 className="text-lg font-black text-white">{selectedFarm.sellerName}</h4>
                  <p className="text-xs text-emerald-200/80 font-mono mt-0.5">{selectedFarm.sellerPhone}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={`tel:${selectedFarm.sellerPhone.replace(/\s+/g, '')}`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Seller</span>
                  </a>

                  <a
                    href={`https://wa.me/${selectedFarm.sellerPhone.replace(/\D+/g, '')}?text=Hello%2C+I+am+interested+in+your+farmland+listing+in+${selectedFarm.district}+on+AgriSahay.`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleOpenDirections(selectedFarm)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 border border-emerald-700 transition-all cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* List New Farm Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">List Your Agricultural Farmland</h3>
                <p className="text-xs text-slate-500">Reach verified farmers, organic cultivators, and agro-enterprises.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 5-Acre Fertile Black Cotton Soil Land with Borewell"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Asking Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Acreage (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newAcreage}
                    onChange={(e) => setNewAcreage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Village / Tehsil</label>
                  <input
                    type="text"
                    required
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Crop Type</label>
                  <input
                    type="text"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Water Resources</label>
                  <input
                    type="text"
                    value={newWater}
                    onChange={(e) => setNewWater(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail soil characteristics, borewell yield, road frontage, power feeder..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
