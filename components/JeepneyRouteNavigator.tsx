import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JEEPNEY_ROUTES } from '../constants';
import { fetchJeepneyRoutes } from '../services/apiService';
import { JeepneyRoute } from '../types';
import AnimatedElement from './AnimatedElement';
import JeepneyAnimatedMap from './JeepneyAnimatedMap';
import { JEEPNEY_ROUTE_DESTINATIONS, RouteDestination } from '../utils/jeepneyMapping';

const EXCLUDED_KEYWORDS = ['beckel', 'shilan', 'ambiong', 'tublay'];

const isExcludedRoute = (name?: string) => {
    if (!name) return false;
    const lower = name.toLowerCase();
    return EXCLUDED_KEYWORDS.some(k => lower.includes(k));
};

const INITIAL_ROUTES = JEEPNEY_ROUTES.filter(r => !isExcludedRoute(r.name));

const JeepneyRouteNavigator: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [routes, setRoutes] = useState<JeepneyRoute[]>(INITIAL_ROUTES);
    const [selectedRoute, setSelectedRoute] = useState<JeepneyRoute>(INITIAL_ROUTES[0]);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
    const [mapView, setMapView] = useState<'terminal' | 'route'>('route');
    const [isReversed, setIsReversed] = useState(false);

    // Deep link sync from URL query param e.g. ?route=Buyagan
    useEffect(() => {
        const routeParam = searchParams.get('route');
        if (routeParam && routes.length > 0) {
            const matched = routes.find(r => 
                r.name.toLowerCase().includes(routeParam.toLowerCase()) || 
                r.signboard.text.toLowerCase().includes(routeParam.toLowerCase())
            );
            if (matched && matched.name !== selectedRoute.name) {
                const timer = setTimeout(() => {
                    setSelectedRoute(matched);
                    setSelectedVariantIndex(0);
                    setIsReversed(false);
                    
                    const el = document.getElementById('jeepney-navigator');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [searchParams, routes, selectedRoute.name]);

    useEffect(() => {
        const loadRoutes = async () => {
            try {
                const apiRoutes = await fetchJeepneyRoutes();
                
                // Merge strategy:
                // Start with pristine local JEEPNEY_ROUTES without excluded routes.
                const merged = [...INITIAL_ROUTES];
                
                if (apiRoutes && apiRoutes.length > 0) {
                    apiRoutes.forEach(apiRoute => {
                        if (isExcludedRoute(apiRoute.name)) return;

                        const localIndex = merged.findIndex(r => r.name.toLowerCase() === apiRoute.name.toLowerCase());
                        if (localIndex >= 0) {
                            merged[localIndex] = {
                                ...merged[localIndex],
                                ...apiRoute,
                                path: merged[localIndex].path.map((stop, sIdx) => {
                                    const apiStop = apiRoute.path?.[sIdx];
                                    return {
                                        ...stop,
                                        ...apiStop,
                                        coordinates: stop.coordinates || apiStop?.coordinates
                                    };
                                })
                            };
                        } else if (!apiRoute.name.toLowerCase().includes('camp dangwa via')) {
                            merged.push(apiRoute);
                        }
                    });
                }
                
                const finalRoutes = merged.filter(r => !isExcludedRoute(r.name));
                setRoutes(finalRoutes);
                
                // Use functional update to avoid dependency on selectedRoute
                setSelectedRoute(prev => {
                    const matched = finalRoutes.find(r => r.name.toLowerCase() === prev.name.toLowerCase());
                    return matched || finalRoutes[0];
                });
            } catch (err) {
                console.error("Failed to load jeepney routes", err);
            }
        };
        loadRoutes();
    }, []);

    const handleRouteSelect = (route: JeepneyRoute) => {
        setSelectedRoute(route);
        setSelectedVariantIndex(0);
        setIsReversed(false); // Reset to default direction when changing routes
    };

    // Active route data (incorporates current variant if route has variants)
    const activeVariant = selectedRoute.variants && selectedRoute.variants[selectedVariantIndex];
    const currentRouteData: JeepneyRoute = activeVariant 
        ? {
            ...selectedRoute,
            ...activeVariant,
            // Keep main route name for consistency
            name: `${selectedRoute.name} (${activeVariant.name})`
          }
        : selectedRoute;

    const displayPath = isReversed ? [...currentRouteData.path].reverse() : currentRouteData.path;
    const origin = currentRouteData.path[0].stop;
    const destination = currentRouteData.path[currentRouteData.path.length - 1].stop;
    
    const currentOrigin = isReversed ? destination : origin;
    const currentDestination = isReversed ? origin : destination;

    // Signboard logic: Show the main destination
    const displaySignboardText = isReversed 
        ? (origin.includes('Magsaysay') ? 'BAGUIO - MAGSAYSAY' : origin.toUpperCase())
        : currentRouteData.signboard.text;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="bg-lt-blue p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-route text-white text-sm"></i>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest">Jeepney Route Guide</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                {/* Route List / Selection */}
                <div className="w-full lg:w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Route</p>
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{routes.length} Routes</span>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-3 max-h-[400px] lg:max-h-none bg-slate-50/50 shadow-inner">
                        {routes.map((route) => {
                            const isActive = selectedRoute.name === route.name;
                            const buttonBase = "w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center gap-4 group relative overflow-hidden";
                            const buttonActive = isActive 
                                ? "bg-white border-lt-blue shadow-xl shadow-lt-blue/10 z-10 scale-[1.02]" 
                                : "bg-white border-transparent hover:border-slate-200 hover:bg-white/80 shadow-sm";
                            
                            return (
                                <button
                                    key={route.name}
                                    onClick={() => handleRouteSelect(route)}
                                    className={`${buttonBase} ${buttonActive}`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-lt-blue animate-pulse"></div>
                                    )}
                                    
                                    {/* Mini Signboard Icon */}
                                    <div className={`w-14 h-9 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-110 ${route.signboard.backgroundColor}`}>
                                        <span className={`text-[7px] font-black text-center leading-tight px-1 ${route.signboard.color}`}>
                                            {route.signboard.text.split(' - ')[0]}
                                        </span>
                                    </div>
                                    
                                    <div className="overflow-hidden">
                                        <p className={`text-sm font-black truncate tracking-tight ${isActive ? 'text-lt-blue' : 'text-slate-800'}`}>
                                            {route.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <i className={`fas fa-map-marker-alt text-[8px] ${isActive ? 'text-lt-blue/60' : 'text-slate-400'}`}></i>
                                            <p className="text-[10px] text-slate-400 truncate font-medium">via {route.terminal.name}</p>
                                        </div>
                                        {route.variants && route.variants.length > 0 && (
                                            <div className="mt-1 flex items-center gap-1">
                                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                    {route.variants.length} Route Options
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {isActive && (
                                        <div className="ml-auto">
                                            <i className="fas fa-chevron-right text-lt-blue text-[10px] animate-bounce-x"></i>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Scroll Hint (Mobile) */}
                    <div className="lg:hidden p-3 text-center border-t border-slate-200 bg-white shadow-lg">
                        <p className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-2">
                            <i className="fas fa-arrows-up-down text-lt-blue"></i>
                            Scroll for more routes
                        </p>
                    </div>
                </div>

                {/* Route Details */}
                <div className="w-full lg:w-2/3 p-6 overflow-y-auto custom-scrollbar bg-white">
                    <AnimatedElement key={`${selectedRoute.name}-${selectedVariantIndex}`} direction="up" distance={20} duration={0.4}>
                        <div className="space-y-8">
                            {/* Variant Selector (e.g. for Tublay) */}
                            {selectedRoute.variants && selectedRoute.variants.length > 0 && (
                                <div className="bg-slate-100/80 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200/80 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-lt-blue text-white flex items-center justify-center">
                                            <i className="fas fa-directions text-xs"></i>
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Route Option</span>
                                            <span className="text-[10px] text-slate-500 font-medium">Choose preferred highway path</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {selectedRoute.variants.map((variant, vIdx) => (
                                            <button
                                                key={variant.name}
                                                onClick={() => setSelectedVariantIndex(vIdx)}
                                                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                                    selectedVariantIndex === vIdx
                                                        ? 'bg-lt-blue text-white shadow-md shadow-lt-blue/20 scale-[1.02]'
                                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                                }`}
                                            >
                                                <i className={`fas ${vIdx === 0 ? 'fa-road' : 'fa-alt-route'} text-[10px]`}></i>
                                                <span>{variant.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Signboard Visual */}
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                                <div className="absolute top-2 left-2 text-[8px] font-bold text-slate-300 uppercase">Look for this signboard:</div>
                                <div className={`px-8 py-4 rounded-xl border-4 border-slate-800 shadow-2xl transform -rotate-1 ${currentRouteData.signboard.backgroundColor}`}>
                                    <h3 className={`text-2xl md:text-3xl font-black tracking-tighter text-center ${currentRouteData.signboard.color}`}>
                                        {displaySignboardText}
                                    </h3>
                                </div>
                                
                                <div className="mt-6 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">From</p>
                                            <p className="text-[10px] font-black text-slate-800">{currentOrigin}</p>
                                        </div>
                                        <i className="fas fa-long-arrow-alt-right text-lt-blue"></i>
                                        <div className="text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">To</p>
                                            <p className="text-[10px] font-black text-lt-blue">{currentDestination}</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setIsReversed(!isReversed)}
                                        className="flex items-center gap-2 px-4 py-2 bg-lt-blue text-white rounded-full text-[10px] font-bold shadow-md hover:bg-lt-moss transition-all active:scale-95"
                                    >
                                        <i className={`fas fa-exchange-alt transition-transform duration-500 ${isReversed ? 'rotate-180' : ''}`}></i>
                                        {isReversed ? 'Switch to Baguio → La Trinidad' : 'Switch to La Trinidad → Baguio'}
                                    </button>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Current Terminal
                                    </p>
                                    <p className="text-xs font-bold text-slate-800">
                                        {isReversed ? 'La Trinidad Terminal' : currentRouteData.terminal.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                                        {isReversed ? 'Various spots in La Trinidad' : currentRouteData.terminal.location}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fare (Min)</p>
                                    <p className="text-xl font-black text-slate-900">₱{currentRouteData.fare.minimum}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <p className="text-[10px] text-slate-500">Student/Senior: <span className="font-bold text-lt-blue">₱{currentRouteData.fare.studentSenior}</span></p>
                                        <p className="text-[10px] text-slate-500">Full: <span className="font-bold text-slate-700">₱{currentRouteData.fare.fullRoute}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Accessible Tourist Spots on this Route */}
                            {JEEPNEY_ROUTE_DESTINATIONS[selectedRoute.name] && (
                                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100/80">
                                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <i className="fas fa-camera text-blue-600"></i>
                                        Popular Tourist Spots Accessible via this Route:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {JEEPNEY_ROUTE_DESTINATIONS[selectedRoute.name].map((spot: RouteDestination, sIdx: number) => (
                                            <span
                                                key={sIdx}
                                                className="inline-flex items-center gap-1.5 bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs hover:border-blue-400 transition-colors"
                                            >
                                                <i className={`${spot.icon} text-blue-600 text-xs`}></i>
                                                {spot.spotName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Map Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {mapView === 'route' ? (isReversed ? 'Return Route Map' : 'Full Route Map') : 'Terminal Location'}
                                    </p>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setMapView('route')}
                                            className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${mapView === 'route' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500'}`}
                                        >
                                            Route
                                        </button>
                                        <button 
                                            onClick={() => setMapView('terminal')}
                                            className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${mapView === 'terminal' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500'}`}
                                        >
                                            Terminal
                                        </button>
                                    </div>
                                </div>
                                <div className="h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                                    <JeepneyAnimatedMap 
                                        route={currentRouteData}
                                        isReversed={isReversed}
                                        mapView={mapView}
                                    />
                                </div>
                            </div>

                            {/* Route Path / Timeline */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Path & Landmarks</p>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                        <span>{currentOrigin}</span>
                                        <i className="fas fa-long-arrow-alt-right text-lt-blue"></i>
                                        <span>{currentDestination}</span>
                                    </div>
                                </div>
                                <div className="relative pl-8 space-y-6">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                                    
                                    {displayPath.map((stop, idx) => {
                                        const dotClass = stop.isLandmark 
                                            ? 'bg-lt-blue border-lt-blue text-white shadow-lg shadow-lt-blue/20' 
                                            : 'bg-white border-slate-300 text-slate-400';
                                            
                                        return (
                                            <div key={idx} className="relative flex items-center gap-4">
                                                {/* Dot/Icon */}
                                                <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${dotClass}`}>
                                                    {stop.isLandmark ? (
                                                        <i className={`${stop.landmarkIcon || 'fas fa-star'} text-[10px]`}></i>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <p className={`text-sm font-bold ${stop.isLandmark ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {stop.stop}
                                                    </p>
                                                    {stop.isLandmark && (
                                                        <span className="text-[9px] font-bold text-lt-blue uppercase">Major Landmark</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-clock"></i>
                                    <span>{currentRouteData.operatingHours}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-sync-alt"></i>
                                    <span>{currentRouteData.frequency}</span>
                                </div>
                            </div>
                        </div>
                    </AnimatedElement>
                </div>
            </div>
        </div>
    );
};

export default JeepneyRouteNavigator;
