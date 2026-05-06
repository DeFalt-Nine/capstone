import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCAL_NORMS, EMERGENCY_CONTACTS, EMERGENCY_HOTLINES } from '../constants';
import { trackEvent } from '../services/apiService';
import type { Norm } from '../types';
import AnimatedElement from '../components/AnimatedElement';
import FunFactBubble from '../components/FunFactBubble';
import JeepneyRouteNavigator from '../components/JeepneyRouteNavigator';

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * LANDMARKS WITH COORDINATES
 */
const LANDMARKS = [
    { id: 'sm', name: 'SM Baguio / Session Rd', lat: 16.4189, lng: 120.5995, area: 'Baguio' },
    { id: 'strawberry', name: 'Strawberry Farm', lat: 16.4522, lng: 120.5828, area: 'LT' },
    { id: 'bellchurch', name: 'Bell Church', lat: 16.4357, lng: 120.5901, area: 'LT' },
    { id: 'burnham', name: 'Burnham Park', lat: 16.4124, lng: 120.5941, area: 'Baguio' },
    { id: 'kalugong', name: 'Mt. Kalugong', lat: 16.4583, lng: 120.5911, area: 'LT' },
    { id: 'stobosa', name: 'Colors of Stobosa', lat: 16.4312, lng: 120.5922, area: 'LT' },
    { id: 'minesview', name: 'Mines View Park', lat: 16.4230, lng: 120.6277, area: 'Baguio' },
    { id: 'cjh', name: 'Camp John Hay', lat: 16.4023, lng: 120.6128, area: 'Baguio' },
    { id: 'market', name: 'Baguio Market', lat: 16.4168, lng: 120.5946, area: 'Baguio' },
    { id: 'bsu', name: 'BSU Campus', lat: 16.4511, lng: 120.5915, area: 'LT' },
    { id: 'victory', name: 'Victory Liner', lat: 16.4055, lng: 120.5989, area: 'Baguio' },
    { id: 'wright', name: 'Wright Park', lat: 16.4194, lng: 120.6158, area: 'Baguio' },
    { id: 'yangbew', name: 'Mt. Yangbew', lat: 16.4635, lng: 120.6012, area: 'LT' },
    { id: 'town', name: 'LT Town Center', lat: 16.4510, lng: 120.5890, area: 'LT' }
];

