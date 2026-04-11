
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserBlogPosts, fetchUserReviews } from '../services/apiService';
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
  const [activeTab, setActiveTab] = useState<'blogs' | 'reviews' | 'notifications'>('blogs');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up border border-slate-200 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-lt-blue px-8 py-6 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}`} 
              alt="" 
              className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg"
            />
            <div>
              <h2 className="font-bold text-2xl tracking-tight">My Dashboard</h2>
              <p className="text-white/70 text-sm font-medium">Welcome back, {getDisplayName()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors border border-white/10">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-50 px-8 border-b border-slate-200 flex-shrink-0">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('blogs')}
              className={`py-4 text-sm font-bold transition-all relative ${activeTab === 'blogs' ? 'text-lt-blue' : 'text-slate-400 hover:text-slate-600'}`}
            >
              My Blogs ({blogs.length})
              {activeTab === 'blogs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`py-4 text-sm font-bold transition-all relative ${activeTab === 'reviews' ? 'text-lt-blue' : 'text-slate-400 hover:text-slate-600'}`}
            >
              My Reviews ({reviews.length})
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`py-4 text-sm font-bold transition-all relative ${activeTab === 'notifications' ? 'text-lt-blue' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Notifications {notifications.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-lt-red text-white text-[10px] rounded-full">{notifications.length}</span>}
              {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-lt-blue rounded-t-full"></div>}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 bg-white custom-scrollbar">
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
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <i className="fas fa-feather-alt text-4xl text-slate-200 mb-4"></i>
                      <p className="text-slate-500 font-medium">You haven't shared any stories yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blogs.map(blog => (
                        <div key={blog._id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                          <div className="h-40 relative overflow-hidden">
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <i className="fas fa-star text-4xl text-slate-200 mb-4"></i>
                      <p className="text-slate-500 font-medium">You haven't posted any reviews yet.</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review._id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-lt-blue/30 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
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
                          <div className="flex gap-2 mt-4">
                            {review.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
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
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <i className="fas fa-bell-slash text-4xl text-slate-200 mb-4"></i>
                      <p className="text-slate-500 font-medium">No new notifications.</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className={`p-6 rounded-2xl border flex gap-4 items-start ${notif.status === 'approved' ? 'bg-green-50 border-green-100' : notif.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${notif.status === 'approved' ? 'bg-white text-green-500' : notif.status === 'rejected' ? 'bg-white text-red-500' : 'bg-white text-blue-500'}`}>
                          <i className={`fas ${notif.status === 'approved' ? 'fa-check' : notif.status === 'rejected' ? 'fa-times' : 'fa-info'}`}></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{notif.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">{notif.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardModal;
