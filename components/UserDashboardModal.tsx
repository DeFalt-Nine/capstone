
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserBlogPosts, fetchUserReviews, getItineraryFromServer, saveItineraryToServer } from '../services/apiService';
import { BlogPost, Review } from '../types';

interface UserDashboardModalProps {
  onClose: () => void;
}

interface UserReview extends Review {
  spotName: string;
  spotType: 'tourist' | 'dining';
}

const UserDashboardModal: React.FC<UserDashboardModalProps> = ({ onClose }) => {
  const { user, getDisplayName } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'blogs' | 'reviews' | 'notifications' | 'itinerary'>('blogs');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [savedItinerary, setSavedItinerary] = useState<any | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try local storage first
    const saved = localStorage.getItem('savedAIItinerary');
    const savedTime = localStorage.getItem('savedAIItineraryTimestamp');
    let isLocalValid = true;

    if (saved) {
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

    if (saved && isLocalValid) {
      try {
        setSavedItinerary(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved itinerary from localStorage', e);
      }
    }

    // Try server-side file database sync
    const loadFromServer = async () => {
      const email = user?.email || 'anonymous';
      try {
        const res = await getItineraryFromServer(email);
        if (res && res.success) {
          if (Array.isArray(res.itineraries)) {
            setSavedItineraries(res.itineraries);
          }
          if (res.itinerary) {
            setSavedItinerary(res.itinerary);
            localStorage.setItem('savedAIItinerary', JSON.stringify(res.itinerary));
            localStorage.setItem('savedAIItineraryTimestamp', Date.now().toString());
          }
        }
      } catch (err) {
        console.error('Failed to load saved itinerary from server database:', err);
      }
    };

    loadFromServer();
  }, [user]);

  const handleDeleteItinerary = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to permanently delete this itinerary?')) return;
    try {
      const res = await saveItineraryToServer(user.email || '', null, 'delete', id);
      if (res && res.success) {
        const remaining = res.itineraries || [];
        setSavedItineraries(remaining);
        
        // If the deleted one was loaded, clear it
        const saved = localStorage.getItem('savedAIItinerary');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.id === id || (!parsed.id && remaining.length === 0)) {
              localStorage.removeItem('savedAIItinerary');
              localStorage.removeItem('savedAIItineraryTimestamp');
              setSavedItinerary(null);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
    }
  };

  const handleLoadItinerary = (item: any) => {
    setSavedItinerary(item.itinerary);
    localStorage.setItem('savedAIItinerary', JSON.stringify(item.itinerary));
    localStorage.setItem('savedAIItineraryTimestamp', Date.now().toString());
    onClose();
    navigate('/tourist-spots?tab=itinerary');
  };

  // Lock body scroll when dashboard is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [userBlogs, userReviews] = await Promise.all([
          fetchUserBlogPosts(user.email),
          fetchUserReviews(user.email)
        ]);
        setBlogs(userBlogs);
        setReviews(userReviews);
      } catch (err: any) {
        setError(err.message || 'Failed to load your data.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Pending</span>;
    }
  };

  // Notifications are derived from blog status changes and admin feedback
  const notifications = blogs
    .filter(blog => blog.status === 'approved' || blog.status === 'rejected' || blog.adminFeedback)
    .map(blog => ({
      id: blog._id,
      type: 'blog',
      title: `Blog Update: ${blog.title}`,
      message: blog.status === 'approved' 
        ? 'Your blog post has been approved and is now live!' 
        : blog.status === 'rejected' 
          ? `Your blog post was rejected. ${blog.adminFeedback ? `Feedback: ${blog.adminFeedback}` : ''}`
          : blog.adminFeedback ? `New feedback on your post: ${blog.adminFeedback}` : '',
      date: blog.date,
      status: blog.status
    }));

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] max-h-[850px] flex flex-col animate-slide-up border border-slate-200 overflow-hidden my-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-lt-blue px-4 py-4 sm:px-8 sm:py-6 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}`} 
              alt="" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/30 shadow-lg object-cover"
            />
            <div>
              <h2 className="font-bold text-lg sm:text-2xl tracking-tight">My Dashboard</h2>
              <p className="text-white/70 text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none">Welcome back, {getDisplayName()}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/35 transition-all border border-white/20 text-white shadow-sm"
            aria-label="Close"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-50 px-4 sm:px-8 border-b border-slate-200 flex-shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-6 sm:gap-8">
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${activeTab === 'blogs' ? 'text-lt-blue font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            My Stories & Blogs ({blogs.length})
            {activeTab === 'blogs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${activeTab === 'reviews' ? 'text-lt-blue font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            My Comments & Reviews ({reviews.length})
            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${activeTab === 'notifications' ? 'text-lt-blue font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Notifications {notifications.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-lt-red text-white text-[10px] rounded-full">{notifications.length}</span>}
            {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('itinerary')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${activeTab === 'itinerary' ? 'text-lt-blue font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            My Saved Itinerary 🗓️
            {activeTab === 'itinerary' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-8 bg-white custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <i className="fas fa-circle-notch fa-spin text-4xl text-lt-blue"></i>
              <p className="font-bold animate-pulse">Loading your data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
              <i className="fas fa-exclamation-circle text-4xl text-lt-red mb-4"></i>
              <p className="text-lt-red font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-lt-red text-white rounded-xl font-bold">Retry</button>
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === 'blogs' && (
                <div className="space-y-6">
                  {blogs.length === 0 ? (
                    <div className="text-center py-10 px-4 sm:py-16 bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-blue-50 text-lt-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <i className="fas fa-feather-alt text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base sm:text-lg mb-1">No stories shared yet</h4>
                      <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm mb-6 leading-relaxed">
                        You have not posted any community stories or blogs yet. Share your unique experiences, travel journals, and adventures in La Trinidad!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button 
                          onClick={() => {
                            onClose();
                            navigate('/blog#write-story');
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('open-blog-submission'));
                            }, 100);
                          }}
                          className="px-5 py-2.5 bg-lt-blue hover:bg-lt-blue/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-lt-blue/20 flex items-center gap-2"
                        >
                          <i className="fas fa-plus"></i> Write a Story / Blog Post
                        </button>
                        <button 
                          onClick={onClose}
                          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Close Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blogs.map(blog => (
                        <div key={blog._id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                          <div className="h-40 relative overflow-hidden">
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                            <div className="absolute top-3 right-3">
                              {getStatusBadge(blog.status)}
                            </div>
                          </div>
                          <div className="p-5 flex-grow">
                            <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{blog.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4">{blog.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{blog.date}</span>
                              {blog.adminFeedback && (
                                <div className="group/tip relative">
                                  <i className="fas fa-comment-dots text-lt-orange cursor-help"></i>
                                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                    {blog.adminFeedback}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-10 px-4 sm:py-16 bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-orange-50 text-lt-orange rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <i className="fas fa-comment shadow-sm text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base sm:text-lg mb-1">No comments or reviews yet</h4>
                      <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm mb-6 leading-relaxed">
                        You have not posted any comments, ratings, or feedback on any spots yet. Explore our tourist attractions and dining spots to share your thoughts!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button 
                          onClick={() => {
                            onClose();
                            navigate('/tourist-spots');
                          }}
                          className="px-5 py-2.5 bg-lt-orange hover:bg-lt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-lt-orange/20 flex items-center gap-2"
                        >
                          <i className="fas fa-search"></i> Explore Spots to Review
                        </button>
                        <button 
                          onClick={onClose}
                          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Close Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review._id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-lt-blue/30 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                              <i className={`fas ${review.spotType === 'tourist' ? 'fa-mountain text-lt-blue' : 'fa-utensils text-lt-orange'} text-xs`}></i>
                              {review.spotName}
                            </h4>
                            <div className="flex text-lt-yellow text-xs mt-1">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < review.rating ? 'text-lt-yellow' : 'text-slate-200'}`}></i>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(review.createdAt || '').toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic leading-relaxed">"{review.comment}"</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-4 overflow-x-auto py-1">
                            {review.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" referrerPolicy="no-referrer" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 px-4 sm:py-16 bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <i className="fas fa-bell-slash text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base sm:text-lg mb-1">No updates or notifications</h4>
                      <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm mb-6 leading-relaxed">
                        You're all caught up! Once you submit blog posts or stories, updates about approval or admin reviews will appear here.
                      </p>
                      <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-2200 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                      >
                        Close Dashboard
                      </button>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className={`p-4 sm:p-6 rounded-2xl border flex gap-3 sm:gap-4 items-start ${notif.status === 'approved' ? 'bg-green-50/70 border-green-100' : notif.status === 'rejected' ? 'bg-red-50/70 border-red-100' : 'bg-blue-50/70 border-blue-100'}`}>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${notif.status === 'approved' ? 'bg-white text-green-500' : notif.status === 'rejected' ? 'bg-white text-red-500' : 'bg-white text-blue-500'}`}>
                          <i className={`fas ${notif.status === 'approved' ? 'fa-check' : notif.status === 'rejected' ? 'fa-times' : 'fa-info'} text-xs sm:text-sm`}></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">{notif.title}</h4>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">{notif.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  {savedItineraries.length === 0 ? (
                    <div className="text-center py-10 px-4 sm:py-16 bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 animate-fade-in">
                      <div className="w-16 h-16 bg-blue-50 text-lt-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <i className="fas fa-route text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base sm:text-lg mb-1">No saved itinerary yet</h4>
                      <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm mb-6 leading-relaxed">
                        You have not generated or saved any custom travel plans yet. Try our new Smart Travel Planner to design your perfect trip!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button 
                          onClick={() => {
                            onClose();
                            navigate('/tourist-spots?tab=itinerary');
                          }}
                          className="px-5 py-2.5 bg-lt-blue hover:bg-lt-blue/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-lt-blue/20 flex items-center gap-2"
                        >
                          <i className="fas fa-sparkles"></i> Open Smart Tour Planner
                        </button>
                        <button 
                          onClick={onClose}
                          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Close Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed shadow-sm">
                        <i className="fas fa-clock text-amber-600 mt-0.5 shrink-0 text-sm"></i>
                        <div>
                          <span className="font-bold">Important Account Storage Policy:</span> Saved itineraries are stored securely on our servers for up to <span className="font-bold">30 days</span> from their creation date before being automatically deleted. Ensure you print or finalize your schedule within this time!
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                        {savedItineraries.map((item) => {
                          const createdAt = new Date(item.createdAt).getTime();
                          const elapsedDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
                          const remainingDays = Math.max(0, Math.ceil(30 - elapsedDays));
                          const isExpiringSoon = remainingDays <= 5;
                          
                          return (
                            <div key={item.id || item.title} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1">
                                  <h3 className="font-black text-slate-800 text-sm sm:text-base leading-snug">{item.title}</h3>
                                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.itinerary?.description}</p>
                                </div>
                                <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isExpiringSoon ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'}`}>
                                  <i className={`fas fa-hourglass-half text-[9px] ${isExpiringSoon ? 'animate-pulse text-red-500' : ''}`}></i>
                                  {remainingDays} days left
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  <div>
                                    <span className="text-slate-400">Budget:</span> <span className="font-extrabold text-slate-700">₱{item.itinerary?.estimatedTotalCost?.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Duration:</span> <span className="font-extrabold text-slate-700">{item.itinerary?.days?.length} days</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Saved:</span> <span className="font-extrabold text-slate-700">{new Date(item.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 self-end sm:self-auto">
                                  <button
                                    onClick={() => handleDeleteItinerary(item.id)}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                                    title="Delete Itinerary"
                                  >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                  </button>
                                  <button
                                    onClick={() => handleLoadItinerary(item)}
                                    className="px-4 py-2 bg-lt-blue hover:bg-lt-blue/90 text-white rounded-xl font-bold transition-all flex items-center gap-1 text-xs"
                                  >
                                    <i className="fas fa-eye text-xs"></i> View Itinerary
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserDashboardModal;
