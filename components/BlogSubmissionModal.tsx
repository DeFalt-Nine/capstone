
import React, { useState, useEffect } from 'react';
import { submitPublicBlogPost } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import AICoverMaker from './AICoverMaker';
import UniversalImageSelector from './UniversalImageSelector';

interface BlogSubmissionModalProps {
  onClose: () => void;
}

const BlogSubmissionModal: React.FC<BlogSubmissionModalProps> = ({ onClose }) => {
  const { user, signInWithGoogle, signOut, getDisplayName } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    author: '',
    email: user?.email || '',
    socialLink: '',
    videoLink: '',
    image: '',
    gallery: [] as string[]
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        author: prev.author || getDisplayName(),
        email: user.email || ''
      }));
    }
  }, [user, getDisplayName]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAICoverOpen, setIsAICoverOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('blog_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Only restore if it's not empty
        if (parsed.title || parsed.story || parsed.description) {
          setFormData(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load blog draft', e);
      }
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (!success) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { author: _author, email: _email, ...draftData } = formData;
      localStorage.setItem('blog_draft', JSON.stringify(draftData));
    }
  }, [formData, success]);

  // Clear draft on success
  useEffect(() => {
    if (success) {
      localStorage.removeItem('blog_draft');
    }
  }, [success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addGalleryItem = (url: string) => {
    if (!url) return;
    if (formData.gallery.length >= 5) {
      setError('Maximum 5 gallery images allowed.');
      return;
    }
    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
  };

  const removeGalleryItem = (index: number) => {
    setFormData(prev => {
      const newGallery = [...prev.gallery];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.image) {
        setError('Please upload a cover image for your story.');
        return;
    }

    setIsSubmitting(true);
    
    try {
        // Simple HTML conversion for the story content
        const htmlContent = formData.story
            .split('\n')
            .filter(para => para.trim() !== '')
            .map(para => `<p>${para}</p>`)
            .join('');

        await submitPublicBlogPost({
            title: formData.title,
            description: formData.description,
            content: htmlContent,
            author: formData.author,
            email: formData.email,
            socialLink: formData.socialLink,
            videoLink: formData.videoLink,
            image: formData.image,
            gallery: formData.gallery,
            // Defaults
            alt: formData.title,
            badge: 'Community Story',
            readTime: '3 min read',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'pending',
            userId: user?.id,
            userAvatar: user?.user_metadata?.avatar_url
        });
        
        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 4000); 
    } catch (err: any) {
        setError(err.message || 'Submission failed. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (success) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl animate-slide-up border border-green-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 text-4xl">
                    <i className="fas fa-check"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Story Submitted!</h2>
                <p className="text-slate-600 mb-4">
                    Thank you, {formData.author}! Your post has been sent to our moderators. We will review it shortly.
                </p>
                <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800">Close Window</button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-slide-up border border-slate-200 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-lt-orange px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
            <h2 className="font-bold text-xl flex items-center gap-2">
                <i className="fas fa-feather-alt"></i> Share Your Story
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                <i className="fas fa-times"></i>
            </button>
        </div>

        {/* Form */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-slate-50 custom-scrollbar">
            {!user ? (
              <div className="text-center py-12 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-lt-orange/10 text-lt-orange rounded-full flex items-center justify-center mx-auto text-3xl">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="max-w-xs mx-auto">
                  <h3 className="text-xl font-bold text-slate-800">Verification Required</h3>
                  <p className="text-sm text-slate-500 mt-2">To prevent spam and maintain quality, please verify with Google to share your story.</p>
                </div>
                <button 
                  onClick={signInWithGoogle}
                  className="py-3 px-8 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-bold text-slate-700 mx-auto"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Verify with Google
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                    Tell us about your experience in La Trinidad! Whether it's a food trip, a hike, or a cultural encounter. Your story will be reviewed by our admin before publishing.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* User Info Header */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 mb-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'User')}`} 
                          alt="" 
                          className="w-10 h-10 rounded-full border border-slate-100"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.user_metadata?.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={signOut}
                        className="text-xs font-bold text-lt-red hover:underline px-3 py-1"
                      >
                        Logout
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Story Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="e.g., My Sunrise at Mt. Kalugong" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Short Description (Summary)</label>
                            <input type="text" name="description" required value={formData.description} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="e.g., A breathtaking morning above the clouds..." />
                        </div>
                    </div>

                    {/* Main Story */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Your Full Experience</label>
                        <textarea name="story" required value={formData.story} onChange={handleInputChange} rows={8} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="Share the details of your adventure, what you saw, and what you felt..."></textarea>
                    </div>

                    {/* Gallery */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-slate-800">Photo Gallery (Optional)</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formData.gallery.length} / 5</span>
                        </div>
                        <p className="text-xs text-slate-500">Add up to 5 additional photos to your story.</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {formData.gallery.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeGalleryItem(i)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <i className="fas fa-times text-[10px]"></i>
                                    </button>
                                </div>
                            ))}
                            
                            {formData.gallery.length < 5 && (
                                <UniversalImageSelector 
                                    onImageSelected={addGalleryItem}
                                    aspectRatio={1}
                                    label=""
                                    className="aspect-square"
                                />
                            )}
                        </div>
                    </div>

                    {/* Media */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Cover Photo</label>
                                <button 
                                    type="button"
                                    onClick={() => setIsAICoverOpen(true)}
                                    className="text-[10px] font-bold text-lt-orange hover:text-lt-red flex items-center gap-1"
                                >
                                    <i className="fas fa-wand-sparkles"></i> Generate AI Cover
                                </button>
                            </div>
                            <UniversalImageSelector 
                                onImageSelected={(url) => setFormData({...formData, image: url})}
                                aspectRatio={16 / 9}
                                label=""
                                currentImage={formData.image}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Video Link (YouTube/TikTok)</label>
                            <input type="url" name="videoLink" value={formData.videoLink} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="https://youtube.com/..." />
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                        <h4 className="font-bold text-sm text-slate-800">About You</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Name / Pen Name</label>
                                <input type="text" name="author" required value={formData.author} onChange={handleInputChange} className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:border-lt-orange" placeholder="Your pen name..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email (Private)</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:border-lt-orange bg-slate-50" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Social Media Link (Public - Optional)</label>
                            <input type="url" name="socialLink" value={formData.socialLink} onChange={handleInputChange} className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:border-lt-orange" placeholder="Instagram/Facebook Profile URL" />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded border border-red-100">{error}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full bg-lt-orange text-white font-bold py-4 rounded-xl shadow-lg hover:bg-lt-red transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                        </button>
                    </div>
                </form>
              </>
            )}
        </div>
      </div>

      {isAICoverOpen && (
        <AICoverMaker 
            onClose={() => setIsAICoverOpen(false)} 
            onSelect={(url) => {
                setFormData({ ...formData, image: url });
                setIsAICoverOpen(false);
            }} 
        />
      )}
    </div>
  );
};

export default BlogSubmissionModal;
