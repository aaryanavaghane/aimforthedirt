import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { InfrastructureAsset, AssetCategory, HealthStatus } from '../../types';
import { formatInr } from '../../utils/formatCurrency';
import { 
  Building2, 
  Waves, 
  Navigation, 
  Filter, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  Layers,
  Search,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Globe,
  Sliders,
  X
} from 'lucide-react';

interface CityMapProps {
  assets: InfrastructureAsset[];
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset | null) => void;
  onDispatchWorkOrder: (assetId: string, actionType: string) => Promise<void>;
  isDispatching?: boolean;
}

// Strict Pune Municipal Region Boundary Box
const PUNE_BOUNDS: [[number, number], [number, number]] = [
  [18.3900, 73.6900], // South-West (Sinhagad / Katraj / Dhayari)
  [18.6400, 73.9900]  // North-East (Lohegaon Airport / Wagholi / Kharadi)
];

const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

// Available Tile Providers
type TileProvider = 'dark' | 'satellite' | 'street';

const TILE_PROVIDERS: Record<TileProvider, { name: string; url: string; attribution: string }> = {
  dark: {
    name: 'Cyber Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  },
  satellite: {
    name: 'Satellite HD',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; High-Res Satellite'
  },
  street: {
    name: 'Voyager Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  }
};

// Custom Leaflet DivIcon creator
const createGlowingIcon = (status: HealthStatus, category: AssetCategory, score: number) => {
  let colorClass = 'border-emerald-400 text-emerald-400 bg-[#050e1c]';
  let pulseColor = 'rgba(16, 185, 129, 0.75)';
  let symbol = '🌉';
  if (category === 'drainage') symbol = '🌊';
  if (category === 'road') symbol = '🛣️';

  if (status === 'critical') {
    colorClass = 'border-rose-400 text-rose-400 bg-[#16060c]';
    pulseColor = 'rgba(244, 63, 94, 0.85)';
  } else if (status === 'warning') {
    colorClass = 'border-amber-400 text-amber-400 bg-[#160e06]';
    pulseColor = 'rgba(245, 158, 11, 0.8)';
  }

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
      <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; border: 2px solid; box-shadow: 0 0 16px ${pulseColor}; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: transform 0.2s;" class="${colorClass}">
        <span>${symbol}</span>
      </div>
      <span style="position: absolute; bottom: -5px; font-family: monospace; font-size: 8px; font-weight: 800; background: #000; padding: 0 3px; border-radius: 3px; color: #fff; border: 1px solid #334155;">
        ${score}
      </span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// Map controller that enforces Pune bounds, invalidates size, and handles zooms
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  fitTrigger: number;
  assetsToFit: InfrastructureAsset[];
}> = ({ center, zoom, fitTrigger, assetsToFit }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setMaxBounds(PUNE_BOUNDS);
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (fitTrigger > 0 && assetsToFit.length > 0) {
      const latLngs = assetsToFit.map(a => [a.location.lat, a.location.lng] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    } else if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, fitTrigger, map]);

  return null;
};

export const CityMap: React.FC<CityMapProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onDispatchWorkOrder,
  isDispatching = false,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | AssetCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | HealthStatus>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tileProvider, setTileProvider] = useState<TileProvider>('dark');
  const [isGridExpanded, setIsGridExpanded] = useState<boolean>(false);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>(PUNE_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(12.5);
  const [fitTrigger, setFitTrigger] = useState<number>(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Available unique zones
  const zones = useMemo(() => {
    return Array.from(new Set(assets.map(a => a.location.ward.replace(' Ward Office', '')))).sort();
  }, [assets]);

  // Filtered assets strictly in Pune
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
      if (selectedZone !== 'all' && !asset.location.ward.toLowerCase().includes(selectedZone.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(q);
        const matchWard = asset.location.ward.toLowerCase().includes(q);
        const matchAddress = asset.location.address.toLowerCase().includes(q);
        if (!matchName && !matchWard && !matchAddress) return false;
      }
      return true;
    });
  }, [assets, categoryFilter, statusFilter, selectedZone, searchQuery]);

  const handleFocusAsset = (asset: InfrastructureAsset) => {
    setMapCenter([asset.location.lat, asset.location.lng]);
    setMapZoom(16);
    onSelectAsset(asset);
  };

  const handleResetToAll = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSelectedZone('all');
    setSearchQuery('');
    setMapCenter(PUNE_CENTER);
    setMapZoom(12.5);
    setFitTrigger(prev => prev + 1);
  };

  const handleZoneSelect = (zone: string) => {
    setSelectedZone(zone);
    if (zone !== 'all') {
      const zoneAssets = assets.filter(a => a.location.ward.toLowerCase().includes(zone.toLowerCase()));
      if (zoneAssets.length > 0) {
        setFitTrigger(prev => prev + 1);
      }
    } else {
      setFitTrigger(prev => prev + 1);
    }
  };

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Status breakdown counts of currently visible assets
  const visibleCritical = filteredAssets.filter(a => a.status === 'critical').length;
  const visibleWarning = filteredAssets.filter(a => a.status === 'warning').length;
  const visibleHealthy = filteredAssets.filter(a => a.status === 'healthy').length;

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden flex flex-col">
      {/* Top Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Main Filters Pill Container */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/94 backdrop-blur-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          {/* Show All Sites */}
          <button
            onClick={handleResetToAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-display transition-all ${
              categoryFilter === 'all' && statusFilter === 'all' && selectedZone === 'all' && !searchQuery
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-glow-cyan font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            All Pune Sites
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* Category Filter Chips */}
          {(['bridge', 'drainage', 'road'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-display capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {cat === 'bridge' ? 'Bridges' : cat === 'drainage' ? 'Drainage' : 'Roads'}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* Status Filter Chips */}
          {(['critical', 'warning', 'healthy'] as const).map((st) => {
            const isSelected = statusFilter === st;
            let activeColor = 'bg-slate-700 text-white';
            if (st === 'critical') activeColor = 'bg-rose-500 text-white shadow-glow-rose font-bold';
            if (st === 'warning') activeColor = 'bg-amber-500 text-slate-950 shadow-glow-amber font-bold';
            if (st === 'healthy') activeColor = 'bg-emerald-500 text-white shadow-glow-emerald font-bold';

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(statusFilter === st ? 'all' : st)}
                className={`px-2.5 py-1.5 rounded-xl text-xs capitalize transition-all ${
                  isSelected ? activeColor : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {st}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* Pune Zone Area Dropdown */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedZone}
              onChange={(e) => handleZoneSelect(e.target.value)}
              className="bg-transparent text-slate-100 focus:outline-none cursor-pointer text-xs font-display"
            >
              <option value="all" className="bg-slate-900">All Wards</option>
              {zones.map(z => (
                <option key={z} value={z} className="bg-slate-900">{z}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* Live Search Input */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Pune Node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-24 lg:w-36 text-xs font-mono placeholder:text-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Basemap Tile Switcher & Fit Bounds */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Basemap Tile Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/94 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-xs font-display">
            {(['dark', 'satellite', 'street'] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => setTileProvider(prov)}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  tileProvider === prov
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {TILE_PROVIDERS[prov].name}
              </button>
            ))}
          </div>

          {/* Fit Pune Region Button */}
          <button
            onClick={() => setFitTrigger(prev => prev + 1)}
            className="px-3 py-2 rounded-2xl bg-slate-950/94 backdrop-blur-xl border border-slate-700/80 text-xs font-display font-bold text-slate-200 hover:text-white hover:bg-slate-900 shadow-2xl flex items-center gap-1.5 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fit ({filteredAssets.length})</span>
          </button>
        </div>
      </div>

      {/* Collapsible Bottom 'PMC Pune Grid' Component */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none flex flex-col items-center">
        {!isGridExpanded ? (
          /* Minimized State: Sleek Clickable Bar */
          <button
            onClick={() => setIsGridExpanded(true)}
            className="px-4 py-2 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl pointer-events-auto flex items-center gap-3 text-xs font-mono text-slate-300 hover:text-white hover:border-cyan-500/60 transition-all group active:scale-98"
          >
            <ChevronUp className="w-4 h-4 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-bold text-white font-display">PMC Pune Grid</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
              {filteredAssets.length} Nodes
            </span>
            <div className="hidden sm:flex items-center gap-2 text-[10px]">
              <span className="text-rose-400 font-bold">{visibleCritical} Critical</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{visibleWarning} Warning</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{visibleHealthy} Healthy</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold ml-1">Expand Grid ▲</span>
          </button>
        ) : (
          /* Expanded State: Full Interactive Carousel Drawer */
          <div className="w-full max-w-4xl p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 shadow-2xl pointer-events-auto space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-white font-display font-bold text-sm">PMC Pune Grid</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                  {filteredAssets.length} Active Nodes
                </span>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
                  <span className="text-rose-400 font-bold">{visibleCritical} Critical</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{visibleWarning} Warning</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{visibleHealthy} Healthy</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleScrollCarousel('left')}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleScrollCarousel('right')}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setIsGridExpanded(false)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white text-[10px] font-bold font-mono flex items-center gap-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Minimize</span>
                </button>
              </div>
            </div>

            <div ref={carouselRef} className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleFocusAsset(asset)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 w-48 transition-all ${
                    selectedAsset?.id === asset.id
                      ? 'bg-slate-800 border-cyan-500 shadow-glow-cyan'
                      : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-bold text-white truncate font-display">{asset.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">{asset.location.ward.replace(' Ward Office', '')}</div>
                  <div className="flex items-center justify-between text-[10px] mt-1.5 font-mono pt-1.5 border-t border-slate-800/60">
                    <span className={asset.status === 'critical' ? 'text-rose-400 font-black' : asset.status === 'warning' ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
                      {asset.healthScore}/100
                    </span>
                    <span className="text-emerald-400 font-semibold">{formatInr(asset.proactiveCost)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          minZoom={11.5}
          maxZoom={18}
          maxBounds={PUNE_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          className="w-full h-full z-0 bg-[#050811]"
        >
          <MapController 
            center={mapCenter} 
            zoom={mapZoom} 
            fitTrigger={fitTrigger} 
            assetsToFit={filteredAssets} 
          />

          {/* Active Basemap Tiles */}
          <TileLayer
            key={tileProvider}
            attribution={TILE_PROVIDERS[tileProvider].attribution}
            url={TILE_PROVIDERS[tileProvider].url}
            maxZoom={18}
            minZoom={11}
            bounds={PUNE_BOUNDS}
          />

          {/* Render All Pune Markers */}
          {filteredAssets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.location.lat, asset.location.lng]}
              icon={createGlowingIcon(asset.status, asset.category, asset.healthScore)}
              eventHandlers={{
                click: () => onSelectAsset(asset),
              }}
            >
              <Popup className="custom-dark-popup">
                <div className="p-1 font-sans text-slate-100 min-w-[220px]">
                  <div className="text-xs font-bold font-display text-white">{asset.name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{asset.location.address}</div>
                  <div className="mt-2 pt-2 border-t border-slate-700 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Health Score:</span>
                      <span className={`font-bold ${
                        asset.status === 'critical' ? 'text-rose-400' : asset.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {asset.healthScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Remaining Life:</span>
                      <span className="font-bold text-white">~{asset.daysToFailure} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Proactive Repair:</span>
                      <span className="font-bold text-emerald-400">{formatInr(asset.proactiveCost)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectAsset(asset)}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] text-center transition-all shadow-glow-cyan font-display"
                  >
                    Open Live Telemetry in Right Panel →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
