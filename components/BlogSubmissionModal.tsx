
import React, { useState } from 'react';
import { uploadImage, submitPublicBlogPost } from '../services/apiService';

interface BlogSubmissionModalProps {
  onClose: () => void;
}

const BlogSubmissionModal: React.FC<BlogSubmissionModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    author: '',
    email: '',
    socialLink: '',
    videoLink: '',
    image: ''
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setError(null);
      try {
        const result = await uploadImage(e.target.files[0]);
        setFormData({ ...formData, image: result.url });
      } catch (err: any) {
        setError(err.message || 'Image upload failed');
      } finally {
        setIsUploading(false);
      }
    }
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
            // Defaults
            alt: formData.title,
            badge: 'Community Story',
            readTime: '3 min read',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'pending'
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
            <p className="text-sm text-slate-600 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                Tell us about your experience in La Trinidad! Whether it's a food trip, a hike, or a cultural encounter. Your story will be reviewed by our admin before publishing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title & Description */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Story Title</label>
                        <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="e.g., My Sunrise at Mt. Kalugong" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Short Description (Summary)</label>
                        <input type="text" name="description" required value={formData.description} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="A quick summary of your trip..." />
                    </div>
                </div>

                {/* Main Story */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Your Full Experience</label>
                    <textarea name="story" required value={formData.story} onChange={handleInputChange} rows={8} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lt-orange focus:outline-none" placeholder="Write your full story here..."></textarea>
                </div>

                {/* Media */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Cover Photo</label>
                        <div className="relative">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lt-orange/10 file:text-lt-orange hover:file:bg-lt-orange/20 cursor-pointer" />
                            {isUploading && <div className="absolute right-2 top-2"><i className="fas fa-spinner fa-spin text-lt-orange"></i></div>}
                        </div>
                        {formData.image && (
                            <div className="mt-2 h-24 w-full rounded-lg overflow-hidden border border-slate-200">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
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
                            <input type="text" name="author" required value={formData.author} onChange={handleInputChange} className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:border-lt-orange" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email (Private)</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:border-lt-orange" placeholder="We might contact you here" />
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
        </div>
      </div>
    </div>
  );
};

export default BlogSubmissionModal;
