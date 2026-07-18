import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Printer, 
  Clock, 
  Check, 
  RotateCcw, 
  Info, 
  Bookmark, 
  Loader2,
  AlertTriangle,
  Search,
  Compass,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { 
  fetchTouristSpots, 
  fetchDiningSpots, 
  generateAIItinerary,
  saveItineraryToServer,
  getItineraryFromServer
} from '../services/apiService';
import { TouristSpot } from '../types';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';

interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: number;
  notes: string;
}

interface ItineraryDay {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

interface AIItinerary {
  id?: string;
  title: string;
  description: string;
  estimatedTotalCost: number;
  days: ItineraryDay[];
  localTips: string[];
}

const AIItineraryPlanner: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [dining, setDining] = useState<TouristSpot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  
  // Selection State
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [selectedDining, setSelectedDining] = useState<string[]>([]);
  
  // Specific Travel Dates State
  const [startDate, setStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    return threeDaysLater.toISOString().split('T')[0];
  });

  // Specific Budget Amount in PHP
  const [budgetAmount, setBudgetAmount] = useState<number>(5000);

  // Automatically calculate travel days based on dates (inclusive)
  const getCalculatedDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(7, Math.max(1, diffDays)); // Clamp between 1 and 7 days
  };

  const calculatedDays = getCalculatedDays();

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    const sDate = new Date(val);
    const eDate = new Date(endDate);
    if (sDate > eDate) {
      const newEnd = new Date(sDate);
      newEnd.setDate(newEnd.getDate() + 2); // default to a 3-day range (inclusive)
      setEndDate(newEnd.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const sDate = new Date(startDate);
    const eDate = new Date(val);
    if (eDate < sDate) {
      setEndDate(startDate);
    }
  };
  
  // Internal filter/search states for attractions
  const [spotSearch, setSpotSearch] = useState('');
  const [selectedSpotCategory, setSelectedSpotCategory] = useState('All');
  
  // Internal filter/search states for eateries
  const [diningSearch, setDiningSearch] = useState('');
  const [selectedDiningCategory, setSelectedDiningCategory] = useState('All');

  // API State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedItinerary, setGeneratedItinerary] = useState<AIItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(false);

  // Categories lists derived from loaded data
  const spotCategories = ['All', ...Array.from(new Set(spots.map(s => s.category).filter(Boolean)))];
  const diningCategories = ['All', ...Array.from(new Set(dining.map(d => d.category).filter(Boolean)))];

  // 1. Load Attractions & Dining Options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingSpots(true);
        const [spotsData, diningData] = await Promise.all([
          fetchTouristSpots(),
          fetchDiningSpots()
        ]);
        setSpots(spotsData || []);
        setDining(diningData || []);
      } catch (err) {
        console.error('Error loading spots for itinerary planner', err);
      } finally {
        setLoadingSpots(false);
      }
    };

    loadOptions();
  }, []);

  // 2. Load Saved Itinerary
  useEffect(() => {
    const saved = localStorage.getItem('savedAIItinerary');
    const savedTime = localStorage.getItem('savedAIItineraryTimestamp');
    let isLocalValid = true;

    if (saved) {
      // Only reset/delete after 30 minutes if the user is a guest (not logged in)
      if (!user) {
        if (savedTime) {
          const elapsed = Date.now() - parseInt(savedTime, 10);
          if (elapsed > 30 * 60 * 1000) { // 30 minutes in milliseconds
            localStorage.removeItem('savedAIItinerary');
            localStorage.removeItem('savedAIItineraryTimestamp');
            isLocalValid = false;
          }
        } else {
          localStorage.setItem('savedAIItineraryTimestamp', Date.now().toString());
        }
      }
    }

    if (saved && isLocalValid) {
      try {
        setGeneratedItinerary(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved itinerary from localStorage', e);
      }
    }

    const loadFromServer = async () => {
      const email = user?.email || 'anonymous';
      try {
        const res = await getItineraryFromServer(email);
        if (res && res.success && res.itinerary) {
          setGeneratedItinerary(res.itinerary);
          localStorage.setItem('savedAIItinerary', JSON.stringify(res.itinerary));
          localStorage.setItem('savedAIItineraryTimestamp', Date.now().toString());
        }
      } catch (err) {
        console.error('Failed to load itinerary from server database:', err);
      }
    };

    loadFromServer();
  }, [user]);

  // Loading indicator cycle messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationProgress(0);
      interval = setInterval(() => {
        setGenerationProgress(prev => (prev < 90 ? prev + Math.floor(Math.random() * 15) + 5 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSpotToggle = (id: string) => {
    setSelectedSpots(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDiningToggle = (id: string) => {
    setSelectedDining(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSpots = () => {
    const filteredCurrent = filteredSpots.map(s => s._id || '');
    const allFilteredSelected = filteredCurrent.every(id => selectedSpots.includes(id));
    
    if (allFilteredSelected) {
      // Remove only filtered current
      setSelectedSpots(prev => prev.filter(id => !filteredCurrent.includes(id)));
    } else {
      // Add all filtered current
      setSelectedSpots(prev => Array.from(new Set([...prev, ...filteredCurrent])));
    }
  };

  const handleSelectAllDining = () => {
    const filteredCurrent = filteredDining.map(d => d._id || '');
    const allFilteredSelected = filteredCurrent.every(id => selectedDining.includes(id));
    
    if (allFilteredSelected) {
      // Remove only filtered current
      setSelectedDining(prev => prev.filter(id => !filteredCurrent.includes(id)));
    } else {
      // Add all filtered current
      setSelectedDining(prev => Array.from(new Set([...prev, ...filteredCurrent])));
    }
  };

  const handleGenerate = async () => {
    if (selectedSpots.length === 0) {
      setError('Please select at least one attraction you want to visit.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setSavedSuccess(false);

    const chosenSpots = spots.filter(s => selectedSpots.includes(s._id || ''));
    const chosenDining = dining.filter(d => selectedDining.includes(d._id || ''));

    try {
      const result = await generateAIItinerary({
        spots: chosenSpots.map(s => ({ name: s.name, category: s.category, description: s.description })),
        dining: chosenDining.map(d => ({ name: d.name, description: d.description })),
        budget: `₱${budgetAmount} PHP`,
        days: calculatedDays,
        startDate,
        endDate,
        budgetAmount
      } as any);

      result.id = `itinerary-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setGeneratedItinerary(result);
      localStorage.setItem('savedAIItinerary', JSON.stringify(result));
      localStorage.setItem('savedAIItineraryTimestamp', Date.now().toString());

      // Auto-save to database
      const email = user?.email || 'anonymous';
      await saveItineraryToServer(email, result);
    } catch (err: any) {
      console.error('Failed to generate itinerary:', err);
      setError(err.message || 'The Smart Itinerary Service is currently unavailable. Please check that configuration is set up properly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!generatedItinerary) return;
    
    // Ensure there is a unique ID
    if (!generatedItinerary.id) {
      generatedItinerary.id = `itinerary-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    localStorage.setItem('savedAIItinerary', JSON.stringify(generatedItinerary));
    localStorage.setItem('savedAIItineraryTimestamp', Date.now().toString());
    
    if (user) {
      try {
        await saveItineraryToServer(user.email || '', generatedItinerary);
        setSavedSuccess(true);
        setShowGuestNotice(false);
      } catch (err) {
        console.error('Failed to save itinerary to server database:', err);
      }
      setTimeout(() => setSavedSuccess(false), 5000);
    } else {
      setShowGuestNotice(true);
      setSavedSuccess(false);
    }
  };

  const handleReset = async () => {
    setGeneratedItinerary(null);
    localStorage.removeItem('savedAIItinerary');
    localStorage.removeItem('savedAIItineraryTimestamp');
    setSelectedSpots([]);
    setSelectedDining([]);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
    
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    setEndDate(threeDaysLater.toISOString().split('T')[0]);

    setBudgetAmount(5000);
    setError(null);
    setSavedSuccess(false);
    setShowGuestNotice(false);

    try {
      if (!user) {
        // Only clear draft on server if the user is a guest (anonymous)
        await saveItineraryToServer('anonymous', null);
      }
    } catch (err) {
      console.error('Failed to clear guest itinerary from server:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter lists based on nested search/category inputs
  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(spotSearch.toLowerCase()) || 
                          spot.description.toLowerCase().includes(spotSearch.toLowerCase());
    const matchesCategory = selectedSpotCategory === 'All' || spot.category === selectedSpotCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDining = dining.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(diningSearch.toLowerCase()) || 
                          d.description.toLowerCase().includes(diningSearch.toLowerCase());
    const matchesCategory = selectedDiningCategory === 'All' || d.category === selectedDiningCategory;
    return matchesSearch && matchesCategory;
  });

  const getProgressMessage = (pct: number) => {
    if (pct < 30) return "Analyzing travel routes and geographical proximity...";
    if (pct < 60) return "Curating top food options and optimal timings...";
    if (pct < 85) return "Designing realistic hour-by-hour schedules...";
    return "Wrapping up your customized La Trinidad adventure guide...";
  };

  if (loadingSpots) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-xl border border-slate-100">
        <Loader2 className="w-12 h-12 text-lt-blue animate-spin mb-4" />
        <p className="text-slate-800 font-bold text-lg animate-pulse">Initializing Planner Engine...</p>
        <p className="text-slate-400 text-sm mt-1">Fetching beautiful destinations and local eats</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {!generatedItinerary ? (
        <div className="animate-fade-in space-y-8">
          {/* Main Visual Header Banner */}
          <div className="bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-lt-blue/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-lt-moss/10 rounded-full blur-3xl"></div>
            
            <div className="p-8 sm:p-12 relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-white/10">
                <Sparkles className="w-4 h-4 text-lt-yellow animate-pulse fill-lt-yellow/20" />
                Smart Tour Planner
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                Craft Your Perfect <span className="text-lt-blue">La Trinidad</span> Journey
              </h2>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
                Select your desired attractions, local eateries, adjust your budget, and set the days. Our interactive system will instantly build a realistic, optimized, hour-by-hour custom schedule!
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 text-red-800 animate-shake">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-500 mt-0.5" />
              <div className="text-sm space-y-1">
                <span className="font-extrabold text-base block text-red-950">Planner Error</span>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {isGenerating ? (
            /* Immersive Loading Screen */
            <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-xl flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-lt-blue border-r-lt-moss animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-lt-yellow animate-bounce fill-lt-yellow/20" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-black text-slate-800">Synthesizing Itinerary</h3>
                <p className="text-slate-500 text-sm font-medium h-12 flex items-center justify-center">
                  {getProgressMessage(generationProgress)}
                </p>
              </div>
              <div className="w-full max-w-md bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-lt-blue to-lt-moss h-full transition-all duration-1000 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{generationProgress}% Completed</span>
            </div>
          ) : (
            /* Split Interactive Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Selector Workspace */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* STEP 1: Core Trip Settings */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                    <div className="w-8 h-8 rounded-full bg-lt-blue/10 text-lt-blue flex items-center justify-center font-bold text-sm">1</div>
                    <h3 className="text-lg font-black text-slate-800">Trip Configuration</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Specific Dates Selector */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-lt-orange" />
                        Travel Dates
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-orange/20 focus:border-lt-orange text-slate-700 text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Date</span>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            min={startDate}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-orange/20 focus:border-lt-orange text-slate-700 text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                        <Info className="w-3.5 h-3.5 text-lt-blue shrink-0" />
                        <span className="text-xs text-slate-500 font-medium">
                          Duration calculated: <strong className="text-slate-800">{calculatedDays} Day{calculatedDays > 1 ? 's' : ''}</strong> (max 7)
                        </span>
                      </div>
                    </div>

                    {/* Specific Budget Amount Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-lt-moss" />
                        Trip Budget (PHP)
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <span className="text-slate-400 font-black text-sm">₱</span>
                        </div>
                        <input
                          type="number"
                          min="500"
                          max="100000"
                          step="500"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-moss/20 focus:border-lt-moss text-slate-700 font-extrabold text-sm"
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[3000, 5000, 10000, 20000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setBudgetAmount(preset)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                budgetAmount === preset
                                  ? 'bg-lt-moss/10 text-lt-moss border-lt-moss shadow-sm scale-105'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                            >
                              ₱{preset.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Choose Attractions */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lt-blue/10 text-lt-blue flex items-center justify-center font-bold text-sm">2</div>
                      <h3 className="text-lg font-black text-slate-800">Select Attractions <span className="text-red-500">*</span></h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAllSpots}
                      className="text-xs font-bold text-lt-blue hover:text-lt-blue/80 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      {filteredSpots.every(s => selectedSpots.includes(s._id || '')) ? 'Deselect Category' : 'Select All Filtered'}
                    </button>
                  </div>

                  {/* Search and Category Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search attractions..." 
                        value={spotSearch}
                        onChange={(e) => setSpotSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-blue/20 focus:border-lt-blue text-sm"
                      />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                      {spotCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedSpotCategory(cat)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            selectedSpotCategory === cat 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Cards Selection Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto p-1.5 border border-slate-50 rounded-2xl custom-scrollbar bg-slate-50/50">
                    {filteredSpots.length === 0 ? (
                      <p className="col-span-full text-center text-slate-400 py-12 text-sm italic">No attractions match your filters.</p>
                    ) : (
                      filteredSpots.map((spot) => {
                        const id = spot._id || '';
                        const isSelected = selectedSpots.includes(id);
                        return (
                          <div
                            key={id}
                            onClick={() => handleSpotToggle(id)}
                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col h-full bg-white relative hover:-translate-y-0.5 ${
                              isSelected
                                ? 'border-lt-blue shadow-md ring-2 ring-lt-blue/15 scale-[1.01]'
                                : 'border-slate-200 hover:border-slate-300 shadow-sm'
                            }`}
                          >
                            <div className="relative h-28 overflow-hidden shrink-0">
                              <img src={spot.image} alt={spot.alt} className="w-full h-full object-cover" />
                              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-100 text-[10px] font-extrabold uppercase text-lt-moss">
                                {spot.category}
                              </div>
                              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border shadow-md transition-all ${
                                isSelected ? 'bg-lt-blue border-lt-blue text-white scale-110' : 'bg-white/90 border-slate-300'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>}
                              </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col justify-between">
                              <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1">{spot.name}</h4>
                              <div className="flex items-center gap-1.5 mt-2">
                                <StarRating rating={spot.averageRating || 0} className="text-[10px]" />
                                <span className="text-[10px] text-slate-400">({spot.reviews?.length || 0})</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* STEP 3: Choose Eateries */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lt-blue/10 text-lt-blue flex items-center justify-center font-bold text-sm">3</div>
                      <h3 className="text-lg font-black text-slate-800">Select Eateries</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAllDining}
                      className="text-xs font-bold text-lt-orange hover:text-lt-orange/80 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      {filteredDining.every(d => selectedDining.includes(d._id || '')) ? 'Deselect Category' : 'Select All Filtered'}
                    </button>
                  </div>

                  {/* Search and Category Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search eateries..." 
                        value={diningSearch}
                        onChange={(e) => setDiningSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-orange/20 focus:border-lt-orange text-sm"
                      />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                      {diningCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedDiningCategory(cat)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            selectedDiningCategory === cat 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Eateries Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1.5 border border-slate-50 rounded-2xl custom-scrollbar bg-slate-50/50">
                    {filteredDining.length === 0 ? (
                      <p className="col-span-full text-center text-slate-400 py-12 text-sm italic">No eateries match your filters.</p>
                    ) : (
                      filteredDining.map((d) => {
                        const id = d._id || '';
                        const isSelected = selectedDining.includes(id);
                        return (
                          <div
                            key={id}
                            onClick={() => handleDiningToggle(id)}
                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col h-full bg-white relative hover:-translate-y-0.5 ${
                              isSelected
                                ? 'border-lt-orange shadow-md ring-2 ring-lt-orange/15 scale-[1.01]'
                                : 'border-slate-200 hover:border-slate-300 shadow-sm'
                            }`}
                          >
                            <div className="relative h-24 overflow-hidden shrink-0">
                              <img src={d.image} alt={d.alt} className="w-full h-full object-cover" />
                              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-100 text-[10px] font-extrabold uppercase text-lt-red">
                                {d.category || 'Local Eat'}
                              </div>
                              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border shadow-md transition-all ${
                                isSelected ? 'bg-lt-orange border-lt-orange text-white scale-110' : 'bg-white/90 border-slate-300'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>}
                              </div>
                            </div>
                            <div className="p-3.5 flex-grow flex flex-col justify-between">
                              <h4 className="font-extrabold text-slate-800 text-xs leading-snug line-clamp-1">{d.name}</h4>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Summary & Hub */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                    <Compass className="w-5 h-5 text-lt-blue animate-pulse" />
                    <h4 className="font-black text-base text-slate-100">Live Planner Hub</h4>
                  </div>

                  {/* Summary Badges */}
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1 text-xs font-semibold text-slate-400 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span>Trip Duration:</span>
                        <span className="font-bold text-slate-200 text-sm bg-lt-orange/15 text-lt-orange px-2.5 py-1 rounded-lg">
                          {calculatedDays} Day{calculatedDays > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono text-right">
                        {startDate} to {endDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                      <span>Target Budget:</span>
                      <span className="font-bold text-slate-200 text-sm bg-lt-moss/15 text-lt-moss px-2.5 py-1 rounded-lg">
                        ₱{budgetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Selected Places Details List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 px-1">
                      <span>Selected Attractions ({selectedSpots.length})</span>
                      <span className="text-[10px] text-slate-500 font-medium">Req. at least 1</span>
                    </div>
                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                      {selectedSpots.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-950/25 rounded-xl border border-slate-800/50">No attractions selected yet</p>
                      ) : (
                        spots.filter(s => selectedSpots.includes(s._id || '')).map(s => (
                          <div key={s._id} className="flex items-center justify-between bg-slate-850/50 px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-800/45">
                            <span className="truncate font-medium max-w-[150px]">{s.name}</span>
                            <button onClick={() => handleSpotToggle(s._id || '')} className="text-[10px] text-slate-500 hover:text-lt-red"><i className="fas fa-trash"></i></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-extrabold text-slate-400 px-1">
                      <span>Selected Eateries ({selectedDining.length})</span>
                    </div>
                    <div className="max-h-[100px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                      {selectedDining.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-950/25 rounded-xl border border-slate-800/50">No dining spots selected yet</p>
                      ) : (
                        dining.filter(d => selectedDining.includes(d._id || '')).map(d => (
                          <div key={d._id} className="flex items-center justify-between bg-slate-850/50 px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-800/45">
                            <span className="truncate font-medium max-w-[150px]">{d.name}</span>
                            <button onClick={() => handleDiningToggle(d._id || '')} className="text-[10px] text-slate-500 hover:text-lt-red"><i className="fas fa-trash"></i></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Core Generate Action Button */}
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={selectedSpots.length === 0}
                      className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 active:scale-95 ${
                        selectedSpots.length === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700/50'
                          : 'bg-lt-blue hover:bg-lt-blue/90 hover:-translate-y-0.5 shadow-lt-blue/20 cursor-pointer'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-lt-yellow fill-lt-yellow/10" />
                      Generate Travel Plan
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2.5 italic">The smart system will curate optimal routes & schedules.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GORGEOUS OUTPUT VIEW */
        <div className="space-y-6 print:space-y-4 animate-fade-in">
          {/* Print Optimization Styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              header, footer, nav, button, .print\\:hidden, #chatbot-bubble, #mascot-container, .sticky, .shadow-xl, .border-slate-100 {
                display: none !important;
                box-shadow: none !important;
              }
              
              body, html {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              #itinerary-print-area {
                position: relative !important;
                width: 100% !important;
                max-width: 100% !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
                overflow: visible !important;
              }
              
              .bg-slate-900 {
                background-color: #0f172a !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .bg-slate-50\\/50 {
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .bg-white {
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .border-slate-150 {
                border-color: #e2e8f0 !important;
              }
            }
          `}} />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-md">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-extrabold text-slate-600 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Plan a New Journey
            </button>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveItinerary}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  savedSuccess 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {savedSuccess ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {savedSuccess ? 'Saved to Dashboard!' : 'Save Itinerary'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-lt-blue text-white rounded-xl text-xs font-extrabold hover:bg-lt-blue/95 transition-all flex items-center justify-center gap-2 shadow-md shadow-lt-blue/10"
              >
                <Printer className="w-4 h-4" />
                Print / Export PDF
              </button>
            </div>
          </div>

          {/* Notification / Alert Banners (Print-Hidden) */}
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-start gap-3 animate-fade-in print:hidden">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-black block text-emerald-950 mb-0.5">Itinerary Synced Successfully!</span> 
                Your itinerary has been locked into your Limitless La Trinidad account. View, adjust, or print it anytime in your personal <span className="font-bold underline">User Dashboard</span> (profile bubble in top right).
              </div>
            </div>
          )}

          {showGuestNotice && (
            <div className="bg-amber-50/70 border border-amber-200 text-amber-950 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in print:hidden">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <h4 className="font-black text-amber-950 mb-1">Saved to Local Browser (Temporary)</h4>
                  <p className="text-amber-800 leading-relaxed text-xs">
                    Your custom itinerary has been stored safely in your browser. Log in to your Google account to secure it permanently in our cloud databases and sync with your dashboard.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full sm:w-auto px-4 py-2.5 bg-lt-blue hover:bg-lt-blue/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-lt-blue/10 flex items-center justify-center gap-1.5"
                >
                  <i className="fab fa-google"></i>
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestNotice(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Deletion & Expiration Banners */}
          {!savedSuccess && (
            user ? (
              <div className="bg-blue-50/50 border border-blue-150 text-blue-950 rounded-2xl p-4 flex items-start gap-3 animate-fade-in print:hidden">
                <Info className="w-5 h-5 shrink-0 text-lt-blue mt-0.5" />
                <div className="text-xs">
                  <span className="font-black block text-blue-950 mb-0.5">Account Storage Policy</span>
                  Your itineraries are securely stored in your account database. To keep our server optimized, saved itineraries are automatically kept for <span className="font-bold text-lt-blue">30 days</span> from creation. You can view, print, or delete multiple itineraries inside your <span className="font-bold">User Dashboard</span> (profile bubble in the top-right).
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/50 border border-amber-100 text-amber-950 rounded-2xl p-4 flex items-start gap-3 animate-fade-in print:hidden">
                <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs">
                  <span className="font-black block text-amber-950 mb-0.5">Guest Draft Expiry Notice</span>
                  You are viewing this as a guest. This temporary draft is saved locally and will automatically reset after <span className="font-bold text-amber-600">30 minutes</span> of inactivity, or when you click "Reset". Sign in to save multiple itineraries permanently for 30 days.
                </div>
              </div>
            )
          )}

          {/* Core Itinerary Card */}
          <div id="itinerary-print-area" className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none">
            {/* Itinerary Banner */}
            <div className="bg-slate-900 p-8 sm:p-12 text-white relative">
              <div className="absolute top-0 right-0 -mt-20 -mr-10 w-72 h-72 bg-lt-blue/15 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-10 w-60 h-60 bg-lt-moss/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-lt-yellow text-slate-950 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-lt-yellow/10">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  Personalized Journey
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{generatedItinerary.title}</h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {generatedItinerary.description}
                </p>

                <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lt-orange" />
                    <span className="font-semibold text-slate-200">Duration:</span> {generatedItinerary.days.length} Day(s)
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-lt-moss" />
                    <span className="font-semibold text-slate-200">Target Budget:</span> ₱{budgetAmount.toLocaleString()} PHP
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/30">
                    <span className="font-semibold text-slate-200">Est. Cost:</span> 
                    <span className="text-lt-yellow font-black text-sm ml-1">₱{(generatedItinerary.estimatedTotalCost || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">/ person</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Day Breakdown Content */}
            <div className="p-6 sm:p-12 space-y-12 bg-slate-50/40 print:p-0">
              {generatedItinerary.days.map((day, dIdx) => (
                <div key={day.dayNumber} className="space-y-6 relative">
                  {/* Day Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-lt-blue text-white flex items-center justify-center font-black text-lg shadow-md shadow-lt-blue/15 shrink-0">
                      D{day.dayNumber}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Day {day.dayNumber} Overview</span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{day.theme}</h3>
                    </div>
                  </div>

                  {/* Day Activities Timeline */}
                  <div className="border-l-2 border-slate-200 ml-6 pl-8 space-y-8 relative">
                    {day.activities.map((act, actIdx) => (
                      <div key={actIdx} className="relative group">
                        {/* Bullet Dot */}
                        <div className="absolute -left-[45px] top-1.5 w-7 h-7 rounded-full bg-white border-2 border-lt-blue flex items-center justify-center shrink-0 z-10 transition-all group-hover:scale-110 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-lt-blue" />
                        </div>

                        {/* Activity Card */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 relative">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-lt-blue tracking-wide bg-lt-blue/5 px-2.5 py-1 rounded-lg shrink-0">
                                {act.time}
                              </span>
                              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">{act.activity}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0 border border-slate-100">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-slate-700">{act.location}</span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{act.notes}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                            <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Estimated Expense</span>
                            <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                              {act.cost === 0 ? (
                                <span className="text-green-600 font-extrabold uppercase text-[10px] bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-200">Free Entrance</span>
                              ) : (
                                `₱${act.cost.toLocaleString()}`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Local Advice */}
              {generatedItinerary.localTips && generatedItinerary.localTips.length > 0 && (
                <div className="bg-amber-50/70 border-2 border-amber-100 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h4 className="font-black text-amber-900 flex items-center gap-2 text-base sm:text-lg">
                    <Info className="w-5 h-5 text-amber-700 shrink-0" />
                    La Trinidad Travel Advice
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {generatedItinerary.localTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-amber-800 leading-relaxed bg-white/70 p-4 rounded-2xl border border-amber-200/50">
                        <span className="font-black text-amber-600 shrink-0 text-base mt-0.5">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIItineraryPlanner;
