
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TouristSpot } from '../types';
import { fetchTouristSpots, fetchDiningSpots, trackEvent } from '../services/apiService';
import TouristSpotModal from '../components/TouristSpotModal';
import StarRating from '../components/StarRating';
import AnimatedElement from '../components/AnimatedElement';
import AIItineraryPlanner from '../components/AIItineraryPlanner';

const TOURIST_CATEGORIES = ['All', 'Nature', 'Culture', 'Agri-tourism', 'Art', 'Shopping'];
const DINING_CATEGORIES = ['All', 'Local Favorite', 'Fast Food', 'Cafe'];

const TouristSpotsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'tourist' | 'dining'>(() => {
    const tab = searchParams.get('tab');
    return (tab === 'dining') ? 'dining' : 'tourist';
  });
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [items, setItems] = useState<TouristSpot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  const categories = viewMode === 'tourist' ? TOURIST_CATEGORIES : DINING_CATEGORIES;

  // Sync viewMode if search tab parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'itinerary') {
      setIsPlannerOpen(true);
    } else if (tab === 'dining') {
      setViewMode('dining');
    } else {
      setViewMode('tourist');
    }
  }, [searchParams]);

  // Handle URL deep linking and search query
  useEffect(() => {
    const spotName = searchParams.get('spot');
    const searchParam = searchParams.get('search');

    if (spotName && items.length > 0) {
        const query = spotName.toLowerCase();
        const found = items.find(item => {
          const name = item.name.toLowerCase();
          return name.includes(query) || query.includes(name) ||
            (query.includes('stobosa') && name.includes('stobosa')) ||
            (query.includes('stabos') && name.includes('stobosa')) ||
            (query.includes('strawberry') && name.includes('strawberry')) ||
            (query.includes('kalugong') && name.includes('kalugong')) ||
            (query.includes('yangbew') && name.includes('yangbew')) ||
            (query.includes('bell church') && name.includes('bell church')) ||
            (query.includes('costa') && name.includes('costa')) ||
            (query.includes('bahong') && name.includes('bahong'));
        });
        if (found) {
            setSelectedSpot(found);
        }
    }

    if (searchParam) {
        setSearchQuery(searchParam);
        // Scroll to search results if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, items]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setItems([]); 
      try {
        const data = viewMode === 'tourist' 
            ? await fetchTouristSpots() 
            : await fetchDiningSpots();
        setItems(data);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setActiveCategory('All');
    setSearchQuery('');
  }, [viewMode]);

  const handleReviewSubmitted = (updatedSpot: TouristSpot) => {
    setItems(prev =>
      prev.map(s => (s._id === updatedSpot._id ? updatedSpot : s))
    );
    setSelectedSpot(updatedSpot);
  };

  const handleItemClick = (item: TouristSpot) => {
      trackEvent('view', item._id || `spot_${item.name}`, viewMode === 'tourist' ? '/tourist-spots' : '/dining-spots', { name: item.name, category: item.category });
      setSelectedSpot(item);
  };

  const handleModeToggle = (mode: 'tourist' | 'dining') => {
      if (viewMode === mode) return;
      setViewMode(mode);
      setSearchParams({ tab: mode }, { replace: true });
      trackEvent('click', 'mode_toggle', '/tourist-spots', { mode });
  };

  const handleOpenPlanner = () => {
    setIsPlannerOpen(true);
    setSearchParams({ tab: 'itinerary' }, { replace: true });
    trackEvent('click', 'launch_planner_button', '/tourist-spots');
  };

  const handleClosePlanner = () => {
    setIsPlannerOpen(false);
    if (searchParams.get('tab') === 'itinerary') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams, { replace: true });
    }
    trackEvent('click', 'close_planner_button', '/tourist-spots');
  };

  const filteredItems = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-slate-500 py-20">
          <i className={`fas fa-spinner fa-spin text-4xl ${viewMode === 'tourist' ? 'text-lt-blue' : 'text-lt-orange'}`}></i>
          <p className="mt-4">Loading {viewMode === 'tourist' ? 'destinations' : 'flavors'}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg my-10 border border-red-200">
          <i className="fas fa-exclamation-triangle text-4xl text-lt-red"></i>
          <p className="mt-4 font-semibold">{error}</p>
        </div>
      );
    }
    
    if (filteredItems.length === 0) {
      return (
        <div className="text-center text-slate-500 py-20 bg-white rounded-xl shadow-sm border border-slate-200">
          <i className={`fas ${viewMode === 'tourist' ? 'fa-map-marked-alt' : 'fa-utensils'} text-5xl mb-4 text-slate-300`}></i>
          <h3 className="text-xl font-bold text-slate-800">No results found</h3>
          <p className="mt-2 text-sm">Try adjusting your search or category.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredItems.map((item, index) => (
          <AnimatedElement 
            key={item._id || index} 
            delay={(index % 4) * 100} 
            direction="up" 
            distance={60}
            scale={0.7}
            rotate={index % 2 === 0 ? -2 : 2}
          >
            <div 
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 border border-slate-100 relative"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative h-60 overflow-hidden">
                <img src={item.image} alt={item.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                  <span className={`text-white text-sm font-bold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg border ${viewMode === 'tourist' ? 'bg-lt-red border-lt-red/50' : 'bg-lt-orange border-lt-orange/50'}`}>
                      {viewMode === 'tourist' ? 'Explore' : 'View Menu'} <i className="fas fa-arrow-right ml-1"></i>
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                    <span className={`bg-white/90 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md border ${viewMode === 'tourist' ? 'text-lt-moss border-lt-moss/20' : 'text-lt-red border-lt-red/20'}`}>
                        {item.category}
                    </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className={`text-lg font-bold text-slate-800 leading-tight transition-colors ${viewMode === 'tourist' ? 'group-hover:text-lt-blue' : 'group-hover:text-lt-orange'}`}>{item.name}</h3>
                 <div className="flex items-center gap-2 mb-4 mt-1">
                  <StarRating rating={item.averageRating || 0} className="text-xs" />
                  <span className="text-xs text-slate-500 font-medium">({item.reviews?.length || 0})</span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">{item.description}</p>
                <div className={`flex items-center text-xs font-semibold mt-auto border-t border-slate-100 pt-3 ${viewMode === 'tourist' ? 'text-lt-moss' : 'text-lt-red'}`}>
                    <i className="fas fa-map-marker-alt mr-2"></i> {item.location.split(',')[0]}
                </div>
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="min-h-screen bg-slate-50 py-20 md:py-32 overflow-hidden print:hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement>
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                  {viewMode === 'tourist' ? 'Explore' : 'Taste'} <span className={viewMode === 'tourist' ? 'text-lt-orange' : 'text-lt-red'}>La Trinidad</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {viewMode === 'tourist' 
                    ? "Discover the valley's hidden gems. From vibrant strawberry fields to misty mountain trails."
                    : "Satisfy your cravings. From world-famous fast food to authentic Cordilleran dishes."
                }
              </p>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={50}>
            <div className="max-w-4xl mx-auto mb-10 bg-gradient-to-r from-lt-blue via-indigo-600 to-lt-moss rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-white/10 group">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl text-left">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                    <i className="fas fa-sparkles text-lt-yellow animate-pulse"></i> Smart Tour Planner
                  </span>
                  <h3 className="text-2xl font-black tracking-tight">Smart Trip Planner</h3>
                  <p className="text-white/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    Don't know where to start? Let our smart system customize an hour-by-hour itinerary based on your favorite attractions, dining tastes, budget, and trip length!
                  </p>
                </div>
                <button 
                  onClick={handleOpenPlanner} 
                  className="w-full md:w-auto bg-white text-lt-blue hover:bg-slate-100 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-magic text-lt-orange"></i> Launch Smart Planner
                </button>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={100}>
              <div className="max-w-4xl mx-auto mb-16 space-y-6">
                  <div className="relative group z-20">
                      <div className={`absolute -inset-1 bg-gradient-to-r ${viewMode === 'tourist' ? 'from-lt-blue to-teal-400' : 'from-lt-orange to-red-400'} rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
                      <div className="relative bg-white rounded-full shadow-lg flex items-center p-2 border border-slate-100">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ml-1 ${viewMode === 'tourist' ? 'bg-lt-blue/10 text-lt-blue' : 'bg-lt-orange/10 text-lt-orange'}`}>
                              <i className="fas fa-search"></i>
                          </div>
                          <input 
                            type="text" 
                            placeholder={viewMode === 'tourist' ? "Search for a destination..." : "Search for restaurants..."}
                            className="w-full px-4 py-3 text-slate-700 font-medium focus:outline-none bg-transparent text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                      <div className="bg-slate-200 p-1.5 rounded-xl flex shrink-0 shadow-inner">
                          <button onClick={() => handleModeToggle('tourist')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'tourist' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                              <i className="fas fa-map-marked-alt"></i> Places
                          </button>
                          <button onClick={() => handleModeToggle('dining')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'dining' ? 'bg-white text-lt-orange shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                              <i className="fas fa-utensils"></i> Food
                          </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                          {categories.map(cat => (
                              <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${activeCategory === cat ? `${viewMode === 'tourist' ? 'bg-lt-blue' : 'bg-lt-orange'} text-white shadow-md` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                                  {cat}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </AnimatedElement>

          {renderContent()}
        </div>
      </section>
      
      {selectedSpot && (
        <TouristSpotModal 
          spot={selectedSpot} 
          spotType={viewMode}
          onClose={() => {
              setSelectedSpot(null);
              // Clean URL param when closing
              setSearchParams({}, { replace: true });
          }}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {isPlannerOpen && (
        <div id="ai-planner-drawer" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @media print {
              #ai-planner-backdrop, #ai-planner-header {
                display: none !important;
              }
              #ai-planner-drawer {
                position: relative !important;
                display: block !important;
                overflow: visible !important;
                height: auto !important;
                z-index: auto !important;
              }
              #ai-planner-panel {
                position: relative !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                background: white !important;
                box-shadow: none !important;
                border: none !important;
                transform: none !important;
                animation: none !important;
              }
              body, html {
                overflow: visible !important;
                height: auto !important;
              }
            }
          `}} />
          {/* Backdrop Blur */}
          <div 
            id="ai-planner-backdrop"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
            onClick={handleClosePlanner}
          />
          {/* Slide-out drawer workspace */}
          <div id="ai-planner-panel" className="relative w-full max-w-5xl bg-slate-50 h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-slide-in-right border-l border-slate-200">
            {/* Drawer Header */}
            <div id="ai-planner-header" className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-150 px-6 py-5 flex items-center justify-between z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lt-blue to-teal-400 flex items-center justify-center text-white shadow-md">
                  <i className="fas fa-sparkles text-lg animate-pulse"></i>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">AI Travel Planner</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Design your custom hour-by-hour La Trinidad itinerary</p>
                </div>
              </div>
              
              <button 
                onClick={handleClosePlanner}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center border border-slate-200 hover:scale-105 active:scale-95 shadow-sm"
                aria-label="Close Planner"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Planner Content inside Drawer */}
            <div className="flex-1 px-4 py-8 sm:px-8">
              <AIItineraryPlanner />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TouristSpotsPage;