// Helper: Haversine distance in KM
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of earth
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const MapPicker: React.FC<{ 
    onPick: (lat: number, lng: number) => void, 
    onClose: () => void,
    initialPos?: [number, number]
}> = ({ onPick, onClose, initialPos }) => {
    const [pos, setPos] = useState<[number, number]>(initialPos || [16.435, 120.59]);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const MapEvents = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                setPos([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    };

    const MapCenterer = ({ center }: { center: [number, number] }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(center);
    }, [center, map]);
        return null;
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Pick Location</h3>
                        <p className="text-xs text-slate-400 font-medium">Click on the map to set coordinates</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="flex-grow relative h-[400px]">
                    <MapContainer 
                        {...{ center: pos, zoom: 14, style: { height: '100%', width: '100%' } } as any}
                    >
                        <TileLayer
                            {...{ 
                                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            } as any}
                        />
                        <Marker position={pos as any} />
                        <MapEvents />
                        <MapCenterer center={pos} />
                    </MapContainer>
                    
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
                        <div className="bg-white/90 backdrop-blur shadow-lg p-3 rounded-2xl border border-white/20 pointer-events-auto">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-[10px] font-mono text-slate-500">
                                    {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
                                </div>
                                <button 
                                    onClick={() => onPick(pos[0], pos[1])}
                                    className="bg-lt-blue text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-lt-blue/20 hover:scale-105 transition-transform"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const TaxiEstimator: React.FC = () => {
    const [originId, setOriginId] = useState('sm');
    const [destId, setDestId] = useState('strawberry');
    const [isHeavyTraffic, setIsHeavyTraffic] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [customOrigin, setCustomOrigin] = useState<{ lat: number, lng: number } | null>(null);
    const [customDest, setCustomDest] = useState<{ lat: number, lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [pickingFor, setPickingFor] = useState<'origin' | 'dest' | null>(null);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setOriginId('current');
                setIsLocating(false);
                trackEvent('click', 'use_current_location', '/visitor-info');
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Unable to retrieve your location.";
                if (error.code === 1) msg = "Location permission denied. Please enable it in settings.";
                setLocationError(msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleMapPick = (lat: number, lng: number) => {
        if (pickingFor === 'origin') {
            setCustomOrigin({ lat, lng });
            setOriginId('custom');
        } else if (pickingFor === 'dest') {
            setCustomDest({ lat, lng });
            setDestId('custom');
        }
        setPickingFor(null);
    };

    const result = useMemo(() => {
        if (originId === destId && originId !== 'custom') return null;
        
        let origin;
        if (originId === 'current' && userLocation) {
            origin = { name: 'Your Current Location', lat: userLocation.lat, lng: userLocation.lng, area: 'Unknown' };
        } else if (originId === 'custom' && customOrigin) {
            origin = { name: 'Custom Point (Origin)', lat: customOrigin.lat, lng: customOrigin.lng, area: 'Unknown' };
        } else {
            origin = LANDMARKS.find(l => l.id === originId)!;
        }

        let dest;
        if (destId === 'custom' && customDest) {
            dest = { name: 'Custom Point (Destination)', lat: customDest.lat, lng: customDest.lng, area: 'Unknown' };
        } else {
            dest = LANDMARKS.find(l => l.id === destId)!;
        }
        
        if (!origin || !dest) return null;

        // Calculate raw distance
        const rawDist = getDistance(origin.lat, origin.lng, dest.lat, dest.lng);
        
        // Road correction factor (winding roads + route inefficiencies)
        const roadFactor = 1.35; 
        const actualDist = rawDist * roadFactor;
        
        // LTFRB Formula: 45 flagdown + (13.50 * dist) + (idle time)
        const flagDown = 45;
        const perKm = 13.50;
        const trafficFactor = isHeavyTraffic ? 1.6 : 1.1; // Slower speed = higher cost
        const idleSurcharge = isHeavyTraffic ? 50 : 10; // Extra ₱50 for rush hour gridlock
        
        const estimatedFare = Math.round(flagDown + (actualDist * perKm * trafficFactor) + idleSurcharge);
        
        // Time estimation (Avg speed: 20km/h light, 8km/h heavy)
        const avgSpeed = isHeavyTraffic ? 8 : 22;
        const timeMins = Math.round((actualDist / avgSpeed) * 60) + (isHeavyTraffic ? 15 : 5);

        return {
            originName: origin.name,
            destName: dest.name,
            distance: actualDist.toFixed(1),
            fare: estimatedFare,
            time: timeMins,
            isBoundaryIssue: (origin.area === 'LT' && dest.area === 'Baguio') || (origin.area === 'Baguio' && dest.area === 'LT'),
            mapUrl: `https://maps.google.com/maps?saddr=${origin.lat},${origin.lng}&daddr=${dest.lat},${dest.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`
        };
    }, [originId, destId, isHeavyTraffic, userLocation, customOrigin, customDest]);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full transition-all hover:shadow-lt-blue/5">
            {pickingFor && (
                <MapPicker 
                    onClose={() => setPickingFor(null)} 
                    onPick={handleMapPick}
                    initialPos={
                        pickingFor === 'origin' 
                            ? (customOrigin ? [customOrigin.lat, customOrigin.lng] : [16.435, 120.59])
                            : (customDest ? [customDest.lat, customDest.lng] : [16.435, 120.59])
                    }
                />
            )}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lt-yellow rounded-xl flex items-center justify-center shadow-lg shadow-lt-yellow/20">
                        <i className="fas fa-taxi text-slate-900 text-lg"></i>
                    </div>
                    <div>
                        <span className="font-black text-sm uppercase tracking-tighter block">Fare Engine</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Metered Estimate</span>
                    </div>
                </div>
                <button 
                    onClick={() => setShowMap(!showMap)} 
                    className={`text-[10px] font-bold px-4 py-2 rounded-full transition-all border ${showMap ? 'bg-white/10 border-white/20 text-white' : 'bg-lt-yellow text-slate-900 border-lt-yellow shadow-lg shadow-lt-yellow/20'}`}
                >
                    {showMap ? 'Hide Map' : 'Show Map'}
                </button>
            </div>

            <div className="p-6 space-y-6 flex-grow">
                {/* Selectors */}
                <div className="space-y-4">
                    <div className="relative">
                        <div className="flex justify-between items-end mb-1 px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting Point</label>
                            <button 
                                onClick={handleUseCurrentLocation}
                                disabled={isLocating}
                                className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${isLocating ? 'text-slate-400' : 'text-lt-blue hover:text-lt-orange'}`}
                            >
                                {isLocating ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Locating...</>
                                ) : (
                                    <><i className="fas fa-crosshairs"></i> Use Current Location</>
                                )}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <i className="fas fa-circle-dot absolute left-4 top-1/2 -translate-y-1/2 text-lt-blue text-xs z-10"></i>
                                <select 
                                    value={originId} 
                                    onChange={e => {
                                        setOriginId(e.target.value);
                                        if (e.target.value !== 'current') setLocationError(null);
                                    }}
                                    className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-lt-blue/10 focus:border-lt-blue outline-none appearance-none cursor-pointer transition-all"
                                >
                                    {originId === 'current' && <option value="current">📍 Your Current Location</option>}
                                    {originId === 'custom' && <option value="custom">🗺️ Custom Map Point</option>}
                                    <optgroup label="La Trinidad Landmarks">
                                        {LANDMARKS.filter(l => l.area === 'LT').map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Baguio Landmarks">
                                        {LANDMARKS.filter(l => l.area === 'Baguio').map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] pointer-events-none"></i>
                            </div>
                            <button 
                                onClick={() => setPickingFor('origin')}
                                className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-lt-blue hover:text-white transition-all shadow-sm shrink-0"
                                title="Pick on Map"
                            >
                                <i className="fas fa-map"></i>
                            </button>
                        </div>
                        {locationError && (
                            <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold animate-shake">
                                <i className="fas fa-exclamation-circle mr-1"></i> {locationError}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <button 
                            onClick={() => {
                                const temp = originId;
                                setOriginId(destId);
                                setDestId(temp);
                                
                                // Swap custom locations if applicable
                                if (originId === 'custom' || destId === 'custom') {
                                    const tempCustom = customOrigin;
                                    setCustomOrigin(customDest);
                                    setCustomDest(tempCustom);
                                }
                            }}
                            className="w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-lt-blue transition-all hover:rotate-180"
                        >
                            <i className="fas fa-exchange-alt rotate-90 text-[10px]"></i>
                        </button>
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Destination</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-lt-red text-xs z-10"></i>
                                <select 
                                    value={destId} 
                                    onChange={e => setDestId(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-lt-red/10 focus:border-lt-red outline-none appearance-none cursor-pointer transition-all"
                                >
                                    {destId === 'custom' && <option value="custom">🗺️ Custom Map Point</option>}
                                    <optgroup label="La Trinidad Landmarks">
                                        {LANDMARKS.filter(l => l.area === 'LT').map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Baguio Landmarks">
                                        {LANDMARKS.filter(l => l.area === 'Baguio').map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] pointer-events-none"></i>
                            </div>
                            <button 
                                onClick={() => setPickingFor('dest')}
                                className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-lt-blue hover:text-white transition-all shadow-sm shrink-0"
                                title="Pick on Map"
                            >
                                <i className="fas fa-map"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Traffic Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 group cursor-pointer" onClick={() => setIsHeavyTraffic(!isHeavyTraffic)}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${isHeavyTraffic ? 'bg-red-100 text-red-600' : 'bg-lt-yellow/20 text-lt-orange'}`}>
                            <i className={`fas ${isHeavyTraffic ? 'fa-car-side text-xl' : 'fa-sun text-xl'}`}></i>
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{isHeavyTraffic ? 'Heavy Rush Hour' : 'Light Traffic'}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Adjusts time & per-min charge</p>
                        </div>
                    </div>
                    <button 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isHeavyTraffic ? 'bg-red-500' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isHeavyTraffic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Boundary Warning */}
                {result?.isBoundaryIssue && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 animate-fade-in shadow-sm">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                            <i className="fas fa-exclamation-triangle text-amber-600 text-xs"></i>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-tight font-medium">
                            <strong>Boundary Rule:</strong> You are crossing between LT and Baguio. <strong>Grey Taxis</strong> cannot legally pick up across boundaries. Ensure you hail a <strong>White Taxi</strong> for this trip.
                        </p>
                    </div>
                )}

                {/* Result Card */}
                {result ? (
                    <div className="space-y-4 animate-slide-up">
                        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 text-center relative overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-lt-yellow via-lt-orange to-lt-red"></div>
                            
                            <div className="mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estimated Fare</p>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-2xl font-bold text-slate-300">₱</span>
                                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                                        {result.fare}
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-50 pt-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                                        <i className="fas fa-road text-[10px]"></i>
                                        <p className="text-[9px] font-black uppercase tracking-widest">Distance</p>
                                    </div>
                                    <p className="text-lg font-black text-slate-800">{result.distance} <span className="text-xs font-bold text-slate-400">km</span></p>
                                </div>
                                <div className="text-center border-l border-slate-100">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                                        <i className="fas fa-clock text-[10px]"></i>
                                        <p className="text-[9px] font-black uppercase tracking-widest">Duration</p>
                                    </div>
                                    <p className="text-lg font-black text-slate-800">~{result.time} <span className="text-xs font-bold text-slate-400">min</span></p>
                                </div>
                            </div>
                        </div>

                        {showMap && (
                            <div className="h-56 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner relative animate-fade-in group">
                                <iframe 
                                    key={result.mapUrl}
                                    src={result.mapUrl}
                                    className="w-full h-full transition-all duration-700 group-hover:scale-105"
                                    title="Route Preview"
                                ></iframe>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Live Route View</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-center p-8 space-y-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                            <i className="fas fa-taxi text-xl opacity-20"></i>
                        </div>
                        <p className="text-xs font-medium italic leading-relaxed">
                            Select an origin and destination to calculate your estimated metered fare.
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lt-orange"></span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">LTFRB Rates 2025</span>
                </div>
                <div className="flex items-center gap-4">
                    <i className="fas fa-info-circle text-slate-300 text-xs cursor-help" title="₱45 flag-down + ₱13.50/km + time charges"></i>
                    <i className="fas fa-shield-alt text-slate-300 text-xs"></i>
                </div>
            </div>
        </div>
    );
};

const VisitorInfoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'culture' | 'emergency'>(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return (tab === 'culture' || tab === 'emergency') ? tab : 'culture';
  });

  const [emergencyFilter, setEmergencyFilter] = useState<'All' | 'Hospital' | 'Police' | 'Fire Station' | 'Rescue' | 'Vet' | 'Pharmacy'>('All');
  const [selectedContact, setSelectedContact] = useState(EMERGENCY_CONTACTS[0]);

  const [activeFact, setActiveFact] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    // If we have an event parameter, redirect to the new events page
    if (searchParams.get('event')) {
        window.location.href = `/events?id=${searchParams.get('event')}`;
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'culture' | 'emergency') => {
      setActiveTab(tab);
      setActiveFact(null); // Clear facts when switching tabs
      trackEvent('view', `tab_${tab}`, '/visitor-info');
  };

  const handleNormClick = useMemo(() => (e: React.MouseEvent, norm: Norm) => {
    if (!norm.facts || norm.facts.length === 0) return;
    
    const randomFact = norm.facts[Math.floor(Math.random() * norm.facts.length)];
    setActiveFact({
      text: randomFact,
      x: e.clientX,
      y: e.clientY
    });
    
    trackEvent('click', `norm_fact_${norm.title}`, '/visitor-info');
  }, []);

  const filteredContacts = EMERGENCY_CONTACTS.filter(
    (contact) => emergencyFilter === 'All' || contact.type === emergencyFilter
  );

  const tabClass = (tab: 'culture' | 'emergency') => {
      const isActive = activeTab === tab;
      const activeColor = tab === 'culture' ? 'text-lt-blue border-lt-blue bg-lt-blue/10' : 'text-lt-red border-lt-red bg-lt-red/10';
      return `flex-1 py-4 px-2 text-center font-bold text-sm md:text-base transition-all border-b-4 rounded-t-lg flex items-center justify-center gap-2 ${isActive ? activeColor : 'border-transparent text-slate-500 hover:bg-slate-100'}`;
  };

  return (
    <section id="visitor-info" className="min-h-screen bg-slate-50 pt-20 md:pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            <AnimatedElement>
                <div className="text-center mb-10">
                    <span className="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Travel Guide</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Visitor Information</h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600">Plan your journey with local knowledge and safety tips.</p>
                </div>
            </AnimatedElement>

            <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-slate-100 sticky top-24 z-30">
                <div className="flex">
                    <button onClick={() => handleTabChange('culture')} className={tabClass('culture')}><i className="fas fa-book-open"></i> Culture & Transpo</button>
                    <button onClick={() => handleTabChange('emergency')} className={tabClass('emergency')}><i className="fas fa-exclamation-circle"></i> Emergency</button>
                </div>
            </div>

            {activeTab === 'culture' && (
                <div className="animate-fade-in space-y-10">
                    
                    {/* Transportation Guide Card */}
                    <AnimatedElement>
                        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-l-8 border-lt-orange relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-lt-orange/10 rounded-full blur-2xl"></div>
                            
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                                <i className="fas fa-shuttle-van text-lt-orange"></i> Transportation Guide
                            </h2>
                            
                            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
                                {/* Taxi Section - Col 1 & 2 */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                            <i className="fas fa-taxi text-lt-moss"></i> Boundary Regulations
                                        </h3>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* White Taxi Info */}
                                            <div 
                                                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-slate-400 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95"
                                                onClick={(e) => setActiveFact({
                                                    text: "White taxis are the only ones allowed to pick up in Baguio for LT trips. Always check the meter!",
                                                    x: e.clientX,
                                                    y: e.clientY
                                                })}
                                            >
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-2">Baguio (White) Taxis</h4>
                                                <p className="text-[11px] text-slate-600 leading-tight">These are city-based taxis. They can take you from Baguio to any point in La Trinidad and back. Preferred for cross-boundary travel.</p>
                                            </div>
                                            {/* Grey Taxi Info */}
                                            <div 
                                                className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 border-l-4 border-slate-400 cursor-pointer hover:bg-slate-700 transition-colors active:scale-95"
                                                onClick={(e) => setActiveFact({
                                                    text: "Grey taxis are proud locals! They know the shortcuts within La Trinidad like the back of their hand.",
                                                    x: e.clientX,
                                                    y: e.clientY
                                                })}
                                            >
                                                <h4 className="text-xs font-black text-white uppercase tracking-tighter mb-2">LT (Grey) Taxis</h4>
                                                <p className="text-[11px] text-slate-300 leading-tight">Specifically for La Trinidad operations. They generally <strong>cannot</strong> pick up passengers within Baguio City bound for the valley.</p>
                                            </div>
                                        </div>
                                        
                                        {/* Pro Tip Box */}
                                        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><i className="fas fa-lightbulb text-blue-600 text-sm"></i></div>
                                            <div>
                                                <h4 className="font-bold text-blue-900 text-sm mb-1">Local Pro-Tip</h4>
                                                <p className="text-blue-800 text-[11px] leading-relaxed">Always confirm the taxi meter is on (starts at ₱45). If you are traveling between 10 PM and 4 AM, ensure the driver is comfortable with the destination as mountain roads are poorly lit.</p>
                                            </div>
                                        </div>
                                    </div>

                                     {/* Jeepney Route Navigator */}
                                     <JeepneyRouteNavigator />
                                  </div>

                                {/* Smart Estimator Tool - Col 3 */}
                                <div className="lg:col-span-1">
                                    <TaxiEstimator />
                                </div>
                            </div>
                        </div>
                    </AnimatedElement>

                    {/* Inayan Feature */}
                    <AnimatedElement>
                        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-l-8 border-lt-blue relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-lt-blue/10 rounded-full opacity-50 blur-3xl"></div>
                            <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">
                                <div className="md:col-span-1 text-center md:text-left"><h2 className="text-5xl font-extrabold text-lt-blue mb-2 font-serif">Inayan</h2><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Core Value</p></div>
                                <div className="md:col-span-2"><p className="text-slate-700 text-lg leading-relaxed italic">"Inayan" is a moral compass. It essentially means preventing oneself from doing bad to others or the environment out of fear of a supreme being. Respect the land and its people.</p></div>
                            </div>
                        </div>
                    </AnimatedElement>

                    {/* Norms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {LOCAL_NORMS.map((norm, index) => (
                            <AnimatedElement 
                                key={index} 
                                delay={(index % 3) * 100} 
                                direction="up" 
                                distance={80}
                                scale={0.6}
                                rotate={index % 2 === 0 ? -5 : 5}
                            >
                                <div 
                                    className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl h-full flex flex-col group border border-slate-100 hover:border-lt-blue relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
                                    onClick={(e) => handleNormClick(e, norm)}
                                >
                                    <div className="w-14 h-14 bg-lt-blue/10 text-lt-blue rounded-2xl flex items-center justify-center text-2xl mb-6 relative z-10 group-hover:scale-110 transition-transform"><i className={norm.icon}></i></div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-lt-blue transition-colors">{norm.title}</h3>
                                    <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{norm.description}</p>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100"><ul className="space-y-2">{norm.points.map((p, i) => (<li key={i} className="flex items-start text-xs text-slate-600"><i className="fas fa-check text-lt-blue mt-1 mr-2"></i><span>{p}</span></li>))}</ul></div>
                                    
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-lt-orange opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fas fa-lightbulb"></i>
                                        <span>Click for a fun fact!</span>
                                    </div>
                                </div>
                            </AnimatedElement>
                        ))}
                    </div>
                </div>
            )}

            {activeFact && (
                <FunFactBubble 
                    fact={activeFact.text} 
                    x={activeFact.x} 
                    y={activeFact.y} 
                    onClose={() => setActiveFact(null)} 
                />
            )}

            {activeTab === 'emergency' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{EMERGENCY_HOTLINES.map((hotline, index) => (
                        <a key={index} href={hotline.href} className="bg-white border-2 border-lt-red/10 hover:border-lt-red hover:bg-red-50 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center group transition-all"><i className="fas fa-phone-alt text-2xl text-lt-red mb-2 group-hover:scale-110 transition-transform"></i><span className="text-[10px] text-slate-500 font-bold uppercase">{hotline.label}</span><span className="text-lg font-extrabold text-slate-900">{hotline.number}</span></a>
                    ))}</div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        <div className="lg:col-span-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                            <div className="p-4 bg-slate-50 border-b border-slate-200"><div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">{(['All', 'Hospital', 'Police', 'Fire Station', 'Rescue', 'Vet', 'Pharmacy'] as const).map((f) => (<button key={f} onClick={() => setEmergencyFilter(f)} className={`whitespace-nowrap flex-shrink-0 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${emergencyFilter === f ? 'bg-lt-red text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border'}`}>{f}</button>))}</div></div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">{filteredContacts.map((contact, index) => (
                                <div key={index} onClick={() => setSelectedContact(contact)} className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedContact.name === contact.name ? 'border-lt-red bg-red-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                    <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-lt-red/10 text-lt-red flex items-center justify-center shrink-0"><i className={contact.icon}></i></div><div><h3 className="font-bold text-slate-800 text-sm">{contact.name}</h3><div className="flex items-center mt-2 gap-2"><span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border text-slate-500">{contact.type}</span><a href={`tel:${contact.phone.split('/')[0].trim()}`} className="text-[10px] bg-lt-red text-white px-2 py-0.5 rounded font-bold" onClick={(e) => e.stopPropagation()}>Call</a></div></div></div>
                                </div>
                            ))}</div>
                        </div>
                        <div className="lg:col-span-2 bg-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
                            <iframe key={selectedContact.name} src={selectedContact.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" title={`Map of ${selectedContact.name}`} className="w-full h-full"></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </section>
  );
};

export default VisitorInfoPage;