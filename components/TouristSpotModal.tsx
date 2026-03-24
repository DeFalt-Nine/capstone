import React, { useEffect, useState, useRef } from 'react';
import type { TouristSpot } from '../types';
import { uploadImage, submitReview, trackEvent } from '../services/apiService';
import StarRating from './StarRating';
import ReportModal from './ReportModal';
import { useAnalytics } from '../hooks/useAnalytics';

interface TouristSpotModalProps {
  spot: TouristSpot;
  spotType: 'tourist' | 'dining';
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
  useAnalytics(spot._id);
  const [activeTab, setActiveTab] = useState('details');

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setUploadingImages] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  // Audio Guide State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Map Routing State
  const [startLocation, setStartLocation] = useState('');
  const [isUsingGPS, setIsUsingGPS] = useState(false);
  const [travelMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [iframeSrc, setIframeSrc] = useState(spot.mapEmbedUrl);
  const [isMapExpanded] = useState(false);
  
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

    setIframeSrc(spot.mapEmbedUrl);
    setStartLocation('');
    setIsUsingGPS(false);
    setReviewImages([]);

    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            // Placeholder for future logic
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
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
      }
  };

  const handleDirectionsClick = () => {
      setActiveTab('map');
  };

  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) return;
    setIsUsingGPS(true);
    setStartLocation("My Location");
    navigator.geolocation.getCurrentPosition(
      (pos) => updateMapRoute(`${pos.coords.latitude},${pos.coords.longitude}`, true),
      () => { setIsUsingGPS(false); setStartLocation(''); }
    );
  };

  const updateMapRoute = (origin: string, isCoords: boolean) => {
      let modeFlag = travelMode === 'walking' ? 'w' : travelMode === 'transit' ? 'r' : 'd';
      const originParam = isCoords ? origin : encodeURIComponent(origin);
      const destParam = encodeURIComponent(`${spot.name} ${spot.location}`);
      setIframeSrc(`https://maps.google.com/maps?saddr=${originParam}&daddr=${destParam}&dirflg=${modeFlag}&t=m&z=12&output=embed`);
  };

  const openExternalNavigation = () => {
      const originParam = isUsingGPS ? '' : `&origin=${encodeURIComponent(startLocation)}`; 
      const destParam = `&destination=${encodeURIComponent(`${spot.name} ${spot.location}`)}`;
      window.open(`https://www.google.com/maps/dir/?api=1${originParam}${destParam}&travelmode=${travelMode}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    if (reviewRating === 0 || !reviewName.trim()) {
        setReviewError('Please provide a name and rating.');
        return;
    }
    
    // Basic email validation
    if (reviewEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewEmail)) {
        setReviewError('Please provide a valid email address.');
        return;
    }

    setIsSubmitting(true);
    try {
      const updatedSpot = await submitReview(spot._id!, {
        name: reviewName, email: reviewEmail, rating: reviewRating, comment: reviewComment, images: reviewImages
      }, spotType);
      onReviewSubmitted(updatedSpot);
      setSubmitSuccess(true);
      setReviewName(''); setReviewEmail(''); setReviewRating(0); setReviewComment(''); setReviewImages([]);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) { 
        setReviewError(error.message || 'Failed to submit review. Please try again.'); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewImages.length + files.length > 3) {
        setReviewError('You can only upload up to 3 images per review.');
        return;
    }

    setUploadingImages(true);
    setReviewError(null);
    try {
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        const results = await Promise.all(uploadPromises);
        const urls = results.map(r => r.url);
        setReviewImages(prev => [...prev, ...urls]);
    } catch (error: any) {
        console.error('Upload failed:', error);
        setReviewError(error.message || 'Image upload failed. Please try again.');
    } finally {
        setUploadingImages(false);
        e.target.value = '';
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const getModalDimensions = () => {
      if (activeTab === 'map' && isMapExpanded) return 'w-[95vw] h-[95vh]';
      if (activeTab === 'reviews') return 'w-full md:max-w-6xl h-[85vh]';
      if (activeTab === 'map') return 'w-full md:max-w-5xl h-[85vh]';
      return 'w-full max-w-3xl h-[85vh]';
  };
  
  return (
    <>
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-slide-up border border-slate-200 transition-all duration-500 ease-in-out ${getModalDimensions()}`} onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/30 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center z-20 transition-all border border-white/20 shadow-sm"><i className="fas fa-times"></i></button>

        <div className={`flex-shrink-0 w-full overflow-hidden relative transition-all duration-500 ${activeTab === 'map' && isMapExpanded ? 'h-0 opacity-0' : 'h-48 md:h-64 opacity-100'}`}>
             <img src={spot.image} alt={spot.alt} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
             <div className="absolute bottom-6 left-6 md:left-8 right-6 text-white">
                 <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-lt-moss text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/20">{spot.category || 'Destinations'}</span>
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                        <i className="fas fa-star text-lt-yellow text-xs"></i>
                        <span className="text-xs font-bold">{spot.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                 </div>
                 <h2 className="text-3xl font-extrabold drop-shadow-lg text-white">{spot.name}</h2>
                 <p className="text-slate-200 text-sm flex items-center mt-1 font-medium"><i className="fas fa-map-marker-alt mr-2 text-lt-red"></i> {spot.location}</p>
             </div>
        </div>
        
        <div className={`bg-slate-50 px-6 md:px-8 py-3 flex flex-wrap gap-3 items-center border-b border-slate-200 transition-all duration-500 ${activeTab === 'map' && isMapExpanded ? 'h-0 opacity-0 py-0 border-0 overflow-hidden' : ''}`}>
            <button onClick={toggleAudioGuide} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isSpeaking ? 'bg-red-100 text-lt-red animate-pulse border border-red-200' : 'bg-white text-lt-blue hover:bg-slate-100 border border-slate-200 shadow-sm'}`}><i className={`fas ${isSpeaking ? 'fa-stop-circle' : 'fa-headphones'}`}></i>{isSpeaking ? 'Stop Audio' : 'Audio Guide'}</button>
            <button onClick={() => setIsReportOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-slate-500 hover:text-lt-red transition-colors border border-slate-200 shadow-sm"><i className="fas fa-flag"></i> Report</button>
            <button onClick={handleDirectionsClick} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-lt-red text-white hover:bg-lt-orange transition-colors shadow-md ml-auto"><i className="fas fa-route"></i> Plan Route</button>
        </div>
        
        <div className="px-6 md:px-8 flex flex-col flex-grow overflow-hidden bg-white">
          <div className="border-b border-slate-200 flex-shrink-0">
            <nav className="-mb-px flex space-x-8">
              <button className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details' ? 'border-lt-orange text-lt-orange' : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('details')}>Details</button>
              <button className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reviews' ? 'border-lt-orange text-lt-orange' : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('reviews')}>Reviews ({spot.reviews?.length || 0})</button>
              <button className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'map' ? 'border-lt-orange text-lt-orange' : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('map')}>Map & Route</button>
            </nav>
          </div>

          <div className="flex-grow mt-6 overflow-y-auto pr-2 custom-scrollbar pb-8">
            {activeTab === 'details' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Transpo Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0"><i className="fas fa-bus"></i></div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-xs uppercase tracking-widest">By Jeepney</h4>
                            <p className="text-slate-700 font-extrabold text-lg mt-1">{spot.jeepneyFare || '₱13.00'}</p>
                            <p className="text-blue-700/70 text-[10px] mt-1 leading-tight font-medium italic"><i className="fas fa-map-pin mr-1"></i> {spot.terminalLocation || 'Baguio City Hall / Center Mall Terminal'}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm flex-shrink-0"><i className="fas fa-taxi"></i></div>
                        <div>
                            <h4 className="font-bold text-slate-500 text-xs uppercase tracking-widest">By Taxi</h4>
                            <p className="text-slate-700 font-extrabold text-lg mt-1">{spot.taxiFare ? `~${spot.taxiFare}` : '~₱150'}</p>
                            <div className="mt-1 bg-red-50 px-2 py-1 rounded border border-red-100">
                                <p className="text-red-700 text-[9px] leading-tight font-bold italic"><i className="fas fa-info-circle mr-1"></i> LT local taxis are **Grey**. Use **White taxis** to go back to Baguio.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 text-lg leading-relaxed">{spot.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="bg-white p-2 rounded-full shadow-sm text-lt-blue border border-slate-100"><i className="fas fa-clock text-lg"></i></div>
                        <div><h4 className="font-bold text-slate-800">Opening Hours</h4><p className="text-slate-600 mt-1">{spot.openingHours}</p></div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                         <div className="bg-white p-2 rounded-full shadow-sm text-lt-orange border border-slate-100"><i className="fas fa-sun text-lg"></i></div>
                        <div><h4 className="font-bold text-slate-800">Best Time</h4><p className="text-slate-600 mt-1">{spot.bestTimeToVisit}</p></div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {spot.gallery.map((imgUrl, index) => (
                            <div key={index} className="rounded-xl overflow-hidden aspect-square group shadow-sm border border-slate-200">
                                <img src={imgUrl} alt={`${spot.name} gallery ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
                <div className="md:col-span-5 md:border-r md:border-slate-200 md:pr-8">
                  <div className="sticky top-0 bg-white z-10 pb-4">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 shadow-sm">
                        <h3 className="text-lg font-bold text-lt-orange mb-2">Post a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <input type="text" placeholder="Your Name" value={reviewName} onChange={e => setReviewName(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-lt-orange/20" />
                                <input type="email" placeholder="Email (Private)" value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-lt-orange/20" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Rating</label>
                                <StarRatingInput rating={reviewRating} setRating={setReviewRating} disabled={isSubmitting} />
                            </div>
                            <textarea placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-lt-orange/20"></textarea>
                            
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Photos (Max 3)</label>
                                <div className="flex flex-wrap gap-2">
                                    {reviewImages.map((img, idx) => (
                                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeReviewImage(idx)}
                                                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="fas fa-times text-[10px]"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {reviewImages.length < 3 && (
                                        <label className={`w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-lt-orange hover:bg-orange-50 transition-all ${isUploadingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={isUploadingImages} />
                                            {isUploadingImages ? <i className="fas fa-spinner fa-spin text-lt-orange"></i> : <i className="fas fa-plus text-slate-300"></i>}
                                            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Add</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {reviewError && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100 animate-shake">{reviewError}</p>}
                            
                            <button type="submit" disabled={isSubmitting || isUploadingImages} className="w-full py-3 shadow-lg rounded-xl text-white bg-lt-red hover:bg-lt-orange font-bold transition-all transform active:scale-95 disabled:opacity-50">
                                {isSubmitting ? 'Posting...' : 'Post Review'}
                            </button>
                            {submitSuccess && <p className="text-sm text-green-600 font-bold text-center"><i className="fas fa-check-circle mr-1"></i> Review posted successfully!</p>}
                        </form>
                      </div>
                  </div>
                </div>
                <div className="md:col-span-7">
                    {spot.reviews && spot.reviews.length > 0 ? (
                        <div className="space-y-4">
                                    {[...spot.reviews].reverse().map(review => (
                                        <div key={review._id} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-lt-orange text-white flex items-center justify-center font-bold">{review.name.charAt(0)}</div>
                                                    <div><h4 className="font-bold text-slate-800 text-sm">{review.name}</h4><StarRating rating={review.rating} className="text-xs" /></div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-700 text-sm mt-2 italic leading-relaxed">"{review.comment}"</p>
                                            
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 mt-3">
                                                    {review.images.map((img: string, i: number) => (
                                                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-lt-orange transition-all">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                        </div>
                    ) : <p className="text-center text-slate-400 py-10 italic">No reviews yet.</p>}
                </div>
              </div>
            )}
            
            {activeTab === 'map' && (
              <div className="flex flex-col h-full animate-fade-in gap-4 relative">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-2 items-center relative" ref={wrapperRef}>
                        <div className="flex-1 relative">
                            <i className="fas fa-map-pin absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                            <input type="text" placeholder="Start location (e.g. Center Mall)" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none" />
                        </div>
                        <button onClick={handleGPSLocation} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${isUsingGPS ? 'bg-lt-blue text-white' : 'bg-white text-slate-600'}`}><i className="fas fa-crosshairs"></i></button>
                    </div>
                </div>
                <div className="flex-grow rounded-xl overflow-hidden border border-slate-200 relative min-h-[300px]">
                    <iframe src={iframeSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" title={`Map of ${spot.name}`}></iframe>
                </div>
                <button onClick={openExternalNavigation} className="w-full bg-lt-blue text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-lt-moss transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-external-link-alt"></i> Open Navigation in Google Maps
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {isReportOpen && spot._id && <ReportModal targetId={spot._id} targetName={spot.name} targetType={spotType === 'dining' ? 'DiningSpot' : 'TouristSpot'} onClose={() => setIsReportOpen(false)} />}
    </>
  );
};

export default TouristSpotModal;