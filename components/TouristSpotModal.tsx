
import React, { useEffect, useState, useRef } from 'react';
import type { TouristSpot } from '../types';
import { submitReview, trackEvent, uploadImage } from '../services/apiService';
import StarRating from './StarRating';
import { NAVIGATION_LANDMARKS, BLOCKED_EMAIL_DOMAINS } from '../constants';
import ReportModal from './ReportModal';

interface TouristSpotModalProps {
  spot: TouristSpot;
  spotType: 'tourist' | 'dining'; // Explicitly passed from parent
  onClose: () => void;
  onReviewSubmitted: (updatedSpot: TouristSpot) => void;
}

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void; disabled: boolean }> = ({ rating, setRating, disabled }) => (
    <div className="flex text-3xl text-slate-300">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                type="button"
                key={star}
                className={`transition-colors duration-150 ${rating >= star ? 'text-lt-yellow' : 'hover:text-lt-yellow'} disabled:text-slate-200 disabled:cursor-not-allowed`}
                onClick={() => setRating(star)}
                disabled={disabled}
                aria-label={`Rate ${star} star`}
            >
                <i className="fas fa-star"></i>
            </button>
        ))}
    </div>
);


const TouristSpotModal: React.FC<TouristSpotModalProps> = ({ spot, spotType, onClose, onReviewSubmitted }) => {
  const [activeTab, setActiveTab] = useState('details');

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  // Audio Guide State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Map Routing State
  const [startLocation, setStartLocation] = useState('');
  const [isUsingGPS, setIsUsingGPS] = useState(false);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [iframeSrc, setIframeSrc] = useState(spot.mapEmbedUrl);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isReportOpen) setIsReportOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    // Reset map when spot changes
    setIframeSrc(spot.mapEmbedUrl);
    setStartLocation('');
    setIsUsingGPS(false);
    setShowSuggestions(false);
    setIsMapExpanded(false);
    setReviewImages([]);

    // Click outside handler for suggestions
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
      window.speechSynthesis.cancel();
    };
  }, [onClose, spot, isReportOpen]);

  const toggleAudioGuide = () => {
      if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
      } else {
          trackEvent('click', 'audio_guide', '/modal', { spot: spot.name });
          const textToRead = `${spot.name}. ${spot.description} ${spot.history ? `History: ${spot.history}` : ''}`;
          const utterance = new SpeechSynthesisUtterance(textToRead);
          
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
          if (preferredVoice) utterance.voice = preferredVoice;

          speechRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
      }
  };

  const handleDirectionsClick = () => {
      trackEvent('click', 'get_directions_header', '/modal', { spot: spot.name });
      setActiveTab('map');
  };

  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      // Reset expansion when leaving map tab
      if (tab !== 'map') setIsMapExpanded(false);
      trackEvent('view', `tab_${tab}`, '/modal', { spot: spot.name });
  };

  // --- ROUTING LOGIC ---

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsUsingGPS(true);
    setStartLocation("My Location"); // Visual placeholder
    setShowSuggestions(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapRoute(`${latitude},${longitude}`, true);
      },
      (error) => {
        console.error(error);
        setIsUsingGPS(false);
        setStartLocation('');
        alert("Unable to retrieve your location. Please type it manually.");
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setStartLocation(value);
      setIsUsingGPS(false); // Disable GPS flag if user types

      if (value.length > 1) {
          const filtered = NAVIGATION_LANDMARKS.filter(place => 
              place.toLowerCase().includes(value.toLowerCase())
          );
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
      } else {
          setShowSuggestions(false);
      }
  };

  const selectSuggestion = (value: string) => {
      setStartLocation(value);
      setShowSuggestions(false);
      updateMapRoute(value, false); // Auto-update map on selection
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(startLocation.trim()) {
          setIsUsingGPS(false);
          setShowSuggestions(false);
          updateMapRoute(startLocation, false);
      }
  };

  const updateMapRoute = (origin: string, isCoords: boolean) => {
      let modeFlag = 'd';
      if (travelMode === 'walking') modeFlag = 'w';
      if (travelMode === 'transit') modeFlag = 'r';

      const originParam = isCoords ? origin : encodeURIComponent(origin);
      const destParam = encodeURIComponent(`${spot.name} ${spot.location}`);
      
      const newSrc = `https://maps.google.com/maps?saddr=${originParam}&daddr=${destParam}&dirflg=${modeFlag}&t=m&z=12&output=embed`;
      setIframeSrc(newSrc);
  };

  const openExternalNavigation = () => {
      // Universal Cross-Platform URL Scheme
      const originParam = isUsingGPS ? '' : `&origin=${encodeURIComponent(startLocation)}`; 
      const destParam = `&destination=${encodeURIComponent(`${spot.name} ${spot.location}`)}`;
      const modeParam = `&travelmode=${travelMode}`; 
      
      const url = `https://www.google.com/maps/dir/?api=1${originParam}${destParam}${modeParam}`;
      window.open(url, '_blank');
      trackEvent('click', 'start_navigation', '/modal', { mode: travelMode });
  };

  // ---------------------

  const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return false;

      const domain = email.split('@')[1].toLowerCase();
      if (BLOCKED_EMAIL_DOMAINS.includes(domain)) return false;

      return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploadingImage(true);
          try {
              const file = e.target.files[0];
              const result = await uploadImage(file);
              setReviewImages(prev => [...prev, result.url]);
          } catch (err: any) {
              console.error("Image upload failed", err);
              alert(err.message || "Failed to upload image.");
          } finally {
              setIsUploadingImage(false);
          }
      }
  };

  const removeImage = (index: number) => {
      setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Basic Validation
    if (reviewRating === 0 || !reviewName.trim() || !reviewEmail.trim()) {
      setSubmitError('Please provide your name, email, and a star rating.');
      return;
    }

    // Advanced Email Validation
    if (!validateEmail(reviewEmail)) {
        setSubmitError('Please use a valid, permanent email address (e.g., Gmail, Yahoo). Temporary emails are not accepted.');
        return;
    }

    setIsSubmitting(true);

    try {
      if (!spot._id) throw new Error("Spot ID is missing.");
      
      // Use the passed prop directly instead of inferring from category string
      const updatedSpot = await submitReview(spot._id, {
        name: reviewName,
        email: reviewEmail,
        rating: reviewRating,
        comment: reviewComment,
        images: reviewImages
      }, spotType);

      trackEvent('submit', 'review', '/modal', { spot: spot.name, rating: reviewRating });
      onReviewSubmitted(updatedSpot);
      setSubmitSuccess(true);
      setReviewName('');
      setReviewEmail('');
      setReviewRating(0);
      setReviewComment('');
      setReviewImages([]);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const emergencyIcon = (type: 'Hospital' | 'Police') => {
      return type === 'Hospital' ? 'fa-hospital' : 'fa-shield-alt';
  }

  const tabClass = (tabName: string) => 
    `px-1 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
      activeTab === tabName 
        ? 'border-lt-orange text-lt-orange' 
        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
    }`;

  // Dynamic Modal Dimensions based on Tab
  const getModalDimensions = () => {
      if (activeTab === 'map' && isMapExpanded) return 'w-[95vw] h-[95vh]';
      if (activeTab === 'reviews') return 'w-full md:max-w-6xl h-[85vh]';
      if (activeTab === 'map') return 'w-full md:max-w-5xl h-[85vh]';
      return 'w-full max-w-3xl h-[85vh]'; // Default/Details
  };
  
  return (
    <>
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in transition-all duration-500"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-slide-up border border-slate-200 transition-all duration-500 ease-in-out ${getModalDimensions()}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center z-20 transition-all border border-white/20 shadow-sm"
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Header Image */}
        <div className={`flex-shrink-0 w-full overflow-hidden relative transition-all duration-500 ${activeTab === 'map' && isMapExpanded ? 'h-0 opacity-0' : 'h-48 md:h-64 opacity-100'}`}>
             <img src={spot.image} alt={spot.alt} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
             <div className="absolute bottom-6 left-6 md:left-8 right-6 text-white">
                 <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-lt-moss text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/20">
                        {spot.category || 'Destinations'}
                    </span>
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                        <i className="fas fa-star text-lt-yellow text-xs"></i>
                        <span className="text-xs font-bold">{spot.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                 </div>
                 <h2 className="text-3xl font-extrabold drop-shadow-lg text-white">{spot.name}</h2>
                 <p className="text-slate-200 text-sm flex items-center mt-1 font-medium">
                    <i className="fas fa-map-marker-alt mr-2 text-lt-red"></i> {spot.location}
                 </p>
             </div>
        </div>
        
        {/* Main Actions Bar */}
        <div className={`bg-slate-50 px-6 md:px-8 py-3 flex flex-wrap gap-3 items-center border-b border-slate-200 transition-all duration-500 ${activeTab === 'map' && isMapExpanded ? 'h-0 opacity-0 py-0 border-0 overflow-hidden' : ''}`}>
            <button 
                onClick={toggleAudioGuide}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isSpeaking ? 'bg-red-100 text-lt-red animate-pulse border border-red-200' : 'bg-white text-lt-blue hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
            >
                <i className={`fas ${isSpeaking ? 'fa-stop-circle' : 'fa-headphones'}`}></i>
                {isSpeaking ? 'Stop Audio' : 'Audio Guide'}
            </button>

            <button 
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-slate-500 hover:text-lt-red transition-colors border border-slate-200 shadow-sm"
                title="Report Issue"
            >
                <i className="fas fa-flag"></i> Report
            </button>

            <button 
                onClick={handleDirectionsClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-lt-red text-white hover:bg-lt-orange transition-colors shadow-md shadow-lt-red/20 ml-auto"
            >
                <i className="fas fa-route"></i> Plan Route
            </button>
        </div>
        
        <div className="px-6 md:px-8 flex flex-col flex-grow overflow-hidden bg-white">
          <div className="border-b border-slate-200 flex-shrink-0">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button className={tabClass('details')} onClick={() => handleTabChange('details')}>
                Details
              </button>
               <button className={tabClass('reviews')} onClick={() => handleTabChange('reviews')}>
                Reviews ({spot.reviews?.length || 0})
              </button>
              <button className={tabClass('map')} onClick={() => handleTabChange('map')}>
                Map & Route
              </button>
            </nav>
          </div>

          <div className="flex-grow mt-6 overflow-y-auto pr-2 custom-scrollbar pb-8">
            {activeTab === 'details' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Attribute Badges */}
                {spot.tags && spot.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {spot.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-lt-moss/10 text-lt-moss border border-lt-moss/20">
                                <i className="fas fa-check-circle mr-2 opacity-60"></i> {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="bg-white p-2 rounded-full shadow-sm text-lt-blue border border-slate-100"><i className="fas fa-clock text-lg"></i></div>
                        <div>
                            <h4 className="font-bold text-slate-800">Opening Hours</h4>
                            <p className="text-slate-600 mt-1">{spot.openingHours}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                         <div className="bg-white p-2 rounded-full shadow-sm text-lt-orange border border-slate-100"><i className="fas fa-sun text-lg"></i></div>
                        <div>
                            <h4 className="font-bold text-slate-800">{spot.category.includes('Food') ? 'Best Time to Eat' : 'Best Time to Visit'}</h4>
                            <p className="text-slate-600 mt-1">{spot.bestTimeToVisit}</p>
                        </div>
                    </div>
                </div>
                
                {/* Standard Prose for Light Mode */}
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 text-lg leading-relaxed">{spot.description}</p>
                    
                    {spot.history && (
                        <>
                            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Background</h3>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border-l-4 border-lt-orange italic">
                                "{spot.history}"
                            </p>
                        </>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Nearby Emergency Services</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {spot.nearbyEmergency.map((service, index) => (
                            <div key={index} className="flex items-center p-3 rounded-lg border border-red-100 bg-red-50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${service.type === 'Hospital' ? 'bg-lt-red' : 'bg-lt-blue'}`}>
                                    <i className={`fas ${emergencyIcon(service.type)} text-xs`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 text-sm">{service.name}</p>
                                    <p className="text-xs text-slate-500">{service.type}</p>
                                </div>
                                <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">{service.distance}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {spot.gallery.map((imgUrl, index) => (
                            <div key={index} className="rounded-xl overflow-hidden aspect-square group shadow-sm border border-slate-200">
                                <img 
                                    src={imgUrl} 
                                    alt={`${spot.name} gallery ${index + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
                {/* Form Column - Sticky on Desktop */}
                <div className="md:col-span-5 md:border-r md:border-slate-200 md:pr-8">
                  <div className="sticky top-0 bg-white z-10 pb-4">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 shadow-sm">
                        <h3 className="text-lg font-bold text-lt-orange mb-2">Share your experience</h3>
                        <p className="text-sm text-slate-600 mb-4">Help others by rating your visit to {spot.name}.</p>
                        
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <input type="text" placeholder="Your Name" value={reviewName} onChange={e => setReviewName(e.target.value)} required className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-orange focus:border-transparent transition-all outline-none text-sm text-slate-900 placeholder-slate-400" disabled={isSubmitting} />
                                <input type="email" placeholder="Your Email" value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} required className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-orange focus:border-transparent transition-all outline-none text-sm text-slate-900 placeholder-slate-400" disabled={isSubmitting} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Rating</label>
                                <StarRatingInput rating={reviewRating} setRating={setReviewRating} disabled={isSubmitting} />
                            </div>
                            <textarea placeholder="Write your review here..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-orange focus:border-transparent transition-all outline-none text-sm text-slate-900 placeholder-slate-400" disabled={isSubmitting}></textarea>
                            
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Add Photos (Optional)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {reviewImages.map((url, i) => (
                                        <div key={i} className="w-16 h-16 relative rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(i)}
                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {reviewImages.length < 3 && (
                                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-lt-orange hover:bg-slate-100 transition-colors relative">
                                            {isUploadingImage ? <i className="fas fa-spinner fa-spin text-slate-400"></i> : <i className="fas fa-camera text-slate-400"></i>}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 shadow-lg text-sm font-bold rounded-lg text-white bg-lt-red hover:bg-lt-orange focus:ring-4 focus:ring-lt-red/50 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5">
                                {isSubmitting ? 'Submitting...' : 'Post Review'}
                            </button>
                            
                            {submitError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200"><i className="fas fa-exclamation-circle mr-1"></i> {submitError}</p>}
                            {submitSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200"><i className="fas fa-check-circle mr-1"></i> Review submitted!</p>}
                        </form>
                      </div>
                  </div>
                </div>
                
                {/* List Column */}
                <div className="md:col-span-7">
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 py-2 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900">Recent Reviews</h3>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">{spot.reviews?.length || 0} reviews</span>
                    </div>
                    
                    {spot.reviews && spot.reviews.length > 0 ? (
                        <div className="space-y-4">
                            {[...spot.reviews].reverse().map(review => (
                                <div key={review._id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lt-red to-lt-orange text-white flex items-center justify-center font-bold text-sm shadow-sm border border-white">
                                                {review.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight">{review.name}</h4>
                                                <StarRating rating={review.rating} className="text-xs" />
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">{new Date(review.createdAt!).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-700 text-sm mt-2 pl-13">"{review.comment}"</p>
                                    
                                    {/* Display uploaded images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-3 pl-13">
                                            {review.images.map((img, i) => (
                                                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={img} alt="User upload" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <i className="fas fa-comments text-4xl mb-3 opacity-20"></i>
                            <p>No reviews yet. Be the first!</p>
                        </div>
                    )}
                </div>
              </div>
            )}
            
            {activeTab === 'map' && (
              <div className="flex flex-col h-full animate-fade-in gap-4 relative">
                
                {/* Control Panel */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
                    <form onSubmit={handleManualLocationSubmit} className="flex flex-col gap-4">
                        {/* Start Location Input */}
                        <div className="flex gap-2 items-center relative" ref={wrapperRef}>
                            <div className="flex-1 relative">
                                <i className="fas fa-map-pin absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Start point (e.g. Tiong San)"
                                    value={startLocation}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-lt-orange focus:outline-none"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <li 
                                                key={index} 
                                                onClick={() => selectSuggestion(suggestion)}
                                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 flex items-center border-b border-slate-50 last:border-b-0"
                                            >
                                                <i className="fas fa-map-marker-alt mr-2 text-lt-orange/60"></i>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button 
                                type="button" 
                                onClick={handleGPSLocation} 
                                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors border ${isUsingGPS ? 'bg-lt-blue text-white border-lt-blue' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                                title="Use GPS"
                            >
                                <i className="fas fa-crosshairs"></i> <span className="hidden sm:inline">My Loc</span>
                            </button>
                        </div>

                        <div className="flex justify-between items-center flex-wrap gap-3">
                            {/* Travel Mode Toggle */}
                            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                <button type="button" onClick={() => setTravelMode('driving')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${travelMode === 'driving' ? 'bg-lt-orange text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <i className="fas fa-car"></i> Drive
                                </button>
                                <button type="button" onClick={() => setTravelMode('transit')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${travelMode === 'transit' ? 'bg-lt-orange text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <i className="fas fa-bus"></i> Transit
                                </button>
                                <button type="button" onClick={() => setTravelMode('walking')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${travelMode === 'walking' ? 'bg-lt-orange text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <i className="fas fa-walking"></i> Walk
                                </button>
                            </div>

                            {/* Preview Button */}
                            {startLocation && !isUsingGPS && (
                                <button type="submit" className="text-xs bg-lt-blue text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90">
                                    Preview Route
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Map Iframe Container */}
                <div className="flex-grow rounded-xl overflow-hidden border border-slate-200 shadow-inner relative group min-h-[300px] transition-all duration-500">
                    {/* Expand/Collapse Button Overlay */}
                    <button 
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur text-slate-800 hover:text-lt-orange px-3 py-2 rounded-lg shadow-md border border-slate-300 text-xs font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                        <i className={`fas ${isMapExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
                        {isMapExpanded ? 'Exit Full Screen' : 'Expand Map'}
                    </button>

                    <iframe
                    src={iframeSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${spot.name}`}
                    className="w-full h-full"
                ></iframe>
                </div>

                {/* Hybrid / Go Button */}
                <button 
                    onClick={openExternalNavigation}
                    className="w-full bg-lt-blue text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-lt-moss transition-colors flex items-center justify-center gap-2 transform active:scale-95"
                >
                    <i className="fas fa-external-link-alt"></i> 
                    Start Navigation in App 
                    <span className="opacity-70 text-xs font-normal ml-1">({travelMode})</span>
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {isReportOpen && spot._id && (
        <ReportModal 
            targetId={spot._id}
            targetName={spot.name}
            // Fix: Use the passed prop which maps directly to database model names
            targetType={spotType === 'dining' ? 'DiningSpot' : 'TouristSpot'}
            onClose={() => setIsReportOpen(false)}
        />
    )}
    </>
  );
};

export default TouristSpotModal;