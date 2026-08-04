import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { JeepneyRoute } from '../types';

interface JeepneyAnimatedMapProps {
    route: JeepneyRoute;
    isReversed: boolean;
    mapView: 'route' | 'terminal';
}

// Sub-component to control map viewport and fit bounds dynamically
const MapController: React.FC<{ path: [number, number][] }> = ({ path }) => {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
    }, [map, path]);
    return null;
};

// Sub-component to animate the jeepney along the coordinates array
const AnimatedJeepneyMarker: React.FC<{ path: [number, number][] }> = ({ path }) => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const progressRef = useRef(0);
    const lastTimeRef = useRef(0);
    
    useEffect(() => {
        if (!path || path.length < 2) return;
        
        let active = true;
        progressRef.current = 0;
        lastTimeRef.current = Date.now();
        
        const animate = () => {
            if (!active) return;
            const now = Date.now();
            const elapsed = now - lastTimeRef.current;
            lastTimeRef.current = now;
            
            // Loop through the segments smoothly
            // Adjust the speed constant to slow down or speed up the animation
            const speed = 0.00015 * elapsed; 
            progressRef.current += speed;
            
            if (progressRef.current >= path.length - 1) {
                progressRef.current = 0;
            }
            
            const floatIdx = progressRef.current;
            const idx = Math.floor(floatIdx);
            const nextIdx = (idx + 1) % path.length;
            const t = floatIdx - idx;
            
            const p1 = path[idx];
            const p2 = path[nextIdx];
            
            if (p1 && p2) {
                const lat = p1[0] * (1 - t) + p2[0] * t;
                const lng = p1[1] * (1 - t) + p2[1] * t;
                setPosition([lat, lng]);
            }
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
        return () => {
            active = false;
        };
    }, [path]);
    
    if (!position) return null;
    
    // Custom DIV icon for the jeepney indicator
    const jeepIcon = L.divIcon({
        html: `
            <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute inset-0 bg-lt-blue/35 rounded-full animate-ping"></div>
                <div class="w-6 h-6 bg-white rounded-full border-2 border-lt-blue flex items-center justify-center shadow-lg transition-transform scale-110">
                    <i class="fas fa-shuttle-van text-lt-blue text-[9px]"></i>
                </div>
            </div>
        `,
        className: 'custom-jeepney-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
    
    return (
        <Marker position={position} icon={jeepIcon}>
            <Popup className="custom-popup">
                <div className="text-xs font-bold text-slate-800 p-1">
                    <p className="flex items-center gap-1 text-lt-blue">
                        <i className="fas fa-shuttle-van"></i> Jeepney In Transit
                    </p>
                    <p className="text-[10px] text-slate-500 font-normal mt-0.5">Moving along the route segment.</p>
                </div>
            </Popup>
        </Marker>
    );
};

const JeepneyAnimatedMap: React.FC<JeepneyAnimatedMapProps> = ({ route, isReversed, mapView }) => {
    const [useGoogleRoadMap, setUseGoogleRoadMap] = useState(true);
    const [roadCoords, setRoadCoords] = useState<[number, number][] | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Extract path coordinates
    const originalPathCoords = route.path
        .map(stop => stop.coordinates)
        .filter((coords): coords is [number, number] => !!coords);
        
    const hasCoords = originalPathCoords.length >= 2;
    
    // Use reverse path if required
    const pathCoords = isReversed ? [...originalPathCoords].reverse() : originalPathCoords;
    const pathCoordsKey = pathCoords.map(c => `${c[0]},${c[1]}`).join(';');

    // Fetch exact street-level road route from OSRM so line follows actual roads
    useEffect(() => {
        if (!hasCoords || pathCoords.length < 2 || useGoogleRoadMap) {
            return;
        }
        
        let isMounted = true;
        
        // Defer state update to microtask to prevent cascading render warning
        Promise.resolve().then(() => {
            if (isMounted) setIsLoadingRoute(true);
        });

        // OSRM format: lng,lat;lng,lat;...
        const waypointsParam = pathCoords.map(c => `${c[1]},${c[0]}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypointsParam}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
                    // GeoJSON coordinates are [lng, lat], convert to Leaflet [lat, lng]
                    const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
                        (pt: [number, number]) => [pt[1], pt[0]]
                    );
                    setRoadCoords(coords);
                } else {
                    setRoadCoords(null);
                }
            })
            .catch(err => {
                console.warn('OSRM routing fetch failed, using fallback path:', err);
                if (isMounted) setRoadCoords(null);
            })
            .finally(() => {
                if (isMounted) setIsLoadingRoute(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isReversed, route.name, hasCoords, pathCoordsKey, pathCoords, useGoogleRoadMap]);

    // Final active coordinates (snapped road geometry or fallback waypoints)
    const activePath = roadCoords && roadCoords.length > 0 ? roadCoords : pathCoords;

    // Default coordinates in case of fallback (La Trinidad Central)
    const centerCoords: [number, number] = [16.4550, 120.5900];

    // Fallback google maps url if coordinates are not available for some reason
    const reversedWaypoints = [...route.path].reverse();
    const reverseOrigin = reversedWaypoints[0]?.stop || 'La Trinidad';
    const reverseDest = reversedWaypoints[reversedWaypoints.length - 1]?.stop || 'Magsaysay Terminal Baguio';
    const reverseViaStops = reversedWaypoints.slice(1, -1).map(s => encodeURIComponent(s.stop + ' Benguet')).join('+to:');
    
    const reverseMapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(reverseOrigin + ' Benguet')}&daddr=${reverseViaStops ? reverseViaStops + '+to:' : ''}${encodeURIComponent(reverseDest + ' Baguio')}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

    const displayFallbackUrl = mapView === 'route' 
        ? (isReversed ? reverseMapUrl : route.routeMapUrl)
        : route.terminal.mapUrl;

    // Standard Google Map rendering for exact highway road route
    if (useGoogleRoadMap || !hasCoords || mapView === 'terminal') {
        return (
            <div className="w-full h-full relative">
                {/* Mode Selector overlay */}
                {hasCoords && mapView === 'route' && (
                    <div className="absolute top-3 left-3 z-[10] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 text-xs">
                        <button
                            onClick={() => setUseGoogleRoadMap(true)}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                                useGoogleRoadMap 
                                    ? 'bg-lt-blue text-white shadow-sm' 
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <i className="fas fa-map text-[10px]"></i>
                            <span>Google Road Route</span>
                        </button>
                        <button
                            onClick={() => setUseGoogleRoadMap(false)}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                                !useGoogleRoadMap 
                                    ? 'bg-lt-blue text-white shadow-sm' 
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <i className="fas fa-bus text-[10px]"></i>
                            <span>Interactive Pin Map</span>
                        </button>
                    </div>
                )}

                <iframe 
                    src={displayFallbackUrl}
                    className="w-full h-full border-0"
                    title="Google Maps View"
                    key={`${route.name}-${isReversed}-${mapView}-${displayFallbackUrl}`}
                ></iframe>
            </div>
        );
    }

    // Styles for Polyline
    const pathOptions = { 
        color: '#2563eb', // Beautiful Royal/LT Blue
        weight: 5, 
        opacity: 0.85,
        lineCap: 'round' as const,
        lineJoin: 'round' as const
    };

    return (
        <div className="w-full h-full relative" id="leaflet-map-wrapper">
            {/* Mode Selector overlay */}
            <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 text-xs">
                <button
                    onClick={() => setUseGoogleRoadMap(true)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        useGoogleRoadMap 
                            ? 'bg-lt-blue text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <i className="fas fa-map text-[10px]"></i>
                    <span>Google Road Route</span>
                </button>
                <button
                    onClick={() => setUseGoogleRoadMap(false)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        !useGoogleRoadMap 
                            ? 'bg-lt-blue text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <i className="fas fa-bus text-[10px]"></i>
                    <span>Interactive Pin Map</span>
                </button>
            </div>

            {isLoadingRoute && (
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg text-xs flex items-center gap-2 z-[400] text-slate-700 font-medium border border-slate-100">
                    <i className="fas fa-spinner fa-spin text-lt-blue"></i>
                    <span>Snapping route to actual roads...</span>
                </div>
            )}

            <MapContainer 
                center={activePath[0] || centerCoords} 
                zoom={14} 
                scrollWheelZoom={false}
                className="w-full h-full z-0"
            >
                {/* Clean OpenStreetMap CartoDB Positron style tile layer (elegant and clean) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                {/* Route Path snapped to real roads */}
                <Polyline positions={activePath} pathOptions={pathOptions} />
                
                {/* Route stops / Waypoints */}
                {route.path.map((stop, idx) => {
                    const coords = stop.coordinates;
                    if (!coords) return null;
                    
                    const isTerminal = idx === 0 || idx === route.path.length - 1;
                    
                    // Custom DIV icon for the stop waypoints
                    const stopIcon = L.divIcon({
                        html: `
                            <div class="relative flex items-center justify-center w-6 h-6">
                                <div class="w-4 h-4 ${isTerminal ? 'bg-lt-blue ring-4 ring-blue-100' : 'bg-slate-700 ring-2 ring-white'} rounded-full flex items-center justify-center shadow-md">
                                    <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                            </div>
                        `,
                        className: 'custom-stop-icon',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    });
                    
                    return (
                        <Marker key={idx} position={coords} icon={stopIcon}>
                            <Popup className="custom-popup">
                                <div className="text-xs p-1">
                                    <p className="font-bold text-slate-800">{stop.stop}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {isTerminal ? 'Terminal/End Point' : (stop.isLandmark ? 'Major Landmark' : 'Route Stop')}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                
                {/* Animating Jeepney Marker moving strictly on actual roads */}
                <AnimatedJeepneyMarker path={activePath} />
                
                {/* Auto Bounds and viewport centering */}
                <MapController path={activePath} />
            </MapContainer>
            
            {/* Interactive legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-md border border-slate-100 z-[400] text-[9px] text-slate-600 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-lt-blue inline-block ring-2 ring-blue-50"></span>
                    <span className="font-bold text-slate-800">Terminal Stop</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
                    <span>Route Stop</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1 bg-blue-600 rounded-full inline-block"></span>
                    <span>Paved Road Route</span>
                </div>
            </div>
        </div>
    );
};

export default JeepneyAnimatedMap;
