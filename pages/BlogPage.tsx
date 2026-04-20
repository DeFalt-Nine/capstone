
import React, { useState, useEffect } from 'react';
import type { BlogPost } from '../types';
import { fetchBlogPosts, trackEvent } from '../services/apiService';
import BlogPostModal from '../components/BlogPostModal';
import BlogSubmissionModal from '../components/BlogSubmissionModal';
import AnimatedElement from '../components/AnimatedElement';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    const getPosts = async () => {
      try {
        const data = await fetchBlogPosts();
        // Only show approved/published posts on the public blog page
        const publicPosts = data.filter((p: any) => p.status === 'approved' || p.is_published !== false);
        setPosts(publicPosts);
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
        setError("Failed to load articles. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    getPosts();
  }, []);

  const handlePostClick = (post: BlogPost) => {
      trackEvent('view', post._id || `blog_post_${post.title.substring(0, 20)}`, '/blog', { title: post.title });
      setSelectedPost(post);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const paginate = (pageNumber: number) => {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const renderContent = () => {
      if (isLoading) {
          return (
            <div className="text-center py-20">
              <i className="fas fa-spinner fa-spin text-4xl text-lt-orange"></i>
              <p className="mt-4 text-slate-500">Loading articles...</p>
            </div>
          );
      }

      if (error) {
          return (
            <div className="text-center text-red-600 bg-red-50 p-8 rounded-lg border border-red-200">
                <i className="fas fa-exclamation-circle text-4xl mb-3 text-red-500"></i>
                <p>{error}</p>
            </div>
          );
      }

      if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500">
                <i className="far fa-newspaper text-4xl mb-3"></i>
                <p>No blog posts found. Check back soon!</p>
            </div>
        );
      }

      return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map((post, index) => (
            <AnimatedElement 
                key={post._id || index} 
                delay={(index % 3) * 100} 
                direction="up" 
                distance={100}
                scale={0.5}
                rotate={index % 2 === 0 ? -10 : 10}
            >
                <div 
                    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group h-full cursor-pointer transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 hover:shadow-xl"
                    onClick={() => handlePostClick(post)}
                >
                <div className="relative aspect-video overflow-hidden">
                    <img src={post.image} alt={post.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-lt-orange text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide border border-lt-orange/20">
                            {post.badge || 'Story'}
                        </span>
                    </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center text-xs text-slate-500 mb-3 space-x-2">
                        <span><i className="far fa-calendar-alt mr-1"></i> {post.date || new Date(post.created_at || '').toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span><i className="far fa-clock mr-1"></i> {post.readTime || '3 min'}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-lt-red transition-colors leading-tight">
                        {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm flex-grow mb-4 line-clamp-3">
                        {post.description}
                    </p>
                    <div className="border-t border-slate-100 pt-4 mt-auto flex justify-between items-center">
                    <div className="flex items-center text-xs text-slate-600 font-medium">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mr-2 text-slate-400 border border-slate-200">
                            <i className="fas fa-user"></i>
                        </div>
                        {post.author}
                    </div>
                    <span className="text-lt-orange font-bold text-sm group-hover:translate-x-1 transition-transform duration-200 flex items-center group-hover:text-lt-red">
                        Read Article <i className="fas fa-arrow-right ml-2 text-xs"></i>
                    </span>
                    </div>
                </div>
                </div>
            </AnimatedElement>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-16 space-x-2">
                    <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-lt-orange hover:text-white border border-slate-200 shadow-sm'}`}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`w-10 h-10 rounded-full font-bold transition-all ${currentPage === i + 1 ? 'bg-lt-orange text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-lt-orange hover:text-white border border-slate-200 shadow-sm'}`}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </>
      );
  };

  return (
    <>
        <section id="blog" className="py-20 md:py-32 bg-slate-50 overflow-hidden min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedElement>
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Travel Blog</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
                Read stories, guides, and tips from travelers and locals to help you plan your perfect La Trinidad adventure.
                </p>
                
                {/* Share Story Button */}
                <div className="mt-8">
                    <button 
                        onClick={() => setIsSubmissionOpen(true)}
                        className="bg-white border-2 border-lt-orange text-lt-orange hover:bg-lt-orange hover:text-white font-bold py-3 px-8 rounded-full shadow-md transition-all duration-300 flex items-center mx-auto gap-2 group transform hover:scale-105"
                    >
                        <i className="fas fa-pen-nib group-hover:rotate-12 transition-transform"></i>
                        Share Your Story
                    </button>
                    <p className="text-xs text-slate-400 mt-2">Have a unique experience? Post it here!</p>
                </div>
            </div>
            </AnimatedElement>

            {renderContent()}
        </div>
        </section>

        {selectedPost && (
            <BlogPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}

        {isSubmissionOpen && (
            <BlogSubmissionModal onClose={() => setIsSubmissionOpen(false)} />
        )}
    </>
  );
};

export default BlogPage;
