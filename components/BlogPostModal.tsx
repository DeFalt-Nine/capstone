
import React, { useEffect, useState } from 'react';
import type { BlogPost } from '../types';
import ReportModal from './ReportModal';
import { useAnalytics } from '../hooks/useAnalytics';

interface BlogPostModalProps {
  post: BlogPost;
  onClose: () => void;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({ post, onClose }) => {
  console.log(`[BlogPostModal] Mounting for post: ${post.title} (ID: ${post._id})`);
  useAnalytics(post._id, '/blog');
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isReportOpen) setIsReportOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Prevent scrolling on body

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, isReportOpen]);

  return (
    <>
    <div 
      className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden animate-slide-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-white bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center z-30 transition-colors border border-white/20 shadow-md"
          aria-label="Close modal"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Hero Image Section */}
        <div className="relative aspect-video flex-shrink-0 w-full overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
             <img 
                src={post.image} 
                alt={post.alt} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
             />
             <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                 <div className="flex items-center gap-3 mb-3">
                    <span className="bg-lt-yellow text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {post.badge}
                    </span>
                    <span className="text-sm font-medium text-slate-200 flex items-center">
                        <i className="far fa-clock mr-1"></i> {post.readTime}
                    </span>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-2 drop-shadow-lg">
                     {post.title}
                 </h1>
                 <div className="flex items-center text-sm md:text-base text-slate-300 gap-4">
                    <span className="flex items-center">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white mr-2 border border-white/20">
                            <i className="fas fa-user"></i>
                        </div>
                        {post.author}
                    </span>
                    <span>&bull;</span>
                    <span>{post.date}</span>
                 </div>
             </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-grow overflow-y-auto bg-white custom-scrollbar">
            <div className="max-w-3xl mx-auto p-8 md:p-12">
                <div 
                    className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed font-serif"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                >
                </div>
                
                {/* Gallery Section */}
                {post.gallery && post.gallery.length > 0 && (
                    <div className="mt-12 space-y-6">
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <i className="fas fa-images text-lt-orange"></i> Story Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {post.gallery.map((img, i) => (
                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group cursor-pointer hover:ring-2 hover:ring-lt-orange transition-all">
                                    <img src={img} alt={`${post.title} gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Footer / Share Section */}
                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
                    <p className="text-slate-500 italic">Thanks for reading!</p>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsReportOpen(true)}
                            className="text-slate-400 hover:text-lt-red transition-colors text-sm font-medium flex items-center gap-1"
                        >
                            <i className="fas fa-flag"></i> Report
                        </button>
                        <button className="text-slate-400 hover:text-lt-blue transition-colors"><i className="fab fa-facebook fa-lg"></i></button>
                        <button className="text-slate-400 hover:text-lt-blue transition-colors"><i className="fab fa-twitter fa-lg"></i></button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    
    {isReportOpen && post._id && (
        <ReportModal 
            targetId={post._id}
            targetName={post.title}
            targetType="BlogPost"
            onClose={() => setIsReportOpen(false)}
        />
    )}
    </>
  );
};

export default BlogPostModal;
