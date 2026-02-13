
import React, { useState, useEffect } from 'react';
import { 
    fetchTouristSpots, fetchDiningSpots, fetchBlogPosts, fetchLocalEvents, fetchReports,
    deleteItem, createItem, updateItem, uploadImage, deleteReview, deleteReport, verifyAdminToken
} from '../services/apiService';
import AnimatedElement from '../components/AnimatedElement';

const TABS = [
    { id: 'tourist-spots', label: 'Tourist Spots' },
    { id: 'dining-spots', label: 'Dining' },
    { id: 'blog-posts', label: 'Blog Moderation' },
    { id: 'events', label: 'Events' },
    { id: 'reports', label: 'Reports' }
];

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [accessCode, setAccessCode] = useState('');
    
    const [activeTab, setActiveTab] = useState('tourist-spots');
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentReviewItem, setCurrentReviewItem] = useState<any | null>(null);

    const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const checkExistingAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    await verifyAdminToken(token);
                    setIsAuthenticated(true);
                    loadData(activeTab);
                } catch (e) {
                    localStorage.removeItem('adminToken');
                    setIsAuthenticated(false);
                }
            }
            setIsVerifying(false);
        };
        checkExistingAuth();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadData(activeTab);
        }
    }, [activeTab, isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);

        try {
            await verifyAdminToken(accessCode);
            localStorage.setItem('adminToken', accessCode);
            setIsAuthenticated(true);
            setAccessCode('');
        } catch (error: any) {
            setLoginError(error.message || 'Invalid access code. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setAccessCode('');
        setData([]);
    };

    const loadData = async (tab: string) => {
        setIsLoading(true);
        try {
            let result;
            if (tab === 'tourist-spots') result = await fetchTouristSpots();
            else if (tab === 'dining-spots') result = await fetchDiningSpots();
            else if (tab === 'blog-posts') result = await fetchBlogPosts('admin');
            else if (tab === 'events') result = await fetchLocalEvents();
            else if (tab === 'reports') result = await fetchReports();
            setData(result || []);
        } catch (error: any) {
            if (error.message.includes('403')) {
                handleLogout();
                alert("Your session has expired. Please login again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            if (activeTab === 'reports') {
                await deleteReport(id);
            } else {
                await deleteItem(activeTab, id);
            }
            setData((prev: any[]) => prev.filter((item: any) => item._id !== id));
        } catch (error: any) {
            alert(error.message || 'Operation failed.');
        }
    };

    const handleApprove = async (id: string) => {
        if(!window.confirm("Approve this post for public view?")) return;
        try {
            const updated = await updateItem(activeTab, id, { status: 'approved' });
            setData((prev: any[]) => prev.map((item: any) => item._id === id ? updated : item));
        } catch (error: any) {
            alert(error.message || 'Failed to approve.');
        }
    };

    const handleOpenModal = (item?: any) => {
        setEditItem(item || null);
        setFormData(item || {});
        setImageInputType('url'); 
        setIsModalOpen(true);
    };

    const handleOpenReviewModal = (item: any) => {
        setCurrentReviewItem(item);
        setIsReviewModalOpen(true);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!currentReviewItem) return;
        if (!window.confirm("Delete this review? This is permanent.")) return;

        try {
            const type = activeTab === 'tourist-spots' ? 'tourist' : 'dining';
            await deleteReview(type, currentReviewItem._id, reviewId);
            const updatedReviews = currentReviewItem.reviews.filter((r: any) => r._id !== reviewId);
            const updatedItem = { ...currentReviewItem, reviews: updatedReviews };
            setCurrentReviewItem(updatedItem);
            setData((prev: any[]) => prev.map((item: any) => item._id === currentReviewItem._id ? updatedItem : item));
        } catch (error: any) {
            alert(error.message || "Failed to delete review.");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const result = await uploadImage(file);
                setFormData({ ...formData, image: result.url });
            } catch (error: any) {
                alert(`${error.message || "Upload failed."}`);
            } finally {
                setIsUploading(false);
                e.target.value = ''; 
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map((t: string) => t.trim());
            if (typeof payload.gallery === 'string') payload.gallery = payload.gallery.split(',').map((t: string) => t.trim());

            if (editItem) {
                const updated = await updateItem(activeTab, editItem._id, payload);
                setData((prev: any[]) => prev.map((item: any) => item._id === editItem._id ? updated : item));
            } else {
                const created = await createItem(activeTab, payload);
                setData((prev: any[]) => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || 'Operation failed.');
        }
    };

    const renderInput = (key: string, label: string, type = 'text', placeholder = '') => (
        <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
            {type === 'textarea' ? (
                <textarea 
                    value={formData[key] || ''} 
                    onChange={e => setFormData({...formData, [key]: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-lt-blue outline-none"
                    rows={4}
                />
            ) : (
                <input 
                    type={type} 
                    value={formData[key] || ''} 
                    onChange={e => setFormData({...formData, [key]: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-lt-blue outline-none"
                    placeholder={placeholder}
                />
            )}
        </div>
    );

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <i className="fas fa-spinner fa-spin text-4xl text-lt-blue"></i>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-lt-blue/10 text-lt-blue rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-user-shield text-2xl"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
                        <p className="text-sm text-slate-500 mt-1">Please verify your access code to continue.</p>
                    </div>

                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Access Code</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-blue outline-none transition-all"
                                value={accessCode}
                                onChange={e => setAccessCode(e.target.value)}
                                disabled={loginLoading}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loginLoading}
                            className="w-full bg-lt-blue text-white font-bold py-3 rounded-lg hover:bg-lt-moss transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95"
                        >
                            {loginLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
                            {loginLoading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const sortedData = activeTab === 'blog-posts' 
        ? [...data].sort((a: any, b: any) => {
            const statusOrder: any = { pending: 0, approved: 1, rejected: 2 };
            return (statusOrder[a.status as keyof typeof statusOrder] || 1) - (statusOrder[b.status as keyof typeof statusOrder] || 1);
        })
        : data;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
            <div className="container mx-auto">
                <AnimatedElement>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                             <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                             <span className="text-xs bg-lt-orange text-white px-2 py-1 rounded font-bold tracking-widest">BETA</span>
                        </div>
                        <button onClick={handleLogout} className="bg-white text-red-500 border border-red-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors shadow-sm">
                            <i className="fas fa-power-off mr-2"></i> Logout
                        </button>
                    </div>
                </AnimatedElement>

                {/* Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-lt-blue text-white shadow-md' : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur">
                        <h2 className="font-bold text-slate-700 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-lt-orange"></span>
                             Manage {TABS.find(t => t.id === activeTab)?.label} ({data.length})
                        </h2>
                        {activeTab !== 'reports' && (
                            <button onClick={() => handleOpenModal()} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95">
                                <i className="fas fa-plus mr-1"></i> Add New
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="p-20 text-center text-slate-400">
                             <i className="fas fa-circle-notch fa-spin text-3xl mb-4"></i>
                             <p className="text-sm font-medium">Fetching Records...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                             <i className="fas fa-folder-open text-4xl mb-4 opacity-20"></i>
                             <p className="text-sm font-medium">No records found for this section.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
                                    <tr>
                                        {activeTab !== 'reports' && <th className="p-4 w-16 text-center">Thumb</th>}
                                        {activeTab === 'reports' ? (
                                            <>
                                                <th className="p-4">Target</th>
                                                <th className="p-4">Reason</th>
                                                <th className="p-4">Description</th>
                                            </>
                                        ) : (
                                            <th className="p-4">Information</th>
                                        )}
                                        {activeTab === 'blog-posts' && <th className="p-4">Status</th>}
                                        {activeTab === 'blog-posts' && <th className="p-4">Author</th>}
                                        {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && <th className="p-4 text-center">Reviews</th>}
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sortedData.map((item: any) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                            {activeTab !== 'reports' && (
                                                <td className="p-4">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shadow-inner">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                            )}
                                            
                                            {activeTab === 'reports' ? (
                                                <>
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800 text-sm">{item.targetName}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{item.targetType}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-bold">
                                                            {item.reason}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-slate-600 max-w-xs truncate">{item.description}</td>
                                                </>
                                            ) : (
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-800 text-sm">{item.name || item.title}</div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <i className="fas fa-map-marker-alt text-[8px]"></i>
                                                        {item.location || item.date || 'No meta'}
                                                    </div>
                                                </td>
                                            )}

                                            {activeTab === 'blog-posts' && (
                                                <td className="p-4">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                                                        item.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                        item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                        'bg-red-50 text-red-600 border-red-200'
                                                    }`}>
                                                        {item.status || 'approved'}
                                                    </span>
                                                </td>
                                            )}
                                            {activeTab === 'blog-posts' && (
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-slate-700">{item.author}</div>
                                                    {item.email && <div className="text-[10px] text-slate-400">{item.email}</div>}
                                                </td>
                                            )}
                                            {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => handleOpenReviewModal(item)}
                                                        className="inline-flex items-center gap-2 text-slate-400 hover:text-lt-orange transition-colors bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold"
                                                    >
                                                        <i className="fas fa-comment-dots text-[10px]"></i> 
                                                        {item.reviews?.length || 0}
                                                    </button>
                                                </td>
                                            )}
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {activeTab === 'blog-posts' && item.status === 'pending' && (
                                                        <button onClick={() => handleApprove(item._id)} className="bg-lt-blue text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-lt-moss shadow-sm transition-all" title="Approve Story">
                                                            Approve
                                                        </button>
                                                    )}
                                                    {activeTab === 'reports' ? (
                                                        <button onClick={() => handleDelete(item._id)} className="bg-lt-blue text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-lt-moss shadow-sm transition-all" title="Resolve Report">
                                                            Resolve
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-lt-blue hover:bg-slate-100 rounded-lg transition-colors" title="Edit Item">
                                                                <i className="fas fa-pen text-xs"></i>
                                                            </button>
                                                            <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Item">
                                                                <i className="fas fa-trash-alt text-xs"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">{editItem ? 'Update Entry' : 'Create New Entry'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar bg-white">
                            {activeTab !== 'events' && activeTab !== 'blog-posts' && renderInput('name', 'Name')}
                            {(activeTab === 'blog-posts' || activeTab === 'events') && renderInput('title', 'Title')}
                            
                            {/* Image UI Section */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Display Image</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-2">
                                    <button 
                                        type="button"
                                        onClick={() => setImageInputType('url')}
                                        className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition-all ${imageInputType === 'url' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                    >
                                        <i className="fas fa-link mr-1"></i> URL
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setImageInputType('file')}
                                        className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition-all ${imageInputType === 'file' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                    >
                                        <i className="fas fa-cloud-upload-alt mr-1"></i> Upload
                                    </button>
                                </div>

                                {imageInputType === 'url' ? (
                                    <input 
                                        type="text" 
                                        value={formData.image || ''} 
                                        onChange={e => setFormData({...formData, image: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-lt-blue outline-none"
                                        placeholder="Paste image link here..."
                                    />
                                ) : (
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-lt-blue/10 file:text-lt-blue hover:file:bg-lt-blue/20 cursor-pointer border border-dashed border-slate-300 p-2 rounded-lg"
                                            disabled={isUploading}
                                        />
                                        {isUploading && <div className="absolute right-4 top-1/2 transform -translate-y-1/2"><i className="fas fa-spinner fa-spin text-lt-orange"></i></div>}
                                    </div>
                                )}
                                
                                {formData.image && (
                                    <div className="mt-3 relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <p className="text-[9px] text-white font-mono truncate w-full">{formData.image}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {renderInput('description', 'Short Summary', 'textarea')}
                            {activeTab !== 'blog-posts' && renderInput('location', 'Location')}
                            
                            {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                <div className="grid grid-cols-1 gap-1">
                                    {activeTab === 'tourist-spots' && renderInput('history', 'Background Story', 'textarea')}
                                    {renderInput('category', 'Category Label')}
                                    {renderInput('openingHours', 'Business Hours')}
                                    {renderInput('bestTimeToVisit', 'Best Visit Time')}
                                </div>
                            )}

                            {activeTab === 'events' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {renderInput('date', 'Schedule')}
                                    {renderInput('badge', 'Event Type')}
                                </div>
                            )}

                            {activeTab === 'blog-posts' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput('author', 'Writer Name')}
                                        {renderInput('readTime', 'Est. Read Time')}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput('badge', 'Article Tag')}
                                        {renderInput('date', 'Post Date')}
                                    </div>
                                    {renderInput('content', 'Article Body (Markdown/HTML)', 'textarea')}
                                    
                                    {editItem && (
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                            <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Author Contact (Private)</label>
                                            <p className="text-xs font-bold text-slate-700">{formData.email || 'No email provided'}</p>
                                            <textarea 
                                                value={formData.adminFeedback || ''}
                                                onChange={e => setFormData({...formData, adminFeedback: e.target.value})}
                                                className="w-full p-2 mt-2 border border-blue-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                placeholder="Internal notes or reasons for status change..."
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="sticky bottom-0 bg-white pt-6 pb-2">
                                <button type="submit" className="w-full bg-lt-blue text-white font-bold py-4 rounded-xl hover:bg-lt-moss transition-all shadow-lg active:scale-[0.98]">
                                    {editItem ? 'Save Record' : 'Create Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Management Modal */}
            {isReviewModalOpen && currentReviewItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsReviewModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800">User Reviews</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentReviewItem.name}</p>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-100/50">
                            {(!currentReviewItem.reviews || currentReviewItem.reviews.length === 0) ? (
                                <div className="text-center py-20 text-slate-400">
                                    <i className="far fa-comments text-4xl mb-4 opacity-10"></i>
                                    <p className="text-sm font-medium">No reviews submitted yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {[...currentReviewItem.reviews].reverse().map((review: any) => (
                                        <div key={review._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute left-0 top-0 w-1 h-full bg-lt-orange opacity-40"></div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 font-bold">
                                                        {review.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm leading-none">{review.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-lt-orange font-bold">{review.rating} ★</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteReview(review._id)} 
                                                    className="text-slate-300 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50"
                                                    title="Spam Moderation"
                                                >
                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                </button>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl mb-3">
                                                <p className="text-xs text-slate-600 leading-relaxed italic">"{review.comment || 'No comment text provided'}"</p>
                                            </div>
                                            
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 mb-3">
                                                    {review.images.map((img: string, i: number) => (
                                                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-lt-orange transition-all shadow-sm">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                                                <i className="fas fa-envelope"></i> {review.email}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
