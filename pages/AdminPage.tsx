import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    fetchTouristSpots, fetchDiningSpots, fetchBlogPosts, fetchLocalEvents, fetchReports,
    deleteItem, createItem, updateItem, uploadImage, deleteReview, deleteReport, verifyAdminToken,
    fetchAnalyticsSummary, fetchAnalyticsDebug, fetchAdminLogs, logoutAdmin
} from '../services/apiService';
import { NAV_LINKS } from '../constants';
import AnimatedElement from '../components/AnimatedElement';

const TABS = [
    { id: 'tourist-spots', label: 'Tourist Spots', icon: 'fa-map-marked-alt' },
    { id: 'dining-spots', label: 'Dining', icon: 'fa-utensils' },
    { id: 'blog-posts', label: 'Blog Moderation', icon: 'fa-newspaper' },
    { id: 'events', label: 'Events', icon: 'fa-calendar-alt' },
    { id: 'reports', label: 'Reports', icon: 'fa-flag' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
    { id: 'activity-log', label: 'Activity Log', icon: 'fa-history' }
];

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [accessCode, setAccessCode] = useState('');
    
    const [activeTab, setActiveTab] = useState('tourist-spots');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState<'management' | 'preview'>('management');
    const [previewUrl, setPreviewUrl] = useState('/');
    
    const [data, setData] = useState<any[]>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
    const [adminLogs, setAdminLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentReviewItem, setCurrentReviewItem] = useState<any | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<any | null>(null);

    const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
    const [isUploading, setIsUploading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

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

    // Inactivity Auto-Logout (10 minutes)
    useEffect(() => {
        if (!isAuthenticated) return;

        let timeout: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                handleLogout();
                alert("You have been logged out due to 10 minutes of inactivity.");
            }, 10 * 60 * 1000); // 10 minutes
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleActivity = () => resetTimer();

        events.forEach(event => document.addEventListener(event, handleActivity));
        resetTimer(); // Initialize timer

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => document.removeEventListener(event, handleActivity));
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'analytics' && isAuthenticated) {
            const fetchDebug = async () => {
                try {
                    const data = await fetchAnalyticsDebug();
                    console.log('[Debug Analytics] Latest Events:', data);
                } catch (e) {
                    console.error('Debug fetch failed', e);
                }
            };
            fetchDebug();
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

    const handleLogout = async () => {
        try {
            await logoutAdmin();
        } catch (e) {}
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setAccessCode('');
        setData([]);
        setIsLogoutConfirmOpen(false);
        // Stay on admin page login state
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
            else if (tab === 'analytics') {
                result = await fetchAnalyticsSummary();
                setAnalyticsSummary(result);
                setData([]); // Clear data for analytics tab
                setIsLoading(false);
                return;
            } else if (tab === 'activity-log') {
                result = await fetchAdminLogs();
                setAdminLogs(result);
                setData([]);
                setIsLoading(false);
                return;
            }
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
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleOpenReviewModal = (item: any) => {
        setCurrentReviewItem(item);
        setIsReviewModalOpen(true);
    };

    const handleOpenDetailModal = (item: any) => {
        setDetailItem(item);
        setIsDetailModalOpen(true);
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
            setFormError(null);
            try {
                const file = e.target.files[0];
                const result = await uploadImage(file);
                setFormData({ ...formData, image: result.url });
            } catch (error: any) {
                setFormError(error.message || "Upload failed.");
            } finally {
                setIsUploading(false);
                e.target.value = ''; 
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
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
            setFormData({});
        } catch (error: any) {
            setFormError(error.message || 'Operation failed.');
        }
    };

    const renderAnalyticsDashboard = () => {
        if (!analyticsSummary) return null;

        const { summary, topTouristSpots, topDiningSpots, topBlogPosts, avgDwellTime, recentActivity } = analyticsSummary;

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-lt-blue/10 text-lt-blue rounded-xl flex items-center justify-center">
                                <i className="fas fa-map-marked-alt text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tourist Spot Views</p>
                                <h3 className="text-2xl font-bold text-slate-900">{summary.totalTouristSpotViews}</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-lt-blue" style={{ width: '70%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-lt-moss/10 text-lt-moss rounded-xl flex items-center justify-center">
                                <i className="fas fa-utensils text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dining Spot Views</p>
                                <h3 className="text-2xl font-bold text-slate-900">{summary.totalDiningSpotViews || 0}</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-lt-moss" style={{ width: '50%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-lt-orange/10 text-lt-orange rounded-xl flex items-center justify-center">
                                <i className="fas fa-newspaper text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blog Post Views</p>
                                <h3 className="text-2xl font-bold text-slate-900">{summary.totalBlogPostViews}</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-lt-orange" style={{ width: '45%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-clock text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Dwell Time</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {avgDwellTime.length > 0 
                                        ? `${Math.round(avgDwellTime.reduce((acc: number, curr: any) => acc + curr.avgDuration, 0) / avgDwellTime.length)}s`
                                        : '0s'}
                                </h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-users text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Interactions</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {(summary.totalTouristSpotViews || 0) + (summary.totalDiningSpotViews || 0) + (summary.totalBlogPostViews || 0)}
                                </h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-trophy text-lt-orange"></i>
                                Top Performing Content
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tourist Spots</h4>
                                <div className="space-y-4">
                                    {topTouristSpots.map((spot: any, index: number) => (
                                        <div key={spot._id} className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-300 w-4">{index + 1}</div>
                                            <img src={spot.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{spot.name}</p>
                                                <p className="text-[10px] text-slate-400">{spot.views} views</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-lt-blue" 
                                                    style={{ width: `${(spot.views / topTouristSpots[0].views) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dining Spots</h4>
                                <div className="space-y-4">
                                    {topDiningSpots && topDiningSpots.length > 0 ? topDiningSpots.map((spot: any, index: number) => (
                                        <div key={spot._id} className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-300 w-4">{index + 1}</div>
                                            <img src={spot.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{spot.name}</p>
                                                <p className="text-[10px] text-slate-400">{spot.views} views</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-lt-moss" 
                                                    style={{ width: `${topDiningSpots[0]?.views > 0 ? (spot.views / topDiningSpots[0].views) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic">No dining spot data yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Blog Posts</h4>
                                <div className="space-y-4">
                                    {topBlogPosts.map((post: any, index: number) => (
                                        <div key={post._id} className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-300 w-4">{index + 1}</div>
                                            <img src={post.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{post.title}</p>
                                                <p className="text-[10px] text-slate-400">{post.views} views</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-lt-orange" 
                                                    style={{ width: `${(post.views / topBlogPosts[0].views) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dwell Time & Activity */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="fas fa-hourglass-half text-lt-blue"></i>
                                    Average Dwell Time by Page
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {avgDwellTime.map((item: any) => (
                                        <div key={item._id} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-700 truncate">{item._id}</p>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-lt-blue" 
                                                        style={{ width: `${Math.min((item.avgDuration / 120) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <p className="text-xs font-bold text-slate-900">{Math.round(item.avgDuration)}s</p>
                                                <p className="text-[9px] text-slate-400">{item.totalEvents} samples</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="fas fa-history text-slate-400"></i>
                                    Recent Activity
                                </h3>
                            </div>
                            <div className="p-0">
                                {recentActivity.map((event: any) => (
                                    <div key={event._id} className="p-4 border-b border-slate-50 last:border-0 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                                            event.eventType === 'view' ? 'bg-blue-50 text-blue-600' :
                                            event.eventType === 'dwell' ? 'bg-green-50 text-green-600' :
                                            event.eventType === 'click' ? 'bg-orange-50 text-orange-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            <i className={`fas ${
                                                event.eventType === 'view' ? 'fa-eye' :
                                                event.eventType === 'dwell' ? 'fa-clock' :
                                                event.eventType === 'click' ? 'fa-mouse-pointer' :
                                                'fa-fingerprint'
                                            }`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {event.eventType === 'view' ? 'Page View' : 
                                                 event.eventType === 'dwell' ? 'Dwell Time' : 
                                                 event.eventType === 'click' ? 'Interaction' : 
                                                 'Event'} on {event.page}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(event.timestamp).toLocaleTimeString()} • {event.duration ? `${event.duration}s` : (event.targetId ? `ID: ${event.targetId.substring(0, 10)}...` : 'Interaction')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderActivityLog = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-history text-lt-blue"></i>
                        Administrative Activity Log
                    </h3>
                    <button 
                        onClick={() => loadData('activity-log')}
                        className="text-xs font-bold text-lt-blue hover:underline flex items-center gap-1"
                    >
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-5">Time</th>
                                <th className="p-5">Action</th>
                                <th className="p-5">Target Type</th>
                                <th className="p-5">Target Name</th>
                                <th className="p-5">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {adminLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 text-sm">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                adminLogs.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-5 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-5">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${
                                                log.action === 'login' ? 'bg-green-50 text-green-600 border-green-200' :
                                                log.action === 'delete' || log.action === 'reject' ? 'bg-red-50 text-red-600 border-red-200' :
                                                log.action === 'create' || log.action === 'approve' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {(log.action || 'unknown').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-5 text-xs font-bold text-slate-700 capitalize">
                                            {(log.targetType || 'system').replace('-', ' ')}
                                        </td>
                                        <td className="p-5 text-xs text-slate-800 font-medium">
                                            {log.targetName || '-'}
                                        </td>
                                        <td className="p-5 text-xs text-slate-500 max-w-xs truncate">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderInput = (key: string, label: string, type: string = 'text', placeholder: string = ''): React.ReactElement => (
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

    const renderDetailModal = () => {
        if (!detailItem) return null;

        const fields = Object.entries(detailItem).filter(([key]) => !['_id', '__v', 'updatedAt', 'reviews', 'image'].includes(key));

        const renderValue = (key: string, value: any) => {
            if (Array.isArray(value)) {
                return (
                    <div className="flex flex-wrap gap-2">
                        {value.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                {String(item)}
                            </span>
                        ))}
                    </div>
                );
            }
            if (typeof value === 'object' && value !== null) {
                return <pre className="text-[10px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
            }
            if (key.toLowerCase().includes('date') || key === 'createdAt') {
                return <span className="text-slate-700 font-medium">{new Date(value).toLocaleString()}</span>;
            }
            if (key === 'status') {
                const colors: any = { approved: 'bg-green-100 text-green-600', pending: 'bg-amber-100 text-amber-600', rejected: 'bg-red-100 text-red-600' };
                return <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colors[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>;
            }
            return <span className="text-slate-700 leading-relaxed">{String(value)}</span>;
        };

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsDetailModalOpen(false)}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-lt-blue/10 text-lt-blue flex items-center justify-center shadow-inner">
                                <i className="fas fa-file-alt text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Entry Details</h3>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">ID: {detailItem._id}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                    </div>
                    
                    <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {detailItem.image && (
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Featured Image</label>
                                    <div className="w-full h-72 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl group relative">
                                        <img src={detailItem.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <a href={detailItem.image} target="_blank" rel="noreferrer" className="text-white text-xs font-bold flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                                                <i className="fas fa-external-link-alt"></i> View Full Size
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {fields.map(([key, value]: [string, any]) => (
                                <div key={key} className={`${key === 'description' || key === 'content' || key === 'comment' ? 'md:col-span-2' : ''} group`}>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-lt-blue transition-colors">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-sm transition-all hover:bg-white hover:shadow-md hover:border-lt-blue/20">
                                        {renderValue(key, value)}
                                    </div>
                                </div>
                            ))}

                            {detailItem.gallery && detailItem.gallery.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Gallery Images</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {detailItem.gallery.map((img: string, i: number) => (
                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:ring-2 hover:ring-lt-blue transition-all">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="text-[10px] text-slate-400 font-medium italic">
                            Last updated: {new Date(detailItem.updatedAt || Date.now()).toLocaleString()}
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleOpenModal(detailItem);
                                }}
                                className="px-6 py-3 bg-lt-blue text-white rounded-2xl text-xs font-bold hover:bg-lt-moss transition-all shadow-lg shadow-lt-blue/20 flex items-center gap-2 active:scale-95"
                            >
                                <i className="fas fa-pen"></i> Edit Entry
                            </button>
                            <button 
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                            <p className="mt-2 text-[10px] text-slate-400 italic">
                                Hint: The default access code is <span className="font-bold text-slate-500">admin123</span>
                            </p>
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

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-lt-blue transition-colors flex items-center justify-center gap-2">
                            <i className="fas fa-arrow-left"></i>
                            Back to Homepage
                        </Link>
                    </div>
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
        <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
            {/* Sidebar Toggle Button (when closed) */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-lt-blue text-white p-2 rounded-r-xl shadow-lg hover:bg-lt-moss transition-all"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            )}

            {/* Sidebar */}
            <aside 
                className={`bg-white border-r border-slate-200 flex flex-col h-screen z-40 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'
                }`}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between min-w-[288px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lt-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-lt-blue/20">
                            <i className="fas fa-user-shield text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Admin</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Control Panel</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-slate-400 hover:text-lt-blue transition-colors"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[288px]">
                    <div className="px-3 mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
                        {viewMode === 'preview' && (
                            <button 
                                onClick={() => setViewMode('management')}
                                className="text-[10px] font-bold text-lt-blue hover:underline"
                            >
                                Back to Data
                            </button>
                        )}
                    </div>
                    {TABS.map((tab: any) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setViewMode('management');
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                                activeTab === tab.id && viewMode === 'management'
                                ? 'bg-lt-blue text-white shadow-md shadow-lt-blue/20' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <i className={`fas ${tab.icon} w-5 text-center ${activeTab === tab.id && viewMode === 'management' ? 'text-white' : 'text-slate-400 group-hover:text-lt-blue'}`}></i>
                            {tab.label}
                            {activeTab === tab.id && viewMode === 'management' && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 min-w-[288px]">
                    <button 
                        onClick={() => setIsLogoutConfirmOpen(true)} 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                        <i className="fas fa-power-off w-5 text-center"></i>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 gap-4">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800">
                                {viewMode === 'management' ? TABS.find(t => t.id === activeTab)?.label : 'Site Preview'}
                            </h2>
                            {viewMode === 'management' && activeTab !== 'analytics' && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                    {data.length} Records
                                </span>
                            )}
                        </div>
                        
                        {/* Preview Tabs - Moved to Preview Toolbar */}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        {viewMode === 'management' && activeTab !== 'reports' && activeTab !== 'analytics' && activeTab !== 'activity-log' && (
                            <button 
                                onClick={() => handleOpenModal()} 
                                className="bg-lt-blue hover:bg-lt-moss text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-lt-blue/10 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <i className="fas fa-plus"></i> Add New
                            </button>
                        )}
                        {activeTab === 'analytics' && (
                            <button 
                                onClick={() => loadData('analytics')} 
                                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                if (viewMode === 'preview') setViewMode('management');
                                else setViewMode('preview');
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                                viewMode === 'preview' 
                                ? 'bg-lt-orange text-white border-lt-orange shadow-md shadow-lt-orange/20' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <i className={`fas ${viewMode === 'preview' ? 'fa-edit' : 'fa-eye'}`}></i>
                            {viewMode === 'preview' ? 'Exit Preview' : 'Live Preview'}
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-lt-orange/10 text-lt-orange flex items-center justify-center text-xs font-bold">
                                AD
                            </div>
                            <span className="text-xs font-bold text-slate-600 hidden sm:block">Administrator</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {viewMode === 'management' ? (
                        <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                            <AnimatedElement>
                                {activeTab === 'analytics' ? (
                                    renderAnalyticsDashboard()
                                ) : activeTab === 'activity-log' ? (
                                    renderActivityLog()
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        {isLoading ? (
                                            <div className="p-32 text-center text-slate-400">
                                                <i className="fas fa-circle-notch fa-spin text-4xl mb-4 text-lt-blue"></i>
                                                <p className="text-sm font-medium">Synchronizing data...</p>
                                            </div>
                                        ) : data.length === 0 ? (
                                            <div className="p-32 text-center text-slate-400">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <i className="fas fa-folder-open text-3xl opacity-20"></i>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-1">No results found</h3>
                                                <p className="text-sm text-slate-500">There are no records to display in this section yet.</p>
                                                {activeTab !== 'reports' && (
                                                    <button 
                                                        onClick={() => handleOpenModal()}
                                                        className="mt-6 text-lt-blue font-bold text-sm hover:underline"
                                                    >
                                                        Create your first entry
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
                                                        <tr>
                                                            {activeTab !== 'reports' && <th className="p-5 w-20 text-center">Media</th>}
                                                            {activeTab === 'reports' ? (
                                                                <>
                                                                    <th className="p-5">Target</th>
                                                                    <th className="p-5">Reason</th>
                                                                    <th className="p-5">Description</th>
                                                                </>
                                                            ) : (
                                                                <th className="p-5">Information</th>
                                                            )}
                                                            {activeTab === 'blog-posts' && <th className="p-5">Status</th>}
                                                            {activeTab === 'blog-posts' && <th className="p-5">Author</th>}
                                                            {(activeTab === 'tourist-spots' || activeTab === 'blog-posts') && <th className="p-5 text-center">Views</th>}
                                                            {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && <th className="p-5 text-center">Reviews</th>}
                                                            <th className="p-5 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {sortedData.map((item: any) => (
                                                            <tr key={item._id} className="hover:bg-slate-50/30 transition-colors group">
                                                                {activeTab !== 'reports' && (
                                                                    <td className="p-5">
                                                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                                                            <img src={item.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                
                                                                {activeTab === 'reports' ? (
                                                                    <>
                                                                        <td className="p-5">
                                                                            <div className="font-bold text-slate-800 text-sm">{item.targetName}</div>
                                                                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{item.targetType}</div>
                                                                        </td>
                                                                        <td className="p-5">
                                                                            <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                                                                                {item.reason}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-5 text-xs text-slate-500 max-w-xs truncate">{item.description}</td>
                                                                    </>
                                                                ) : (
                                                                    <td className="p-5">
                                                                        <div className="font-bold text-slate-800 text-sm group-hover:text-lt-blue transition-colors">{item.name || item.title}</div>
                                                                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                                                                            <i className="fas fa-map-marker-alt text-[8px]"></i>
                                                                            {item.location || item.date || 'No meta provided'}
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {activeTab === 'blog-posts' && (
                                                                    <td className="p-5">
                                                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${
                                                                            item.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                                            item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                                            'bg-red-50 text-red-600 border-red-200'
                                                                        }`}>
                                                                            {item.status || 'approved'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {activeTab === 'blog-posts' && (
                                                                    <td className="p-5">
                                                                        <div className="text-xs font-bold text-slate-700">{item.author}</div>
                                                                        {item.email && <div className="text-[10px] text-slate-400">{item.email}</div>}
                                                                    </td>
                                                                )}
                                                                {(activeTab === 'tourist-spots' || activeTab === 'blog-posts') && (
                                                                    <td className="p-5 text-center">
                                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                                                                            <i className="fas fa-eye text-[8px]"></i>
                                                                            {item.views || 0}
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                                                    <td className="p-5 text-center">
                                                                        <button 
                                                                            onClick={() => handleOpenReviewModal(item)}
                                                                            className="inline-flex items-center gap-2 text-slate-400 hover:text-lt-orange transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                                                                        >
                                                                            <i className="fas fa-comment-dots text-[10px]"></i> 
                                                                            {item.reviews?.length || 0}
                                                                        </button>
                                                                    </td>
                                                                )}
                                                                <td className="p-5 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button 
                                                                            onClick={() => handleOpenDetailModal(item)} 
                                                                            className="p-2 text-slate-400 hover:text-lt-blue hover:bg-slate-100 rounded-lg transition-colors" 
                                                                            title="View Full Details"
                                                                        >
                                                                            <i className="fas fa-expand-alt text-xs"></i>
                                                                        </button>
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
                                )}
                            </AnimatedElement>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-200 animate-in fade-in duration-500 flex flex-col">
                            {/* Preview Toolbar */}
                            <div className="bg-slate-900 text-white px-6 py-4 flex flex-col gap-4 shadow-2xl z-10 border-b border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live Preview Active</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-700"></div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <i className="fas fa-desktop text-xs"></i>
                                            <span className="text-[11px] font-bold">Desktop View</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setPreviewUrl('/')}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                                            title="Reset to Home"
                                        >
                                            <i className="fas fa-home text-xs"></i>
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('management')}
                                            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 border border-red-500/20"
                                        >
                                            <i className="fas fa-times"></i>
                                            Exit Preview
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner group">
                                        <i className="fas fa-lock text-[10px] text-green-500/50"></i>
                                        <span className="text-[10px] font-mono text-slate-500 select-none">https://visitlatrinidad.gov.ph</span>
                                        <span className="text-[11px] font-mono text-lt-blue font-bold">{previewUrl}</span>
                                    </div>
                                    
                                    <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                                        {NAV_LINKS.map((link) => (
                                            <button
                                                key={link.name}
                                                onClick={() => setPreviewUrl(link.path)}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    previewUrl === link.path
                                                    ? 'bg-lt-blue text-white shadow-lg shadow-lt-blue/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                }`}
                                            >
                                                {link.name}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-slate-800 p-4 md:p-8">
                                <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-700 bg-white relative">
                                    <iframe 
                                        src={`${window.location.origin}${window.location.pathname}#${previewUrl}`}
                                        className="w-full h-full border-none"
                                        title="Site Preview"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

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

                            {formError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold animate-shake">
                                    <i className="fas fa-exclamation-circle mr-2"></i> {formError}
                                </div>
                            )}

                            <div className="sticky bottom-0 bg-white pt-6 pb-2">
                                <button type="submit" disabled={isUploading} className="w-full bg-lt-blue text-white font-bold py-4 rounded-xl hover:bg-lt-moss transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
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

            {/* Detail Modal */}
            {isDetailModalOpen && renderDetailModal()}

            {/* Logout Confirmation Modal */}
            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsLogoutConfirmOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-sign-out-alt text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Sign Out</h3>
                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to end your administrative session?</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsLogoutConfirmOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;