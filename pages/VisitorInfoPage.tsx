import React, { useState, useEffect, useMemo } from 'react';
import { LOCAL_NORMS, EMERGENCY_CONTACTS, EMERGENCY_HOTLINES } from '../constants';
import { fetchLocalEvents, trackEvent } from '../services/apiService';
import type { LocalEvent } from '../types';
import AnimatedElement from '../components/AnimatedElement';
import FunFactBubble from '../components/FunFactBubble';

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

const TaxiEstimator: React.FC = () => {
    const [originId, setOriginId] = useState('sm');
    const [destId, setDestId] = useState('strawberry');
    const [isHeavyTraffic, setIsHeavyTraffic] = useState(false);
    const [showMap, setShowMap] = useState(true);

    const result = useMemo(() => {
        if (originId === destId) return null;
        
        const origin = LANDMARKS.find(l => l.id === originId)!;
        const dest = LANDMARKS.find(l => l.id === destId)!;
        
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
            distance: actualDist.toFixed(1),
            fare: estimatedFare,
            time: timeMins,
            isBoundaryIssue: origin.area === 'LT' && dest.area === 'Baguio',
            mapUrl: `https://www.google.com/maps/embed/v1/directions?key=API_KEY_NOT_NEEDED_FOR_EMBED&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&mode=driving`
        };
    }, [originId, destId, isHeavyTraffic]);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-lt-yellow rounded-lg flex items-center justify-center">
                        <i className="fas fa-calculator text-slate-900 text-sm"></i>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest">Taxi Fare Engine</span>
                </div>
                <button onClick={() => setShowMap(!showMap)} className="text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                    {showMap ? 'Hide Map' : 'Show Map'}
                </button>
            </div>

            <div className="p-6 space-y-6 flex-grow">
                {/* Selectors */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">From</label>
                        <i className="fas fa-circle-dot absolute left-4 top-[38px] text-lt-blue text-xs z-10"></i>
                        <select 
                            value={originId} 
                            onChange={e => setOriginId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lt-blue outline-none appearance-none cursor-pointer"
                        >
                            {LANDMARKS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">To</label>
                        <i className="fas fa-location-dot absolute left-4 top-[38px] text-lt-red text-xs z-10"></i>
                        <select 
                            value={destId} 
                            onChange={e => setDestId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-lt-red outline-none appearance-none cursor-pointer"
                        >
                            {LANDMARKS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Traffic Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isHeavyTraffic ? 'bg-red-100 text-red-600' : 'bg-lt-yellow/20 text-lt-orange'}`}>
                            <i className={`fas ${isHeavyTraffic ? 'fa-car-side' : 'fa-sun'}`}></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">{isHeavyTraffic ? 'Heavy Rush Hour' : 'Light Traffic'}</p>
                            <p className="text-[10px] text-slate-500">Affects time & per-min charge</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsHeavyTraffic(!isHeavyTraffic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isHeavyTraffic ? 'bg-red-500' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHeavyTraffic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Boundary Warning */}
                {result?.isBoundaryIssue && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-3 animate-fade-in">
                        <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
                        <p className="text-[10px] text-amber-800 leading-tight">
                            <strong>Note:</strong> You are crossing from La Trinidad to Baguio. Grey Taxis cannot legally make this trip. Ensure you hail a <strong>White Taxi</strong>.
                        </p>
                    </div>
                )}

                {/* Result Card */}
                {result ? (
                    <div className="space-y-4">
                        <div className="bg-lt-moss/5 border border-lt-moss/10 rounded-2xl p-5 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lt-yellow to-lt-orange"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Fare</p>
                            <h3 className="text-4xl font-black text-slate-900 flex items-center justify-center gap-1">
                                <span className="text-xl font-bold text-slate-400">₱</span>{result.fare}
                            </h3>
                            <div className="flex justify-center gap-6 mt-4 border-t border-slate-100 pt-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Distance</p>
                                    <p className="text-sm font-bold text-slate-800">{result.distance} km</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Duration</p>
                                    <p className="text-sm font-bold text-slate-800">~{result.time} mins</p>
                                </div>
                            </div>
                        </div>

                        {showMap && (
                            <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner relative animate-fade-in">
                                <iframe 
                                    src={`https://maps.google.com/maps?q=${LANDMARKS.find(l => l.id === destId)?.lat},${LANDMARKS.find(l => l.id === destId)?.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                    className="w-full h-full grayscale opacity-80"
                                    title="Route Preview"
                                ></iframe>
                                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs text-center p-6 italic">
                        Select an origin and destination to calculate the metered fare.
                    </div>
                )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-medium italic">Rates: ₱45 + ₱13.50/km (2025)</span>
                <i className="fas fa-shield-alt text-slate-300 text-xs"></i>
            </div>
        </div>
    );
};

const VisitorInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'culture' | 'events' | 'emergency'>('culture');
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const [emergencyFilter, setEmergencyFilter] = useState<'All' | 'Hospital' | 'Police' | 'Fire Station' | 'Rescue' | 'Vet' | 'Pharmacy'>('All');
  const [selectedContact, setSelectedContact] = useState(EMERGENCY_CONTACTS[0]);

  const [activeFact, setActiveFact] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
      const loadEvents = async () => {
          setIsLoadingEvents(true);
          try {
              const data = await fetchLocalEvents();
              setEvents(data);
          } catch (err) {
              console.error("Unable to load events at this time:", err);
          } finally {
              setIsLoadingEvents(false);
          }
      };
      loadEvents();
  }, []);

  const handleTabChange = (tab: 'culture' | 'events' | 'emergency') => {
      setActiveTab(tab);
      setActiveFact(null); // Clear facts when switching tabs
      trackEvent('view', `tab_${tab}`, '/visitor-info');
  };

  const handleNormClick = (e: React.MouseEvent, norm: any) => {
    if (!norm.facts || norm.facts.length === 0) return;
    
    const randomFact = norm.facts[Math.floor(Math.random() * norm.facts.length)];
    setActiveFact({
      text: randomFact,
      x: e.clientX,
      y: e.clientY
    });
    
    trackEvent('click', `norm_fact_${norm.title}`, '/visitor-info');
  };

  const filteredContacts = EMERGENCY_CONTACTS.filter(
    (contact) => emergencyFilter === 'All' || contact.type === emergencyFilter
  );

  const tabClass = (tab: 'culture' | 'events' | 'emergency') => {
      const isActive = activeTab === tab;
      let activeColor = tab === 'culture' ? 'text-lt-blue border-lt-blue bg-lt-blue/10' : tab === 'events' ? 'text-lt-yellow border-lt-yellow bg-lt-yellow/10' : 'text-lt-red border-lt-red bg-lt-red/10';
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
                    <button onClick={() => handleTabChange('events')} className={tabClass('events')}><i className="fas fa-calendar-alt"></i> Events</button>
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

                                            {/* Jeepney Section */}
                                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                                    <i className="fas fa-bus text-lt-blue"></i> Jeepney Hubs
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {[
                                                        { 
                                                            name: 'Baguio City Hall', 
                                                            desc: 'Beside Fire Station. Routes: Buyagan, Km. 5, Km. 6.', 
                                                            tags: ['Best for Farm'],
                                                            icon: 'fa-landmark',
                                                            fact: 'Jeepneys are the heartbeat of the valley. Riding one is the most authentic local experience!'
                                                        },
                                                        { 
                                                            name: 'Baguio Center Mall', 
                                                            desc: 'LG Floor. Frequent LT Proper trips.', 
                                                            tags: ['Central'],
                                                            icon: 'fa-shopping-bag',
                                                            fact: 'The Center Mall terminal is the most convenient if you are coming from the city center.'
                                                        }
                                                    ].map((terminal, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="flex gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all cursor-pointer active:scale-95"
                                                            onClick={(e) => setActiveFact({
                                                                text: terminal.fact,
                                                                x: e.clientX,
                                                                y: e.clientY
                                                            })}
                                                        >
                                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                                <i className={`fas ${terminal.icon} text-sm`}></i>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-xs mb-1">{terminal.name}</h4>
                                                                <p className="text-[10px] text-slate-500 leading-relaxed">{terminal.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
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

            {activeTab === 'events' && (
                <div className="animate-fade-in">
                    <AnimatedElement><div className="bg-gradient-to-r from-lt-yellow to-lt-orange rounded-3xl p-8 text-center text-slate-900 mb-10 shadow-xl"><h2 className="text-3xl font-bold mb-2">Festivities & Celebrations</h2><p className="opacity-80 font-medium">Join the community gatherings of La Trinidad.</p></div></AnimatedElement>
                    {isLoadingEvents ? <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-4xl text-lt-orange"></i></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{events.map((event, index) => (
                            <AnimatedElement 
                                key={event._id || index} 
                                delay={(index % 2) * 150} 
                                direction={index % 2 === 0 ? 'left' : 'right'} 
                                distance={100}
                                scale={0.8}
                                rotate={index % 2 === 0 ? -3 : 3}
                            >
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row h-full border border-slate-100 hover:shadow-2xl transition-shadow group">
                                    <div className="w-full md:w-2/5 relative h-48 md:h-auto overflow-hidden"><img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /><div className="absolute top-4 left-4"><span className="bg-lt-yellow/90 backdrop-blur text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase">{event.badge}</span></div></div>
                                    <div className="p-6 w-full md:w-3/5 flex flex-col justify-center"><div className="text-lt-orange font-bold text-sm mb-1 uppercase tracking-wide">{event.date}</div><h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-lt-orange transition-colors">{event.title}</h3><p className="text-slate-600 text-sm mb-4">{event.description}</p><div className="mt-auto flex items-center text-xs text-slate-500 font-medium"><i className="fas fa-map-pin mr-2 text-lt-blue"></i> {event.location}</div></div>
                                </div>
                            </AnimatedElement>
                        ))}</div>
                    )}
                </div>
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