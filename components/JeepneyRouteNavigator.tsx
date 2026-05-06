import React, { useState, useEffect } from 'react';
import { JEEPNEY_ROUTES } from '../constants';
import { fetchJeepneyRoutes } from '../services/apiService';
import { JeepneyRoute } from '../types';
import AnimatedElement from './AnimatedElement';

const JeepneyRouteNavigator: React.FC = () => {
    const [routes, setRoutes] = useState<JeepneyRoute[]>(JEEPNEY_ROUTES);
    const [selectedRoute, setSelectedRoute] = useState<JeepneyRoute>(JEEPNEY_ROUTES[0]);
    const [mapView, setMapView] = useState<'terminal' | 'route'>('route');
    const [isReversed, setIsReversed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRoutes = async () => {
            try {
                const apiRoutes = await fetchJeepneyRoutes();
                if (apiRoutes && apiRoutes.length > 0) {
                    setRoutes(apiRoutes);
                    setSelectedRoute(apiRoutes[0]);
                }
            } catch (err) {
                console.error("Failed to load jeepney routes", err);
            } finally {
                setLoading(false);
            }
        };
        loadRoutes();
    }, []);

    const handleRouteSelect = (route: JeepneyRoute) => {
        setSelectedRoute(route);
        setIsReversed(false); // Reset to default direction when changing routes
    };

    const displayPath = isReversed ? [...selectedRoute.path].reverse() : selectedRoute.path;
    const origin = selectedRoute.path[0].stop;
    const destination = selectedRoute.path[selectedRoute.path.length - 1].stop;
    
    const currentOrigin = isReversed ? destination : origin;
    const currentDestination = isReversed ? origin : destination;
    
    // Attempt to reverse the map URL if it's a standard Google Maps saddr/daddr URL
    const getReversedMapUrl = (url?: string) => {
        if (!url) return url;
        if (url.includes('saddr=') && url.includes('daddr=')) {
            const saddrMatch = url.match(/saddr=([^&]+)/);
            const daddrMatch = url.match(/daddr=([^&]+)/);
            if (saddrMatch && daddrMatch) {
                return url.replace(saddrMatch[0], `saddr=${daddrMatch[1]}`).replace(daddrMatch[0], `daddr=${saddrMatch[1]}`);
            }
        }
        return url;
    };

    const displayMapUrl = mapView === 'route' 
        ? (isReversed ? getReversedMapUrl(selectedRoute.routeMapUrl) : selectedRoute.routeMapUrl)
        : selectedRoute.terminal.mapUrl;

    // Signboard logic: Show the main destination
    const displaySignboardText = isReversed 
        ? (origin.includes('Magsaysay') ? 'BAGUIO - MAGSAYSAY' : origin.toUpperCase())
        : selectedRoute.signboard.text;

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
                    <AnimatedElement key={selectedRoute.name} direction="up" distance={20} duration={0.4}>
                        <div className="space-y-8">
                            {/* Signboard Visual */}
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                                <div className="absolute top-2 left-2 text-[8px] font-bold text-slate-300 uppercase">Look for this signboard:</div>
                                <div className={`px-8 py-4 rounded-xl border-4 border-slate-800 shadow-2xl transform -rotate-1 ${selectedRoute.signboard.backgroundColor}`}>
                                    <h3 className={`text-2xl md:text-3xl font-black tracking-tighter text-center ${selectedRoute.signboard.color}`}>
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
                                        {isReversed ? 'La Trinidad Terminal' : selectedRoute.terminal.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                                        {isReversed ? 'Various spots in La Trinidad' : selectedRoute.terminal.location}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fare (Min)</p>
                                    <p className="text-xl font-black text-slate-900">₱{selectedRoute.fare.minimum}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <p className="text-[10px] text-slate-500">Student/Senior: <span className="font-bold text-lt-blue">₱{selectedRoute.fare.studentSenior}</span></p>
                                        <p className="text-[10px] text-slate-500">Full: <span className="font-bold text-slate-700">₱{selectedRoute.fare.fullRoute}</span></p>
                                    </div>
                                </div>
                            </div>

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
                                    <iframe 
                                        src={displayMapUrl}
                                        className="w-full h-full"
                                        title="Map View"
                                        key={`${selectedRoute.name}-${isReversed}-${mapView}`}
                                    ></iframe>
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
                                    <span>{selectedRoute.operatingHours}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-sync-alt"></i>
                                    <span>{selectedRoute.frequency}</span>
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
